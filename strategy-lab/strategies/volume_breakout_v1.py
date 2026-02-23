"""
Volume Spike Breakout v1 — Volume-confirmed breakouts.

Most breakouts fail. Volume-confirmed breakouts are far more reliable.
Entry: Price breaks key level + volume spike + trend alignment.

Volume spike = current volume > 2x average volume (institutional interest).
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import (
    ema, sma, rsi, atr, adx, macd, obv,
    highest, lowest, crossover, crossunder
)


class VolumeBreakoutV1:
    name = "volume_breakout"
    version = "1.0"
    description = "Volume Breakout: volume spike + price breakout entries"

    params = {
        # Breakout detection
        "breakout_period": 20,

        # Volume filter
        "vol_sma_period": 20,
        "vol_spike_mult": 1.8,

        # OBV confirmation
        "obv_ema_period": 21,

        # Trend filter
        "ema_fast": 9,
        "ema_slow": 21,
        "ema_trend": 50,

        # ADX filter
        "adx_period": 14,
        "adx_min": 18,

        # MACD confirmation
        "macd_fast": 12,
        "macd_slow": 26,
        "macd_signal": 9,

        # RSI filter
        "rsi_period": 14,

        # Risk management
        "atr_period": 14,
        "atr_sl_mult": 1.5,
        "atr_tp_mult": 3.0,

        # Volatility filter
        "vol_lookback": 100,
        "vol_min_pctile": 10,
        "vol_max_pctile": 95,
    }

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        p = self.params

        # ── Breakout levels ────────────────────────────────────────────
        df["resistance"] = highest(df["High"], p["breakout_period"]).shift(1)
        df["support"] = lowest(df["Low"], p["breakout_period"]).shift(1)

        # Price breakout
        df["break_up"] = df["Close"] > df["resistance"]
        df["break_down"] = df["Close"] < df["support"]

        # ── Volume analysis ────────────────────────────────────────────
        df["vol_sma"] = sma(df["Volume"], p["vol_sma_period"])
        df["vol_spike"] = df["Volume"] > (df["vol_sma"] * p["vol_spike_mult"])

        # OBV trend (confirms volume is flowing in the right direction)
        df["obv"] = obv(df["Close"], df["Volume"])
        df["obv_ema"] = ema(df["obv"], p["obv_ema_period"])
        df["obv_bull"] = df["obv"] > df["obv_ema"]
        df["obv_bear"] = df["obv"] < df["obv_ema"]

        # ── Trend filter ───────────────────────────────────────────────
        df["ema_fast"] = ema(df["Close"], p["ema_fast"])
        df["ema_slow"] = ema(df["Close"], p["ema_slow"])
        df["ema_trend"] = ema(df["Close"], p["ema_trend"])
        df["trend_up"] = (df["ema_fast"] > df["ema_slow"]) & (df["Close"] > df["ema_trend"])
        df["trend_down"] = (df["ema_fast"] < df["ema_slow"]) & (df["Close"] < df["ema_trend"])

        # ── ADX ────────────────────────────────────────────────────────
        adx_val, plus_di, minus_di = adx(df["High"], df["Low"], df["Close"], p["adx_period"])
        df["adx"] = adx_val
        df["plus_di"] = plus_di
        df["minus_di"] = minus_di

        # ── MACD ───────────────────────────────────────────────────────
        macd_line, signal_line, histogram = macd(
            df["Close"], p["macd_fast"], p["macd_slow"], p["macd_signal"]
        )
        df["macd_bull"] = histogram > 0
        df["macd_bear"] = histogram < 0

        # ── RSI ────────────────────────────────────────────────────────
        df["rsi"] = rsi(df["Close"], p["rsi_period"])

        # ── ATR ────────────────────────────────────────────────────────
        df["atr"] = atr(df["High"], df["Low"], df["Close"], p["atr_period"])

        # Volatility filter
        atr_pctile = df["atr"].rolling(p["vol_lookback"]).rank(pct=True) * 100
        df["vol_ok"] = (atr_pctile >= p["vol_min_pctile"]) & (atr_pctile <= p["vol_max_pctile"])

        # ── Signal generation ──────────────────────────────────────────
        df["signal"] = 0
        df["stop_loss"] = np.nan
        df["take_profit"] = np.nan

        # LONG: Price breaks resistance + volume spike + OBV bull + trend up
        long_cond = (
            df["break_up"] &
            df["vol_spike"] &
            df["obv_bull"] &
            df["trend_up"] &
            (df["adx"] > p["adx_min"]) &
            (df["plus_di"] > df["minus_di"]) &
            df["macd_bull"] &
            (df["rsi"] > 45) & (df["rsi"] < 80) &
            df["vol_ok"]
        )

        # SHORT: Price breaks support + volume spike + OBV bear + trend down
        short_cond = (
            df["break_down"] &
            df["vol_spike"] &
            df["obv_bear"] &
            df["trend_down"] &
            (df["adx"] > p["adx_min"]) &
            (df["minus_di"] > df["plus_di"]) &
            df["macd_bear"] &
            (df["rsi"] > 20) & (df["rsi"] < 55) &
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
// Volume Breakout v1 — Volume spike + price breakout
// Breakout of 20-bar high/low with 1.8x volume spike
"""


Strategy = VolumeBreakoutV1
