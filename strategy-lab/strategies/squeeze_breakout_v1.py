"""
Squeeze Breakout v1 — TTM Squeeze release + momentum direction.

Core insight: When Bollinger Bands contract inside Keltner Channels (squeeze),
volatility is compressed. When the squeeze releases, an explosive move follows.
Trading the DIRECTION of the release captures the expansion.

Entry:
- Squeeze was ON (BB inside KC) and just released
- Momentum direction (linear regression of close - midline) determines long/short
- ADX rising = trend developing
- ATR expanding = volatility expansion confirming

This catches the early phase of big moves — before EMA crossovers fire.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import (
    ema, sma, rsi, atr, adx, bollinger_bands, keltner_channels,
    highest, lowest, crossover, crossunder, supertrend
)


class SqueezeBreakoutV1:
    name = "squeeze_breakout"
    version = "1.0"
    description = "TTM Squeeze release breakout with momentum direction"

    params = {
        # Squeeze detection
        "bb_period": 20,
        "bb_std": 2.0,
        "kc_ema_period": 20,
        "kc_atr_period": 10,
        "kc_mult": 1.5,

        # Momentum
        "mom_period": 20,          # Lookback for momentum calculation

        # Trend confirmation
        "ema_fast": 21,
        "ema_slow": 55,
        "rsi_period": 14,

        # Risk management
        "atr_period": 14,
        "atr_sl_mult": 1.5,
        "atr_tp_mult": 3.5,       # Squeeze releases are explosive — wide target

        # Filters
        "adx_period": 14,
        "adx_min": 15,            # ADX must be rising (developing trend)
        "vol_lookback": 100,
        "vol_min_pctile": 10,
        "vol_max_pctile": 95,

        # Squeeze duration filter
        "min_squeeze_bars": 3,     # Squeeze must have been on for at least N bars
    }

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate squeeze breakout signals.

        1. Detect squeeze (BB inside KC)
        2. Wait for release (BB expands outside KC)
        3. Enter in the direction of momentum
        """
        df = df.copy()
        p = self.params

        # ── Core indicators ──────────────────────────────────────────
        bb_upper, bb_mid, bb_lower = bollinger_bands(df["Close"], p["bb_period"], p["bb_std"])
        df["bb_upper"] = bb_upper
        df["bb_mid"] = bb_mid
        df["bb_lower"] = bb_lower

        kc_upper, kc_mid, kc_lower = keltner_channels(
            df["High"], df["Low"], df["Close"],
            p["kc_ema_period"], p["kc_atr_period"], p["kc_mult"]
        )

        # Squeeze detection
        df["squeeze_on"] = (bb_lower > kc_lower) & (bb_upper < kc_upper)

        # Count consecutive squeeze bars
        squeeze_count = pd.Series(0, index=df.index)
        count = 0
        for i in range(len(df)):
            if df["squeeze_on"].iloc[i]:
                count += 1
            else:
                count = 0
            squeeze_count.iloc[i] = count
        df["squeeze_count"] = squeeze_count.shift(1).fillna(0)  # Previous bar's count

        # Squeeze release: was on (for min bars), now off
        df["squeeze_release"] = (
            (~df["squeeze_on"]) &
            (df["squeeze_on"].shift(1).fillna(False)) &
            (df["squeeze_count"] >= p["min_squeeze_bars"])
        )

        # Momentum: close relative to midline of Donchian
        midline = (highest(df["High"], p["mom_period"]) + lowest(df["Low"], p["mom_period"])) / 2
        midline2 = sma(df["Close"], p["mom_period"])
        midline_avg = (midline + midline2) / 2
        df["momentum"] = df["Close"] - midline_avg

        # Momentum direction and strength
        df["mom_positive"] = df["momentum"] > 0
        df["mom_rising"] = df["momentum"] > df["momentum"].shift(1)
        df["mom_negative"] = df["momentum"] < 0
        df["mom_falling"] = df["momentum"] < df["momentum"].shift(1)

        # Trend indicators
        df["fast_ema"] = ema(df["Close"], p["ema_fast"])
        df["slow_ema"] = ema(df["Close"], p["ema_slow"])
        df["rsi"] = rsi(df["Close"], p["rsi_period"])
        df["atr"] = atr(df["High"], df["Low"], df["Close"], p["atr_period"])

        adx_val, plus_di, minus_di = adx(df["High"], df["Low"], df["Close"], p["adx_period"])
        df["adx"] = adx_val
        df["adx_rising"] = adx_val > adx_val.shift(1)

        # ATR expansion (confirming volatility breakout)
        df["atr_expanding"] = df["atr"] > df["atr"].shift(1)

        # Volatility filter
        atr_pctile = df["atr"].rolling(p["vol_lookback"]).rank(pct=True) * 100
        df["vol_ok"] = (atr_pctile >= p["vol_min_pctile"]) & (atr_pctile <= p["vol_max_pctile"])

        # ── Signal generation ──────────────────────────────────────────
        df["signal"] = 0
        df["stop_loss"] = np.nan
        df["take_profit"] = np.nan

        # LONG: Squeeze releases with positive, rising momentum
        long_condition = (
            df["squeeze_release"] &
            df["mom_positive"] &
            df["mom_rising"] &
            (df["Close"] > df["fast_ema"]) &    # Price above fast EMA
            (df["rsi"] < 75) &                   # Not extremely overbought
            (df["rsi"] > 40) &                   # Has some momentum
            df["vol_ok"]
        )

        # SHORT: Squeeze releases with negative, falling momentum
        short_condition = (
            df["squeeze_release"] &
            df["mom_negative"] &
            df["mom_falling"] &
            (df["Close"] < df["fast_ema"]) &
            (df["rsi"] > 25) &
            (df["rsi"] < 60) &
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
// ─── TTM Squeeze Breakout ────────────────────────────────────────────
[bb_upper, bb_mid, bb_lower] = ta.bb(close, bb_period, bb_std)
[kc_mid, kc_upper, kc_lower] = ta.kc(close, kc_ema_period, kc_mult, true)

squeeze_on = bb_lower > kc_lower and bb_upper < kc_upper
squeeze_release = not squeeze_on and squeeze_on[1]

// Momentum
midline = (ta.highest(high, mom_period) + ta.lowest(low, mom_period)) / 2
midline2 = ta.sma(close, mom_period)
mom = close - (midline + midline2) / 2

fast_ma = ta.ema(close, ema_fast)
rsi_val = ta.rsi(close, rsi_period)
atr_val = ta.atr(atr_period)

long_entry = squeeze_release and mom > 0 and mom > mom[1] and close > fast_ma and rsi_val < 75 and rsi_val > 40
short_entry = squeeze_release and mom < 0 and mom < mom[1] and close < fast_ma and rsi_val > 25 and rsi_val < 60

if long_entry
    strategy.entry("SQ Long", strategy.long)
    strategy.exit("SQ Long X", "SQ Long", stop=close - atr_val * atr_sl_mult, limit=close + atr_val * atr_tp_mult)

if short_entry
    strategy.entry("SQ Short", strategy.short)
    strategy.exit("SQ Short X", "SQ Short", stop=close + atr_val * atr_sl_mult, limit=close - atr_val * atr_tp_mult)

bgcolor(squeeze_on ? color.new(color.red, 90) : na)
"""


Strategy = SqueezeBreakoutV1
