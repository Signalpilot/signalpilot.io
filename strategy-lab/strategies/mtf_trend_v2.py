"""
MTF Trend v2 — Improved multi-timeframe with Hull MA + StochRSI timing.

v1 used EMA pullback for H1 entries. v2 upgrades to:
1. Hull MA for H4 trend (less lag = earlier trend detection)
2. StochRSI for H1 entry timing (more sensitive pullback detection)
3. MACD histogram confirmation (momentum building)
4. Tighter stops (earlier entries = closer to reversal point)

This combines the best elements of all our other strategies.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import (
    ema, hull_ma, rsi, atr, adx, macd, supertrend,
    stoch_rsi, crossover, crossunder
)


class MTFTrendV2:
    name = "mtf_trend"
    version = "2.0"
    description = "MTF v2: Hull MA H4 direction + StochRSI H1 timing"

    params = {
        # H4 trend (Hull MA — less lag)
        "h4_hull_fast": 16,
        "h4_hull_slow": 48,
        "h4_st_period": 10,
        "h4_st_mult": 3.0,

        # H1 entry timing (StochRSI)
        "h1_ema_fast": 9,
        "h1_ema_slow": 21,
        "stochrsi_rsi": 14,
        "stochrsi_stoch": 14,
        "stochrsi_k": 3,
        "stochrsi_d": 3,
        "stochrsi_os": 20,
        "stochrsi_ob": 80,

        # MACD confirmation
        "macd_fast": 12,
        "macd_slow": 26,
        "macd_signal": 9,

        # Risk management
        "atr_period": 14,
        "atr_sl_mult": 1.0,       # Very tight — Hull + StochRSI = precise entry
        "atr_tp_mult": 3.0,       # 3:1 R:R

        # Volatility filter
        "vol_lookback": 100,
        "vol_min_pctile": 10,
        "vol_max_pctile": 95,
    }

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        p = self.params

        # ── Resample H1 → H4 ──────────────────────────────────────────
        h4 = df.resample("4h").agg({
            "Open": "first", "High": "max", "Low": "min",
            "Close": "last", "Volume": "sum",
        }).dropna()

        # H4 Hull MA trend
        h4["hull_fast"] = hull_ma(h4["Close"], p["h4_hull_fast"])
        h4["hull_slow"] = hull_ma(h4["Close"], p["h4_hull_slow"])
        h4["trend_up"] = h4["hull_fast"] > h4["hull_slow"]
        h4["trend_down"] = h4["hull_fast"] < h4["hull_slow"]

        # H4 SuperTrend
        st_line, st_dir = supertrend(h4["High"], h4["Low"], h4["Close"],
                                      p["h4_st_period"], p["h4_st_mult"])
        h4["st_dir"] = st_dir

        # H4 ADX
        adx_val, plus_di, minus_di = adx(h4["High"], h4["Low"], h4["Close"])
        h4["adx"] = adx_val
        h4["plus_di"] = plus_di
        h4["minus_di"] = minus_di

        # H4 Hull slope
        h4["hull_slope"] = h4["hull_fast"].diff(2) / h4["hull_fast"].shift(2) * 100

        # Reindex to H1
        h4_cols = h4[["trend_up", "trend_down", "st_dir", "adx", "plus_di", "minus_di", "hull_slope"]]
        h4_on_h1 = h4_cols.reindex(df.index, method="ffill")

        df["h4_trend_up"] = h4_on_h1["trend_up"].fillna(False)
        df["h4_trend_down"] = h4_on_h1["trend_down"].fillna(False)
        df["h4_st_dir"] = h4_on_h1["st_dir"].fillna(0)
        df["h4_adx"] = h4_on_h1["adx"].fillna(0)
        df["h4_plus_di"] = h4_on_h1["plus_di"].fillna(0)
        df["h4_minus_di"] = h4_on_h1["minus_di"].fillna(0)
        df["h4_hull_slope"] = h4_on_h1["hull_slope"].fillna(0)

        # ── H1 entry indicators ────────────────────────────────────────
        df["h1_fast_ema"] = ema(df["Close"], p["h1_ema_fast"])
        df["h1_slow_ema"] = ema(df["Close"], p["h1_ema_slow"])
        df["h1_trend_up"] = df["h1_fast_ema"] > df["h1_slow_ema"]
        df["h1_trend_down"] = df["h1_fast_ema"] < df["h1_slow_ema"]

        # StochRSI
        k, d = stoch_rsi(df["Close"], p["stochrsi_rsi"], p["stochrsi_stoch"],
                         p["stochrsi_k"], p["stochrsi_d"])
        df["srsi_k"] = k
        df["srsi_d"] = d

        df["srsi_bull"] = crossover(k, d) & (k.shift(1) < p["stochrsi_os"] + 15)
        df["srsi_bear"] = crossunder(k, d) & (k.shift(1) > p["stochrsi_ob"] - 15)

        # MACD
        macd_line, signal_line, histogram = macd(df["Close"], p["macd_fast"], p["macd_slow"], p["macd_signal"])
        df["macd_bull"] = histogram > 0
        df["macd_bear"] = histogram < 0
        df["macd_accel_up"] = histogram > histogram.shift(1)
        df["macd_accel_down"] = histogram < histogram.shift(1)

        # RSI and ATR
        df["rsi"] = rsi(df["Close"], 14)
        df["atr"] = atr(df["High"], df["Low"], df["Close"], p["atr_period"])

        # Volatility filter
        atr_pctile = df["atr"].rolling(p["vol_lookback"]).rank(pct=True) * 100
        df["vol_ok"] = (atr_pctile >= p["vol_min_pctile"]) & (atr_pctile <= p["vol_max_pctile"])

        # ── Signal generation ──────────────────────────────────────────
        df["signal"] = 0
        df["stop_loss"] = np.nan
        df["take_profit"] = np.nan

        # LONG: H4 Hull uptrend + H4 SuperTrend bullish + H4 ADX >20 +
        #       H1 StochRSI bullish cross + MACD positive/accelerating + H1 trend aligned
        long_cond = (
            df["h4_trend_up"] &
            (df["h4_st_dir"] == 1) &
            (df["h4_adx"] > 20) &
            (df["h4_plus_di"] > df["h4_minus_di"]) &
            df["h1_trend_up"] &
            df["srsi_bull"] &
            (df["macd_bull"] | df["macd_accel_up"]) &
            (df["rsi"] > 35) & (df["rsi"] < 70) &
            df["vol_ok"]
        )

        # SHORT: H4 Hull downtrend + H4 SuperTrend bearish + H4 ADX >20 +
        #        H1 StochRSI bearish cross + MACD negative/decelerating + H1 trend aligned
        short_cond = (
            df["h4_trend_down"] &
            (df["h4_st_dir"] == -1) &
            (df["h4_adx"] > 20) &
            (df["h4_minus_di"] > df["h4_plus_di"]) &
            df["h1_trend_down"] &
            df["srsi_bear"] &
            (df["macd_bear"] | df["macd_accel_down"]) &
            (df["rsi"] > 30) & (df["rsi"] < 65) &
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
// MTF Trend v2 — Hull MA H4 + StochRSI H1
// Use request.security for H4 Hull MA on TradingView
"""


Strategy = MTFTrendV2
