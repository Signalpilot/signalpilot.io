"""
Mean Reversion v2 — Squeeze-release with Keltner confirmation.

v1 failed walk-forward across all instruments. Root cause analysis:
- BB + RSI alone catches falling knives — no structural reason to revert
- No volatility context — trades in dead markets AND chaotic ones
- No confirmation that reversal is actually happening

v2 fixes:
1. Keltner squeeze detection — only trade when volatility is compressed
   (BB inside KC = squeeze ON), then trade the release direction
2. RSI divergence — price makes new low but RSI doesn't (momentum shifting)
3. Stochastic confirmation — %K crossing %D from extreme zone
4. Volatility percentile filter — skip dead and extreme markets
5. Close-to-BB-midline target — revert TO the mean, not beyond it
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import (
    rsi, atr, sma, ema, bollinger_bands, keltner_channels,
    stochastic, adx, lowest, highest
)


class MeanReversionV2:
    name = "mean_reversion"
    version = "2.0"
    description = "Squeeze-release mean reversion with Keltner + Stochastic confirmation"

    params = {
        # Bollinger Bands
        "bb_period": 20,
        "bb_std": 2.0,

        # Keltner Channels (for squeeze detection)
        "kc_ema_period": 20,
        "kc_atr_period": 10,
        "kc_mult": 1.5,

        # Oscillators
        "rsi_period": 14,
        "rsi_ob": 70,
        "rsi_os": 30,
        "stoch_k": 14,
        "stoch_d": 3,
        "stoch_ob": 80,
        "stoch_os": 20,

        # Trend filter
        "adx_max": 30,         # Don't revert in strong trends

        # Risk management
        "atr_period": 14,
        "atr_sl_mult": 1.2,    # Tight — if reversal fails, exit fast
        "use_bb_mid_tp": True,  # Target = BB midline (the "mean")
        "atr_tp_mult": 2.0,    # Fallback if not using BB mid target

        # Volatility filter
        "vol_lookback": 100,
        "vol_min_pctile": 15,   # Skip dead markets
        "vol_max_pctile": 90,   # Skip extreme chaos

        # Lookback for divergence
        "divergence_lookback": 10,
    }

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate mean reversion signals with multi-factor confirmation.

        Entry requires 3 of 4 conditions:
        1. Price at BB extreme (below lower / above upper)
        2. RSI at extreme (oversold / overbought)
        3. Stochastic %K crossing %D from extreme zone (reversal starting)
        4. RSI divergence (price vs RSI momentum diverging)

        Plus mandatory filters:
        - ADX < threshold (not strong trend)
        - Volatility in acceptable range
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

        # Squeeze: BB inside KC
        df["squeeze_on"] = (bb_lower > kc_lower) & (bb_upper < kc_upper)
        # Squeeze just released (was on, now off)
        df["squeeze_release"] = df["squeeze_on"].shift(1) & ~df["squeeze_on"]

        df["rsi"] = rsi(df["Close"], p["rsi_period"])
        df["atr"] = atr(df["High"], df["Low"], df["Close"], p["atr_period"])

        stoch_k, stoch_d = stochastic(df["High"], df["Low"], df["Close"],
                                       p["stoch_k"], p["stoch_d"])
        df["stoch_k"] = stoch_k
        df["stoch_d"] = stoch_d

        adx_val, _, _ = adx(df["High"], df["Low"], df["Close"])
        df["adx"] = adx_val

        # ── Divergence detection ─────────────────────────────────────
        lb = p["divergence_lookback"]
        price_low = lowest(df["Close"], lb)
        price_high = highest(df["Close"], lb)
        rsi_low = lowest(df["rsi"], lb)
        rsi_high = highest(df["rsi"], lb)

        # Bullish divergence: price makes new low, RSI makes higher low
        df["bull_div"] = (df["Close"] <= price_low * 1.002) & (df["rsi"] > rsi_low + 2)

        # Bearish divergence: price makes new high, RSI makes lower high
        df["bear_div"] = (df["Close"] >= price_high * 0.998) & (df["rsi"] < rsi_high - 2)

        # ── Volatility filter ────────────────────────────────────────
        atr_pctile = df["atr"].rolling(p["vol_lookback"]).rank(pct=True) * 100
        df["vol_ok"] = (atr_pctile >= p["vol_min_pctile"]) & (atr_pctile <= p["vol_max_pctile"])

        # ── Signal generation (confluence scoring) ───────────────────
        df["signal"] = 0
        df["stop_loss"] = np.nan
        df["take_profit"] = np.nan

        # Mandatory filters
        base_filter = (df["adx"] < p["adx_max"]) & df["vol_ok"]

        # LONG confluence scoring
        long_c1 = df["Close"] <= df["bb_lower"]           # At BB lower
        long_c2 = df["rsi"] < p["rsi_os"]                 # RSI oversold
        long_c3 = (df["stoch_k"] > df["stoch_d"]) & (df["stoch_k"].shift(1) <= df["stoch_d"].shift(1)) & (df["stoch_k"] < p["stoch_os"] + 10)  # Stoch cross up from extreme
        long_c4 = df["bull_div"]                           # RSI divergence

        long_score = long_c1.astype(int) + long_c2.astype(int) + long_c3.astype(int) + long_c4.astype(int)
        long_signal = base_filter & (long_score >= 3)

        # SHORT confluence scoring
        short_c1 = df["Close"] >= df["bb_upper"]
        short_c2 = df["rsi"] > p["rsi_ob"]
        short_c3 = (df["stoch_k"] < df["stoch_d"]) & (df["stoch_k"].shift(1) >= df["stoch_d"].shift(1)) & (df["stoch_k"] > p["stoch_ob"] - 10)
        short_c4 = df["bear_div"]

        short_score = short_c1.astype(int) + short_c2.astype(int) + short_c3.astype(int) + short_c4.astype(int)
        short_signal = base_filter & (short_score >= 3)

        # Apply signals
        df.loc[long_signal, "signal"] = 1
        df.loc[short_signal, "signal"] = -1

        # SL/TP for longs
        long_mask = df["signal"] == 1
        df.loc[long_mask, "stop_loss"] = (
            df.loc[long_mask, "Close"] - p["atr_sl_mult"] * df.loc[long_mask, "atr"]
        )
        if p["use_bb_mid_tp"]:
            df.loc[long_mask, "take_profit"] = df.loc[long_mask, "bb_mid"]
        else:
            df.loc[long_mask, "take_profit"] = (
                df.loc[long_mask, "Close"] + p["atr_tp_mult"] * df.loc[long_mask, "atr"]
            )

        # SL/TP for shorts
        short_mask = df["signal"] == -1
        df.loc[short_mask, "stop_loss"] = (
            df.loc[short_mask, "Close"] + p["atr_sl_mult"] * df.loc[short_mask, "atr"]
        )
        if p["use_bb_mid_tp"]:
            df.loc[short_mask, "take_profit"] = df.loc[short_mask, "bb_mid"]
        else:
            df.loc[short_mask, "take_profit"] = (
                df.loc[short_mask, "Close"] - p["atr_tp_mult"] * df.loc[short_mask, "atr"]
            )

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

        # Clear SL/TP on suppressed
        df.loc[df["signal"] == 0, "stop_loss"] = np.nan
        df.loc[df["signal"] == 0, "take_profit"] = np.nan

        return df

    def pine_script(self) -> str:
        return """
// ─── Bollinger Bands + Keltner Channels ─────────────────────────────
[bb_upper, bb_mid, bb_lower] = ta.bb(close, bb_period, bb_std)
[kc_mid, kc_upper, kc_lower] = ta.kc(close, kc_ema_period, kc_mult, true)

squeeze_on = bb_lower > kc_lower and bb_upper < kc_upper

// ─── Oscillators ────────────────────────────────────────────────────
rsi_val = ta.rsi(close, rsi_period)
[stoch_k_raw, stoch_d_raw] = ta.stoch(close, high, low, stoch_k)
stoch_k_val = ta.sma(stoch_k_raw, stoch_d)
stoch_d_val = ta.sma(stoch_k_val, stoch_d)
atr_val = ta.atr(atr_period)
adx_val = ta.adx(14)

// ─── Volatility Filter ─────────────────────────────────────────────
atr_rank = ta.percentrank(atr_val, vol_lookback)
vol_ok = atr_rank >= vol_min_pctile and atr_rank <= vol_max_pctile
base_ok = adx_val < adx_max and vol_ok

// ─── Confluence Scoring ─────────────────────────────────────────────
long_c1 = close <= bb_lower
long_c2 = rsi_val < rsi_os
long_c3 = ta.crossover(stoch_k_val, stoch_d_val) and stoch_k_val < stoch_os + 10
long_score = (long_c1 ? 1 : 0) + (long_c2 ? 1 : 0) + (long_c3 ? 1 : 0)

short_c1 = close >= bb_upper
short_c2 = rsi_val > rsi_ob
short_c3 = ta.crossunder(stoch_k_val, stoch_d_val) and stoch_k_val > stoch_ob - 10
short_score = (short_c1 ? 1 : 0) + (short_c2 ? 1 : 0) + (short_c3 ? 1 : 0)

// ─── Execute ────────────────────────────────────────────────────────
if base_ok and long_score >= 3
    strategy.entry("MR Long", strategy.long)
    tp = use_bb_mid_tp ? bb_mid : close + atr_val * atr_tp_mult
    strategy.exit("MR Long X", "MR Long", stop=close - atr_val * atr_sl_mult, limit=tp)

if base_ok and short_score >= 3
    strategy.entry("MR Short", strategy.short)
    tp = use_bb_mid_tp ? bb_mid : close - atr_val * atr_tp_mult
    strategy.exit("MR Short X", "MR Short", stop=close + atr_val * atr_sl_mult, limit=tp)

// ─── Plots ──────────────────────────────────────────────────────────
p_u = plot(bb_upper, "BB Upper", color=color.new(color.red, 50))
p_l = plot(bb_lower, "BB Lower", color=color.new(color.green, 50))
plot(bb_mid, "BB Mid", color=color.gray)
fill(p_u, p_l, color=squeeze_on ? color.new(color.orange, 85) : color.new(color.blue, 92))
bgcolor(base_ok and long_score >= 3 ? color.new(color.green, 85) : base_ok and short_score >= 3 ? color.new(color.red, 85) : na)
"""


Strategy = MeanReversionV2
