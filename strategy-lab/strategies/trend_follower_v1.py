"""
Trend Follower v1 — EMA crossover with RSI filter and ATR-based exits.

Inspired by ZenomTrader's Challenge Edge methodology:
- Trend-following / trend-continuation
- Low win rate, high reward-to-risk (asymmetric)
- No martingale, no grid
- Works across XAUUSD, NAS100, USDJPY, BTCUSD
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import ema, rsi, atr, crossover, crossunder


class TrendFollowerV1:
    name = "trend_follower"
    version = "1.0"
    description = "EMA crossover trend-follower with RSI filter and ATR-based SL/TP"

    params = {
        "fast_ema": 21,
        "slow_ema": 55,
        "rsi_period": 14,
        "rsi_ob": 70,
        "rsi_os": 30,
        "atr_period": 14,
        "atr_sl_mult": 1.5,
        "atr_tp_mult": 3.0,
    }

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate entry signals with SL/TP levels.

        Logic:
        - LONG: Fast EMA crosses above Slow EMA AND RSI < overbought
        - SHORT: Fast EMA crosses below Slow EMA AND RSI > oversold
        - SL: ATR-based (1.5x ATR from entry)
        - TP: ATR-based (3.0x ATR from entry) → 2:1 R:R target
        """
        df = df.copy()
        p = self.params

        # Calculate indicators
        df["fast_ema"] = ema(df["Close"], p["fast_ema"])
        df["slow_ema"] = ema(df["Close"], p["slow_ema"])
        df["rsi"] = rsi(df["Close"], p["rsi_period"])
        df["atr"] = atr(df["High"], df["Low"], df["Close"], p["atr_period"])

        # Trend direction
        df["trend_up"] = df["fast_ema"] > df["slow_ema"]

        # Crossover signals
        df["cross_up"] = crossover(df["fast_ema"], df["slow_ema"])
        df["cross_down"] = crossunder(df["fast_ema"], df["slow_ema"])

        # Entry signals with RSI filter
        df["signal"] = 0
        df.loc[df["cross_up"] & (df["rsi"] < p["rsi_ob"]), "signal"] = 1
        df.loc[df["cross_down"] & (df["rsi"] > p["rsi_os"]), "signal"] = -1

        # Stop loss and take profit levels
        df["stop_loss"] = np.nan
        df["take_profit"] = np.nan

        # Long entries
        long_mask = df["signal"] == 1
        df.loc[long_mask, "stop_loss"] = df.loc[long_mask, "Close"] - p["atr_sl_mult"] * df.loc[long_mask, "atr"]
        df.loc[long_mask, "take_profit"] = df.loc[long_mask, "Close"] + p["atr_tp_mult"] * df.loc[long_mask, "atr"]

        # Short entries
        short_mask = df["signal"] == -1
        df.loc[short_mask, "stop_loss"] = df.loc[short_mask, "Close"] + p["atr_sl_mult"] * df.loc[short_mask, "atr"]
        df.loc[short_mask, "take_profit"] = df.loc[short_mask, "Close"] - p["atr_tp_mult"] * df.loc[short_mask, "atr"]

        return df

    def pine_script(self) -> str:
        """Return Pine Script v5 strategy logic block."""
        return """
// ─── Indicator Calculations ─────────────────────────────────────────
fast_ma = ta.ema(close, fast_ema)
slow_ma = ta.ema(close, slow_ema)
atr_val = ta.atr(atr_period)
rsi_val = ta.rsi(close, rsi_period)

// ─── Trend Filter ───────────────────────────────────────────────────
trend_up = fast_ma > slow_ma
trend_down = fast_ma < slow_ma

// ─── Entry Conditions ───────────────────────────────────────────────
long_entry = ta.crossover(fast_ma, slow_ma) and rsi_val < rsi_ob
short_entry = ta.crossunder(fast_ma, slow_ma) and rsi_val > rsi_os

// ─── Stop Loss & Take Profit (ATR-based) ────────────────────────────
long_sl = close - atr_val * atr_sl_mult
long_tp = close + atr_val * atr_tp_mult
short_sl = close + atr_val * atr_sl_mult
short_tp = close - atr_val * atr_tp_mult

// ─── Execute Trades ─────────────────────────────────────────────────
if long_entry
    strategy.entry("Long", strategy.long)
    strategy.exit("Long Exit", "Long", stop=long_sl, limit=long_tp)

if short_entry
    strategy.entry("Short", strategy.short)
    strategy.exit("Short Exit", "Short", stop=short_sl, limit=short_tp)

// ─── Plots ──────────────────────────────────────────────────────────
p1 = plot(fast_ma, "Fast EMA", color=color.new(color.blue, 0), linewidth=2)
p2 = plot(slow_ma, "Slow EMA", color=color.new(color.orange, 0), linewidth=2)
fill(p1, p2, color=trend_up ? color.new(color.green, 90) : color.new(color.red, 90))

// ─── Background ─────────────────────────────────────────────────────
bgcolor(long_entry ? color.new(color.green, 85) : short_entry ? color.new(color.red, 85) : na)
"""


# Allow direct instantiation
Strategy = TrendFollowerV1
