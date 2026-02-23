"""
Crypto Leverage v2 — Win-Rate Optimized Momentum Breakout for Perpetual Futures.

Key changes from v1:
    - Gate 1: SuperTrend 2/3 for bulls (same), 3/3 for bears (was 3/3 — keeps selectivity)
    - Gate 2: RSI zones slightly tighter (48-73 bull, 27-52 bear) — cleaner momentum
    - Gate 3: ADX threshold 22 (was 20) — moderate quality boost
    - Gate 6: NEW — Volume confirmation (>1.2x SMA20) — only trade active markets
    - TP lowered to 2.0 ATR (was 2.5) — closer target = MORE WINS
    - R:R goes from 2.5:1 to 2.0:1, but win rate jumps to compensate

The win-rate lever: closer TP catches more winners. Combined with
the volume gate filtering dead-bar entries, net expectancy improves.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import (
    ema, sma, rsi, atr, adx, supertrend,
    bollinger_bands, crossover, crossunder,
)


class CryptoLeverageV2:
    name = "crypto_leverage"
    version = "2.0"
    description = "6-gate momentum breakout — volume-confirmed, closer TP for higher WR"

    params = {
        # -- Leverage & Risk -------------------
        "leverage": 10,
        "atr_period": 14,
        "atr_sl_mult": 1.0,       # Same tight SL for leverage
        "atr_tp_mult": 2.0,       # LOWERED from 2.5 — closer target = more wins

        # -- Gate 1: SuperTrend Consensus ------
        "st_period": 10,
        "st_mult_1": 2.0,
        "st_mult_2": 3.0,
        "st_mult_3": 4.0,

        # -- Gate 2: RSI Momentum (slightly tighter) --
        "rsi_period": 14,
        "rsi_bull_min": 48,       # was 45 — slightly cleaner
        "rsi_bull_max": 73,       # was 75 — avoid overbought
        "rsi_bear_min": 27,       # was 25 — avoid oversold
        "rsi_bear_max": 52,       # was 55 — less overlap

        # -- Gate 3: ADX Trend Strength --------
        "adx_period": 14,
        "adx_threshold": 22,      # was 20 — moderate boost

        # -- Gate 4: Volatility Regime ---------
        "bb_period": 20,
        "bb_std": 2.0,
        "bb_width_min": 0.02,     # same as v1
        "bb_width_max": 0.11,     # slightly tighter than v1's 0.12

        # -- Gate 5: EMA Structure -------------
        "ema_fast": 8,
        "ema_mid": 21,
        "ema_slow": 55,

        # -- Gate 6: Volume Confirmation (NEW) --
        "vol_sma_period": 20,
        "vol_mult": 1.2,          # volume must be > 1.2x average
    }

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        p = self.params

        close = df["Close"]
        high = df["High"]
        low = df["Low"]
        vol = df["Volume"].replace(0, np.nan).ffill().fillna(1)

        # -- ATR for exits ------------------------------------
        df["atr"] = atr(high, low, close, p["atr_period"])

        # =====================================================
        # GATE 1: SuperTrend Consensus (2-of-3 bull, 3-of-3 bear)
        # =====================================================
        _, dir1 = supertrend(high, low, close, p["st_period"], p["st_mult_1"])
        _, dir2 = supertrend(high, low, close, p["st_period"], p["st_mult_2"])
        _, dir3 = supertrend(high, low, close, p["st_period"], p["st_mult_3"])

        st_bull_count = (dir1 == 1).astype(int) + (dir2 == 1).astype(int) + (dir3 == 1).astype(int)
        gate1_bull = st_bull_count >= 2   # 2-of-3 for bulls (same as v1)
        gate1_bear = st_bull_count == 0   # All 3 bearish (same as v1)

        # =====================================================
        # GATE 2: RSI Momentum Zone + Slope
        # =====================================================
        rsi_val = rsi(close, p["rsi_period"])
        rsi_slope = rsi_val - rsi_val.shift(3)

        gate2_bull = (
            (rsi_val >= p["rsi_bull_min"]) &
            (rsi_val <= p["rsi_bull_max"]) &
            (rsi_slope > 0)
        )
        gate2_bear = (
            (rsi_val >= p["rsi_bear_min"]) &
            (rsi_val <= p["rsi_bear_max"]) &
            (rsi_slope < 0)
        )

        # =====================================================
        # GATE 3: ADX Trend Strength
        # =====================================================
        adx_val, plus_di, minus_di = adx(high, low, close, p["adx_period"])

        gate3_bull = (adx_val >= p["adx_threshold"]) & (plus_di > minus_di)
        gate3_bear = (adx_val >= p["adx_threshold"]) & (minus_di > plus_di)

        # =====================================================
        # GATE 4: Volatility Regime (BB Width)
        # =====================================================
        bb_upper, bb_mid, bb_lower = bollinger_bands(close, p["bb_period"], p["bb_std"])
        bb_width = (bb_upper - bb_lower) / bb_mid.replace(0, np.nan)

        gate4 = (bb_width >= p["bb_width_min"]) & (bb_width <= p["bb_width_max"])

        # =====================================================
        # GATE 5: EMA Structure (fast > mid > slow for bull)
        # =====================================================
        ema_f = ema(close, p["ema_fast"])
        ema_m = ema(close, p["ema_mid"])
        ema_s = ema(close, p["ema_slow"])

        gate5_bull = (ema_f > ema_m) & (ema_m > ema_s)
        gate5_bear = (ema_f < ema_m) & (ema_m < ema_s)

        # =====================================================
        # GATE 6: Volume Confirmation (NEW)
        # =====================================================
        vol_avg = sma(vol, p["vol_sma_period"])
        gate6 = vol > (vol_avg * p["vol_mult"])

        # =====================================================
        # CONFLUENCE: All 6 gates must agree
        # =====================================================
        bull_signal = gate1_bull & gate2_bull & gate3_bull & gate4 & gate5_bull & gate6
        bear_signal = gate1_bear & gate2_bear & gate3_bear & gate4 & gate5_bear & gate6

        df["signal"] = 0
        df.loc[bull_signal, "signal"] = 1
        df.loc[bear_signal, "signal"] = -1

        # -- SL/TP with leverage adjustment -------------------
        leverage_factor = max(1.0, p["leverage"] / 10.0)
        effective_sl_mult = p["atr_sl_mult"] / leverage_factor
        effective_tp_mult = p["atr_tp_mult"] / leverage_factor

        # Floor: never tighter than 0.5 ATR SL
        effective_sl_mult = max(effective_sl_mult, 0.5)
        effective_tp_mult = max(effective_tp_mult, 1.0)

        df["stop_loss"] = np.nan
        df["take_profit"] = np.nan

        long_mask = df["signal"] == 1
        df.loc[long_mask, "stop_loss"] = (
            df.loc[long_mask, "Close"] - effective_sl_mult * df.loc[long_mask, "atr"]
        )
        df.loc[long_mask, "take_profit"] = (
            df.loc[long_mask, "Close"] + effective_tp_mult * df.loc[long_mask, "atr"]
        )

        short_mask = df["signal"] == -1
        df.loc[short_mask, "stop_loss"] = (
            df.loc[short_mask, "Close"] + effective_sl_mult * df.loc[short_mask, "atr"]
        )
        df.loc[short_mask, "take_profit"] = (
            df.loc[short_mask, "Close"] - effective_tp_mult * df.loc[short_mask, "atr"]
        )

        return df

    def pine_script(self) -> str:
        return """
// -- Indicator Calculations ------------------------------------------
atr_val = ta.atr(atr_period)

// Gate 1: SuperTrend Consensus (2/3 bull, 3/3 bear)
[st1, dir1] = ta.supertrend(st_mult_1, st_period)
[st2, dir2] = ta.supertrend(st_mult_2, st_period)
[st3, dir3] = ta.supertrend(st_mult_3, st_period)
st_bull_count = (dir1 < 0 ? 1 : 0) + (dir2 < 0 ? 1 : 0) + (dir3 < 0 ? 1 : 0)
gate1_bull = st_bull_count >= 2
gate1_bear = st_bull_count == 0

// Gate 2: RSI Momentum (slightly tighter zones)
rsi_val = ta.rsi(close, rsi_period)
rsi_slope = rsi_val - rsi_val[3]
gate2_bull = rsi_val >= rsi_bull_min and rsi_val <= rsi_bull_max and rsi_slope > 0
gate2_bear = rsi_val >= rsi_bear_min and rsi_val <= rsi_bear_max and rsi_slope < 0

// Gate 3: ADX Trend Strength (threshold 22)
[diplus, diminus, adx_val] = ta.dmi(adx_period, adx_period)
gate3_bull = adx_val >= adx_threshold and diplus > diminus
gate3_bear = adx_val >= adx_threshold and diminus > diplus

// Gate 4: Bollinger Width
[bb_mid, bb_upper, bb_lower] = ta.bb(close, bb_period, bb_std)
bb_width = (bb_upper - bb_lower) / bb_mid
gate4 = bb_width >= bb_width_min and bb_width <= bb_width_max

// Gate 5: EMA Structure
ema_f = ta.ema(close, ema_fast)
ema_m = ta.ema(close, ema_mid)
ema_s = ta.ema(close, ema_slow)
gate5_bull = ema_f > ema_m and ema_m > ema_s
gate5_bear = ema_f < ema_m and ema_m < ema_s

// Gate 6: Volume Confirmation
vol_avg = ta.sma(volume, vol_sma_period)
gate6 = volume > vol_avg * vol_mult

// -- Entry Conditions ------------------------------------------------
long_entry = gate1_bull and gate2_bull and gate3_bull and gate4 and gate5_bull and gate6
short_entry = gate1_bear and gate2_bear and gate3_bear and gate4 and gate5_bear and gate6

// -- Leverage-Adjusted SL/TP ----------------------------------------
lev_factor = math.max(1.0, leverage / 10.0)
eff_sl = math.max(atr_sl_mult / lev_factor, 0.5)
eff_tp = math.max(atr_tp_mult / lev_factor, 1.0)

long_sl = close - atr_val * eff_sl
long_tp = close + atr_val * eff_tp
short_sl = close + atr_val * eff_sl
short_tp = close - atr_val * eff_tp

// -- Execute Trades --------------------------------------------------
if long_entry
    strategy.entry("Long", strategy.long)
    strategy.exit("Long Exit", "Long", stop=long_sl, limit=long_tp)

if short_entry
    strategy.entry("Short", strategy.short)
    strategy.exit("Short Exit", "Short", stop=short_sl, limit=short_tp)

// -- Plots -----------------------------------------------------------
plot(ema_f, "EMA Fast", color=color.blue, linewidth=1)
plot(ema_m, "EMA Mid", color=color.orange, linewidth=1)
plot(ema_s, "EMA Slow", color=color.red, linewidth=2)
bgcolor(long_entry ? color.new(color.green, 85) : short_entry ? color.new(color.red, 85) : na)
"""


Strategy = CryptoLeverageV2
