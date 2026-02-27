"""
Layer 1: Structural Arbitrage Scanner

Scans markets for YES + NO combined price < $1.00 (minus fees).
When found, buys both sides for risk-free profit.

Works on:
- 5-minute BTC markets (binary: YES/NO per window)
- Multi-outcome NegRisk markets (validated for mutual exclusivity)
"""
import logging
import time

from signalpilot.core.client import PolymarketClient, OrderError
from signalpilot.core.risk import RiskManager
from signalpilot.core.fills import FillTracker, OrderState
from signalpilot.config import Settings
from signalpilot.quant import kelly_for_arb, negrisk_bregman_arb, alpha_extraction_condition

logger = logging.getLogger(__name__)

# Minimum profit after fees to execute (in dollars per share)
MIN_PROFIT_THRESHOLD = 0.005  # $0.005 per share = 0.5 cents
# Minimum book depth required to execute (shares available at best ask)
MIN_BOOK_DEPTH = 20


class ArbOpportunity:
    __slots__ = ("market_question", "yes_token", "no_token", "yes_ask", "no_ask",
                 "combined", "fee_yes", "fee_no", "net_profit", "yes_depth", "no_depth",
                 "timestamp")

    def __init__(self, market_question: str, yes_token: str, no_token: str,
                 yes_ask: float, no_ask: float, fee_rate: float,
                 yes_depth: float = 0, no_depth: float = 0):
        self.market_question = market_question
        self.yes_token = yes_token
        self.no_token = no_token
        self.yes_ask = yes_ask
        self.no_ask = no_ask
        self.combined = yes_ask + no_ask
        self.fee_yes = PolymarketClient.calc_dynamic_fee(yes_ask, fee_rate)
        self.fee_no = PolymarketClient.calc_dynamic_fee(no_ask, fee_rate)
        self.net_profit = 1.0 - self.combined - self.fee_yes - self.fee_no
        self.yes_depth = yes_depth
        self.no_depth = no_depth
        self.timestamp = time.time()

    @property
    def is_profitable(self) -> bool:
        return self.net_profit > MIN_PROFIT_THRESHOLD

    @property
    def max_executable_shares(self) -> float:
        """Maximum shares we can trade based on book depth on both sides."""
        return min(self.yes_depth, self.no_depth)

    def __repr__(self) -> str:
        return (
            f"ArbOpp({self.market_question[:50]}.. "
            f"YES={self.yes_ask:.4f} NO={self.no_ask:.4f} "
            f"combined={self.combined:.4f} fees={self.fee_yes + self.fee_no:.4f} "
            f"net_profit={self.net_profit:.4f} depth={self.max_executable_shares:.0f})"
        )


class NegRiskOpportunity:
    """Represents a multi-outcome arbitrage opportunity with Bregman divergence."""
    __slots__ = ("event_name", "outcomes", "total_cost", "total_fees", "net_profit",
                 "kl_divergence", "mu_star")

    def __init__(self, event_name: str, outcomes: list[tuple[str, str, float]],
                 total_cost: float, total_fees: float,
                 kl_divergence: float = 0.0, mu_star: list[float] | None = None):
        self.event_name = event_name
        self.outcomes = outcomes  # list of (name, token_id, ask_price)
        self.total_cost = total_cost
        self.total_fees = total_fees
        self.net_profit = 1.0 - total_cost - total_fees
        self.kl_divergence = kl_divergence
        self.mu_star = mu_star or []

    @property
    def is_profitable(self) -> bool:
        return self.net_profit > MIN_PROFIT_THRESHOLD

    def __repr__(self) -> str:
        return (
            f"NegRiskOpp({self.event_name[:40]} "
            f"{len(self.outcomes)} outcomes, cost={self.total_cost:.4f}, "
            f"net={self.net_profit:.4f}, D_KL={self.kl_divergence:.4f})"
        )


class ArbScanner:
    """Continuously scans Polymarket for structural arbitrage opportunities."""

    def __init__(self, client: PolymarketClient, risk: RiskManager, settings: Settings,
                 fill_tracker: FillTracker | None = None):
        self.client = client
        self.risk = risk
        self.settings = settings
        self.fill_tracker = fill_tracker
        self.capital = settings.arb_capital
        self.opportunities_found: int = 0
        self.trades_executed: int = 0
        self.total_profit: float = 0.0

    def scan_binary_markets(self, markets: list[dict], fee_rate: float = 0.0625) -> list[ArbOpportunity]:
        """Scan binary markets for YES+NO < $1 opportunities with depth checks."""
        opportunities = []

        for market in markets:
            try:
                token_ids = market.get("clobTokenIds", [])
                if len(token_ids) < 2:
                    continue

                yes_token = token_ids[0]
                no_token = token_ids[1]
                question = market.get("question", "Unknown")

                # Get live best ask prices — None means empty book
                yes_ask = self.client.get_best_ask(yes_token)
                no_ask = self.client.get_best_ask(no_token)

                if yes_ask is None or no_ask is None:
                    logger.debug("Empty book for %s, skipping", question[:30])
                    continue

                # Check book depth at best ask
                yes_depth = self.client.get_book_depth_at_price(yes_token, "BUY", yes_ask)
                no_depth = self.client.get_book_depth_at_price(no_token, "BUY", no_ask)

                opp = ArbOpportunity(
                    market_question=question,
                    yes_token=yes_token,
                    no_token=no_token,
                    yes_ask=yes_ask,
                    no_ask=no_ask,
                    fee_rate=fee_rate,
                    yes_depth=yes_depth,
                    no_depth=no_depth,
                )

                if opp.is_profitable and opp.max_executable_shares >= MIN_BOOK_DEPTH:
                    logger.info("ARB FOUND: %s", opp)
                    opportunities.append(opp)
                    self.opportunities_found += 1

            except Exception as e:
                logger.debug("Error scanning market %s: %s", market.get("question", "?")[:30], e)

        return opportunities

    def scan_negrisk_event(self, event: dict, fee_rate: float = 0.0) -> list[NegRiskOpportunity]:
        """
        Scan a multi-outcome (NegRisk) event for sum-to-one arbitrage.
        Only processes events that are explicitly marked as negRisk.
        """
        # CRITICAL: validate this is actually a NegRisk (mutually exclusive) event
        if not event.get("negRisk", False):
            return []

        markets = event.get("markets", [])
        if len(markets) < 3:
            return []

        # Collect best ask for YES on each outcome
        outcome_asks: list[tuple[str, str, float]] = []
        total_yes_cost = 0.0
        total_fees = 0.0
        expected_outcomes = len(markets)

        for m in markets:
            token_ids = m.get("clobTokenIds", [])
            if not token_ids:
                # Missing token IDs — cannot safely evaluate this event
                logger.debug("Missing clobTokenIds in NegRisk event %s, skipping entire event",
                             event.get("title", "?")[:30])
                return []
            yes_token = token_ids[0]
            question = m.get("question", m.get("outcome", "?"))
            try:
                yes_ask = self.client.get_best_ask(yes_token)
                if yes_ask is None:
                    logger.debug("Empty book for NegRisk outcome %s, skipping event", question[:30])
                    return []
                fee = PolymarketClient.calc_dynamic_fee(yes_ask, fee_rate)
                outcome_asks.append((question, yes_token, yes_ask))
                total_yes_cost += yes_ask
                total_fees += fee
            except Exception as e:
                logger.debug("Error fetching price for %s: %s", question[:30], e)
                return []

        # Verify we got prices for ALL outcomes
        if len(outcome_asks) != expected_outcomes:
            logger.debug("Only got %d/%d outcomes for NegRisk event, skipping",
                         len(outcome_asks), expected_outcomes)
            return []

        # Bregman projection for mispricing quantification (#29, #34)
        prices = [ask for _, _, ask in outcome_asks]
        fees_list = [PolymarketClient.calc_dynamic_fee(ask, fee_rate) for _, _, ask in outcome_asks]
        bregman = negrisk_bregman_arb(prices, fees_list)

        if not bregman["has_arb"]:
            return []

        # Alpha-extraction condition (#50): D_KL must exceed fees + slippage
        if not alpha_extraction_condition(bregman["kl_divergence"], bregman["total_fees"]):
            logger.debug(
                "NegRisk D_KL=%.4f too small vs fees=%.4f — near-arbitrage-free",
                bregman["kl_divergence"], bregman["total_fees"],
            )
            return []

        event_name = event.get("title", event.get("slug", "Unknown"))
        logger.info(
            "NEGRISK ARB FOUND: %s — %d outcomes, cost=%.4f, fees=%.4f, "
            "net=%.4f, D_KL=%.4f",
            event_name, len(outcome_asks), total_yes_cost, total_fees,
            bregman["dollar_profit_per_set"], bregman["kl_divergence"],
        )
        self.opportunities_found += 1
        return [NegRiskOpportunity(
            event_name=event_name,
            outcomes=outcome_asks,
            total_cost=total_yes_cost,
            total_fees=total_fees,
            kl_divergence=bregman["kl_divergence"],
            mu_star=bregman["mu_star"],
        )]

    def execute_binary_arb(self, opp: ArbOpportunity, shares: float | None = None) -> bool:
        """
        Execute a binary arbitrage: buy YES and NO.
        If one leg fails, attempts to cancel/unwind the other.
        PnL is ONLY recorded after fills are confirmed by the fill tracker.
        """
        if not opp.is_profitable:
            logger.warning("Opportunity no longer profitable, skipping")
            return False

        # Position sizing via Kelly Criterion (#03, #11)
        cost_per_set = opp.combined + opp.fee_yes + opp.fee_no
        if shares is None:
            kelly_f = kelly_for_arb(opp.net_profit, cost_per_set)
            kelly_shares = (self.capital * kelly_f) / cost_per_set if cost_per_set > 0 else 0
            max_by_depth = opp.max_executable_shares
            shares = min(kelly_shares, max_by_depth)

        if shares < 1:
            logger.debug("Too few executable shares (%.2f), skipping", shares)
            return False

        # Risk checks
        if not self.risk.can_open_position(opp.yes_token, shares, opp.yes_ask):
            return False

        logger.info(
            "EXECUTING ARB: %.0f shares @ $%.4f/set — expected profit: $%.4f",
            shares, cost_per_set, shares * opp.net_profit,
        )

        # Create a trade group to track both legs
        ft = self.fill_tracker
        group_id = ft.new_group_id("arb") if ft else ""

        # Execute leg 1 (YES)
        yes_result = None
        try:
            yes_result = self.client.buy_limit(opp.yes_token, opp.yes_ask, shares)
        except (OrderError, Exception) as e:
            logger.error("ARB LEG 1 (YES) FAILED: %s — aborting", e)
            return False

        yes_tracked = None
        if ft and yes_result:
            yes_tracked = ft.track_order(
                yes_result, opp.yes_token, "BUY", opp.yes_ask, shares, "arb", group_id)

        # Execute leg 2 (NO)
        no_result = None
        try:
            no_result = self.client.buy_limit(opp.no_token, opp.no_ask, shares)
        except (OrderError, Exception) as e:
            # LEG 1 is already placed — attempt to cancel it
            logger.error("ARB LEG 2 (NO) FAILED: %s — UNWINDING leg 1", e)
            yes_order_id = yes_result.get("orderID") if isinstance(yes_result, dict) else None
            if yes_order_id:
                try:
                    self.client.cancel_order(yes_order_id)
                    logger.info("Unwound leg 1 (cancelled order %s)", yes_order_id)
                except Exception as cancel_err:
                    logger.critical(
                        "FAILED TO CANCEL LEG 1 order %s — NAKED POSITION: %s",
                        yes_order_id, cancel_err,
                    )
                    self.risk.record_fill(opp.yes_token, "BUY", shares, opp.yes_ask)
            return False

        if ft and no_result:
            ft.track_order(
                no_result, opp.no_token, "BUY", opp.no_ask, shares, "arb", group_id)

        # Poll both legs for fill confirmation
        if ft and group_id:
            group = ft.groups.get(group_id)
            if group:
                # Wait for fills on both legs
                for order in group.orders:
                    ft.poll_until_terminal(order.order_id)

                # Reconcile — this records ACTUAL PnL, not expected
                summary = ft.reconcile_group(group_id)

                if summary.get("all_filled"):
                    pnl = summary["pnl"]
                    self.trades_executed += 1
                    self.total_profit += pnl
                    logger.info("ARB CONFIRMED: actual PnL=$%.4f (total=$%.2f)", pnl, self.total_profit)
                    return True

                if summary.get("has_naked_leg"):
                    logger.critical("ARB PARTIAL FILL — attempting unwind")
                    for order in group.filled_orders:
                        ft.try_unwind_naked_leg(order)
                    return False

                logger.warning("ARB group %s: no fills confirmed", group_id)
                return False

        # Fallback if no fill tracker (e.g. dry run mode)
        self.risk.record_fill(opp.yes_token, "BUY", shares, opp.yes_ask)
        self.risk.record_fill(opp.no_token, "BUY", shares, opp.no_ask)
        profit = shares * opp.net_profit
        self.risk.record_pnl(profit)
        self.trades_executed += 1
        self.total_profit += profit
        logger.info("ARB PLACED (no tracker): expected profit=$%.4f", profit)
        return True

    def execute_negrisk_arb(self, opp: NegRiskOpportunity, shares: float = 50) -> bool:
        """
        Execute a NegRisk arbitrage: buy YES on every outcome.
        Places orders sequentially. If any leg fails, attempts to cancel all previous legs.
        PnL is ONLY recorded after fills are confirmed.
        """
        if not opp.is_profitable:
            return False

        if not self.risk.can_open_position(opp.outcomes[0][1], shares, opp.total_cost):
            return False

        logger.info("EXECUTING NEGRISK ARB: %s — %.0f shares across %d outcomes",
                     opp.event_name[:40], shares, len(opp.outcomes))

        ft = self.fill_tracker
        group_id = ft.new_group_id("arb") if ft else ""
        placed_orders: list[tuple[str, dict]] = []

        for name, token_id, ask_price in opp.outcomes:
            try:
                result = self.client.buy_limit(token_id, ask_price, shares)
                placed_orders.append((token_id, result))
                if ft and result:
                    ft.track_order(result, token_id, "BUY", ask_price, shares, "arb", group_id)
            except (OrderError, Exception) as e:
                logger.error("NEGRISK LEG FAILED (%s): %s — UNWINDING %d previous legs",
                             name[:20], e, len(placed_orders))
                for prev_token, prev_result in placed_orders:
                    order_id = prev_result.get("orderID") if isinstance(prev_result, dict) else None
                    if order_id:
                        try:
                            self.client.cancel_order(order_id)
                        except Exception as cancel_err:
                            logger.critical("FAILED TO CANCEL NegRisk leg %s: %s", prev_token[:12], cancel_err)
                            self.risk.record_fill(prev_token, "BUY", shares, ask_price)
                return False

        # Poll all legs for fill confirmation
        if ft and group_id:
            group = ft.groups.get(group_id)
            if group:
                for order in group.orders:
                    ft.poll_until_terminal(order.order_id)

                summary = ft.reconcile_group(group_id)

                if summary.get("all_filled"):
                    pnl = summary["pnl"]
                    self.trades_executed += 1
                    self.total_profit += pnl
                    logger.info("NEGRISK ARB CONFIRMED: %d legs, actual PnL=$%.4f",
                                 len(opp.outcomes), pnl)
                    return True

                if summary.get("has_naked_leg"):
                    logger.critical("NEGRISK PARTIAL FILL — attempting unwind")
                    for order in group.filled_orders:
                        ft.try_unwind_naked_leg(order)
                    return False

                return False

        # Fallback (dry run / no tracker)
        for name, token_id, ask_price in opp.outcomes:
            self.risk.record_fill(token_id, "BUY", shares, ask_price)
        profit = shares * opp.net_profit
        self.risk.record_pnl(profit)
        self.trades_executed += 1
        self.total_profit += profit
        logger.info("NEGRISK ARB PLACED (no tracker): expected profit=$%.4f", profit)
        return True

    def run_scan_cycle_with_data(
        self,
        crypto_markets: list[dict],
        general_markets: list[dict],
        events: list[dict],
        fee_rate: float = 0.0625,
    ) -> tuple[list[ArbOpportunity], list[NegRiskOpportunity]]:
        """
        Run one full scan cycle with pre-fetched data (from async callers).
        Returns (binary_opps, negrisk_opps).
        """
        binary_opps: list[ArbOpportunity] = []
        negrisk_opps: list[NegRiskOpportunity] = []

        # 1. Scan 5-minute BTC markets (dynamic fee)
        try:
            if crypto_markets:
                opps = self.scan_binary_markets(crypto_markets, fee_rate=fee_rate)
                binary_opps.extend(opps)
                logger.info("Scanned %d crypto 5-min markets, found %d opportunities",
                            len(crypto_markets), len(opps))
        except Exception as e:
            logger.error("Error scanning crypto markets: %s", e)

        # 2. Scan general binary markets (0% fee on standard markets)
        try:
            binary_markets = [m for m in general_markets if len(m.get("clobTokenIds", [])) == 2]
            if binary_markets:
                opps = self.scan_binary_markets(binary_markets, fee_rate=0.0)
                binary_opps.extend(opps)
                logger.info("Scanned %d binary markets, found %d opportunities",
                            len(binary_markets), len(opps))
        except Exception as e:
            logger.error("Error scanning binary markets: %s", e)

        # 3. Scan NegRisk events (validated for negRisk flag)
        try:
            for event in events:
                opps = self.scan_negrisk_event(event, fee_rate=0.0)
                negrisk_opps.extend(opps)
            logger.info("Scanned %d events for NegRisk arb, found %d", len(events), len(negrisk_opps))
        except Exception as e:
            logger.error("Error scanning NegRisk events: %s", e)

        return binary_opps, negrisk_opps

    def run_scan_cycle(self, fee_rate: float = 0.0625) -> tuple[list[ArbOpportunity], list[NegRiskOpportunity]]:
        """
        Run one full scan cycle using sync API (for standalone scan.py).
        Returns (binary_opps, negrisk_opps).
        """
        binary_opps: list[ArbOpportunity] = []
        negrisk_opps: list[NegRiskOpportunity] = []

        # 1. Scan 5-minute BTC markets
        try:
            crypto_markets = self.client.get_crypto_5min_markets()
            if crypto_markets:
                opps = self.scan_binary_markets(crypto_markets, fee_rate=fee_rate)
                binary_opps.extend(opps)
                logger.info("Scanned %d crypto 5-min markets, found %d opportunities",
                            len(crypto_markets), len(opps))
        except Exception as e:
            logger.error("Error scanning crypto markets: %s", e)

        # 2. Scan general binary markets (0% fee on standard markets)
        try:
            general_markets = self.client.get_active_markets(limit=100)
            binary_markets = [m for m in general_markets if len(m.get("clobTokenIds", [])) == 2]
            if binary_markets:
                opps = self.scan_binary_markets(binary_markets, fee_rate=0.0)
                binary_opps.extend(opps)
                logger.info("Scanned %d binary markets, found %d opportunities",
                            len(binary_markets), len(opps))
        except Exception as e:
            logger.error("Error scanning binary markets: %s", e)

        # 3. Scan NegRisk events (validated for negRisk flag)
        try:
            events = self.client.get_events()
            for event in events:
                opps = self.scan_negrisk_event(event, fee_rate=0.0)
                negrisk_opps.extend(opps)
            logger.info("Scanned %d events for NegRisk arb, found %d", len(events), len(negrisk_opps))
        except Exception as e:
            logger.error("Error scanning NegRisk events: %s", e)

        return binary_opps, negrisk_opps

    def status(self) -> dict:
        return {
            "strategy": "arb_scanner",
            "capital_allocated": self.capital,
            "opportunities_found": self.opportunities_found,
            "trades_executed": self.trades_executed,
            "total_profit": round(self.total_profit, 4),
        }
