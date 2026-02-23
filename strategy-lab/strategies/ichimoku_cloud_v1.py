"""
Ichimoku Cloud v1 — Full Ichimoku Kinko Hyo system.

The Ichimoku Cloud provides 5 lines that give a complete view of trend,
momentum, and support/resistance at a glance.

Entry conditions:
- Price above/below the cloud (Kumo)
- Tenkan-sen/Kijun-sen cross (TK cross)
- Chikou Span confirms (price 26 bars ago vs cloud)
- Future cloud color agrees (Senkou A vs B)
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import (
    ema, rsi, atr, adx, macd, highest, lowest,
    crossover, crossunder
)


class IchimokuCloudV1:
    name = "ichimoku_cloud"
    version = "1.0"
    description = "Ichimoku Cloud: full TK cross + Kumo + Chikou system"

    params = {
        # Ichimoku periods (crypto-adapted: 20/60/120/30 instead of 9/26/52/26)
        "tenkan_period": 20,
        "kijun_period": 60,
        "senkou_b_period": 120,
        "displacement": 30,

        # Confirmation
        "rsi_period": 14,
        "adx_period": 14,
        "adx_min": 20,

        # MACD confirmation
        "macd_fast": 12,
        "macd_slow": 26,
        "macd_signal": 9,

        # Risk management
        "atr_period": 14,
        "atr_sl_mult": 1.5,
        "atr_tp_mult": 3.5,

        # Volatility filter
        "vol_lookback": 100,
        "vol_min_pctile": 10,
        "vol_max_pctile": 95,
    }

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        p = self.params

        # ── Ichimoku lines ─────────────────────────────────────────────
        # Tenkan-sen (conversion line): midpoint of highest high and lowest low over tenkan_period
        df["tenkan"] = (highest(df["High"], p["tenkan_period"]) +
                        lowest(df["Low"], p["tenkan_period"])) / 2

        # Kijun-sen (base line): midpoint over kijun_period
        df["kijun"] = (highest(df["High"], p["kijun_period"]) +
                       lowest(df["Low"], p["kijun_period"])) / 2

        # Senkou Span A (leading span A): midpoint of tenkan and kijun, displaced forward
        df["senkou_a"] = ((df["tenkan"] + df["kijun"]) / 2).shift(p["displacement"])

        # Senkou Span B (leading span B): midpoint over senkou_b_period, displaced forward
        df["senkou_b"] = ((highest(df["High"], p["senkou_b_period"]) +
                           lowest(df["Low"], p["senkou_b_period"])) / 2).shift(p["displacement"])

        # Chikou Span (lagging span): close displaced backward
        df["chikou"] = df["Close"].shift(-p["displacement"])

        # ── Cloud (Kumo) analysis ──────────────────────────────────────
        df["cloud_top"] = df[["senkou_a", "senkou_b"]].max(axis=1)
        df["cloud_bottom"] = df[["senkou_a", "senkou_b"]].min(axis=1)

        # Price position relative to cloud
        df["above_cloud"] = df["Close"] > df["cloud_top"]
        df["below_cloud"] = df["Close"] < df["cloud_bottom"]

        # Cloud color (bullish = senkou_a > senkou_b)
        df["cloud_bull"] = df["senkou_a"] > df["senkou_b"]
        df["cloud_bear"] = df["senkou_a"] < df["senkou_b"]

        # Cloud thickness (thicker = stronger support/resistance)
        df["cloud_thickness"] = abs(df["senkou_a"] - df["senkou_b"])

        # ── TK Cross ──────────────────────────────────────────────────
        df["tk_bull_cross"] = crossover(df["tenkan"], df["kijun"])
        df["tk_bear_cross"] = crossunder(df["tenkan"], df["kijun"])

        # ── Chikou confirmation ────────────────────────────────────────
        # Chikou above price = bullish, below = bearish
        # We check current close vs close 26 bars ago
        df["chikou_bull"] = df["Close"] > df["Close"].shift(p["displacement"])
        df["chikou_bear"] = df["Close"] < df["Close"].shift(p["displacement"])

        # ── Confirmation indicators ────────────────────────────────────
        df["rsi"] = rsi(df["Close"], p["rsi_period"])

        adx_val, plus_di, minus_di = adx(df["High"], df["Low"], df["Close"], p["adx_period"])
        df["adx"] = adx_val
        df["plus_di"] = plus_di
        df["minus_di"] = minus_di

        macd_line, signal_line, histogram = macd(
            df["Close"], p["macd_fast"], p["macd_slow"], p["macd_signal"]
        )
        df["macd_bull"] = histogram > 0
        df["macd_bear"] = histogram < 0

        # ATR
        df["atr"] = atr(df["High"], df["Low"], df["Close"], p["atr_period"])

        # Volatility filter
        atr_pctile = df["atr"].rolling(p["vol_lookback"]).rank(pct=True) * 100
        df["vol_ok"] = (atr_pctile >= p["vol_min_pctile"]) & (atr_pctile <= p["vol_max_pctile"])

        # ── Signal generation ──────────────────────────────────────────
        df["signal"] = 0
        df["stop_loss"] = np.nan
        df["take_profit"] = np.nan

        # LONG: Price above cloud + TK bullish cross + cloud is bullish +
        #       Chikou bullish + ADX trending + MACD positive
        long_cond = (
            df["above_cloud"] &
            df["tk_bull_cross"] &
            df["cloud_bull"] &
            df["chikou_bull"] &
            (df["adx"] > p["adx_min"]) &
            (df["plus_di"] > df["minus_di"]) &
            df["macd_bull"] &
            (df["rsi"] > 40) & (df["rsi"] < 75) &
            df["vol_ok"]
        )

        # SHORT: Price below cloud + TK bearish cross + cloud is bearish +
        #        Chikou bearish + ADX trending + MACD negative
        short_cond = (
            df["below_cloud"] &
            df["tk_bear_cross"] &
            df["cloud_bear"] &
            df["chikou_bear"] &
            (df["adx"] > p["adx_min"]) &
            (df["minus_di"] > df["plus_di"]) &
            df["macd_bear"] &
            (df["rsi"] > 25) & (df["rsi"] < 60) &
            df["vol_ok"]
        )

        df.loc[long_cond, "signal"] = 1
        df.loc[short_cond, "signal"] = -1

        # SL/TP — use Kijun-sen as dynamic SL reference
        long_mask = df["signal"] == 1
        kijun_sl = df.loc[long_mask, "kijun"] - 0.5 * df.loc[long_mask, "atr"]
        atr_sl = df.loc[long_mask, "Close"] - p["atr_sl_mult"] * df.loc[long_mask, "atr"]
        df.loc[long_mask, "stop_loss"] = pd.concat([kijun_sl, atr_sl], axis=1).max(axis=1)
        df.loc[long_mask, "take_profit"] = df.loc[long_mask, "Close"] + p["atr_tp_mult"] * df.loc[long_mask, "atr"]

        short_mask = df["signal"] == -1
        kijun_sl_s = df.loc[short_mask, "kijun"] + 0.5 * df.loc[short_mask, "atr"]
        atr_sl_s = df.loc[short_mask, "Close"] + p["atr_sl_mult"] * df.loc[short_mask, "atr"]
        df.loc[short_mask, "stop_loss"] = pd.concat([kijun_sl_s, atr_sl_s], axis=1).min(axis=1)
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
// Ichimoku Cloud v1 — Full system with crypto-adapted periods
// TK cross above cloud + Chikou confirms + MACD momentum
"""


Strategy = IchimokuCloudV1
