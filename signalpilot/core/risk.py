"""
Risk management — shared across all strategies.
Tracks positions, enforces limits, triggers kill switch.
Persists state to disk so restarts don't lose risk tracking.
"""
import json
import logging
import os
import time

from signalpilot.config import Settings
from signalpilot.core.client import PolymarketClient

logger = logging.getLogger(__name__)

# Use /app/data in Docker, local dir otherwise
_DATA_DIR = "/app/data" if os.path.isdir("/app/data") else "."
STATE_FILE = os.path.join(_DATA_DIR, ".signalpilot_risk_state.json")
KILL_SWITCH_CANCEL_RETRIES = 3


class Position:
    __slots__ = ("token_id", "side", "size", "entry_price", "timestamp")

    def __init__(self, token_id: str, side: str, size: float, entry_price: float):
        self.token_id = token_id
        self.side = side
        self.size = size
        self.entry_price = entry_price
        self.timestamp = time.time()

    @property
    def cost(self) -> float:
        return self.size * self.entry_price

    def to_dict(self) -> dict:
        return {"token_id": self.token_id, "side": self.side, "size": self.size,
                "entry_price": self.entry_price, "timestamp": self.timestamp}

    @classmethod
    def from_dict(cls, d: dict) -> "Position":
        p = cls(d["token_id"], d["side"], d["size"], d["entry_price"])
        p.timestamp = d.get("timestamp", time.time())
        return p


class RiskManager:
    def __init__(self, settings: Settings, client: PolymarketClient):
        self.settings = settings
        self.client = client
        self.positions: dict[str, Position] = {}
        self.daily_pnl: float = 0.0
        self.daily_pnl_reset_ts: float = time.time()
        self.kill_switch_active: bool = False

        # Try to restore state from disk
        self._load_state()

    @property
    def total_exposure(self) -> float:
        return sum(p.cost for p in self.positions.values())

    def can_open_position(self, token_id: str, size: float, price: float) -> bool:
        """Check if a new position passes all risk checks."""
        if self.kill_switch_active:
            logger.warning("Kill switch active — rejecting order")
            return False

        self._maybe_reset_daily_pnl()

        cost = size * price
        capital = self.settings.max_capital_usdc

        # Check daily loss limit (only trigger on LOSSES, not profits)
        if self.daily_pnl <= -(capital * self.settings.max_daily_loss):
            logger.warning("Daily loss limit reached (PnL=$%.2f) — rejecting", self.daily_pnl)
            self.trigger_kill_switch("daily loss limit")
            return False

        # Check per-token position size (accumulate across all positions for this token)
        existing_cost = sum(
            p.cost for key, p in self.positions.items()
            if p.token_id == token_id
        )
        if (existing_cost + cost) > capital * self.settings.max_position_size:
            logger.warning(
                "Position size limit for %s (existing=$%.2f + new=$%.2f > max=$%.2f)",
                token_id[:12], existing_cost, cost, capital * self.settings.max_position_size,
            )
            return False

        # Check total capital usage
        if (self.total_exposure + cost) > capital:
            logger.warning("Total capital limit reached ($%.2f + $%.2f > $%.2f)", self.total_exposure, cost, capital)
            return False

        return True

    def record_fill(self, token_id: str, side: str, size: float, price: float):
        """Record a filled order. Accumulates with existing positions instead of overwriting."""
        key = f"{token_id}:{side}"
        existing = self.positions.get(key)
        if existing:
            # Weighted average price, accumulated size
            total_size = existing.size + size
            avg_price = (existing.cost + size * price) / total_size
            existing.size = total_size
            existing.entry_price = avg_price
            logger.info("Position added: %s %s +%.2f @ $%.4f (total=%.2f @ $%.4f)",
                        side, token_id[:12], size, price, total_size, avg_price)
        else:
            self.positions[key] = Position(token_id, side, size, price)
            logger.info("Position opened: %s %s %.2f @ $%.4f", side, token_id[:12], size, price)
        self._save_state()

    def record_pnl(self, amount: float):
        """Record realized PnL (positive = profit, negative = loss)."""
        self.daily_pnl += amount
        logger.info("PnL recorded: $%.4f (daily total: $%.2f)", amount, self.daily_pnl)
        self._save_state()

    def close_position(self, token_id: str, side: str):
        key = f"{token_id}:{side}"
        self.positions.pop(key, None)
        self._save_state()

    def trigger_kill_switch(self, reason: str):
        """Emergency: cancel all orders and stop trading."""
        logger.critical("KILL SWITCH triggered: %s", reason)
        self.kill_switch_active = True
        self._save_state()

        # Retry cancel_all with backoff
        for attempt in range(KILL_SWITCH_CANCEL_RETRIES):
            try:
                self.client.cancel_all()
                logger.info("Kill switch: all orders cancelled (attempt %d)", attempt + 1)
                return
            except Exception as e:
                logger.error("Kill switch cancel attempt %d failed: %s", attempt + 1, e)
                if attempt < KILL_SWITCH_CANCEL_RETRIES - 1:
                    time.sleep(2 ** attempt)

        logger.critical("KILL SWITCH: FAILED TO CANCEL ALL ORDERS after %d attempts", KILL_SWITCH_CANCEL_RETRIES)

    def reset_kill_switch(self):
        self.kill_switch_active = False
        self._save_state()
        logger.info("Kill switch reset")

    def _maybe_reset_daily_pnl(self):
        """Reset daily PnL counter every 24 hours."""
        if time.time() - self.daily_pnl_reset_ts > 86400:
            logger.info("Daily PnL reset (was $%.2f)", self.daily_pnl)
            self.daily_pnl = 0.0
            self.daily_pnl_reset_ts = time.time()
            self._save_state()

    # ── State Persistence ────────────────────────────────────────

    def _save_state(self):
        """Persist risk state to disk for crash recovery."""
        state = {
            "positions": {k: p.to_dict() for k, p in self.positions.items()},
            "daily_pnl": self.daily_pnl,
            "daily_pnl_reset_ts": self.daily_pnl_reset_ts,
            "kill_switch_active": self.kill_switch_active,
            "saved_at": time.time(),
        }
        try:
            with open(STATE_FILE, "w") as f:
                json.dump(state, f, indent=2)
        except Exception as e:
            logger.error("Failed to save risk state: %s", e)

    def _load_state(self):
        """Restore risk state from disk if available."""
        if not os.path.exists(STATE_FILE):
            return
        try:
            with open(STATE_FILE) as f:
                state = json.load(f)

            # Restore positions
            for key, pdata in state.get("positions", {}).items():
                self.positions[key] = Position.from_dict(pdata)

            self.daily_pnl = state.get("daily_pnl", 0.0)
            self.daily_pnl_reset_ts = state.get("daily_pnl_reset_ts", time.time())
            self.kill_switch_active = state.get("kill_switch_active", False)

            saved_at = state.get("saved_at", 0)
            age_min = (time.time() - saved_at) / 60

            logger.info(
                "Restored risk state (%.0f min old): %d positions, daily_pnl=$%.2f, kill_switch=%s",
                age_min, len(self.positions), self.daily_pnl, self.kill_switch_active,
            )

            if self.kill_switch_active:
                logger.critical("Kill switch was active before restart — staying active. Use reset_kill_switch() to resume.")

        except Exception as e:
            logger.error("Failed to load risk state: %s — starting fresh", e)
