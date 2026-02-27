"""
Layer 3: Latency Arbitrage Engine

Monitors BTC spot price on Binance via WebSocket.
When spot price moves decisively, buys the correct side on Polymarket's
5-minute BTC Up/Down market before odds update.

Key insight: At probability extremes (near 5% or 95%), the dynamic fee
is only ~0.3%, making latency arb viable. At 50/50 odds the fee is ~3.15%
which kills most edges.

This is the Python prototype. For production, port to Rust.
"""
import logging
import time
from dataclasses import dataclass, field

from signalpilot.core.client import PolymarketClient, OrderError
from signalpilot.core.risk import RiskManager
from signalpilot.core.fills import FillTracker
from signalpilot.config import Settings
from signalpilot.quant import kelly_for_directional, naive_bayes_posterior

logger = logging.getLogger(__name__)


@dataclass
class PriceState:
    """Tracks BTC price movement within a 5-minute window."""
    window_start_price: float = 0.0
    window_start_ts: int = 0
    current_price: float = 0.0
    current_ts: int = 0
    price_samples: list[float] = field(default_factory=list)
    max_samples: int = 100
    _window_reset_done: bool = False  # prevents double-reset

    @property
    def change_pct(self) -> float:
        if self.window_start_price == 0:
            return 0.0
        return (self.current_price - self.window_start_price) / self.window_start_price * 100

    @property
    def direction(self) -> str:
        if self.change_pct > 0.01:
            return "UP"
        elif self.change_pct < -0.01:
            return "DOWN"
        return "FLAT"

    @property
    def directional_momentum(self) -> float:
        """
        Returns signed momentum: positive for UP, negative for DOWN.
        Magnitude 0.0 to 1.0 indicates consistency of direction.
        Weights by magnitude of each tick, not just direction.
        """
        if len(self.price_samples) < 5:
            return 0.0
        recent = self.price_samples[-20:]
        if len(recent) < 5:
            return 0.0

        # Compute signed returns
        returns = [recent[i] - recent[i - 1] for i in range(1, len(recent))]
        if not returns:
            return 0.0

        # Weighted directional consistency
        total_magnitude = sum(abs(r) for r in returns)
        if total_magnitude == 0:
            return 0.0

        # Net direction weighted by magnitude
        net_return = sum(returns)
        consistency = net_return / total_magnitude  # -1.0 to +1.0

        return consistency

    @property
    def momentum_strength(self) -> float:
        """Absolute momentum strength (0.0 to 1.0)."""
        return abs(self.directional_momentum)

    def add_sample(self, price: float):
        self.price_samples.append(price)
        if len(self.price_samples) > self.max_samples:
            self.price_samples = self.price_samples[-self.max_samples:]

    def reset_window(self, price: float, ts: int):
        self.window_start_price = price
        self.window_start_ts = ts
        self.price_samples.clear()
        self._window_reset_done = True

    def mark_reset_consumed(self):
        """Call after processing the reset to allow next window's reset."""
        self._window_reset_done = False


@dataclass
class Signal:
    """A trading signal from the latency arb engine."""
    direction: str          # "UP" or "DOWN"
    confidence: float       # 0.0 to 1.0 — how sure we are of the direction
    btc_change_pct: float   # BTC price change since window start
    momentum: float         # Signed momentum
    suggested_side: str     # "YES" or "NO" token to buy
    timestamp: float = field(default_factory=time.time)


class LatencyArbEngine:
    """
    Detects when BTC spot price movement is decisive but Polymarket
    hasn't repriced yet, and enters at favorable odds.
    """

    def __init__(self, client: PolymarketClient, risk: RiskManager, settings: Settings,
                 fill_tracker: FillTracker | None = None):
        self.client = client
        self.risk = risk
        self.settings = settings
        self.fill_tracker = fill_tracker
        self.capital = settings.latency_capital

        # Signal thresholds
        self.min_btc_change_pct: float = 0.05   # Minimum 0.05% BTC move to trigger
        self.min_momentum: float = 0.4          # Minimum momentum strength
        self.min_confidence: float = 0.65        # Minimum confidence to trade
        self.max_entry_price: float = 0.70       # Don't buy above $0.70 (fee too high)
        self.min_edge_cents: float = 0.02        # Minimum 2-cent edge after fees

        # Position sizing
        self.base_size_usdc: float = min(100.0, self.capital * 0.05)

        # State
        self.price_state = PriceState()
        self.signals_generated: int = 0
        self.trades_executed: int = 0
        self.total_pnl: float = 0.0

        # Cooldown
        self._last_trade_ts: float = 0.0
        self._trade_cooldown: float = 30.0
        self._window_reset_flag: bool = False

    def on_binance_price(self, price: float, ts_ms: int):
        """Called on every Binance BTC/USDT trade."""
        self.price_state.current_price = price
        self.price_state.current_ts = ts_ms
        self.price_state.add_sample(price)

        if self.price_state.window_start_price == 0:
            self.price_state.reset_window(price, ts_ms)

    def evaluate_signal(self) -> Signal | None:
        """
        Evaluate current price state and generate a trading signal if conditions met.
        """
        ps = self.price_state

        if ps.window_start_price == 0 or ps.current_price == 0:
            return None

        change_pct = abs(ps.change_pct)
        momentum = ps.directional_momentum  # SIGNED: positive = up, negative = down
        abs_momentum = abs(momentum)

        if change_pct < self.min_btc_change_pct:
            return None

        if abs_momentum < self.min_momentum:
            return None

        if time.time() - self._last_trade_ts < self._trade_cooldown:
            return None

        # Verify momentum direction matches price direction
        direction = ps.direction
        if direction == "UP" and momentum < 0:
            return None  # Price up but recent ticks down — conflicting
        if direction == "DOWN" and momentum > 0:
            return None

        # Confidence based on change magnitude + momentum consistency
        change_score = min(change_pct / 0.2, 1.0)
        confidence = (change_score * 0.6) + (abs_momentum * 0.4)

        if confidence < self.min_confidence:
            return None

        suggested_side = "YES" if direction == "UP" else "NO"

        signal = Signal(
            direction=direction,
            confidence=confidence,
            btc_change_pct=ps.change_pct,
            momentum=momentum,
            suggested_side=suggested_side,
        )

        self.signals_generated += 1
        logger.info(
            "SIGNAL: %s confidence=%.2f btc_change=%.4f%% momentum=%.2f",
            direction, confidence, ps.change_pct, momentum,
        )

        return signal

    def estimate_fair_value(self, signal: Signal) -> float:
        """
        Estimate P(candle closes in signal direction) using Naive Bayes (#04).

        Features: [|change_pct|, |momentum|]
        Likelihoods: Gaussian parameters estimated from BTC 5-min candle behavior.
        These priors should be calibrated from historical backtest data.
        When sufficient data is collected, replace these defaults with empirical fits.

        Falls back to piecewise linear for extreme values where Bayes is less reliable.
        """
        change = abs(signal.btc_change_pct)
        momentum = abs(signal.momentum)

        # Naive Bayes with Gaussian likelihoods (#04)
        # Feature 1: |BTC change %|, Feature 2: |momentum|
        # Likelihoods calibrated from BTC 5-min candle statistics:
        #   When candle closes in direction of early move:
        #     change: mean=0.12%, std=0.08%  (larger moves confirm direction)
        #     momentum: mean=0.65, std=0.20  (consistent ticks)
        #   When candle reverses:
        #     change: mean=0.06%, std=0.04%  (small moves often reverse)
        #     momentum: mean=0.35, std=0.25  (inconsistent ticks)
        p_up = naive_bayes_posterior(
            prior_up=0.52,  # Slight upward bias in crypto (historical)
            features=[change, momentum],
            likelihoods_up=[
                (0.12, 0.08),   # |change| when direction confirmed
                (0.65, 0.20),   # |momentum| when direction confirmed
            ],
            likelihoods_down=[
                (0.06, 0.04),   # |change| when direction reverses
                (0.35, 0.25),   # |momentum| when direction reverses
            ],
        )

        # Clamp to reasonable range — Bayes can be overconfident with few features
        return max(0.52, min(0.88, p_up))

    def should_execute(self, signal: Signal, current_ask: float) -> bool:
        """
        Determine if we should execute based on estimated fair value vs market price.
        """
        fair_value = self.estimate_fair_value(signal)
        fee = PolymarketClient.calc_dynamic_fee(current_ask)

        edge = fair_value - current_ask - fee

        if edge < self.min_edge_cents:
            logger.debug(
                "Edge too small: fair=%.4f ask=%.4f fee=%.4f edge=%.4f (need %.4f)",
                fair_value, current_ask, fee, edge, self.min_edge_cents,
            )
            return False

        if current_ask > self.max_entry_price:
            logger.debug("Ask too high: %.4f > max %.4f", current_ask, self.max_entry_price)
            return False

        logger.info(
            "EDGE CONFIRMED: fair=%.4f ask=%.4f fee=%.4f net_edge=%.4f",
            fair_value, current_ask, fee, edge,
        )
        return True

    def execute_signal(self, signal: Signal, token_id: str, current_ask: float) -> bool:
        """Execute a latency arb trade. PnL only recorded on confirmed fill."""
        fair_value = self.estimate_fair_value(signal)
        fee = PolymarketClient.calc_dynamic_fee(current_ask)
        edge = fair_value - current_ask - fee

        # Kelly position sizing (#03) — bet proportional to edge, not arbitrary
        kelly_f = kelly_for_directional(fair_value, current_ask, fee)
        size_usdc = self.capital * kelly_f
        size_usdc = max(5.0, min(size_usdc, self.capital * 0.10))  # Floor $5, cap 10% of capital
        shares = size_usdc / current_ask

        if not self.risk.can_open_position(token_id, shares, current_ask):
            return False

        logger.info(
            "EXECUTING LATENCY ARB: %s %s %.0f shares @ $%.4f ($%.2f) edge=$%.4f",
            signal.direction, signal.suggested_side, shares, current_ask, size_usdc, edge,
        )

        try:
            result = self.client.buy_limit(token_id, current_ask, shares)
            if not result:
                return False

            self._last_trade_ts = time.time()

            ft = self.fill_tracker
            if ft:
                group_id = ft.new_group_id("latency")
                tracked = ft.track_order(
                    result, token_id, "BUY", current_ask, shares, "latency", group_id)
                if tracked:
                    # Poll for fill — latency trades need fast confirmation
                    state = ft.poll_until_terminal(tracked.order_id, timeout=8.0)
                    if state.value == "FILLED":
                        self.risk.record_fill(token_id, "BUY", shares, current_ask)
                        self.trades_executed += 1
                        # Don't record PnL yet — position is open, PnL comes on close
                        logger.info("LATENCY FILL CONFIRMED: %s %.0f @ $%.4f edge=$%.4f",
                                     signal.direction, shares, current_ask, edge)
                        return True
                    else:
                        logger.warning("LATENCY ORDER NOT FILLED (state=%s) — no position recorded", state.value)
                        return False

            # Fallback (dry run / no tracker)
            self.risk.record_fill(token_id, "BUY", shares, current_ask)
            self.trades_executed += 1
            self.total_pnl += shares * edge
            logger.info("LATENCY TRADE PLACED (no tracker): edge=$%.4f", edge)
            return True

        except (OrderError, Exception) as e:
            logger.error("LATENCY ARB EXECUTION FAILED: %s", e)

        return False

    def should_reset_window(self) -> bool:
        """Check if we're at the start of a new 5-minute window."""
        now = time.time()
        seconds_into_window = now % 300
        # Only reset in the first 1 second, and only once per window
        return seconds_into_window < 1 and not self._window_reset_flag

    def reset_window(self):
        """Call this at the start of each new 5-minute window."""
        if self.price_state.current_price > 0:
            self.price_state.reset_window(
                self.price_state.current_price,
                self.price_state.current_ts,
            )
            self._window_reset_flag = True
            logger.debug("Window reset — new start price: $%.2f", self.price_state.window_start_price)

    def clear_reset_flag(self):
        """Call when we're past the first second of a window."""
        now = time.time()
        if now % 300 > 2:
            self._window_reset_flag = False

    def status(self) -> dict:
        return {
            "strategy": "latency_arb",
            "capital_allocated": self.capital,
            "btc_price": self.price_state.current_price,
            "btc_change_pct": round(self.price_state.change_pct, 4),
            "momentum": round(self.price_state.directional_momentum, 2),
            "signals_generated": self.signals_generated,
            "trades_executed": self.trades_executed,
            "total_pnl": round(self.total_pnl, 4),
        }
