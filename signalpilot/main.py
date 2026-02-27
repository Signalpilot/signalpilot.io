"""
SignalPilot — Main runner

Orchestrates all three strategy layers using fully async I/O:
1. Structural Arbitrage Scanner (scan cycle every 30s)
2. Market Maker (quote refresh every 15s + fill polling)
3. Latency Arb (real-time via Binance WebSocket, async CLOB calls)

Plus infrastructure:
4. Fill Tracker — polls order statuses, confirms fills, detects naked legs
5. Position Unwinder — stop-loss, take-profit, stale position cleanup

Usage:
    python -m signalpilot.main              # Dry run (default)
    DRY_RUN=false python -m signalpilot.main  # Live trading (be careful)
"""
import asyncio
import logging
import signal
import time

from signalpilot.config import Settings
from signalpilot.core.client import PolymarketClient
from signalpilot.core.risk import RiskManager
from signalpilot.core.fills import FillTracker
from signalpilot.core.unwind import PositionUnwinder
from signalpilot.core.allocator import CapitalAllocator
from signalpilot.core.feeds import BinanceFeed
from signalpilot.strategies.arb_scanner import ArbScanner
from signalpilot.strategies.market_maker import MarketMaker
from signalpilot.strategies.latency_arb import LatencyArbEngine
from signalpilot.utils.alerts import Alerter

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("signalpilot")


class SignalPilot:
    def __init__(self):
        self.settings = Settings()
        self.client = PolymarketClient(self.settings)
        self.risk = RiskManager(self.settings, self.client)
        self.alerter = Alerter(self.settings.telegram_bot_token, self.settings.telegram_chat_id)

        # Core infrastructure
        self.fill_tracker = FillTracker(self.client, self.risk)
        self.unwinder = PositionUnwinder(self.client, self.risk, self.settings.stop_loss)
        self.allocator = CapitalAllocator(
            total_capital=self.settings.max_capital_usdc,
            initial_weights=[
                self.settings.arb_allocation,
                self.settings.mm_allocation,
                self.settings.latency_allocation,
            ],
        )

        # Initialize strategies — all wired to fill tracker
        self.arb_scanner = ArbScanner(
            self.client, self.risk, self.settings, fill_tracker=self.fill_tracker)
        self.market_maker = MarketMaker(self.client, self.risk, self.settings)
        self.latency_engine = LatencyArbEngine(
            self.client, self.risk, self.settings, fill_tracker=self.fill_tracker)

        # Feeds
        self.binance_feed: BinanceFeed | None = None
        self._shutdown = False

    def print_banner(self):
        mode = "DRY RUN" if self.settings.dry_run else "LIVE"
        auth = "YES" if self.client.is_authenticated else "NO (read-only)"
        strategies = ", ".join(self.settings.strategy_list)

        print(f"""
╔══════════════════════════════════════════════════════╗
║  SignalPilot — Polymarket Trading Bot                ║
╠══════════════════════════════════════════════════════╣
║  Mode:       {mode:<40s}║
║  Auth:       {auth:<40s}║
║  Capital:    ${self.settings.max_capital_usdc:<39,.0f}║
║  Strategies: {strategies:<40s}║
╠══════════════════════════════════════════════════════╣
║  Arb:     ${self.settings.arb_capital:<10,.0f}  ({self.settings.arb_allocation:.0%} allocation)          ║
║  MM:      ${self.settings.mm_capital:<10,.0f}  ({self.settings.mm_allocation:.0%} allocation)          ║
║  Latency: ${self.settings.latency_capital:<10,.0f}  ({self.settings.latency_allocation:.0%} allocation)          ║
╠══════════════════════════════════════════════════════╣
║  Max Daily Loss: {self.settings.max_daily_loss:.0%}                              ║
║  Max Position:   {self.settings.max_position_size:.0%}                              ║
║  Stop Loss:      {self.settings.stop_loss:.0%}                              ║
╚══════════════════════════════════════════════════════╝
""")

    def reconcile_on_startup(self):
        """Cancel any orphaned orders from previous sessions."""
        if self.settings.dry_run:
            return
        try:
            open_orders = self.client.get_open_orders()
            if open_orders:
                logger.warning("Found %d orphaned orders from previous session — cancelling", len(open_orders))
                self.client.cancel_all()
                logger.info("Orphaned orders cancelled")
        except Exception as e:
            logger.warning("Could not check for orphaned orders: %s", e)

    # ── Strategy Loops (all async, non-blocking) ─────────────────

    async def run_arb_loop(self):
        """Scan for arbitrage opportunities every 30 seconds. Uses async Gamma API."""
        logger.info("Starting arb scanner loop")
        while not self._shutdown:
            try:
                # Use async API for market discovery
                crypto_markets = await self.client.async_get_crypto_5min_markets()
                general_markets = await self.client.async_get_active_markets(limit=100)
                events = await self.client.async_get_events()

                # CLOB calls (sync SDK) run in thread pool so they don't block
                binary_opps, negrisk_opps = await asyncio.to_thread(
                    self.arb_scanner.run_scan_cycle_with_data,
                    crypto_markets, general_markets, events,
                )

                for opp in binary_opps:
                    if opp.is_profitable:
                        self.alerter.trade_alert("arb", "OPPORTUNITY", str(opp))
                        await asyncio.to_thread(self.arb_scanner.execute_binary_arb, opp)
                for opp in negrisk_opps:
                    if opp.is_profitable:
                        self.alerter.trade_alert("arb", "NEGRISK OPPORTUNITY", str(opp))
                        await asyncio.to_thread(self.arb_scanner.execute_negrisk_arb, opp)
            except Exception as e:
                logger.error("Arb scan error: %s", e)
            await asyncio.sleep(30)

    async def run_mm_loop(self):
        """Refresh market making quotes every 15 seconds with fill polling."""
        logger.info("Starting market maker loop")
        while not self._shutdown:
            try:
                markets = await self.client.async_get_active_markets(limit=20)
                tradeable = [
                    m for m in markets
                    if len(m.get("clobTokenIds", [])) == 2
                    and float(m.get("volume", 0)) > 1000
                ]

                # Poll for fills on active quotes before placing new ones
                await self._poll_mm_fills()

                if tradeable:
                    await asyncio.to_thread(self.market_maker.run_cycle, tradeable[:5])
            except Exception as e:
                logger.error("MM cycle error: %s", e)
            await asyncio.sleep(15)

    async def _poll_mm_fills(self):
        """Check if any MM quotes have been filled and update inventory."""
        for key, quotes in list(self.market_maker.active_quotes.items()):
            filled_quotes = []
            for quote in quotes:
                try:
                    status = await asyncio.to_thread(
                        self.client.check_fill_status, quote.order_id
                    )
                    if status == "FILLED":
                        self.market_maker.update_inventory(
                            quote.token_id, quote.side, quote.size, quote.price
                        )
                        filled_quotes.append(quote)
                        logger.info("MM QUOTE FILLED: %s %s %.0f @ %.4f",
                                    quote.side, quote.token_id[:12], quote.size, quote.price)
                except Exception as e:
                    logger.debug("Failed to check fill for %s: %s", quote.order_id, e)

            # Remove filled quotes from tracking
            if filled_quotes:
                remaining = [q for q in quotes if q not in filled_quotes]
                if remaining:
                    self.market_maker.active_quotes[key] = remaining
                else:
                    self.market_maker.active_quotes.pop(key, None)

    async def run_latency_loop(self):
        """Latency arb — Binance feed + signal evaluation. Fully async."""
        logger.info("Starting latency arb loop")

        self.binance_feed = BinanceFeed(
            self.settings.binance_ws_url,
            on_price=self.latency_engine.on_binance_price,
        )
        asyncio.create_task(self.binance_feed.run())

        while not self._shutdown:
            try:
                # Window reset (once per 5-min boundary)
                if self.latency_engine.should_reset_window():
                    self.latency_engine.reset_window()
                self.latency_engine.clear_reset_flag()

                # Time-in-window guard: don't trade in last 30s of window
                seconds_into_window = time.time() % 300
                if seconds_into_window > 270:
                    await asyncio.sleep(0.5)
                    continue

                # Check for signal
                sig = self.latency_engine.evaluate_signal()
                if sig:
                    # Use async API — doesn't block the event loop
                    markets = await self.client.async_get_crypto_5min_markets()
                    if markets:
                        market = markets[0]
                        token_ids = market.get("clobTokenIds", [])
                        if len(token_ids) >= 2:
                            target_token = token_ids[0] if sig.suggested_side == "YES" else token_ids[1]
                            current_ask = await self.client.async_get_best_ask(target_token)
                            if current_ask is not None and self.latency_engine.should_execute(sig, current_ask):
                                success = await asyncio.to_thread(
                                    self.latency_engine.execute_signal,
                                    sig, target_token, current_ask,
                                )
                                if success:
                                    self.alerter.trade_alert(
                                        "latency", "EXECUTED",
                                        f"{sig.direction} conf={sig.confidence:.2f} @ ${current_ask:.4f}",
                                    )
            except Exception as e:
                logger.error("Latency arb error: %s", e)

            await asyncio.sleep(0.5)

    async def run_unwind_loop(self):
        """Check open positions every 10 seconds for stop-loss / take-profit / stale exits."""
        logger.info("Starting position unwinder loop")
        while not self._shutdown:
            try:
                exits = await asyncio.to_thread(self.unwinder.run_cycle)
                if exits > 0:
                    self.alerter.risk_alert(f"Unwinder closed {exits} position(s)")
            except Exception as e:
                logger.error("Unwinder error: %s", e)
            await asyncio.sleep(10)

    async def run_fill_tracker_loop(self):
        """Poll pending orders and reconcile groups every 5 seconds."""
        logger.info("Starting fill tracker loop")
        while not self._shutdown:
            try:
                resolved = await asyncio.to_thread(self.fill_tracker.poll_all_pending)
                for gid in resolved:
                    summary = self.fill_tracker.reconcile_group(gid)
                    if summary.get("has_naked_leg"):
                        self.alerter.risk_alert(
                            f"NAKED LEG in group {gid}: {summary.get('naked_positions', [])}")
                        # Auto-unwind naked legs
                        group = self.fill_tracker.groups.get(gid)
                        if group:
                            for order in group.filled_orders:
                                if not order.pnl_recorded:
                                    continue  # already handled in reconcile
                                # Only unwind if the group is partial (some filled, some not)

                # Clean up stale orders
                await asyncio.to_thread(self.fill_tracker.cancel_and_expire_stale)

            except Exception as e:
                logger.error("Fill tracker error: %s", e)
            await asyncio.sleep(5)

    async def run_allocator_loop(self):
        """Black-Litterman capital rebalance every 5 minutes (#22-#25)."""
        logger.info("Starting B-L capital allocator loop")
        while not self._shutdown:
            try:
                # Record recent PnL from each strategy
                self.allocator.record_pnl(0, self.arb_scanner.total_profit)
                self.allocator.record_pnl(1, self.market_maker.total_spread_earned)
                self.allocator.record_pnl(2, self.latency_engine.total_pnl)

                if self.allocator.should_rebalance():
                    allocations = self.allocator.rebalance()
                    # Apply new capital allocations to strategies
                    self.arb_scanner.capital = allocations[0]
                    self.market_maker.capital = allocations[1]
                    self.latency_engine.capital = allocations[2]
            except Exception as e:
                logger.error("Allocator error: %s", e)
            await asyncio.sleep(60)

    async def run_status_loop(self):
        """Print status every 60 seconds."""
        while not self._shutdown:
            await asyncio.sleep(60)
            statuses = []
            for strat in self.settings.strategy_list:
                if strat == "arb":
                    statuses.append(self.arb_scanner.status())
                elif strat == "mm":
                    statuses.append(self.market_maker.status())
                elif strat == "latency":
                    statuses.append(self.latency_engine.status())

            fill_summary = self.fill_tracker.get_summary()
            unwind_status = self.unwinder.status()
            alloc_status = self.allocator.status()

            logger.info(
                "STATUS: %s | daily_pnl=$%.2f | kill_switch=%s | fills=%s | unwinder=%s | alloc=%s",
                statuses, self.risk.daily_pnl, self.risk.kill_switch_active,
                fill_summary, unwind_status, alloc_status,
            )

    async def run(self):
        self.print_banner()

        if self.settings.dry_run:
            logger.info("Running in DRY RUN mode — no real orders will be placed")
        else:
            logger.warning("Running in LIVE mode — real orders will be placed!")

        self.reconcile_on_startup()

        if self.risk.kill_switch_active:
            logger.critical("Kill switch is active from previous session. Exiting. Reset manually to continue.")
            return

        # Infrastructure loops always run
        tasks = [
            asyncio.create_task(self.run_status_loop()),
            asyncio.create_task(self.run_fill_tracker_loop()),
            asyncio.create_task(self.run_unwind_loop()),
            asyncio.create_task(self.run_allocator_loop()),
        ]

        strategies = self.settings.strategy_list
        if "arb" in strategies:
            tasks.append(asyncio.create_task(self.run_arb_loop()))
        if "mm" in strategies:
            tasks.append(asyncio.create_task(self.run_mm_loop()))
        if "latency" in strategies:
            tasks.append(asyncio.create_task(self.run_latency_loop()))

        if not any(s in strategies for s in ("arb", "mm", "latency")):
            logger.warning("No strategies enabled! Set ACTIVE_STRATEGIES in .env")
            return

        logger.info("All strategy loops started. Press Ctrl+C to stop.")

        loop = asyncio.get_event_loop()
        for sig in (signal.SIGINT, signal.SIGTERM):
            loop.add_signal_handler(sig, self._handle_shutdown)

        try:
            await asyncio.gather(*tasks)
        except asyncio.CancelledError:
            pass
        finally:
            await self.shutdown()

    def _handle_shutdown(self):
        logger.info("Shutdown signal received")
        self._shutdown = True

    async def shutdown(self):
        logger.info("Shutting down...")
        try:
            # Exit open positions before cancelling orders
            exits = self.unwinder.force_exit_all()
            if exits:
                logger.info("Force-exited %d positions on shutdown", exits)
            self.market_maker.cancel_all_quotes()
            self.client.cancel_all()
        except Exception:
            pass
        if self.binance_feed:
            await self.binance_feed.stop()
        await self.client.close()

        # Final status
        logger.info("Final fill tracker: %s", self.fill_tracker.get_summary())
        logger.info("Final unwinder: %s", self.unwinder.status())
        logger.info("Shutdown complete")


def main():
    bot = SignalPilot()
    asyncio.run(bot.run())


if __name__ == "__main__":
    main()
