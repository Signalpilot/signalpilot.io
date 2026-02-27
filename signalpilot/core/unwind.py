"""
Position Unwinder — actively manages open positions that need to be closed.

Handles:
1. Stop-loss: sells positions that have moved against us past the stop-loss threshold.
2. Expiry exit: sells positions before market resolution to lock in profit/limit loss
   rather than gambling on binary outcome.
3. Stale position cleanup: closes positions that have been open too long.
"""
import logging
import time

from signalpilot.core.risk import RiskManager, Position

logger = logging.getLogger(__name__)

# How close to market close we start exiting (seconds before resolution)
EXIT_BEFORE_CLOSE_SECS = 60
# Minimum position age before we consider unwinding (avoid closing fresh positions)
MIN_POSITION_AGE = 30.0
# Maximum position age — force exit regardless
MAX_POSITION_AGE = 3600.0  # 1 hour


class PositionUnwinder:
    """
    Monitors open positions and exits them based on stop-loss rules,
    time-based rules, and market conditions.
    """

    def __init__(self, client, risk: RiskManager, stop_loss_pct: float = 0.15):
        self.client = client
        self.risk = risk
        self.stop_loss_pct = stop_loss_pct
        self.unwinds_executed: int = 0
        self.unwind_pnl: float = 0.0

    def check_stop_loss(self, position: Position) -> bool:
        """Check if a position has breached its stop-loss level."""
        if position.side != "BUY":
            return False

        try:
            current_bid = self.client.get_best_bid(position.token_id)
            if current_bid is None:
                return False

            loss_pct = (position.entry_price - current_bid) / position.entry_price
            if loss_pct >= self.stop_loss_pct:
                logger.warning(
                    "STOP-LOSS TRIGGERED: %s entry=$%.4f current=$%.4f loss=%.1f%%",
                    position.token_id[:12], position.entry_price, current_bid, loss_pct * 100,
                )
                return True
        except Exception as e:
            logger.debug("Error checking stop-loss for %s: %s", position.token_id[:12], e)
        return False

    def check_take_profit(self, position: Position, take_profit_pct: float = 0.10) -> bool:
        """Check if a position has hit its take-profit level."""
        if position.side != "BUY":
            return False

        try:
            current_bid = self.client.get_best_bid(position.token_id)
            if current_bid is None:
                return False

            gain_pct = (current_bid - position.entry_price) / position.entry_price
            if gain_pct >= take_profit_pct:
                logger.info(
                    "TAKE-PROFIT HIT: %s entry=$%.4f current=$%.4f gain=%.1f%%",
                    position.token_id[:12], position.entry_price, current_bid, gain_pct * 100,
                )
                return True
        except Exception as e:
            logger.debug("Error checking take-profit for %s: %s", position.token_id[:12], e)
        return False

    def check_stale(self, position: Position) -> bool:
        """Check if a position is too old and should be force-closed."""
        return position.timestamp > 0 and (time.time() - position.timestamp) > MAX_POSITION_AGE

    def exit_position(self, position: Position, reason: str) -> bool:
        """
        Sell a position at the best available bid.
        Returns True if the sell order was placed.
        """
        try:
            current_bid = self.client.get_best_bid(position.token_id)
            if current_bid is None or current_bid <= 0:
                logger.warning("Cannot exit %s — no bid available", position.token_id[:12])
                return False

            logger.info(
                "EXITING POSITION (%s): %s SELL %.0f @ $%.4f (entry=$%.4f)",
                reason, position.token_id[:12], position.size, current_bid, position.entry_price,
            )

            result = self.client.sell_limit(position.token_id, current_bid, position.size)
            if result:
                pnl = position.size * (current_bid - position.entry_price)
                self.risk.record_pnl(pnl)
                self.risk.close_position(position.token_id, position.side)
                self.unwinds_executed += 1
                self.unwind_pnl += pnl
                logger.info("EXIT PLACED: %s PnL=$%.4f (%s)", position.token_id[:12], pnl, reason)
                return True

        except Exception as e:
            logger.error("EXIT FAILED for %s: %s", position.token_id[:12], e)

        return False

    def run_cycle(self, skip_arb: bool = True) -> int:
        """
        Check all open positions and exit any that need it.
        Returns the number of positions exited.

        skip_arb: If True, don't unwind positions that are part of arb trades
                  (those settle automatically when the market resolves).
        """
        exits = 0
        # Copy positions dict to avoid mutation during iteration
        positions = list(self.risk.positions.items())

        for key, position in positions:
            age = time.time() - position.timestamp if position.timestamp > 0 else 0

            # Skip very fresh positions
            if age < MIN_POSITION_AGE:
                continue

            # Check stop-loss
            if self.check_stop_loss(position):
                if self.exit_position(position, "stop-loss"):
                    exits += 1
                continue

            # Check take-profit (only for latency/mm positions, not arb)
            if self.check_take_profit(position):
                if self.exit_position(position, "take-profit"):
                    exits += 1
                continue

            # Check stale positions — force close after MAX_POSITION_AGE
            if self.check_stale(position):
                if self.exit_position(position, f"stale ({age:.0f}s old)"):
                    exits += 1
                continue

        return exits

    def force_exit_all(self) -> int:
        """Emergency: exit every open position at market. Used during shutdown."""
        exits = 0
        for key, position in list(self.risk.positions.items()):
            if self.exit_position(position, "force-exit-all"):
                exits += 1
        return exits

    def status(self) -> dict:
        return {
            "unwinds_executed": self.unwinds_executed,
            "unwind_pnl": round(self.unwind_pnl, 4),
            "open_positions": len(self.risk.positions),
        }
