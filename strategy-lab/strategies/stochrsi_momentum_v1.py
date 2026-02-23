"""
StochRSI Momentum v1 — Stochastic RSI reversal + trend alignment.

Core insight: StochRSI is RSI applied to RSI — it's more sensitive
and oscillates more frequently than plain RSI. When StochRSI crosses
from extreme zones WHILE in a trend, it catches pullback entries.

This is a PULLBACK strategy:
- Trend must be established (EMA alignment + ADX)
- StochRSI dips to oversold in uptrend → BUY the dip
- StochRSI pops to overbought in downtrend → SELL the rip
- Much higher frequency than crossover strategies

Think of it as: "the trend is up, price pulled back, now it's
resuming — get on board."
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import (
    ema, rsi, atr, adx, stoch_rsi, supertrend, crossover, crossunder
)


class StochRSIMomentumV1:
    name = "stochrsi_momentum"
    version = "1.0"
    description = "StochRSI pullback entries in established trends"

    params = {
        # Trend detection
        "ema_fast": 21,
        "ema_slow": 55,
        "adx_period": 14,
        "adx_min": 20,
        "st_period": 10,
        "st_mult": 3.0,

        # StochRSI settings
        "stochrsi_rsi_period": 14,
        "stochrsi_stoch_period": 14,
        "stochrsi_k": 3,
        "stochrsi_d": 3,
        "stochrsi_ob": 80,        # Overbought
        "stochrsi_os": 20,        # Oversold

        # Risk management
        "atr_period": 14,
        "atr_sl_mult": 1.0,       # Very tight stop — pullback = fast reversal or cut
        "atr_tp_mult": 2.5,       # 2.5:1 R:R

        # Volatility filter
        "vol_lookback": 100,
        "vol_min_pctile": 10,
        "vol_max_pctile": 95,
    }

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        p = self.params

        # ── Trend indicators ──────────────────────────────────────────
        df["fast_ema"] = ema(df["Close"], p["ema_fast"])
        df["slow_ema"] = ema(df["Close"], p["ema_slow"])
        df["trend_up"] = df["fast_ema"] > df["slow_ema"]
        df["trend_down"] = df["fast_ema"] < df["slow_ema"]

        st_line, st_dir = supertrend(df["High"], df["Low"], df["Close"],
                                      p["st_period"], p["st_mult"])
        df["st_dir"] = st_dir

        adx_val, plus_di, minus_di = adx(df["High"], df["Low"], df["Close"], p["adx_period"])
        df["adx"] = adx_val

        # ── StochRSI ─────────────────────────────────────────────────
        k, d = stoch_rsi(df["Close"], p["stochrsi_rsi_period"],
                         p["stochrsi_stoch_period"], p["stochrsi_k"], p["stochrsi_d"])
        df["stochrsi_k"] = k
        df["stochrsi_d"] = d

        # StochRSI signals
        # Bullish: K crosses above D from oversold zone
        df["srsi_bull_cross"] = (
            crossover(k, d) &
            (k.shift(1) < p["stochrsi_os"] + 10)  # Was near oversold
        )

        # Bearish: K crosses below D from overbought zone
        df["srsi_bear_cross"] = (
            crossunder(k, d) &
            (k.shift(1) > p["stochrsi_ob"] - 10)  # Was near overbought
        )

        # ── Other indicators ──────────────────────────────────────────
        df["atr"] = atr(df["High"], df["Low"], df["Close"], p["atr_period"])
        df["rsi"] = rsi(df["Close"], p["stochrsi_rsi_period"])

        # Volatility filter
        atr_pctile = df["atr"].rolling(p["vol_lookback"]).rank(pct=True) * 100
        df["vol_ok"] = (atr_pctile >= p["vol_min_pctile"]) & (atr_pctile <= p["vol_max_pctile"])

        # ── Signal generation ─────────────────────────────────────────
        df["signal"] = 0
        df["stop_loss"] = np.nan
        df["take_profit"] = np.nan

        # LONG: Trend up + SuperTrend bullish + ADX trending + StochRSI bullish cross
        long_cond = (
            df["trend_up"] &
            (df["st_dir"] == 1) &
            (df["adx"] > p["adx_min"]) &
            df["srsi_bull_cross"] &
            (df["rsi"] > 35) &        # RSI shows some momentum
            (df["rsi"] < 65) &        # Not overextended
            df["vol_ok"]
        )

        # SHORT: Trend down + SuperTrend bearish + ADX trending + StochRSI bearish cross
        short_cond = (
            df["trend_down"] &
            (df["st_dir"] == -1) &
            (df["adx"] > p["adx_min"]) &
            df["srsi_bear_cross"] &
            (df["rsi"] > 35) &
            (df["rsi"] < 65) &
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
// ─── StochRSI Momentum ──────────────────────────────────────────────
fast_ma = ta.ema(close, ema_fast)
slow_ma = ta.ema(close, ema_slow)
[st_line, st_dir] = ta.supertrend(st_mult, st_period)
adx_val = ta.adx(adx_period)
rsi_val = ta.rsi(close, stochrsi_rsi_period)
atr_val = ta.atr(atr_period)

rsi1 = ta.rsi(close, stochrsi_rsi_period)
k = ta.sma(ta.stoch(rsi1, rsi1, rsi1, stochrsi_stoch_period), stochrsi_k)
d = ta.sma(k, stochrsi_d)

trend_up = fast_ma > slow_ma
trend_down = fast_ma < slow_ma

srsi_bull = ta.crossover(k, d) and k[1] < stochrsi_os + 10
srsi_bear = ta.crossunder(k, d) and k[1] > stochrsi_ob - 10

long_entry = trend_up and st_dir == 1 and adx_val > adx_min and srsi_bull and rsi_val > 35 and rsi_val < 65
short_entry = trend_down and st_dir == -1 and adx_val > adx_min and srsi_bear and rsi_val > 35 and rsi_val < 65

if long_entry
    strategy.entry("SRSI Long", strategy.long)
    strategy.exit("SRSI Long X", "SRSI Long", stop=close - atr_val * atr_sl_mult, limit=close + atr_val * atr_tp_mult)

if short_entry
    strategy.entry("SRSI Short", strategy.short)
    strategy.exit("SRSI Short X", "SRSI Short", stop=close + atr_val * atr_sl_mult, limit=close - atr_val * atr_tp_mult)

plot(fast_ma, "Fast EMA", color=color.blue)
plot(slow_ma, "Slow EMA", color=color.orange)
"""


Strategy = StochRSIMomentumV1
