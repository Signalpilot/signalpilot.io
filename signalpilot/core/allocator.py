"""
Capital Allocator — Black-Litterman dynamic allocation across strategies (#22-#25).

Instead of static 40/40/20 splits, uses recent PnL history to form "views"
about which strategies deserve more capital, then blends those views with
the equilibrium (current allocation) via Black-Litterman.

Runs periodically (e.g. every 5 minutes) and adjusts strategy capital.

Design choices:
- Conservative: B-L posterior never moves more than ±15% from current allocation.
- Minimum allocation: No strategy drops below 10% of total capital.
- Gradual rebalance: Allocation changes are applied as exponential moving averages.
"""
import logging
import time
from dataclasses import dataclass, field

from signalpilot.quant import (
    bl_equilibrium_returns,
    bl_posterior,
    bl_allocate,
    sharpe_ratio,
)

logger = logging.getLogger(__name__)

# Strategy indices
ARB = 0
MM = 1
LATENCY = 2
STRATEGY_NAMES = ["arb", "mm", "latency"]


@dataclass
class AllocationState:
    """Current allocation and performance tracking."""
    weights: list[float] = field(default_factory=lambda: [0.40, 0.40, 0.20])
    pnl_history: dict[int, list[float]] = field(default_factory=lambda: {0: [], 1: [], 2: []})
    last_rebalance_ts: float = 0.0
    rebalance_count: int = 0


class CapitalAllocator:
    """Black-Litterman capital allocator for multi-strategy portfolio."""

    def __init__(self, total_capital: float, initial_weights: list[float] | None = None):
        self.total_capital = total_capital
        self.state = AllocationState()
        if initial_weights:
            self.state.weights = list(initial_weights)

        # B-L parameters
        self.risk_aversion: float = 3.0   # Higher than equities — prediction markets are riskier
        self.tau: float = 0.05            # Uncertainty in equilibrium (standard B-L value)
        self.min_weight: float = 0.10     # No strategy drops below 10%
        self.max_shift: float = 0.15      # Max ±15% shift per rebalance
        self.ema_alpha: float = 0.3       # Smoothing factor for allocation changes
        self.rebalance_interval: float = 300.0  # 5 minutes

        # Covariance estimated from typical strategy return distributions
        # Arb: low variance, low correlation with others
        # MM: medium variance, slightly negative correlation with latency
        # Latency: high variance, slightly negative correlation with MM
        self._base_cov: list[list[float]] = [
            [0.0004, 0.0001, 0.0001],  # arb
            [0.0001, 0.0016, -0.0002],  # mm
            [0.0001, -0.0002, 0.0025],  # latency
        ]

    def record_pnl(self, strategy_idx: int, pnl: float):
        """Record a PnL data point for a strategy."""
        history = self.state.pnl_history[strategy_idx]
        history.append(pnl)
        # Keep last 200 data points
        if len(history) > 200:
            self.state.pnl_history[strategy_idx] = history[-200:]

    def should_rebalance(self) -> bool:
        """Check if it's time to rebalance."""
        now = time.time()
        if now - self.state.last_rebalance_ts < self.rebalance_interval:
            return False
        # Need at least 10 data points from each active strategy
        for idx in range(3):
            if len(self.state.pnl_history[idx]) < 10:
                return False
        return True

    def rebalance(self) -> list[float]:
        """Run Black-Litterman rebalance and return new capital allocations.

        Returns list of [arb_capital, mm_capital, latency_capital].
        """
        current_weights = self.state.weights

        # Step 1: Equilibrium returns from current allocation (#22)
        pi = bl_equilibrium_returns(
            risk_aversion=self.risk_aversion,
            cov_matrix=self._get_cov(),
            market_weights=current_weights,
        )

        # Step 2: Form views from recent performance
        views, view_matrix, omega = self._form_views()

        if not views:
            # No strong views — keep current allocation
            return [w * self.total_capital for w in current_weights]

        # Step 3: Black-Litterman posterior (#25)
        posterior = bl_posterior(
            equilibrium=pi,
            tau=self.tau,
            cov_matrix=self._get_cov(),
            views=views,
            view_matrix=view_matrix,
            omega=omega,
        )

        # Step 4: Optimal weights from posterior
        raw_allocations = bl_allocate(
            posterior_returns=posterior,
            cov_matrix=self._get_cov(),
            risk_aversion=self.risk_aversion,
            total_capital=1.0,  # Compute as weights first
        )

        # Step 5: Convert to weights and apply constraints
        total_abs = sum(abs(w) for w in raw_allocations)
        if total_abs > 0:
            new_weights = [abs(w) / total_abs for w in raw_allocations]
        else:
            new_weights = list(current_weights)

        # Apply constraints
        new_weights = self._constrain_weights(new_weights, current_weights)

        # Step 6: EMA smoothing — don't jump to new weights immediately
        smoothed = [
            self.ema_alpha * new_weights[i] + (1 - self.ema_alpha) * current_weights[i]
            for i in range(3)
        ]

        # Renormalize after smoothing
        total = sum(smoothed)
        smoothed = [w / total for w in smoothed]

        self.state.weights = smoothed
        self.state.last_rebalance_ts = time.time()
        self.state.rebalance_count += 1

        allocations = [w * self.total_capital for w in smoothed]

        logger.info(
            "B-L REBALANCE #%d: arb=%.1f%% ($%.0f) mm=%.1f%% ($%.0f) lat=%.1f%% ($%.0f)",
            self.state.rebalance_count,
            smoothed[0] * 100, allocations[0],
            smoothed[1] * 100, allocations[1],
            smoothed[2] * 100, allocations[2],
        )

        return allocations

    def _form_views(self) -> tuple[list[float], list[list[float]], list[list[float]]]:
        """Form B-L views from recent strategy Sharpe ratios.

        Views express relative beliefs:
        - If arb Sharpe > latency Sharpe: view that arb outperforms latency
        - View confidence proportional to Sharpe difference magnitude
        """
        sharpes = []
        for idx in range(3):
            pnls = self.state.pnl_history[idx]
            sr = sharpe_ratio(pnls) if len(pnls) >= 5 else 0.0
            sharpes.append(sr)

        views = []
        view_matrix = []
        omega_diag = []

        # Relative views: compare each pair
        pairs = [(ARB, MM), (ARB, LATENCY), (MM, LATENCY)]
        for i, j in pairs:
            diff = sharpes[i] - sharpes[j]
            if abs(diff) < 0.1:
                continue  # No meaningful difference

            # View: strategy i outperforms strategy j by `diff` return
            view_val = diff * 0.001  # Scale to return units
            views.append(view_val)

            # Picking matrix: +1 on winner, -1 on loser
            row = [0.0, 0.0, 0.0]
            row[i] = 1.0
            row[j] = -1.0
            view_matrix.append(row)

            # View uncertainty: inversely proportional to data quantity
            min_data = min(len(self.state.pnl_history[i]), len(self.state.pnl_history[j]))
            uncertainty = 0.001 / max(min_data / 100, 0.1)
            omega_diag.append(uncertainty)

        if not views:
            return [], [], []

        # Build diagonal Omega
        k = len(views)
        omega = [[0.0] * k for _ in range(k)]
        for i in range(k):
            omega[i][i] = omega_diag[i]

        return views, view_matrix, omega

    def _constrain_weights(
        self, new_weights: list[float], current_weights: list[float],
    ) -> list[float]:
        """Apply minimum allocation and max shift constraints."""
        constrained = list(new_weights)

        # Enforce minimum weight
        for i in range(3):
            constrained[i] = max(constrained[i], self.min_weight)

        # Enforce max shift from current
        for i in range(3):
            shift = constrained[i] - current_weights[i]
            if abs(shift) > self.max_shift:
                constrained[i] = current_weights[i] + (self.max_shift if shift > 0 else -self.max_shift)

        # Renormalize
        total = sum(constrained)
        constrained = [w / total for w in constrained]

        return constrained

    def _get_cov(self) -> list[list[float]]:
        """Get covariance matrix, updated from actual PnL if enough data."""
        # If we have enough data, compute empirical covariance
        min_len = min(len(self.state.pnl_history[i]) for i in range(3))
        if min_len < 30:
            return self._base_cov

        n = min_len
        means = []
        for i in range(3):
            recent = self.state.pnl_history[i][-n:]
            means.append(sum(recent) / n)

        cov = [[0.0] * 3 for _ in range(3)]
        for i in range(3):
            for j in range(3):
                pnl_i = self.state.pnl_history[i][-n:]
                pnl_j = self.state.pnl_history[j][-n:]
                cov[i][j] = sum(
                    (pnl_i[k] - means[i]) * (pnl_j[k] - means[j])
                    for k in range(n)
                ) / (n - 1)
                # Add small regularization to avoid singular matrix
                if i == j:
                    cov[i][j] = max(cov[i][j], 1e-6)

        return cov

    def get_allocations(self) -> list[float]:
        """Get current dollar allocations per strategy."""
        return [w * self.total_capital for w in self.state.weights]

    def status(self) -> dict:
        return {
            "allocator": "black-litterman",
            "weights": {STRATEGY_NAMES[i]: round(w, 3) for i, w in enumerate(self.state.weights)},
            "allocations": {
                STRATEGY_NAMES[i]: round(w * self.total_capital, 2)
                for i, w in enumerate(self.state.weights)
            },
            "rebalance_count": self.state.rebalance_count,
            "data_points": {
                STRATEGY_NAMES[i]: len(self.state.pnl_history[i]) for i in range(3)
            },
        }
