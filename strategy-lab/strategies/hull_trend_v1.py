"""
Hull MA Trend v1 — Hull Moving Average crossover with zero-lag advantage.

Core insight: Hull MA eliminates the lag problem of EMAs. Where EMA(21)
responds ~10 bars late to a trend change, Hull(21) responds in ~3-4 bars.
This means EARLIER entries, TIGHTER stops, and BETTER R:R.

Mechanism:
- Hull MA fast/slow crossover for trend direction
- Hull MA slope (acceleration) confirms momentum is building
- RSI filter prevents chasing extremes
- ADX confirms trend exists (not choppy)
- SuperTrend provides structural confirmation

This should beat EMA crossover strategies on the same pairs by entering
trends 5-10 bars earlier.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import (
    hull_ma, ema, rsi, atr, adx, supertrend, crossover, crossunder
)


class HullTrendV1:
    name = "hull_trend"
    version = "1.0"
    description = "Hull MA crossover — zero-lag trend entries"

    params = {
        # Hull MAs (fast responds in ~sqrt(period) bars)
        "hull_fast": 16,
        "hull_slow": 48,

        # Trend confirmation
        "st_period": 10,
        "st_mult": 3.0,
        "adx_period": 14,
        "adx_min": 18,

        # RSI filter
        "rsi_period": 14,
        "rsi_max_long": 72,
        "rsi_min_short": 28,

        # Hull slope (momentum acceleration)
        "slope_lookback": 3,

        # Risk management
        "atr_period": 14,
        "atr_sl_mult": 1.2,      # Tighter stop — Hull enters earlier
        "atr_tp_mult": 3.5,      # Wide TP — let confirmed trends run

        # Volatility filter
        "vol_lookback": 100,
        "vol_min_pctile": 10,
        "vol_max_pctile": 95,
    }

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        p = self.params

        # ── Hull MAs ──────────────────────────────────────────────────
        df["hull_fast"] = hull_ma(df["Close"], p["hull_fast"])
        df["hull_slow"] = hull_ma(df["Close"], p["hull_slow"])

        # Hull crossovers
        df["cross_up"] = crossover(df["hull_fast"], df["hull_slow"])
        df["cross_down"] = crossunder(df["hull_fast"], df["hull_slow"])

        # Hull slope (momentum direction)
        lb = p["slope_lookback"]
        df["hull_slope"] = df["hull_fast"].diff(lb) / df["hull_fast"].shift(lb) * 100

        # ── Confirmation indicators ───────────────────────────────────
        st_line, st_dir = supertrend(df["High"], df["Low"], df["Close"],
                                      p["st_period"], p["st_mult"])
        df["st_dir"] = st_dir

        adx_val, plus_di, minus_di = adx(df["High"], df["Low"], df["Close"], p["adx_period"])
        df["adx"] = adx_val
        df["plus_di"] = plus_di
        df["minus_di"] = minus_di

        df["rsi"] = rsi(df["Close"], p["rsi_period"])
        df["atr"] = atr(df["High"], df["Low"], df["Close"], p["atr_period"])

        # Volatility filter
        atr_pctile = df["atr"].rolling(p["vol_lookback"]).rank(pct=True) * 100
        df["vol_ok"] = (atr_pctile >= p["vol_min_pctile"]) & (atr_pctile <= p["vol_max_pctile"])

        # ── Signal generation ─────────────────────────────────────────
        df["signal"] = 0
        df["stop_loss"] = np.nan
        df["take_profit"] = np.nan

        # LONG: Hull cross up + SuperTrend bullish + ADX trending + RSI ok
        long_cond = (
            df["cross_up"] &
            (df["st_dir"] == 1) &
            (df["adx"] > p["adx_min"]) &
            (df["plus_di"] > df["minus_di"]) &
            (df["rsi"] < p["rsi_max_long"]) &
            (df["hull_slope"] > 0) &
            df["vol_ok"]
        )

        # SHORT: Hull cross down + SuperTrend bearish + ADX trending + RSI ok
        short_cond = (
            df["cross_down"] &
            (df["st_dir"] == -1) &
            (df["adx"] > p["adx_min"]) &
            (df["minus_di"] > df["plus_di"]) &
            (df["rsi"] > p["rsi_min_short"]) &
            (df["hull_slope"] < 0) &
            df["vol_ok"]
        )

        df.loc[long_cond, "signal"] = 1
        df.loc[short_cond, "signal"] = -1

        # SL/TP
        long_mask = df["signal"] == 1
        df.loc[long_mask, "stop_loss"] = df.loc[long_mask, "Close"] - p["atr_sl_mult"] * df.loc[long_mask, "atr"]
        df.loc[long_mask, "take_profit"] = df.loc[long_mask, "Close"] + p["atr_tp_mult"] * df.loc[long_mask, "atr"]

        short_mask = df["signal"] == -1
        df.loc[short_mask, "stop_loss"] = df.loc[short_mask, "Close"] + p["atr_sl_mult"] * df.loc[short_mask, "atr"]
        df.loc[short_mask, "take_profit"] = df.loc[short_mask, "Close"] - p["atr_tp_mult"] * df.loc[short_mask, "atr"]

        # De-duplicate
        signals = df["signal"].values.copy()
        last_signal = 0
        for i in range(len(signals)):
            if signals[i] != 0:
                if signals[i] == last_signal:
                    signals[i] = 0
                else:
                    last_signal = signals[i]
            elif last_signal != 0:
                last_signal = 0
        df["signal"] = signals

        df.loc[df["signal"] == 0, "stop_loss"] = np.nan
        df.loc[df["signal"] == 0, "take_profit"] = np.nan

        return df

    def pine_script(self) -> str:
        return """
// ─── Hull MA Trend ──────────────────────────────────────────────────
hull_fast_val = ta.hma(close, hull_fast)
hull_slow_val = ta.hma(close, hull_slow)
[st_line, st_dir] = ta.supertrend(st_mult, st_period)
[adx_val, plus_di, minus_di] = ta.dmi(adx_period, adx_period)
rsi_val = ta.rsi(close, rsi_period)
atr_val = ta.atr(atr_period)

hull_slope = (hull_fast_val - hull_fast_val[slope_lookback]) / hull_fast_val[slope_lookback] * 100

long_entry = ta.crossover(hull_fast_val, hull_slow_val) and st_dir == 1 and adx_val > adx_min and plus_di > minus_di and rsi_val < rsi_max_long and hull_slope > 0
short_entry = ta.crossunder(hull_fast_val, hull_slow_val) and st_dir == -1 and adx_val > adx_min and minus_di > plus_di and rsi_val > rsi_min_short and hull_slope < 0

if long_entry
    strategy.entry("Hull Long", strategy.long)
    strategy.exit("Hull Long X", "Hull Long", stop=close - atr_val * atr_sl_mult, limit=close + atr_val * atr_tp_mult)

if short_entry
    strategy.entry("Hull Short", strategy.short)
    strategy.exit("Hull Short X", "Hull Short", stop=close + atr_val * atr_sl_mult, limit=close - atr_val * atr_tp_mult)

plot(hull_fast_val, "Hull Fast", color=color.blue, linewidth=2)
plot(hull_slow_val, "Hull Slow", color=color.orange, linewidth=2)
"""


Strategy = HullTrendV1
