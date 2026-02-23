"""
RSI Divergence v1 — Price vs RSI divergence detector.

Bullish divergence: Price makes lower low, RSI makes higher low → reversal up
Bearish divergence: Price makes higher high, RSI makes lower high → reversal down

Uses pivot detection to find swing points, then compares price and RSI slopes.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import (
    ema, rsi, atr, adx, macd, supertrend,
    pivothigh, pivotlow, crossover, crossunder
)


class RSIDivergenceV1:
    name = "rsi_divergence"
    version = "1.0"
    description = "RSI Divergence: price vs momentum divergence entries"

    params = {
        # RSI
        "rsi_period": 14,

        # Pivot detection
        "pivot_left": 5,
        "pivot_right": 3,

        # Divergence lookback (max bars between pivots)
        "div_lookback": 50,

        # Trend filter
        "ema_fast": 9,
        "ema_slow": 21,
        "ema_trend": 100,

        # ADX filter (want some trend, not dead market)
        "adx_period": 14,
        "adx_min": 15,

        # MACD confirmation
        "macd_fast": 12,
        "macd_slow": 26,
        "macd_signal": 9,

        # Risk management
        "atr_period": 14,
        "atr_sl_mult": 1.2,
        "atr_tp_mult": 3.0,

        # Volatility filter
        "vol_lookback": 100,
        "vol_min_pctile": 10,
        "vol_max_pctile": 95,
    }

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        p = self.params

        # RSI
        df["rsi"] = rsi(df["Close"], p["rsi_period"])

        # Pivot highs and lows on price
        df["pivot_high"] = pivothigh(df["High"], p["pivot_left"], p["pivot_right"])
        df["pivot_low"] = pivotlow(df["Low"], p["pivot_left"], p["pivot_right"])

        # Pivot highs and lows on RSI
        df["rsi_pivot_high"] = pivothigh(df["rsi"], p["pivot_left"], p["pivot_right"])
        df["rsi_pivot_low"] = pivotlow(df["rsi"], p["pivot_left"], p["pivot_right"])

        # Detect divergences
        df["bull_div"] = False
        df["bear_div"] = False

        lookback = p["div_lookback"]

        for i in range(lookback, len(df)):
            # Bullish divergence: price lower low + RSI higher low
            if not np.isnan(df["pivot_low"].iloc[i]):
                current_price_low = df["pivot_low"].iloc[i]
                current_rsi_low = df["rsi_pivot_low"].iloc[i] if not np.isnan(df["rsi_pivot_low"].iloc[i]) else df["rsi"].iloc[i]

                for j in range(i - lookback, i):
                    if not np.isnan(df["pivot_low"].iloc[j]):
                        prev_price_low = df["pivot_low"].iloc[j]
                        prev_rsi_low = df["rsi_pivot_low"].iloc[j] if not np.isnan(df["rsi_pivot_low"].iloc[j]) else df["rsi"].iloc[j]

                        if current_price_low < prev_price_low and current_rsi_low > prev_rsi_low:
                            df.iloc[i, df.columns.get_loc("bull_div")] = True
                            break

            # Bearish divergence: price higher high + RSI lower high
            if not np.isnan(df["pivot_high"].iloc[i]):
                current_price_high = df["pivot_high"].iloc[i]
                current_rsi_high = df["rsi_pivot_high"].iloc[i] if not np.isnan(df["rsi_pivot_high"].iloc[i]) else df["rsi"].iloc[i]

                for j in range(i - lookback, i):
                    if not np.isnan(df["pivot_high"].iloc[j]):
                        prev_price_high = df["pivot_high"].iloc[j]
                        prev_rsi_high = df["rsi_pivot_high"].iloc[j] if not np.isnan(df["rsi_pivot_high"].iloc[j]) else df["rsi"].iloc[j]

                        if current_price_high > prev_price_high and current_rsi_high < prev_rsi_high:
                            df.iloc[i, df.columns.get_loc("bear_div")] = True
                            break

        # Trend EMAs
        df["ema_fast"] = ema(df["Close"], p["ema_fast"])
        df["ema_slow"] = ema(df["Close"], p["ema_slow"])
        df["ema_trend"] = ema(df["Close"], p["ema_trend"])

        # ADX
        adx_val, plus_di, minus_di = adx(df["High"], df["Low"], df["Close"], p["adx_period"])
        df["adx"] = adx_val

        # MACD
        macd_line, signal_line, histogram = macd(df["Close"], p["macd_fast"], p["macd_slow"], p["macd_signal"])
        df["macd_hist"] = histogram

        # ATR
        df["atr"] = atr(df["High"], df["Low"], df["Close"], p["atr_period"])

        # Volatility filter
        atr_pctile = df["atr"].rolling(p["vol_lookback"]).rank(pct=True) * 100
        df["vol_ok"] = (atr_pctile >= p["vol_min_pctile"]) & (atr_pctile <= p["vol_max_pctile"])

        # ── Signal generation ──────────────────────────────────────────
        df["signal"] = 0
        df["stop_loss"] = np.nan
        df["take_profit"] = np.nan

        # LONG: Bullish divergence + RSI recovering + MACD turning + ADX active
        long_cond = (
            df["bull_div"] &
            (df["rsi"] > 30) & (df["rsi"] < 55) &
            (df["macd_hist"] > df["macd_hist"].shift(1)) &
            (df["adx"] > p["adx_min"]) &
            df["vol_ok"]
        )

        # SHORT: Bearish divergence + RSI weakening + MACD turning + ADX active
        short_cond = (
            df["bear_div"] &
            (df["rsi"] > 45) & (df["rsi"] < 70) &
            (df["macd_hist"] < df["macd_hist"].shift(1)) &
            (df["adx"] > p["adx_min"]) &
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
// RSI Divergence v1 — Pivot-based divergence detection
// Bullish: price lower low + RSI higher low
// Bearish: price higher high + RSI lower high
"""


Strategy = RSIDivergenceV1
