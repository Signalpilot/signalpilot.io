"""
Meta Confluence v1 — Multi-system signal scoring.

Core insight: Instead of trusting ONE indicator system, score entries
by how many INDEPENDENT systems agree. When 4+ of 6 systems say BUY,
the probability of success is dramatically higher.

Signal sources (each contributes 0 or 1 to the score):
1. EMA crossover (21/55) — trend direction
2. Hull MA crossover (16/48) — fast trend direction
3. MACD histogram positive — momentum direction
4. SuperTrend bullish — structural trend
5. StochRSI from extreme — timing/pullback
6. ADX + DI alignment — trend strength

Required score: 4+ out of 6 for entry
This is a higher-conviction, lower-frequency system.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import (
    ema, hull_ma, rsi, atr, adx, macd, supertrend,
    stoch_rsi, crossover, crossunder, bollinger_bands
)


class MetaConfluenceV1:
    name = "meta_confluence"
    version = "1.0"
    description = "Multi-system confluence: 4+ of 6 signals must agree"

    params = {
        # System 1: EMA crossover
        "ema_fast": 21,
        "ema_slow": 55,

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
        "stochrsi_threshold": 15,  # How close to OS/OB zone

        # System 6: ADX + DI
        "adx_period": 14,
        "adx_min": 20,

        # Confluence threshold
        "min_score": 4,            # Minimum systems that must agree (out of 6)

        # RSI sanity check
        "rsi_period": 14,
        "rsi_max_long": 75,
        "rsi_min_short": 25,

        # Risk management
        "atr_period": 14,
        "atr_sl_mult": 1.2,       # Moderate stop
        "atr_tp_mult": 3.0,       # 2.5:1 R:R

        # Volatility filter
        "vol_lookback": 100,
        "vol_min_pctile": 10,
        "vol_max_pctile": 95,
    }

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        p = self.params

        # ── System 1: EMA Crossover ───────────────────────────────────
        df["ema_fast"] = ema(df["Close"], p["ema_fast"])
        df["ema_slow"] = ema(df["Close"], p["ema_slow"])
        s1_long = (df["ema_fast"] > df["ema_slow"]).astype(int)
        s1_short = (df["ema_fast"] < df["ema_slow"]).astype(int)

        # ── System 2: Hull MA ─────────────────────────────────────────
        df["hull_fast"] = hull_ma(df["Close"], p["hull_fast"])
        df["hull_slow"] = hull_ma(df["Close"], p["hull_slow"])
        s2_long = (df["hull_fast"] > df["hull_slow"]).astype(int)
        s2_short = (df["hull_fast"] < df["hull_slow"]).astype(int)

        # ── System 3: MACD ────────────────────────────────────────────
        macd_line, signal_line, histogram = macd(
            df["Close"], p["macd_fast"], p["macd_slow"], p["macd_signal"]
        )
        s3_long = (histogram > 0).astype(int)
        s3_short = (histogram < 0).astype(int)

        # ── System 4: SuperTrend ──────────────────────────────────────
        st_line, st_dir = supertrend(df["High"], df["Low"], df["Close"],
                                      p["st_period"], p["st_mult"])
        s4_long = (st_dir == 1).astype(int)
        s4_short = (st_dir == -1).astype(int)

        # ── System 5: StochRSI ────────────────────────────────────────
        k, d = stoch_rsi(df["Close"], p["stochrsi_rsi"], p["stochrsi_stoch"],
                         p["stochrsi_k"], p["stochrsi_d"])
        # Bullish: K rising from oversold or K > D
        s5_long = ((k > d) & (k < 80)).astype(int)
        s5_short = ((k < d) & (k > 20)).astype(int)

        # ── System 6: ADX + DI ────────────────────────────────────────
        adx_val, plus_di, minus_di = adx(df["High"], df["Low"], df["Close"], p["adx_period"])
        df["adx"] = adx_val
        s6_long = ((adx_val > p["adx_min"]) & (plus_di > minus_di)).astype(int)
        s6_short = ((adx_val > p["adx_min"]) & (minus_di > plus_di)).astype(int)

        # ── Confluence scoring ────────────────────────────────────────
        df["long_score"] = s1_long + s2_long + s3_long + s4_long + s5_long + s6_long
        df["short_score"] = s1_short + s2_short + s3_short + s4_short + s5_short + s6_short

        # Need score to INCREASE (new confluence forming, not stale)
        df["long_score_rising"] = df["long_score"] > df["long_score"].shift(1)
        df["short_score_rising"] = df["short_score"] > df["short_score"].shift(1)

        # ── Other indicators ──────────────────────────────────────────
        df["rsi"] = rsi(df["Close"], p["rsi_period"])
        df["atr"] = atr(df["High"], df["Low"], df["Close"], p["atr_period"])

        # Volatility filter
        atr_pctile = df["atr"].rolling(p["vol_lookback"]).rank(pct=True) * 100
        df["vol_ok"] = (atr_pctile >= p["vol_min_pctile"]) & (atr_pctile <= p["vol_max_pctile"])

        # ── Signal generation ─────────────────────────────────────────
        df["signal"] = 0
        df["stop_loss"] = np.nan
        df["take_profit"] = np.nan

        # LONG: 4+ systems agree + score just increased + RSI ok + vol ok
        long_cond = (
            (df["long_score"] >= p["min_score"]) &
            df["long_score_rising"] &
            (df["rsi"] < p["rsi_max_long"]) &
            (df["rsi"] > 30) &
            df["vol_ok"]
        )

        # SHORT: 4+ systems agree + score just increased + RSI ok + vol ok
        short_cond = (
            (df["short_score"] >= p["min_score"]) &
            df["short_score_rising"] &
            (df["rsi"] > p["rsi_min_short"]) &
            (df["rsi"] < 70) &
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
// ─── Meta Confluence v1 ──────────────────────────────────────────────
fast_ma = ta.ema(close, ema_fast)
slow_ma = ta.ema(close, ema_slow)
hull_f = ta.hma(close, hull_fast)
hull_s = ta.hma(close, hull_slow)
[macd_l, sig_l, hist] = ta.macd(close, macd_fast, macd_slow, macd_signal)
[st_l, st_d] = ta.supertrend(st_mult, st_period)
rsi1 = ta.rsi(close, stochrsi_rsi)
k = ta.sma(ta.stoch(rsi1, rsi1, rsi1, stochrsi_stoch), stochrsi_k)
d = ta.sma(k, stochrsi_d)
[adx_v, p_di, m_di] = ta.dmi(adx_period, adx_period)
rsi_val = ta.rsi(close, rsi_period)
atr_val = ta.atr(atr_period)

s1 = fast_ma > slow_ma ? 1 : 0
s2 = hull_f > hull_s ? 1 : 0
s3 = hist > 0 ? 1 : 0
s4 = st_d == 1 ? 1 : 0
s5 = k > d and k < 80 ? 1 : 0
s6 = adx_v > adx_min and p_di > m_di ? 1 : 0
long_score = s1 + s2 + s3 + s4 + s5 + s6

s1s = fast_ma < slow_ma ? 1 : 0
s2s = hull_f < hull_s ? 1 : 0
s3s = hist < 0 ? 1 : 0
s4s = st_d == -1 ? 1 : 0
s5s = k < d and k > 20 ? 1 : 0
s6s = adx_v > adx_min and m_di > p_di ? 1 : 0
short_score = s1s + s2s + s3s + s4s + s5s + s6s

long_entry = long_score >= min_score and long_score > long_score[1] and rsi_val < rsi_max_long and rsi_val > 30
short_entry = short_score >= min_score and short_score > short_score[1] and rsi_val > rsi_min_short and rsi_val < 70

if long_entry
    strategy.entry("Meta Long", strategy.long)
    strategy.exit("Meta Long X", "Meta Long", stop=close - atr_val * atr_sl_mult, limit=close + atr_val * atr_tp_mult)

if short_entry
    strategy.entry("Meta Short", strategy.short)
    strategy.exit("Meta Short X", "Meta Short", stop=close + atr_val * atr_sl_mult, limit=close - atr_val * atr_tp_mult)

bgcolor(long_score >= min_score ? color.new(color.green, 85) : short_score >= min_score ? color.new(color.red, 85) : na)
"""


Strategy = MetaConfluenceV1
