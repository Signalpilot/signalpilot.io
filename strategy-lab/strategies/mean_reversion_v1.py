"""
Mean Reversion v1 — Bollinger Band + RSI extremes.

The orthogonal complement to trend-following.
Research shows a 50/50 blend of momentum + mean reversion delivers
Sharpe 1.71 and 56% annualized return because signals are orthogonal.

Logic:
- LONG when price closes below lower Bollinger Band AND RSI < oversold
  (price has overshot to the downside, expect snap-back)
- SHORT when price closes above upper Bollinger Band AND RSI > overbought
  (price has overshot to the upside, expect snap-back)
- Exits: tight ATR-based stops (mean reversion = fast moves, tight targets)

Key differences from trend-following:
- Higher win rate, lower R:R (opposite profile)
- Works in ranging/choppy markets where trend-following fails
- Negatively correlated with momentum = portfolio diversification gold
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import (
    rsi, atr, sma, bollinger_bands, ema, adx
)


class MeanReversionV1:
    name = "mean_reversion"
    version = "1.0"
    description = "Bollinger Band + RSI mean reversion (orthogonal to trend-following)"

    params = {
        "bb_period": 20,
        "bb_std": 2.0,
        "rsi_period": 14,
        "rsi_ob": 70,        # Overbought threshold
        "rsi_os": 30,        # Oversold threshold
        "atr_period": 14,
        "atr_sl_mult": 1.2,  # Tight stop — wrong fast = cut fast
        "atr_tp_mult": 1.8,  # Target 1.5:1 R:R (lower than trend, higher WR)
        "adx_max": 35,       # Only trade when trend is NOT extreme
        "ema_200_filter": False,  # Enable to add macro trend filter
    }

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate mean reversion signals.

        LONG:  Close < Lower BB AND RSI < oversold AND ADX < adx_max
        SHORT: Close > Upper BB AND RSI > overbought AND ADX < adx_max

        Optional: EMA200 filter to avoid fighting strong macro trends.
        """
        df = df.copy()
        p = self.params

        # Core indicators
        bb_upper, bb_mid, bb_lower = bollinger_bands(df["Close"], p["bb_period"], p["bb_std"])
        df["bb_upper"] = bb_upper
        df["bb_mid"] = bb_mid
        df["bb_lower"] = bb_lower
        df["rsi"] = rsi(df["Close"], p["rsi_period"])
        df["atr"] = atr(df["High"], df["Low"], df["Close"], p["atr_period"])

        # Trend strength filter — only revert when trend is weak
        adx_val, _, _ = adx(df["High"], df["Low"], df["Close"])
        df["adx"] = adx_val

        # Macro filter
        df["ema_200"] = ema(df["Close"], 200)

        # Initialize signals
        df["signal"] = 0
        df["stop_loss"] = np.nan
        df["take_profit"] = np.nan

        # LONG: Price below lower band + RSI oversold + weak trend
        long_condition = (
            (df["Close"] < df["bb_lower"]) &
            (df["rsi"] < p["rsi_os"]) &
            (df["adx"] < p["adx_max"])
        )

        # SHORT: Price above upper band + RSI overbought + weak trend
        short_condition = (
            (df["Close"] > df["bb_upper"]) &
            (df["rsi"] > p["rsi_ob"]) &
            (df["adx"] < p["adx_max"])
        )

        # Optional EMA200 macro filter
        if p["ema_200_filter"]:
            # Don't short below EMA200 (macro uptrend) or long above (macro downtrend)
            # For mean reversion: only revert toward the mean, not against macro
            long_condition = long_condition & (df["Close"] < df["ema_200"])
            short_condition = short_condition & (df["Close"] > df["ema_200"])

        df.loc[long_condition, "signal"] = 1
        df.loc[short_condition, "signal"] = -1

        # Prevent signal clusters: only take first signal after a gap
        # (no consecutive same-direction signals without a flat period)
        signals = df["signal"].values.copy()
        last_signal = 0
        for i in range(len(signals)):
            if signals[i] != 0:
                if signals[i] == last_signal:
                    signals[i] = 0  # Suppress duplicate
                else:
                    last_signal = signals[i]
            elif last_signal != 0:
                last_signal = 0  # Reset after flat bar
        df["signal"] = signals

        # SL/TP for long entries
        long_mask = df["signal"] == 1
        df.loc[long_mask, "stop_loss"] = (
            df.loc[long_mask, "Close"] - p["atr_sl_mult"] * df.loc[long_mask, "atr"]
        )
        df.loc[long_mask, "take_profit"] = (
            df.loc[long_mask, "Close"] + p["atr_tp_mult"] * df.loc[long_mask, "atr"]
        )

        # SL/TP for short entries
        short_mask = df["signal"] == -1
        df.loc[short_mask, "stop_loss"] = (
            df.loc[short_mask, "Close"] + p["atr_sl_mult"] * df.loc[short_mask, "atr"]
        )
        df.loc[short_mask, "take_profit"] = (
            df.loc[short_mask, "Close"] - p["atr_tp_mult"] * df.loc[short_mask, "atr"]
        )

        return df

    def pine_script(self) -> str:
        """Return Pine Script v5 strategy logic block."""
        return """
// ─── Indicator Calculations ─────────────────────────────────────────
[bb_upper, bb_mid, bb_lower] = ta.bb(close, bb_period, bb_std)
rsi_val = ta.rsi(close, rsi_period)
atr_val = ta.atr(atr_period)
adx_val = ta.adx(14)  // ADX period fixed at 14
ema_200 = ta.ema(close, 200)

// ─── Mean Reversion Conditions ──────────────────────────────────────
weak_trend = adx_val < adx_max

long_entry = close < bb_lower and rsi_val < rsi_os and weak_trend
short_entry = close > bb_upper and rsi_val > rsi_ob and weak_trend

// ─── EMA200 Macro Filter ────────────────────────────────────────────
if ema_200_filter
    long_entry := long_entry and close < ema_200
    short_entry := short_entry and close > ema_200

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
p_upper = plot(bb_upper, "BB Upper", color=color.new(color.red, 50))
p_lower = plot(bb_lower, "BB Lower", color=color.new(color.green, 50))
p_mid = plot(bb_mid, "BB Mid", color=color.new(color.gray, 50), linewidth=1)
fill(p_upper, p_lower, color=color.new(color.blue, 92))
plot(ema_200, "EMA 200", color=color.new(color.yellow, 0), linewidth=2)

bgcolor(long_entry ? color.new(color.green, 85) : short_entry ? color.new(color.red, 85) : na)
"""


# Allow direct instantiation
Strategy = MeanReversionV1
