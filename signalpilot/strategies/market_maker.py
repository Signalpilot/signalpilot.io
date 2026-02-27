"""
Layer 2: Market Making Bot

Places two-sided limit orders (bid + ask) using the Avellaneda-Stoikov model (#08, #09).
Earns the spread + Polymarket's daily USDC maker rebates.
Zero maker fees — every filled limit order is pure spread profit.

Pricing model:
  - Reservation price adjusts for inventory risk: z = s - q × γ × σ² × (T-t)
  - Optimal spread adapts to volatility and fill rate: δ = γσ²(T-t) + (2/γ)ln(1+γ/κ)
  - VPIN (#12) detects toxic flow — widens spread or pulls quotes when informed traders dominate

KNOWN LIMITATIONS (v2):
- Fill detection relies on polling, not WebSocket.
- Merge is logged but not auto-executed on-chain.
- Volatility estimated from order book snapshots, not tick-level data.
"""
import logging
import time

from signalpilot.core.client import PolymarketClient, OrderError
from signalpilot.core.risk import RiskManager
from signalpilot.config import Settings
from signalpilot.quant import (
    as_bid_ask, estimate_sigma, vpin, kelly_for_directional,
)

logger = logging.getLogger(__name__)


class ActiveQuote:
    __slots__ = ("token_id", "side", "order_id", "price", "size", "timestamp")

    def __init__(self, token_id: str, side: str, order_id: str, price: float, size: float):
        self.token_id = token_id
        self.side = side
        self.order_id = order_id
        self.price = price
        self.size = size
        self.timestamp = time.time()


class MarketMaker:
    """Avellaneda-Stoikov market maker for Polymarket binary markets."""

    def __init__(self, client: PolymarketClient, risk: RiskManager, settings: Settings):
        self.client = client
        self.risk = risk
        self.settings = settings
        self.capital = settings.mm_capital

        # A-S parameters — calibrated for binary markets (price range 0-1)
        # gamma: risk aversion. Higher = wider spreads. For 0-1 range need ~2.0
        #   (equities use 0.01-0.1 but their price range is 10-1000x wider)
        # kappa: order arrival intensity. Polymarket ~10 fills/session on active markets.
        # session_duration: normalized to 1.0 (one quote cycle). A-S time is relative.
        self.gamma: float = 2.0
        self.kappa: float = 10.0
        self.session_duration: float = 1.0
        self.order_size: float = 50.0
        self.refresh_interval: float = 15.0
        self.max_inventory: float = 500.0

        # VPIN tracking — per token
        self._buy_volume: dict[str, float] = {}
        self._sell_volume: dict[str, float] = {}
        self.vpin_threshold: float = 0.7  # Pull quotes above this

        # Price history for volatility estimation
        self._price_history: dict[str, list[float]] = {}

        # State
        self.active_quotes: dict[str, list[ActiveQuote]] = {}
        self.inventory: dict[str, float] = {}
        self.total_spread_earned: float = 0.0
        self.quotes_placed: int = 0

    def _record_price(self, token_id: str, price: float):
        """Track price samples for volatility estimation."""
        if token_id not in self._price_history:
            self._price_history[token_id] = []
        history = self._price_history[token_id]
        history.append(price)
        if len(history) > 100:
            self._price_history[token_id] = history[-100:]

    def _get_sigma(self, token_id: str) -> float:
        """Estimate volatility from price history."""
        history = self._price_history.get(token_id, [])
        return estimate_sigma(history)

    def _get_vpin(self, token_id: str) -> float:
        """Get current VPIN for a token."""
        bv = self._buy_volume.get(token_id, 0.0)
        sv = self._sell_volume.get(token_id, 0.0)
        return vpin(bv, sv)

    def record_volume(self, token_id: str, side: str, size: float):
        """Record trade volume for VPIN calculation. Called on fills."""
        if side == "BUY":
            self._buy_volume[token_id] = self._buy_volume.get(token_id, 0.0) + size
        else:
            self._sell_volume[token_id] = self._sell_volume.get(token_id, 0.0) + size

    def reset_vpin(self, token_id: str):
        """Reset VPIN accumulators (call periodically, e.g. every 5 minutes)."""
        self._buy_volume.pop(token_id, None)
        self._sell_volume.pop(token_id, None)

    def quote_market(self, yes_token: str, no_token: str) -> dict:
        """Place two-sided quotes using Avellaneda-Stoikov pricing."""
        try:
            midpoint = self.client.get_midpoint(yes_token)
        except ValueError:
            logger.debug("Cannot get midpoint for %s, skipping", yes_token[:12])
            return {}

        if midpoint <= 0.05 or midpoint >= 0.95:
            return {}

        self._record_price(yes_token, midpoint)

        # Check VPIN — if toxic flow detected, don't quote
        token_vpin = self._get_vpin(yes_token)
        if token_vpin > self.vpin_threshold:
            logger.warning(
                "VPIN=%.2f > %.2f for %s — PULLING QUOTES (toxic flow)",
                token_vpin, self.vpin_threshold, yes_token[:12],
            )
            return {}

        # A-S model inputs
        yes_inv = self.inventory.get(yes_token, 0.0)
        sigma = self._get_sigma(yes_token)
        time_remaining = self.session_duration  # Fresh each cycle

        # Compute bid/ask via Avellaneda-Stoikov (#08, #09)
        bid_price, ask_price = as_bid_ask(
            mid=midpoint,
            inventory=yes_inv,
            gamma=self.gamma,
            sigma=sigma,
            time_remaining=time_remaining,
            kappa=self.kappa,
        )

        # Clamp to valid range
        bid_price = max(0.01, min(0.98, bid_price))
        ask_price = max(0.02, min(0.99, ask_price))

        if bid_price >= ask_price:
            return {}

        # Enforce minimum 2-cent spread
        if (ask_price - bid_price) < 0.02:
            return {}

        # Widen spread proportionally to VPIN (even below threshold)
        if token_vpin > 0.4:
            widen = (token_vpin - 0.4) * 0.02  # Up to 0.6 cents extra at threshold
            bid_price = round(bid_price - widen, 4)
            ask_price = round(ask_price + widen, 4)

        results = {}

        # Place bid
        if self.risk.can_open_position(yes_token, self.order_size, bid_price):
            try:
                bid_result = self.client.buy_limit(yes_token, bid_price, self.order_size)
                if bid_result:
                    order_id = str(bid_result.get("orderID", ""))
                    if order_id:
                        key = f"bid:{yes_token}"
                        if key not in self.active_quotes:
                            self.active_quotes[key] = []
                        self.active_quotes[key].append(
                            ActiveQuote(yes_token, "BUY", order_id, bid_price, self.order_size)
                        )
                        results["bid"] = {"price": bid_price, "size": self.order_size}
                        self.quotes_placed += 1
            except (OrderError, Exception) as e:
                logger.error("Failed to place bid: %s", e)

        # Place ask
        if self.risk.can_open_position(yes_token, self.order_size, ask_price):
            try:
                ask_result = self.client.sell_limit(yes_token, ask_price, self.order_size)
                if ask_result:
                    order_id = str(ask_result.get("orderID", ""))
                    if order_id:
                        key = f"ask:{yes_token}"
                        if key not in self.active_quotes:
                            self.active_quotes[key] = []
                        self.active_quotes[key].append(
                            ActiveQuote(yes_token, "SELL", order_id, ask_price, self.order_size)
                        )
                        results["ask"] = {"price": ask_price, "size": self.order_size}
                        self.quotes_placed += 1
            except (OrderError, Exception) as e:
                logger.error("Failed to place ask: %s", e)

        if results:
            logger.info(
                "QUOTES [A-S]: %s mid=%.4f bid=%.4f ask=%.4f spread=%.4f σ=%.4f inv=%.0f vpin=%.2f",
                yes_token[:12], midpoint, bid_price, ask_price,
                ask_price - bid_price, sigma, yes_inv, token_vpin,
            )

        return results

    def cancel_all_quotes(self):
        """Cancel all tracked quotes."""
        for key, quotes in list(self.active_quotes.items()):
            for quote in quotes:
                try:
                    self.client.cancel_order(quote.order_id)
                except Exception as e:
                    logger.debug("Failed to cancel %s: %s", quote.order_id, e)
        self.active_quotes.clear()

    def cancel_stale_quotes(self, max_age: float | None = None):
        """Cancel quotes older than max_age seconds."""
        if max_age is None:
            max_age = self.refresh_interval
        now = time.time()
        for key in list(self.active_quotes.keys()):
            quotes = self.active_quotes[key]
            remaining = []
            for quote in quotes:
                if now - quote.timestamp > max_age:
                    try:
                        self.client.cancel_order(quote.order_id)
                    except Exception as e:
                        logger.debug("Failed to cancel %s: %s", quote.order_id, e)
                else:
                    remaining.append(quote)
            if remaining:
                self.active_quotes[key] = remaining
            else:
                del self.active_quotes[key]

    def update_inventory(self, token_id: str, side: str, size: float, price: float):
        """Update inventory on fill notification."""
        if side == "BUY":
            self.inventory[token_id] = self.inventory.get(token_id, 0.0) + size
        else:
            self.inventory[token_id] = self.inventory.get(token_id, 0.0) - size

        # Track volume for VPIN
        self.record_volume(token_id, side, size)
        self.risk.record_fill(token_id, side, size, price)
        logger.info("MM FILL: %s %s %.0f @ %.4f — inventory now %.0f",
                     side, token_id[:12], size, price, self.inventory.get(token_id, 0))

    def check_merge_opportunity(self, yes_token: str, no_token: str) -> float:
        """If we hold both YES and NO, they can be merged back to USDC."""
        yes_inv = self.inventory.get(yes_token, 0.0)
        no_inv = self.inventory.get(no_token, 0.0)

        if yes_inv > 0 and no_inv > 0:
            mergeable = min(yes_inv, no_inv)
            logger.info(
                "MERGE AVAILABLE: %d YES + %d NO = %d sets (requires on-chain merge)",
                yes_inv, no_inv, mergeable,
            )
            return mergeable
        return 0.0

    def run_cycle(self, markets: list[dict]):
        """
        Run one market making cycle:
        1. Cancel stale quotes
        2. Place fresh A-S-priced quotes on each market
        3. Log merge opportunities
        """
        self.cancel_stale_quotes()

        for market in markets:
            token_ids = market.get("clobTokenIds", [])
            if len(token_ids) < 2:
                continue

            yes_token = token_ids[0]
            no_token = token_ids[1]

            self.quote_market(yes_token, no_token)
            self.check_merge_opportunity(yes_token, no_token)

    def status(self) -> dict:
        total_quotes = sum(len(q) for q in self.active_quotes.values())
        return {
            "strategy": "market_maker",
            "model": "avellaneda-stoikov",
            "capital_allocated": self.capital,
            "active_quotes": total_quotes,
            "quotes_placed_total": self.quotes_placed,
            "total_spread_earned": round(self.total_spread_earned, 4),
            "inventory": {k[:12]: v for k, v in self.inventory.items() if v != 0},
            "gamma": self.gamma,
            "kappa": self.kappa,
        }
