"""
Multi-Timeframe Trend Follower v1 — H4 direction + H1 entry timing.

Core insight: When H1 and H4 both agree on trend direction,
the probability of a winning trade increases significantly.

Mechanism:
- Resample H1 data → H4 internally
- H4 EMA crossover + SuperTrend = trend DIRECTION
- H1 EMA pullback + RSI bounce = ENTRY TIMING
- Enter on H1 when:
  1. H4 says "we're trending UP" (EMA cross + SuperTrend bullish)
  2. H1 pulls back to fast EMA + RSI shows momentum resuming
  3. This gives better entries than H4-only (tighter stops, bigger R:R)

NOTE: Feed this strategy H1 data. It resamples to H4 internally.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import (
    ema, rsi, atr, adx, supertrend, crossover, crossunder,
    bollinger_bands
)


class MTFTrendV1:
    name = "mtf_trend"
    version = "1.0"
    description = "Multi-timeframe: H4 direction + H1 entry timing"

    params = {
        # H4 trend detection (computed from resampled data)
        "h4_fast_ema": 21,
        "h4_slow_ema": 55,
        "h4_st_period": 10,
        "h4_st_mult": 3.0,

        # H1 entry timing
        "h1_fast_ema": 9,
        "h1_slow_ema": 21,
        "h1_rsi_period": 14,
        "h1_rsi_pullback_long": 45,    # RSI dips below this then bounces = pullback
        "h1_rsi_pullback_short": 55,   # RSI pops above this then dips = pullback
        "h1_rsi_entry_long": 50,       # RSI must be above this to confirm bounce
        "h1_rsi_entry_short": 50,      # RSI must be below this to confirm drop

        # Risk management
        "atr_period": 14,
        "atr_sl_mult": 1.2,      # Tighter stop since MTF confirmation = higher conviction
        "atr_tp_mult": 3.5,      # Wider target — riding confirmed trends

        # Volatility filter
        "vol_lookback": 100,
        "vol_min_pctile": 15,
        "vol_max_pctile": 95,
    }

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate MTF signals from H1 data.

        1. Resample H1 → H4 for trend direction
        2. Compute H1 indicators for entry timing
        3. Enter when both timeframes agree
        """
        df = df.copy()
        p = self.params

        # ── Resample H1 → H4 ──────────────────────────────────────────
        h4 = df.resample("4h").agg({
            "Open": "first",
            "High": "max",
            "Low": "min",
            "Close": "last",
            "Volume": "sum",
        }).dropna()

        # H4 trend indicators
        h4["fast_ema"] = ema(h4["Close"], p["h4_fast_ema"])
        h4["slow_ema"] = ema(h4["Close"], p["h4_slow_ema"])
        h4["trend_up"] = h4["fast_ema"] > h4["slow_ema"]
        h4["trend_down"] = h4["fast_ema"] < h4["slow_ema"]

        st_line, st_dir = supertrend(h4["High"], h4["Low"], h4["Close"],
                                      p["h4_st_period"], p["h4_st_mult"])
        h4["st_dir"] = st_dir

        # H4 ADX for trend strength
        adx_val, plus_di, minus_di = adx(h4["High"], h4["Low"], h4["Close"])
        h4["adx"] = adx_val
        h4["plus_di"] = plus_di
        h4["minus_di"] = minus_di

        # Reindex H4 signals to H1 (forward fill — H4 signal persists until next H4 bar)
        h4_signals = h4[["trend_up", "trend_down", "st_dir", "adx", "plus_di", "minus_di"]]
        h4_on_h1 = h4_signals.reindex(df.index, method="ffill")

        df["h4_trend_up"] = h4_on_h1["trend_up"].fillna(False)
        df["h4_trend_down"] = h4_on_h1["trend_down"].fillna(False)
        df["h4_st_dir"] = h4_on_h1["st_dir"].fillna(0)
        df["h4_adx"] = h4_on_h1["adx"].fillna(0)
        df["h4_plus_di"] = h4_on_h1["plus_di"].fillna(0)
        df["h4_minus_di"] = h4_on_h1["minus_di"].fillna(0)

        # ── H1 entry indicators ────────────────────────────────────────
        df["h1_fast_ema"] = ema(df["Close"], p["h1_fast_ema"])
        df["h1_slow_ema"] = ema(df["Close"], p["h1_slow_ema"])
        df["rsi"] = rsi(df["Close"], p["h1_rsi_period"])
        df["atr"] = atr(df["High"], df["Low"], df["Close"], p["atr_period"])

        # Pullback detection: price touches or dips below fast EMA then closes above
        df["near_fast_ema"] = abs(df["Close"] - df["h1_fast_ema"]) / df["atr"] < 1.0  # Within 1 ATR
        df["above_fast_ema"] = df["Close"] > df["h1_fast_ema"]
        df["below_fast_ema"] = df["Close"] < df["h1_fast_ema"]

        # RSI bounce: was below threshold, now above entry level
        df["rsi_bounce_long"] = (df["rsi"].shift(1) < p["h1_rsi_pullback_long"]) & (df["rsi"] > p["h1_rsi_entry_long"])
        df["rsi_bounce_short"] = (df["rsi"].shift(1) > p["h1_rsi_pullback_short"]) & (df["rsi"] < p["h1_rsi_entry_short"])

        # H1 trend alignment
        df["h1_trend_up"] = df["h1_fast_ema"] > df["h1_slow_ema"]
        df["h1_trend_down"] = df["h1_fast_ema"] < df["h1_slow_ema"]

        # ── Volatility filter ──────────────────────────────────────────
        atr_pctile = df["atr"].rolling(p["vol_lookback"]).rank(pct=True) * 100
        df["vol_ok"] = (atr_pctile >= p["vol_min_pctile"]) & (atr_pctile <= p["vol_max_pctile"])

        # ── Signal generation ──────────────────────────────────────────
        df["signal"] = 0
        df["stop_loss"] = np.nan
        df["take_profit"] = np.nan

        # LONG: H4 trend up + H4 SuperTrend bullish + H4 ADX > 20 +
        #        H1 pullback to EMA + RSI bounce + H1 trend aligned
        long_condition = (
            df["h4_trend_up"] &
            (df["h4_st_dir"] == 1) &
            (df["h4_adx"] > 20) &
            (df["h4_plus_di"] > df["h4_minus_di"]) &
            df["h1_trend_up"] &
            df["vol_ok"] &
            (
                # Entry type 1: Pullback to EMA + RSI bounce
                (df["near_fast_ema"] & df["rsi_bounce_long"]) |
                # Entry type 2: H1 EMA crossover when H4 trending
                (crossover(df["h1_fast_ema"], df["h1_slow_ema"]) & (df["rsi"] < 70))
            )
        )

        # SHORT: H4 trend down + H4 SuperTrend bearish + H4 ADX > 20 +
        #         H1 pullback to EMA + RSI drop + H1 trend aligned
        short_condition = (
            df["h4_trend_down"] &
            (df["h4_st_dir"] == -1) &
            (df["h4_adx"] > 20) &
            (df["h4_minus_di"] > df["h4_plus_di"]) &
            df["h1_trend_down"] &
            df["vol_ok"] &
            (
                (df["near_fast_ema"] & df["rsi_bounce_short"]) |
                (crossunder(df["h1_fast_ema"], df["h1_slow_ema"]) & (df["rsi"] > 30))
            )
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

        # De-duplicate consecutive same-direction signals
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
// ─── Multi-Timeframe Trend Follower ──────────────────────────────────
// H4 direction computed via request.security()
h4_fast = request.security(syminfo.tickerid, "240", ta.ema(close, h4_fast_ema))
h4_slow = request.security(syminfo.tickerid, "240", ta.ema(close, h4_slow_ema))
[h4_st, h4_st_dir] = request.security(syminfo.tickerid, "240", ta.supertrend(h4_st_mult, h4_st_period))
h4_adx_val = request.security(syminfo.tickerid, "240", ta.adx(14))

h4_trend_up = h4_fast > h4_slow and h4_st_dir == 1 and h4_adx_val > 20
h4_trend_down = h4_fast < h4_slow and h4_st_dir == -1 and h4_adx_val > 20

// H1 entry timing
h1_fast = ta.ema(close, h1_fast_ema)
h1_slow = ta.ema(close, h1_slow_ema)
rsi_val = ta.rsi(close, h1_rsi_period)
atr_val = ta.atr(atr_period)

h1_trend_up = h1_fast > h1_slow
h1_trend_down = h1_fast < h1_slow

// Pullback entry
near_ema = math.abs(close - h1_fast) / atr_val < 1.0
rsi_bounce_long = rsi_val[1] < h1_rsi_pullback_long and rsi_val > h1_rsi_entry_long
rsi_bounce_short = rsi_val[1] > h1_rsi_pullback_short and rsi_val < h1_rsi_entry_short

long_entry = h4_trend_up and h1_trend_up and (near_ema and rsi_bounce_long or ta.crossover(h1_fast, h1_slow) and rsi_val < 70)
short_entry = h4_trend_down and h1_trend_down and (near_ema and rsi_bounce_short or ta.crossunder(h1_fast, h1_slow) and rsi_val > 30)

if long_entry
    strategy.entry("MTF Long", strategy.long)
    strategy.exit("MTF Long X", "MTF Long", stop=close - atr_val * atr_sl_mult, limit=close + atr_val * atr_tp_mult)

if short_entry
    strategy.entry("MTF Short", strategy.short)
    strategy.exit("MTF Short X", "MTF Short", stop=close + atr_val * atr_sl_mult, limit=close - atr_val * atr_tp_mult)

plot(h1_fast, "H1 Fast EMA", color=color.blue, linewidth=1)
plot(h1_slow, "H1 Slow EMA", color=color.orange, linewidth=1)
plot(h4_fast, "H4 Fast EMA", color=color.new(color.blue, 50), linewidth=3)
plot(h4_slow, "H4 Slow EMA", color=color.new(color.orange, 50), linewidth=3)
bgcolor(h4_trend_up ? color.new(color.green, 95) : h4_trend_down ? color.new(color.red, 95) : na)
"""


Strategy = MTFTrendV1
