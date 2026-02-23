"""
Leveraged backtesting engine for crypto perpetual futures.

Extends the core backtester with:
- Configurable leverage (1x–125x)
- Margin accounting (initial + maintenance margin)
- Liquidation simulation
- Funding rate costs (8-hour intervals)
- Maker/taker fee structure
- Position margin tracking and equity curve
"""

import pandas as pd
import numpy as np


class LeveragedBacktester:
    """
    Event-driven backtester for leveraged perpetual futures.

    Models real-world crypto perps: margin, liquidation, funding,
    and maker/taker fees.
    """

    def __init__(
        self,
        initial_capital: float = 10000,
        leverage: float = 10.0,
        maker_fee_pct: float = 0.02,
        taker_fee_pct: float = 0.04,
        slippage_pct: float = 0.02,
        risk_per_trade_pct: float = 1.0,
        max_positions: int = 1,
        funding_rate_pct: float = 0.01,
        funding_interval_hours: float = 8.0,
        maintenance_margin_pct: float = 0.5,
        use_maker_for_limit: bool = False,
    ):
        """
        Args:
            initial_capital: Starting account balance (USDT)
            leverage: Position leverage multiplier
            maker_fee_pct: Maker fee as % of notional (limit orders)
            taker_fee_pct: Taker fee as % of notional (market orders)
            slippage_pct: Simulated slippage as % of price
            risk_per_trade_pct: Risk per trade as % of equity
            max_positions: Max concurrent positions
            funding_rate_pct: Funding rate per interval (% of position notional)
            funding_interval_hours: Hours between funding payments
            maintenance_margin_pct: Maintenance margin as % of position notional
            use_maker_for_limit: True = TP exits use maker fee
        """
        self.initial_capital = initial_capital
        self.leverage = leverage
        self.maker_fee = maker_fee_pct / 100
        self.taker_fee = taker_fee_pct / 100
        self.slippage_pct = slippage_pct / 100
        self.risk_per_trade_pct = risk_per_trade_pct / 100
        self.max_positions = max_positions
        self.funding_rate = funding_rate_pct / 100
        self.funding_interval_hours = funding_interval_hours
        self.maintenance_margin = maintenance_margin_pct / 100
        self.use_maker_for_limit = use_maker_for_limit

    def run(self, df: pd.DataFrame) -> dict:
        """
        Run leveraged backtest on a DataFrame with signals.

        Required columns:
            Open, High, Low, Close, Volume
            signal: 1 (long), -1 (short), 0 (flat)
            stop_loss: price level for SL
            take_profit: price level for TP

        Returns:
            {
                "trades": list of trade dicts,
                "equity_curve": pd.Series,
                "liquidations": int,
                "total_funding_paid": float,
            }
        """
        if "signal" not in df.columns:
            raise ValueError("DataFrame must have a 'signal' column")

        trades = []
        equity = self.initial_capital
        equity_curve = pd.Series(dtype=float, index=df.index)
        position = None
        liquidations = 0
        total_funding = 0.0

        for i in range(1, len(df)):
            bar = df.iloc[i]
            prev_bar = df.iloc[i - 1]
            time = df.index[i]

            # --- Funding rate on open position ---
            if position is not None:
                funding_cost = self._calc_funding(position, prev_bar, bar, time)
                if funding_cost != 0:
                    equity -= funding_cost
                    total_funding += funding_cost
                    position["total_funding"] += funding_cost

            # --- Check liquidation ---
            if position is not None:
                liquidated = self._check_liquidation(position, bar, equity)
                if liquidated:
                    pnl = self._close_position(
                        position, position["liquidation_price"], time, "liquidation"
                    )
                    equity += pnl["pnl_dollar"]
                    trades.append(pnl)
                    position = None
                    liquidations += 1
                    equity_curve.iloc[i] = equity
                    continue

            # --- Check SL/TP on open position ---
            if position is not None:
                closed = self._check_exit(position, bar, time)
                if closed:
                    pnl = self._calc_pnl(position)
                    equity += pnl["pnl_dollar"]
                    trades.append(pnl)
                    position = None

            # --- Check for new signal (only if no position) ---
            if position is None and prev_bar.get("signal", 0) != 0:
                signal = prev_bar["signal"]
                sl = prev_bar.get("stop_loss", np.nan)
                tp = prev_bar.get("take_profit", np.nan)

                if not np.isnan(sl) and equity > 0:
                    entry_price = bar["Open"]
                    entry_price = self._apply_slippage(entry_price, signal)

                    # Position sizing: risk-based, then capped by leverage
                    risk_distance = abs(entry_price - sl)
                    if risk_distance > 0:
                        risk_dollar = equity * self.risk_per_trade_pct
                        size_from_risk = risk_dollar / risk_distance
                    else:
                        size_from_risk = (equity * self.risk_per_trade_pct) / entry_price

                    # Max size from leverage constraint
                    max_notional = equity * self.leverage
                    max_size_from_leverage = max_notional / entry_price
                    position_size = min(size_from_risk, max_size_from_leverage)

                    # Notional value and margin
                    notional = position_size * entry_price
                    initial_margin = notional / self.leverage

                    # Entry fee (taker — market order entry)
                    entry_fee = notional * self.taker_fee

                    # Liquidation price
                    liq_price = self._calc_liquidation_price(
                        entry_price, signal, initial_margin, position_size
                    )

                    position = {
                        "direction": "long" if signal == 1 else "short",
                        "entry_price": entry_price,
                        "entry_time": time,
                        "stop_loss": sl,
                        "take_profit": tp if not np.isnan(tp) else None,
                        "size": position_size,
                        "notional": notional,
                        "initial_margin": initial_margin,
                        "leverage_used": notional / equity if equity > 0 else 0,
                        "entry_fee": entry_fee,
                        "equity_at_entry": equity,
                        "liquidation_price": liq_price,
                        "total_funding": 0.0,
                        "last_funding_time": time,
                    }

            equity_curve.iloc[i] = equity

        # Close any open position at end
        if position is not None:
            last_bar = df.iloc[-1]
            pnl = self._close_position(
                position, last_bar["Close"], df.index[-1], "end_of_data"
            )
            equity += pnl["pnl_dollar"]
            trades.append(pnl)

        # Fill forward equity curve
        equity_curve = equity_curve.ffill()
        equity_curve = equity_curve.fillna(self.initial_capital)

        return {
            "trades": trades,
            "equity_curve": equity_curve,
            "liquidations": liquidations,
            "total_funding_paid": round(total_funding, 2),
        }

    def _calc_liquidation_price(
        self, entry: float, direction: int, margin: float, size: float
    ) -> float:
        """
        Calculate liquidation price.

        Long:  liq = entry - (margin - maintenance_buffer) / size
        Short: liq = entry + (margin - maintenance_buffer) / size
        """
        maint_buffer = entry * size * self.maintenance_margin
        available = margin - maint_buffer
        if available <= 0 or size <= 0:
            # Already under-margined — liquidation immediate
            return entry

        if direction == 1:  # Long
            return entry - available / size
        else:  # Short
            return entry + available / size

    def _check_liquidation(self, pos: dict, bar, equity: float) -> bool:
        """Check if price hit liquidation level during this bar."""
        liq = pos["liquidation_price"]
        if pos["direction"] == "long":
            return bar["Low"] <= liq
        else:
            return bar["High"] >= liq

    def _calc_funding(self, pos: dict, prev_bar, bar, time) -> float:
        """
        Calculate funding cost if a funding interval boundary was crossed.

        In real perps, funding is paid every 8 hours.
        We check if the time delta since last funding >= interval.
        """
        last_funding = pos["last_funding_time"]
        hours_elapsed = (time - last_funding).total_seconds() / 3600

        if hours_elapsed < self.funding_interval_hours:
            return 0.0

        # How many funding intervals passed
        intervals = int(hours_elapsed / self.funding_interval_hours)
        notional = pos["size"] * bar["Close"]
        cost = notional * self.funding_rate * intervals

        pos["last_funding_time"] = time
        return cost

    def _check_exit(self, pos: dict, bar, time) -> bool:
        """Check if SL or TP is hit on this bar."""
        direction = pos["direction"]
        sl = pos["stop_loss"]
        tp = pos.get("take_profit")

        if direction == "long":
            if bar["Low"] <= sl:
                self._fill_exit(pos, sl, time, "stop_loss", is_limit=False)
                return True
            if tp and bar["High"] >= tp:
                self._fill_exit(pos, tp, time, "take_profit", is_limit=True)
                return True
        elif direction == "short":
            if bar["High"] >= sl:
                self._fill_exit(pos, sl, time, "stop_loss", is_limit=False)
                return True
            if tp and bar["Low"] <= tp:
                self._fill_exit(pos, tp, time, "take_profit", is_limit=True)
                return True

        return False

    def _fill_exit(self, pos: dict, price: float, time, reason: str, is_limit: bool):
        """Fill exit details on the position dict."""
        pos["exit_price"] = price
        pos["exit_time"] = time
        pos["exit_reason"] = reason

        notional_exit = price * pos["size"]
        fee_rate = self.maker_fee if (is_limit and self.use_maker_for_limit) else self.taker_fee
        pos["exit_fee"] = notional_exit * fee_rate

    def _close_position(self, pos: dict, price: float, time, reason: str) -> dict:
        """Force-close a position (liquidation or end-of-data)."""
        pos["exit_price"] = price
        pos["exit_time"] = time
        pos["exit_reason"] = reason

        notional_exit = price * pos["size"]
        pos["exit_fee"] = notional_exit * self.taker_fee

        return self._calc_pnl(pos)

    def _calc_pnl(self, pos: dict) -> dict:
        """Calculate realized P&L for a closed leveraged position."""
        entry = pos["entry_price"]
        exit_p = pos["exit_price"]
        size = pos["size"]
        total_fees = pos["entry_fee"] + pos.get("exit_fee", 0)
        funding = pos.get("total_funding", 0)

        if pos["direction"] == "long":
            raw_pnl = (exit_p - entry) * size
        else:
            raw_pnl = (entry - exit_p) * size

        net_pnl = raw_pnl - total_fees - funding
        pnl_pct = (net_pnl / pos["equity_at_entry"]) * 100 if pos["equity_at_entry"] > 0 else 0

        return {
            "direction": pos["direction"],
            "entry_price": entry,
            "exit_price": exit_p,
            "entry_time": pos["entry_time"],
            "exit_time": pos.get("exit_time"),
            "exit_reason": pos.get("exit_reason", "unknown"),
            "size": size,
            "notional": pos.get("notional", entry * size),
            "leverage_used": round(pos.get("leverage_used", 1.0), 1),
            "pnl": raw_pnl - total_fees - funding,
            "pnl_pct": pnl_pct,
            "pnl_dollar": net_pnl,
            "fees": round(total_fees, 4),
            "funding": round(funding, 4),
            "commission": total_fees + funding,  # compat with metrics.py
        }

    def _apply_slippage(self, price: float, direction: int) -> float:
        """Apply slippage to entry price."""
        slip = price * self.slippage_pct
        if direction == 1:
            return price + slip
        else:
            return price - slip
