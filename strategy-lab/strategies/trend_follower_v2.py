"""
Trend Follower v2 — Enhanced with SuperTrend + ADX + volatility filter.

v1 (Sharpe 1.71 on SOL H4) is our benchmark. v2 aims to beat it by:
1. Adding SuperTrend confirmation — only enter when trend structure agrees
2. ADX filter — only trade when trend is actually present (ADX > 20)
3. DI directional filter — +DI > -DI for longs, vice versa
4. Volatility percentile filter — skip dead/extreme markets
5. Tighter stop + wider target (higher R:R for the confirmed entries)

The hypothesis: additional filters reduce noise trades and improve Sharpe.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import (
    ema, rsi, atr, adx, crossover, crossunder, supertrend
)


class TrendFollowerV2:
    name = "trend_follower"
    version = "2.0"
    description = "Enhanced trend follower with SuperTrend + ADX + vol filter"

    params = {
        # EMAs
        "fast_ema": 21,
        "slow_ema": 55,

        # RSI filter
        "rsi_period": 14,
        "rsi_max_long": 70,
        "rsi_min_short": 30,

        # SuperTrend
        "st_period": 10,
        "st_mult": 3.0,

        # ADX + DI
        "adx_period": 14,
        "adx_min": 20,

        # Risk management
        "atr_period": 14,
        "atr_sl_mult": 1.3,       # Tighter stop — confirmed entries
        "atr_tp_mult": 3.5,       # Wider TP — more room to run

        # Volatility filter
        "vol_lookback": 100,
        "vol_min_pctile": 15,
        "vol_max_pctile": 95,

        # EMA slope filter (only enter in accelerating trends)
        "ema_slope_lookback": 5,
        "min_slope_pct": 0.0,     # Minimum slope to confirm direction
    }

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate enhanced trend-following signals.
        """
        df = df.copy()
        p = self.params

        # ── Core indicators ──────────────────────────────────────────
        df["fast_ema"] = ema(df["Close"], p["fast_ema"])
        df["slow_ema"] = ema(df["Close"], p["slow_ema"])
        df["rsi"] = rsi(df["Close"], p["rsi_period"])
        df["atr"] = atr(df["High"], df["Low"], df["Close"], p["atr_period"])

        # SuperTrend
        st_line, st_dir = supertrend(df["High"], df["Low"], df["Close"],
                                      p["st_period"], p["st_mult"])
        df["st_dir"] = st_dir

        # ADX + DI
        adx_val, plus_di, minus_di = adx(df["High"], df["Low"], df["Close"], p["adx_period"])
        df["adx"] = adx_val
        df["plus_di"] = plus_di
        df["minus_di"] = minus_di

        # EMA crossovers
        df["cross_up"] = crossover(df["fast_ema"], df["slow_ema"])
        df["cross_down"] = crossunder(df["fast_ema"], df["slow_ema"])

        # EMA slope (trend acceleration)
        lb = p["ema_slope_lookback"]
        df["ema_slope"] = df["fast_ema"].diff(lb) / df["fast_ema"].shift(lb) * 100

        # Volatility filter
        atr_pctile = df["atr"].rolling(p["vol_lookback"]).rank(pct=True) * 100
        df["vol_ok"] = (atr_pctile >= p["vol_min_pctile"]) & (atr_pctile <= p["vol_max_pctile"])

        # ── Signal generation ──────────────────────────────────────────
        df["signal"] = 0
        df["stop_loss"] = np.nan
        df["take_profit"] = np.nan

        # LONG: EMA cross up + SuperTrend bullish + ADX > min + DI confirms + RSI ok + vol ok
        long_condition = (
            df["cross_up"] &
            (df["st_dir"] == 1) &
            (df["adx"] > p["adx_min"]) &
            (df["plus_di"] > df["minus_di"]) &
            (df["rsi"] < p["rsi_max_long"]) &
            (df["ema_slope"] > p["min_slope_pct"]) &
            df["vol_ok"]
        )

        # SHORT: EMA cross down + SuperTrend bearish + ADX > min + DI confirms + RSI ok + vol ok
        short_condition = (
            df["cross_down"] &
            (df["st_dir"] == -1) &
            (df["adx"] > p["adx_min"]) &
            (df["minus_di"] > df["plus_di"]) &
            (df["rsi"] > p["rsi_min_short"]) &
            (df["ema_slope"] < -p["min_slope_pct"]) &
            df["vol_ok"]
        )

        df.loc[long_condition, "signal"] = 1
        df.loc[short_condition, "signal"] = -1

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
// ─── Enhanced Trend Follower v2 ──────────────────────────────────────
fast_ma = ta.ema(close, fast_ema)
slow_ma = ta.ema(close, slow_ema)
[st_line, st_dir] = ta.supertrend(st_mult, st_period)
[adx_val, plus_di, minus_di] = ta.dmi(adx_period, adx_period)
rsi_val = ta.rsi(close, rsi_period)
atr_val = ta.atr(atr_period)

atr_rank = ta.percentrank(atr_val, vol_lookback)
vol_ok = atr_rank >= vol_min_pctile and atr_rank <= vol_max_pctile

ema_slope = (fast_ma - fast_ma[ema_slope_lookback]) / fast_ma[ema_slope_lookback] * 100

long_entry = ta.crossover(fast_ma, slow_ma) and st_dir == 1 and adx_val > adx_min and plus_di > minus_di and rsi_val < rsi_max_long and ema_slope > min_slope_pct and vol_ok
short_entry = ta.crossunder(fast_ma, slow_ma) and st_dir == -1 and adx_val > adx_min and minus_di > plus_di and rsi_val > rsi_min_short and ema_slope < -min_slope_pct and vol_ok

if long_entry
    strategy.entry("TF2 Long", strategy.long)
    strategy.exit("TF2 Long X", "TF2 Long", stop=close - atr_val * atr_sl_mult, limit=close + atr_val * atr_tp_mult)

if short_entry
    strategy.entry("TF2 Short", strategy.short)
    strategy.exit("TF2 Short X", "TF2 Short", stop=close + atr_val * atr_sl_mult, limit=close - atr_val * atr_tp_mult)

p1 = plot(fast_ma, "Fast EMA", color=color.blue, linewidth=2)
p2 = plot(slow_ma, "Slow EMA", color=color.orange, linewidth=2)
fill(p1, p2, color=fast_ma > slow_ma ? color.new(color.green, 92) : color.new(color.red, 92))
bgcolor(long_entry ? color.new(color.green, 85) : short_entry ? color.new(color.red, 85) : na)
"""


Strategy = TrendFollowerV2
