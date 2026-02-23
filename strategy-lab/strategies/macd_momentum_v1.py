"""
MACD Momentum v1 — Histogram reversal + trend alignment.

Core insight: MACD histogram flipping direction (going from negative to
positive or vice versa) catches momentum SHIFTS earlier than moving
average crossovers. Combined with trend alignment, this nails entries
at the start of impulse moves.

Entry:
- MACD histogram crosses zero (momentum shifting)
- MACD line and signal both same side as entry direction
- EMA trend alignment (fast > slow for longs)
- ADX > threshold (trend is present)
- RSI not extreme (momentum has room to run)

This catches trends EARLIER than EMA crossover strategies.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import (
    ema, rsi, atr, adx, macd, crossover, crossunder, supertrend
)


class MACDMomentumV1:
    name = "macd_momentum"
    version = "1.0"
    description = "MACD histogram reversal + trend alignment for early entries"

    params = {
        # MACD
        "macd_fast": 12,
        "macd_slow": 26,
        "macd_signal": 9,

        # Trend alignment
        "ema_fast": 21,
        "ema_slow": 55,
        "ema_200": 200,           # Macro trend filter

        # Trend strength
        "adx_period": 14,
        "adx_min": 20,

        # RSI filter
        "rsi_period": 14,
        "rsi_max_long": 70,       # Not overbought
        "rsi_min_short": 30,      # Not oversold

        # SuperTrend confirmation
        "st_period": 10,
        "st_mult": 3.0,

        # Risk management
        "atr_period": 14,
        "atr_sl_mult": 1.3,
        "atr_tp_mult": 3.0,

        # Volatility filter
        "vol_lookback": 100,
        "vol_min_pctile": 15,
        "vol_max_pctile": 95,
    }

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate MACD momentum signals.

        Enter when MACD histogram crosses zero with trend alignment.
        """
        df = df.copy()
        p = self.params

        # ── Core indicators ──────────────────────────────────────────
        macd_line, signal_line, histogram = macd(
            df["Close"], p["macd_fast"], p["macd_slow"], p["macd_signal"]
        )
        df["macd"] = macd_line
        df["macd_signal"] = signal_line
        df["histogram"] = histogram

        # Histogram zero cross
        df["hist_cross_up"] = (histogram > 0) & (histogram.shift(1) <= 0)
        df["hist_cross_down"] = (histogram < 0) & (histogram.shift(1) >= 0)

        # MACD line cross (additional confirmation)
        df["macd_cross_up"] = crossover(macd_line, signal_line)
        df["macd_cross_down"] = crossunder(macd_line, signal_line)

        # Trend EMAs
        df["fast_ema"] = ema(df["Close"], p["ema_fast"])
        df["slow_ema"] = ema(df["Close"], p["ema_slow"])
        df["ema200"] = ema(df["Close"], p["ema_200"])
        df["trend_up"] = df["fast_ema"] > df["slow_ema"]
        df["trend_down"] = df["fast_ema"] < df["slow_ema"]

        # SuperTrend
        st_line, st_dir = supertrend(df["High"], df["Low"], df["Close"],
                                      p["st_period"], p["st_mult"])
        df["st_dir"] = st_dir

        # ADX
        adx_val, plus_di, minus_di = adx(df["High"], df["Low"], df["Close"], p["adx_period"])
        df["adx"] = adx_val

        # RSI
        df["rsi"] = rsi(df["Close"], p["rsi_period"])

        # ATR
        df["atr"] = atr(df["High"], df["Low"], df["Close"], p["atr_period"])

        # Volatility filter
        atr_pctile = df["atr"].rolling(p["vol_lookback"]).rank(pct=True) * 100
        df["vol_ok"] = (atr_pctile >= p["vol_min_pctile"]) & (atr_pctile <= p["vol_max_pctile"])

        # ── Signal generation ──────────────────────────────────────────
        df["signal"] = 0
        df["stop_loss"] = np.nan
        df["take_profit"] = np.nan

        # LONG: MACD histogram crosses above zero + trend up + ST bullish
        long_condition = (
            (df["hist_cross_up"] | df["macd_cross_up"]) &  # Momentum shifting up
            df["trend_up"] &                                 # EMA trend up
            (df["st_dir"] == 1) &                           # SuperTrend bullish
            (df["adx"] > p["adx_min"]) &                    # Trend present
            (df["rsi"] < p["rsi_max_long"]) &               # Room to run
            (df["rsi"] > 35) &                               # Some momentum already
            (df["macd"] > signal_line) &                     # MACD above signal
            df["vol_ok"]
        )

        # SHORT: MACD histogram crosses below zero + trend down + ST bearish
        short_condition = (
            (df["hist_cross_down"] | df["macd_cross_down"]) &
            df["trend_down"] &
            (df["st_dir"] == -1) &
            (df["adx"] > p["adx_min"]) &
            (df["rsi"] > p["rsi_min_short"]) &
            (df["rsi"] < 65) &
            (df["macd"] < signal_line) &
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
// ─── MACD Momentum ──────────────────────────────────────────────────
[macd_line, signal_line, hist] = ta.macd(close, macd_fast, macd_slow, macd_signal)
fast_ma = ta.ema(close, ema_fast)
slow_ma = ta.ema(close, ema_slow)
[st_line, st_dir] = ta.supertrend(st_mult, st_period)
adx_val = ta.adx(adx_period)
rsi_val = ta.rsi(close, rsi_period)
atr_val = ta.atr(atr_period)

trend_up = fast_ma > slow_ma
trend_down = fast_ma < slow_ma

hist_up = hist > 0 and hist[1] <= 0
hist_down = hist < 0 and hist[1] >= 0
macd_cross_up = ta.crossover(macd_line, signal_line)
macd_cross_down = ta.crossunder(macd_line, signal_line)

long_entry = (hist_up or macd_cross_up) and trend_up and st_dir == 1 and adx_val > adx_min and rsi_val < rsi_max_long and rsi_val > 35 and macd_line > signal_line
short_entry = (hist_down or macd_cross_down) and trend_down and st_dir == -1 and adx_val > adx_min and rsi_val > rsi_min_short and rsi_val < 65 and macd_line < signal_line

if long_entry
    strategy.entry("MACD Long", strategy.long)
    strategy.exit("MACD Long X", "MACD Long", stop=close - atr_val * atr_sl_mult, limit=close + atr_val * atr_tp_mult)

if short_entry
    strategy.entry("MACD Short", strategy.short)
    strategy.exit("MACD Short X", "MACD Short", stop=close + atr_val * atr_sl_mult, limit=close - atr_val * atr_tp_mult)

p1 = plot(fast_ma, "Fast EMA", color=color.blue)
p2 = plot(slow_ma, "Slow EMA", color=color.orange)
fill(p1, p2, color=trend_up ? color.new(color.green, 92) : color.new(color.red, 92))
"""


Strategy = MACDMomentumV1
