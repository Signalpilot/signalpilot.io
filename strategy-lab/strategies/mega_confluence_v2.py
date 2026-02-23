"""
Mega Confluence v2 — 10 independent indicator systems, require 7+ agreement.

Upgrades Meta Confluence v1 (6 systems, need 4+) to:
- 10 scoring systems covering trend, momentum, volatility, volume, and structure
- Higher threshold (7/10) for extreme selectivity
- Each system scores +1 (bullish) or -1 (bearish) independently

Systems:
1. EMA ribbon (9/21)
2. Hull MA trend (16/48)
3. MACD histogram
4. SuperTrend direction
5. StochRSI momentum
6. ADX + DI directional
7. RSI level zone
8. Bollinger Band position
9. OBV trend
10. CCI momentum
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import (
    ema, hull_ma, rsi, atr, adx, macd, supertrend,
    stoch_rsi, bollinger_bands, obv, cci, sma,
    crossover, crossunder
)


class MegaConfluenceV2:
    name = "mega_confluence"
    version = "2.0"
    description = "Mega Confluence v2: 10 systems, need 7+ to fire"

    params = {
        # System 1: EMA ribbon
        "ema_fast": 9,
        "ema_slow": 21,

        # System 2: Hull MA
        "hull_fast": 16,
        "hull_slow": 48,

        # System 3: MACD
        "macd_fast": 12,
        "macd_slow": 26,
        "macd_signal": 9,

        # System 4: SuperTrend
        "st_period": 10,
        "st_mult": 3.0,

        # System 5: StochRSI
        "stochrsi_rsi": 14,
        "stochrsi_stoch": 14,
        "stochrsi_k": 3,
        "stochrsi_d": 3,
        "stochrsi_os": 25,
        "stochrsi_ob": 75,

        # System 6: ADX + DI
        "adx_period": 14,
        "adx_threshold": 20,

        # System 7: RSI
        "rsi_period": 14,

        # System 8: Bollinger Bands
        "bb_period": 20,
        "bb_std": 2.0,

        # System 9: OBV
        "obv_ema": 21,

        # System 10: CCI
        "cci_period": 20,

        # Entry threshold
        "min_score": 7,

        # Risk management
        "atr_period": 14,
        "atr_sl_mult": 1.0,
        "atr_tp_mult": 3.0,

        # Volatility filter
        "vol_lookback": 100,
        "vol_min_pctile": 10,
        "vol_max_pctile": 95,
    }

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        p = self.params

        # ── System 1: EMA ribbon ───────────────────────────────────────
        df["ema_f"] = ema(df["Close"], p["ema_fast"])
        df["ema_s"] = ema(df["Close"], p["ema_slow"])
        df["score_ema"] = np.where(df["ema_f"] > df["ema_s"], 1,
                          np.where(df["ema_f"] < df["ema_s"], -1, 0))

        # ── System 2: Hull MA ──────────────────────────────────────────
        df["hull_f"] = hull_ma(df["Close"], p["hull_fast"])
        df["hull_s"] = hull_ma(df["Close"], p["hull_slow"])
        df["score_hull"] = np.where(df["hull_f"] > df["hull_s"], 1,
                           np.where(df["hull_f"] < df["hull_s"], -1, 0))

        # ── System 3: MACD ─────────────────────────────────────────────
        macd_line, signal_line, histogram = macd(
            df["Close"], p["macd_fast"], p["macd_slow"], p["macd_signal"]
        )
        df["score_macd"] = np.where(
            (histogram > 0) & (histogram > histogram.shift(1)), 1,
            np.where((histogram < 0) & (histogram < histogram.shift(1)), -1, 0)
        )

        # ── System 4: SuperTrend ───────────────────────────────────────
        st_line, st_dir = supertrend(
            df["High"], df["Low"], df["Close"], p["st_period"], p["st_mult"]
        )
        df["score_st"] = st_dir

        # ── System 5: StochRSI ─────────────────────────────────────────
        k, d = stoch_rsi(df["Close"], p["stochrsi_rsi"], p["stochrsi_stoch"],
                         p["stochrsi_k"], p["stochrsi_d"])
        df["score_srsi"] = np.where(
            (k > d) & (k.shift(1) < p["stochrsi_ob"]), 1,
            np.where((k < d) & (k.shift(1) > p["stochrsi_os"]), -1, 0)
        )

        # ── System 6: ADX + DI ─────────────────────────────────────────
        adx_val, plus_di, minus_di = adx(df["High"], df["Low"], df["Close"], p["adx_period"])
        df["score_adx"] = np.where(
            (adx_val > p["adx_threshold"]) & (plus_di > minus_di), 1,
            np.where((adx_val > p["adx_threshold"]) & (minus_di > plus_di), -1, 0)
        )

        # ── System 7: RSI zones ────────────────────────────────────────
        df["rsi"] = rsi(df["Close"], p["rsi_period"])
        df["score_rsi"] = np.where(
            (df["rsi"] > 45) & (df["rsi"] < 70), 1,
            np.where((df["rsi"] > 30) & (df["rsi"] < 55), -1, 0)
        )

        # ── System 8: Bollinger Band position ──────────────────────────
        bb_upper, bb_mid, bb_lower = bollinger_bands(
            df["Close"], p["bb_period"], p["bb_std"]
        )
        bb_pct = (df["Close"] - bb_lower) / (bb_upper - bb_lower).replace(0, np.nan)
        df["score_bb"] = np.where(
            (bb_pct > 0.5) & (bb_pct < 0.9), 1,
            np.where((bb_pct < 0.5) & (bb_pct > 0.1), -1, 0)
        )

        # ── System 9: OBV trend ────────────────────────────────────────
        df["obv_val"] = obv(df["Close"], df["Volume"])
        df["obv_ema"] = ema(df["obv_val"], p["obv_ema"])
        df["score_obv"] = np.where(df["obv_val"] > df["obv_ema"], 1,
                          np.where(df["obv_val"] < df["obv_ema"], -1, 0))

        # ── System 10: CCI momentum ────────────────────────────────────
        df["cci_val"] = cci(df["High"], df["Low"], df["Close"], p["cci_period"])
        df["score_cci"] = np.where(
            (df["cci_val"] > 0) & (df["cci_val"] < 200), 1,
            np.where((df["cci_val"] < 0) & (df["cci_val"] > -200), -1, 0)
        )

        # ── Composite score ────────────────────────────────────────────
        score_cols = ["score_ema", "score_hull", "score_macd", "score_st",
                      "score_srsi", "score_adx", "score_rsi", "score_bb",
                      "score_obv", "score_cci"]
        df["bull_score"] = sum((df[c] == 1).astype(int) for c in score_cols)
        df["bear_score"] = sum((df[c] == -1).astype(int) for c in score_cols)

        # ATR
        df["atr"] = atr(df["High"], df["Low"], df["Close"], p["atr_period"])

        # Volatility filter
        atr_pctile = df["atr"].rolling(p["vol_lookback"]).rank(pct=True) * 100
        df["vol_ok"] = (atr_pctile >= p["vol_min_pctile"]) & (atr_pctile <= p["vol_max_pctile"])

        # ── Signal generation ──────────────────────────────────────────
        df["signal"] = 0
        df["stop_loss"] = np.nan
        df["take_profit"] = np.nan

        long_cond = (df["bull_score"] >= p["min_score"]) & df["vol_ok"]
        short_cond = (df["bear_score"] >= p["min_score"]) & df["vol_ok"]

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
// Mega Confluence v2 — 10 independent scoring systems
// Entry when 7+ of 10 systems agree on direction
"""


Strategy = MegaConfluenceV2
