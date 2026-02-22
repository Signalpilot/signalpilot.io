"""
Core backtesting engine.

Takes a strategy with signals and simulates trade execution
on historical OHLCV data. Handles position management,
stop-loss, take-profit, and generates trade logs + equity curve.
"""

import pandas as pd
import numpy as np


class Backtester:
    """
    Event-driven backtester.

    Walks through bars sequentially, enters/exits trades based on signals,
    and tracks equity.
    """

    def __init__(self, initial_capital: float = 10000, commission_pct: float = 0.01,
                 slippage_pct: float = 0.01, risk_per_trade_pct: float = 1.0,
                 max_positions: int = 1):
        """
        Args:
            initial_capital: Starting account balance
            commission_pct: Commission per trade (% of trade value)
            slippage_pct: Simulated slippage (% of price)
            risk_per_trade_pct: Risk per trade as % of equity
            max_positions: Max concurrent positions
        """
        self.initial_capital = initial_capital
        self.commission_pct = commission_pct / 100
        self.slippage_pct = slippage_pct / 100
        self.risk_per_trade_pct = risk_per_trade_pct / 100
        self.max_positions = max_positions

    def run(self, df: pd.DataFrame) -> dict:
        """
        Run backtest on a DataFrame with signals.

        Required columns:
            Open, High, Low, Close, Volume
            signal: 1 (long), -1 (short), 0 (flat)
            stop_loss: price level for SL
            take_profit: price level for TP

        Returns:
            {
                "trades": list of trade dicts,
                "equity_curve": pd.Series,
                "df": DataFrame with added columns
            }
        """
        if "signal" not in df.columns:
            raise ValueError("DataFrame must have a 'signal' column")

        trades = []
        equity = self.initial_capital
        equity_curve = pd.Series(dtype=float, index=df.index)
        position = None  # Current open position

        for i in range(1, len(df)):
            bar = df.iloc[i]
            prev_bar = df.iloc[i - 1]
            time = df.index[i]

            # Check SL/TP on open position
            if position is not None:
                closed = self._check_exit(position, bar, time)
                if closed:
                    pnl = self._calc_pnl(position)
                    equity += pnl["pnl_dollar"]
                    trades.append(pnl)
                    position = None

            # Check for new signal (only if no position)
            if position is None and prev_bar.get("signal", 0) != 0:
                signal = prev_bar["signal"]
                sl = prev_bar.get("stop_loss", np.nan)
                tp = prev_bar.get("take_profit", np.nan)

                if not np.isnan(sl):
                    entry_price = bar["Open"]
                    entry_price = self._apply_slippage(entry_price, signal)

                    # Position size based on risk
                    risk_distance = abs(entry_price - sl)
                    if risk_distance > 0:
                        risk_dollar = equity * self.risk_per_trade_pct
                        position_size = risk_dollar / risk_distance
                    else:
                        position_size = equity * self.risk_per_trade_pct / entry_price

                    commission = entry_price * position_size * self.commission_pct

                    position = {
                        "direction": "long" if signal == 1 else "short",
                        "entry_price": entry_price,
                        "entry_time": time,
                        "stop_loss": sl,
                        "take_profit": tp if not np.isnan(tp) else None,
                        "size": position_size,
                        "entry_commission": commission,
                        "equity_at_entry": equity,
                    }

            equity_curve.iloc[i] = equity

        # Close any open position at the end
        if position is not None:
            last_bar = df.iloc[-1]
            position["exit_price"] = last_bar["Close"]
            position["exit_time"] = df.index[-1]
            position["exit_reason"] = "end_of_data"
            exit_commission = position["exit_price"] * position["size"] * self.commission_pct
            position["exit_commission"] = exit_commission
            pnl = self._calc_pnl(position)
            equity += pnl["pnl_dollar"]
            trades.append(pnl)

        # Fill forward equity curve
        equity_curve = equity_curve.ffill()
        equity_curve = equity_curve.fillna(self.initial_capital)

        return {
            "trades": trades,
            "equity_curve": equity_curve,
        }

    def _check_exit(self, pos: dict, bar, time) -> bool:
        """Check if SL or TP is hit on this bar. Returns True if position closed."""
        direction = pos["direction"]
        sl = pos["stop_loss"]
        tp = pos.get("take_profit")

        if direction == "long":
            # Stop loss hit?
            if bar["Low"] <= sl:
                pos["exit_price"] = sl
                pos["exit_time"] = time
                pos["exit_reason"] = "stop_loss"
                pos["exit_commission"] = sl * pos["size"] * self.commission_pct
                return True
            # Take profit hit?
            if tp and bar["High"] >= tp:
                pos["exit_price"] = tp
                pos["exit_time"] = time
                pos["exit_reason"] = "take_profit"
                pos["exit_commission"] = tp * pos["size"] * self.commission_pct
                return True

        elif direction == "short":
            # Stop loss hit?
            if bar["High"] >= sl:
                pos["exit_price"] = sl
                pos["exit_time"] = time
                pos["exit_reason"] = "stop_loss"
                pos["exit_commission"] = sl * pos["size"] * self.commission_pct
                return True
            # Take profit hit?
            if tp and bar["Low"] <= tp:
                pos["exit_price"] = tp
                pos["exit_time"] = time
                pos["exit_reason"] = "take_profit"
                pos["exit_commission"] = tp * pos["size"] * self.commission_pct
                return True

        return False

    def _calc_pnl(self, pos: dict) -> dict:
        """Calculate realized P&L for a closed position."""
        entry = pos["entry_price"]
        exit_p = pos["exit_price"]
        size = pos["size"]
        total_commission = pos["entry_commission"] + pos.get("exit_commission", 0)

        if pos["direction"] == "long":
            raw_pnl = (exit_p - entry) * size
        else:
            raw_pnl = (entry - exit_p) * size

        net_pnl = raw_pnl - total_commission
        pnl_pct = (net_pnl / pos["equity_at_entry"]) * 100

        return {
            "direction": pos["direction"],
            "entry_price": entry,
            "exit_price": exit_p,
            "entry_time": pos["entry_time"],
            "exit_time": pos.get("exit_time"),
            "exit_reason": pos.get("exit_reason", "unknown"),
            "size": size,
            "pnl": raw_pnl - total_commission,
            "pnl_pct": pnl_pct,
            "pnl_dollar": net_pnl,
            "commission": total_commission,
        }

    def _apply_slippage(self, price: float, direction: int) -> float:
        """Apply slippage to entry price."""
        slip = price * self.slippage_pct
        if direction == 1:  # Long — slippage makes entry worse (higher)
            return price + slip
        else:  # Short — slippage makes entry worse (lower)
            return price - slip
