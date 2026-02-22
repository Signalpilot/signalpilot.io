"""
Elite Seven Confluence v1 — Full 7-indicator confluence strategy.

Backtestable Python approximation of the Signal Pilot Elite Seven
indicator suite. Each indicator module produces a directional vote
(+1 bullish, -1 bearish, 0 neutral). Entries fire when a minimum
number of indicators agree on direction.

The Seven:
    1. Pentarch       — Cycle phase detection (regime + momentum)
    2. OmniDeck       — Multi-system overlay (SuperTrend, Squeeze, EMA Trio, Exhaustion)
    3. Volume Oracle   — Accumulation/Distribution regime
    4. Plutus Flow     — Enhanced OBV with flow ribbon
    5. Janus Atlas     — Market structure (BOS/CHoCH, swing HH/HL/LH/LL)
    6. Augury Grid     — MACD-based signal quality scorer
    7. Harmonic Osc.   — 7-component voting system
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import (
    ema, sma, rsi, atr, macd, adx, supertrend, squeeze,
    bollinger_bands, keltner_channels, stochastic,
    obv, stoch_rsi, momentum,
    crossover, crossunder, pivothigh, pivotlow, highest, lowest,
)


class EliteSevenConfluenceV1:
    name = "elite_seven_confluence"
    version = "1.0"
    description = "7-indicator confluence strategy modelling the Signal Pilot Elite Seven"

    params = {
        # ── Pentarch ──────────────────────────
        "pentarch_fast": 13,
        "pentarch_slow": 34,
        "pentarch_adx_period": 14,
        "pentarch_adx_thresh": 20,

        # ── OmniDeck ─────────────────────────
        "omni_ema_50": 50,
        "omni_ema_100": 100,
        "omni_ema_200": 200,
        "omni_st_period": 10,
        "omni_st_mult": 3.0,
        "omni_bmsb_sma": 20,
        "omni_bmsb_ema": 21,

        # ── Volume Oracle ────────────────────
        "oracle_vol_fast": 10,
        "oracle_vol_slow": 30,
        "oracle_regime_lookback": 21,

        # ── Plutus Flow ──────────────────────
        "plutus_obv_fast": 10,
        "plutus_obv_slow": 30,
        "plutus_sigma_period": 50,
        "plutus_sigma_mult": 2.0,

        # ── Janus Atlas ──────────────────────
        "janus_pivot_left": 5,
        "janus_pivot_right": 5,

        # ── Augury Grid ──────────────────────
        "augury_macd_fast": 12,
        "augury_macd_slow": 26,
        "augury_macd_signal": 9,
        "augury_adx_min": 20,
        "augury_rsi_period": 14,

        # ── Harmonic Oscillator ──────────────
        "harmonic_rsi": 14,
        "harmonic_stoch_k": 14,
        "harmonic_stoch_d": 3,
        "harmonic_ema_trend": 50,
        "harmonic_mom_period": 10,

        # ── Confluence & Risk ────────────────
        "min_confluence": 4,       # need 4/7 to agree
        "atr_period": 14,
        "atr_sl_mult": 1.5,
        "atr_tp_mult": 3.0,
    }

    # ─────────────────────────────────────────────────────────────────────
    #  1. PENTARCH — Cycle Phase Detection
    # ─────────────────────────────────────────────────────────────────────
    def _pentarch(self, df: pd.DataFrame) -> pd.Series:
        """
        Regime classification + momentum direction.

        Logic:
        - ADX + DI determine regime (bullish/bearish/neutral)
        - Fast/Slow EMA spread as NanoFlow proxy
        - Bullish: ADX trending + +DI > -DI + rising momentum
        - Bearish: ADX trending + -DI > +DI + falling momentum
        """
        p = self.params
        adx_val, plus_di, minus_di = adx(df["High"], df["Low"], df["Close"], p["pentarch_adx_period"])

        fast = ema(df["Close"], p["pentarch_fast"])
        slow = ema(df["Close"], p["pentarch_slow"])
        nanoflow = fast - slow
        nf_rising = nanoflow > nanoflow.shift(1)

        trending = adx_val > p["pentarch_adx_thresh"]
        bullish_regime = trending & (plus_di > minus_di)
        bearish_regime = trending & (minus_di > plus_di)

        signal = pd.Series(0, index=df.index)
        signal[bullish_regime & nf_rising] = 1
        signal[bearish_regime & ~nf_rising] = -1
        return signal

    # ─────────────────────────────────────────────────────────────────────
    #  2. OMNIDECK — Multi-System Overlay
    # ─────────────────────────────────────────────────────────────────────
    def _omnideck(self, df: pd.DataFrame) -> pd.Series:
        """
        Aggregates 5 sub-systems into a net score.

        Sub-systems:
        1. EMA Trio alignment (50/100/200)
        2. SuperTrend direction
        3. BMSB (Bull Market Support Band: 20 SMA + 21 EMA)
        4. Squeeze state (compression → expansion)
        5. Exhaustion Counter (9 consecutive closes → reversal warning)

        Score: sum of sub-system votes, normalized to -1/0/+1.
        """
        p = self.params
        close = df["Close"]

        # Sub-system 1: EMA Trio alignment
        e50 = ema(close, p["omni_ema_50"])
        e100 = ema(close, p["omni_ema_100"])
        e200 = ema(close, p["omni_ema_200"])
        ema_bull = ((e50 > e100) & (e100 > e200)).astype(int)
        ema_bear = ((e50 < e100) & (e100 < e200)).astype(int)
        ema_vote = ema_bull - ema_bear

        # Sub-system 2: SuperTrend
        st_line, st_dir = supertrend(df["High"], df["Low"], close,
                                     p["omni_st_period"], p["omni_st_mult"])
        st_vote = st_dir  # 1 = bullish, -1 = bearish

        # Sub-system 3: BMSB
        bmsb_sma = sma(close, p["omni_bmsb_sma"])
        bmsb_ema = ema(close, p["omni_bmsb_ema"])
        bmsb_mid = (bmsb_sma + bmsb_ema) / 2
        bmsb_vote = pd.Series(0, index=df.index)
        bmsb_vote[close > bmsb_mid] = 1
        bmsb_vote[close < bmsb_mid] = -1

        # Sub-system 4: Squeeze (BB inside KC)
        sq_on, sq_mom = squeeze(df["High"], df["Low"], close)
        sq_vote = pd.Series(0, index=df.index)
        # Squeeze releasing with positive momentum → bullish
        sq_releasing = sq_on.shift(1).fillna(False) & ~sq_on
        sq_vote[(sq_releasing | ~sq_on) & (sq_mom > 0)] = 1
        sq_vote[(sq_releasing | ~sq_on) & (sq_mom < 0)] = -1

        # Sub-system 5: Exhaustion Counter (penalizes overextension)
        exhaust = self._exhaustion_count(close)
        exhaust_vote = pd.Series(0, index=df.index)
        # 7+ consecutive up closes → overbought warning (bearish)
        # 7+ consecutive down closes → oversold warning (bullish)
        exhaust_vote[exhaust >= 7] = -1   # too many up closes → bearish
        exhaust_vote[exhaust <= -7] = 1   # too many down closes → bullish

        # Net score from 5 sub-systems
        net = ema_vote + st_vote + bmsb_vote + sq_vote + exhaust_vote
        signal = pd.Series(0, index=df.index)
        signal[net >= 3] = 1
        signal[net <= -3] = -1
        return signal

    @staticmethod
    def _exhaustion_count(close: pd.Series) -> pd.Series:
        """Count consecutive up/down closes. + = up streak, - = down streak."""
        direction = close.diff().apply(lambda x: 1 if x > 0 else (-1 if x < 0 else 0))
        count = pd.Series(0, index=close.index, dtype=int)
        for i in range(1, len(close)):
            if direction.iloc[i] == direction.iloc[i - 1] and direction.iloc[i] != 0:
                count.iloc[i] = count.iloc[i - 1] + direction.iloc[i]
            else:
                count.iloc[i] = direction.iloc[i]
        return count

    # ─────────────────────────────────────────────────────────────────────
    #  3. VOLUME ORACLE — Accumulation / Distribution Regime
    # ─────────────────────────────────────────────────────────────────────
    def _volume_oracle(self, df: pd.DataFrame) -> pd.Series:
        """
        Three-state regime: Accumulation (+1), Distribution (-1), Neutral (0).

        Logic:
        - Volume-weighted price momentum (fast vs slow)
        - If fast volume flow > slow → accumulation
        - If fast volume flow < slow → distribution
        - Volume must be above average for conviction
        """
        p = self.params
        close = df["Close"]
        vol = df["Volume"].replace(0, np.nan)

        # Volume-weighted close change
        price_change = close.diff()
        vol_flow = price_change * vol

        # Fast/slow EMAs of volume flow
        flow_fast = ema(vol_flow, p["oracle_vol_fast"])
        flow_slow = ema(vol_flow, p["oracle_vol_slow"])

        # Volume above average filter
        vol_sma = sma(vol, p["oracle_regime_lookback"])
        vol_active = vol > vol_sma

        signal = pd.Series(0, index=df.index)
        signal[(flow_fast > flow_slow) & (flow_fast > 0) & vol_active] = 1
        signal[(flow_fast < flow_slow) & (flow_fast < 0) & vol_active] = -1
        return signal

    # ─────────────────────────────────────────────────────────────────────
    #  4. PLUTUS FLOW — Enhanced OBV with Flow Ribbon
    # ─────────────────────────────────────────────────────────────────────
    def _plutus_flow(self, df: pd.DataFrame) -> pd.Series:
        """
        OBV trend direction via flow ribbon (fast EMA > slow EMA of OBV).

        Logic:
        - Compute OBV
        - Fast EMA of OBV vs Slow EMA of OBV (flow ribbon)
        - Rising OBV above ribbon → bullish flow
        - Falling OBV below ribbon → bearish flow
        """
        p = self.params
        obv_line = obv(df["Close"], df["Volume"])

        obv_fast = ema(obv_line, p["plutus_obv_fast"])
        obv_slow = ema(obv_line, p["plutus_obv_slow"])

        signal = pd.Series(0, index=df.index)
        signal[(obv_fast > obv_slow) & (obv_line > obv_fast)] = 1
        signal[(obv_fast < obv_slow) & (obv_line < obv_fast)] = -1
        return signal

    # ─────────────────────────────────────────────────────────────────────
    #  5. JANUS ATLAS — Market Structure
    # ─────────────────────────────────────────────────────────────────────
    def _janus_atlas(self, df: pd.DataFrame) -> pd.Series:
        """
        Market structure classification via swing highs/lows.

        Logic:
        - Detect pivot highs and lows
        - Track last two swing highs and two swing lows
        - HH + HL → bullish structure (+1)
        - LH + LL → bearish structure (-1)
        - Mixed → neutral (0)
        """
        p = self.params
        left = p["janus_pivot_left"]
        right = p["janus_pivot_right"]

        ph = pivothigh(df["High"], left, right)
        pl = pivotlow(df["Low"], left, right)

        signal = pd.Series(0, index=df.index)

        last_ph1 = np.nan
        last_ph2 = np.nan
        last_pl1 = np.nan
        last_pl2 = np.nan

        for i in range(len(df)):
            # Update swing highs
            if not np.isnan(ph.iloc[i]):
                last_ph2 = last_ph1
                last_ph1 = ph.iloc[i]

            # Update swing lows
            if not np.isnan(pl.iloc[i]):
                last_pl2 = last_pl1
                last_pl1 = pl.iloc[i]

            # Need at least 2 of each to classify
            if np.isnan(last_ph2) or np.isnan(last_pl2):
                continue

            hh = last_ph1 > last_ph2  # Higher High
            hl = last_pl1 > last_pl2  # Higher Low
            lh = last_ph1 < last_ph2  # Lower High
            ll = last_pl1 < last_pl2  # Lower Low

            if hh and hl:
                signal.iloc[i] = 1   # Bullish structure
            elif lh and ll:
                signal.iloc[i] = -1  # Bearish structure

        return signal

    # ─────────────────────────────────────────────────────────────────────
    #  6. AUGURY GRID — Signal Quality Scorer
    # ─────────────────────────────────────────────────────────────────────
    def _augury_grid(self, df: pd.DataFrame) -> pd.Series:
        """
        MACD crossover signal filtered by ADX + RSI + Volume.

        Logic:
        - Base: MACD line crosses signal line
        - Filter 1: ADX > threshold (trending market)
        - Filter 2: RSI not extreme (< 75 for longs, > 25 for shorts)
        - Filter 3: Volume above 20-period SMA
        - All filters must pass for a valid signal
        """
        p = self.params
        close = df["Close"]

        macd_line, sig_line, hist = macd(close, p["augury_macd_fast"],
                                         p["augury_macd_slow"], p["augury_macd_signal"])

        adx_val, _, _ = adx(df["High"], df["Low"], close, p["pentarch_adx_period"])
        rsi_val = rsi(close, p["augury_rsi_period"])
        vol_above = df["Volume"] > sma(df["Volume"], 20)

        bull_cross = crossover(macd_line, sig_line)
        bear_cross = crossunder(macd_line, sig_line)

        trending = adx_val > p["augury_adx_min"]

        signal = pd.Series(0, index=df.index)
        signal[bull_cross & trending & (rsi_val < 75) & vol_above] = 1
        signal[bear_cross & trending & (rsi_val > 25) & vol_above] = -1
        return signal

    # ─────────────────────────────────────────────────────────────────────
    #  7. HARMONIC OSCILLATOR — 7-Component Voting System
    # ─────────────────────────────────────────────────────────────────────
    def _harmonic_oscillator(self, df: pd.DataFrame) -> pd.Series:
        """
        7-component voting system: RSI, StochRSI, MACD, EMA Trend,
        Momentum, Volume, Divergence proxy.

        Each component votes +1 (bull) or -1 (bear).
        6-7 votes → TRENDING (+1/-1)
        4-5 votes → BIAS (+1/-1)
        0-3 votes → RANGING (0)
        """
        p = self.params
        close = df["Close"]

        # Component 1: RSI
        rsi_val = rsi(close, p["harmonic_rsi"])
        rsi_vote = pd.Series(0, index=df.index)
        rsi_vote[rsi_val > 50] = 1
        rsi_vote[rsi_val < 50] = -1

        # Component 2: Stochastic RSI
        stoch_k, stoch_d = stoch_rsi(close, p["harmonic_rsi"], p["harmonic_stoch_k"],
                                     p["harmonic_stoch_d"], p["harmonic_stoch_d"])
        stoch_vote = pd.Series(0, index=df.index)
        stoch_vote[stoch_k > 50] = 1
        stoch_vote[stoch_k < 50] = -1

        # Component 3: MACD
        macd_line, sig_line, _ = macd(close)
        macd_vote = pd.Series(0, index=df.index)
        macd_vote[macd_line > sig_line] = 1
        macd_vote[macd_line < sig_line] = -1

        # Component 4: EMA Trend
        trend_ema = ema(close, p["harmonic_ema_trend"])
        trend_vote = pd.Series(0, index=df.index)
        trend_vote[close > trend_ema] = 1
        trend_vote[close < trend_ema] = -1

        # Component 5: Momentum
        mom = momentum(close, p["harmonic_mom_period"])
        mom_vote = pd.Series(0, index=df.index)
        mom_vote[mom > 0] = 1
        mom_vote[mom < 0] = -1

        # Component 6: Volume trend
        vol = df["Volume"]
        vol_ema = ema(vol, 20)
        vol_vote = pd.Series(0, index=df.index)
        # Positive volume (rising price + above-avg volume) → bullish
        price_up = close > close.shift(1)
        vol_vote[price_up & (vol > vol_ema)] = 1
        vol_vote[~price_up & (vol > vol_ema)] = -1

        # Component 7: Divergence proxy (RSI slope vs price slope)
        price_slope = close.rolling(10).apply(
            lambda x: np.polyfit(range(len(x)), x, 1)[0] if len(x) == 10 else 0, raw=True
        )
        rsi_slope = rsi_val.rolling(10).apply(
            lambda x: np.polyfit(range(len(x)), x.dropna(), 1)[0] if len(x.dropna()) >= 2 else 0, raw=False
        )
        div_vote = pd.Series(0, index=df.index)
        # Bullish divergence: price falling but RSI rising
        div_vote[(price_slope < 0) & (rsi_slope > 0)] = 1
        # Bearish divergence: price rising but RSI falling
        div_vote[(price_slope > 0) & (rsi_slope < 0)] = -1

        # Aggregate votes
        total_bull = (
            (rsi_vote == 1).astype(int) + (stoch_vote == 1).astype(int) +
            (macd_vote == 1).astype(int) + (trend_vote == 1).astype(int) +
            (mom_vote == 1).astype(int) + (vol_vote == 1).astype(int) +
            (div_vote == 1).astype(int)
        )
        total_bear = (
            (rsi_vote == -1).astype(int) + (stoch_vote == -1).astype(int) +
            (macd_vote == -1).astype(int) + (trend_vote == -1).astype(int) +
            (mom_vote == -1).astype(int) + (vol_vote == -1).astype(int) +
            (div_vote == -1).astype(int)
        )

        signal = pd.Series(0, index=df.index)
        # TRENDING: 6-7 components agree → strong signal
        # BIAS: 5 components agree → moderate signal (still counted)
        signal[total_bull >= 5] = 1
        signal[total_bear >= 5] = -1
        return signal

    # ═════════════════════════════════════════════════════════════════════
    #  MAIN SIGNAL GENERATOR
    # ═════════════════════════════════════════════════════════════════════
    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate confluence signals from all 7 Elite Seven indicators.

        Entry logic:
        - Compute each indicator's vote: +1 (bull), -1 (bear), 0 (neutral)
        - Count bullish and bearish votes
        - LONG when bullish votes >= min_confluence
        - SHORT when bearish votes >= min_confluence
        - SL/TP: ATR-based
        """
        df = df.copy()
        p = self.params

        # Compute ATR for SL/TP
        df["atr"] = atr(df["High"], df["Low"], df["Close"], p["atr_period"])

        # Compute all 7 indicator votes
        df["v_pentarch"] = self._pentarch(df)
        df["v_omnideck"] = self._omnideck(df)
        df["v_oracle"] = self._volume_oracle(df)
        df["v_plutus"] = self._plutus_flow(df)
        df["v_janus"] = self._janus_atlas(df)
        df["v_augury"] = self._augury_grid(df)
        df["v_harmonic"] = self._harmonic_oscillator(df)

        # Count votes
        vote_cols = [c for c in df.columns if c.startswith("v_")]
        df["bull_votes"] = sum((df[c] == 1).astype(int) for c in vote_cols)
        df["bear_votes"] = sum((df[c] == -1).astype(int) for c in vote_cols)

        # Confluence signals
        min_c = p["min_confluence"]
        df["signal"] = 0
        df.loc[df["bull_votes"] >= min_c, "signal"] = 1
        df.loc[df["bear_votes"] >= min_c, "signal"] = -1

        # Prevent same-bar conflict (bullish wins tie)
        conflict = (df["bull_votes"] >= min_c) & (df["bear_votes"] >= min_c)
        df.loc[conflict, "signal"] = 0

        # Stop loss and take profit (ATR-based)
        df["stop_loss"] = np.nan
        df["take_profit"] = np.nan

        long_mask = df["signal"] == 1
        df.loc[long_mask, "stop_loss"] = df.loc[long_mask, "Close"] - p["atr_sl_mult"] * df.loc[long_mask, "atr"]
        df.loc[long_mask, "take_profit"] = df.loc[long_mask, "Close"] + p["atr_tp_mult"] * df.loc[long_mask, "atr"]

        short_mask = df["signal"] == -1
        df.loc[short_mask, "stop_loss"] = df.loc[short_mask, "Close"] + p["atr_sl_mult"] * df.loc[short_mask, "atr"]
        df.loc[short_mask, "take_profit"] = df.loc[short_mask, "Close"] - p["atr_tp_mult"] * df.loc[short_mask, "atr"]

        return df

    def pine_script(self) -> str:
        """Return Pine Script v5 strategy logic block."""
        return """
// ─── Elite Seven Confluence v1 ─────────────────────────────────────
// Each indicator module votes: +1 bullish, -1 bearish, 0 neutral
// Entry fires when min_confluence indicators agree

// ─── 1. PENTARCH — Regime + Momentum ──────────────────────────────
[adx_val, plus_di, minus_di] = ta.dmi(pentarch_adx_period, pentarch_adx_period)
pent_fast = ta.ema(close, pentarch_fast)
pent_slow = ta.ema(close, pentarch_slow)
pent_nf = pent_fast - pent_slow
pent_nf_rising = pent_nf > pent_nf[1]
pent_trending = adx_val > pentarch_adx_thresh
pent_vote = pent_trending and plus_di > minus_di and pent_nf_rising ? 1 :
            pent_trending and minus_di > plus_di and not pent_nf_rising ? -1 : 0

// ─── 2. OMNIDECK — Multi-System ───────────────────────────────────
e50 = ta.ema(close, omni_ema_50)
e100 = ta.ema(close, omni_ema_100)
e200 = ta.ema(close, omni_ema_200)
ema_vote = e50 > e100 and e100 > e200 ? 1 : e50 < e100 and e100 < e200 ? -1 : 0

[st_val, st_dir] = ta.supertrend(omni_st_mult, omni_st_period)
st_vote = st_dir == -1 ? 1 : -1

bmsb_mid = (ta.sma(close, omni_bmsb_sma) + ta.ema(close, omni_bmsb_ema)) / 2
bmsb_vote = close > bmsb_mid ? 1 : close < bmsb_mid ? -1 : 0

[sq_on, _, _] = ta.squeeze(close)
sq_mom = close - ((ta.highest(high, 20) + ta.lowest(low, 20)) / 2 + ta.sma(close, 20)) / 2
sq_vote = sq_mom > 0 ? 1 : sq_mom < 0 ? -1 : 0

omni_net = ema_vote + st_vote + bmsb_vote + sq_vote
omni_vote = omni_net >= 3 ? 1 : omni_net <= -3 ? -1 : 0

// ─── 3. VOLUME ORACLE — Accumulation/Distribution ─────────────────
vol_flow = (close - close[1]) * volume
flow_fast = ta.ema(vol_flow, oracle_vol_fast)
flow_slow = ta.ema(vol_flow, oracle_vol_slow)
vol_active = volume > ta.sma(volume, oracle_regime_lookback)
oracle_vote = flow_fast > flow_slow and flow_fast > 0 and vol_active ? 1 :
              flow_fast < flow_slow and flow_fast < 0 and vol_active ? -1 : 0

// ─── 4. PLUTUS FLOW — OBV Ribbon ─────────────────────────────────
obv_val = ta.obv
obv_fast = ta.ema(obv_val, plutus_obv_fast)
obv_slow = ta.ema(obv_val, plutus_obv_slow)
plutus_vote = obv_fast > obv_slow and obv_val > obv_fast ? 1 :
              obv_fast < obv_slow and obv_val < obv_fast ? -1 : 0

// ─── 5. JANUS ATLAS — Market Structure (simplified) ───────────────
ph = ta.pivothigh(high, janus_pivot_left, janus_pivot_right)
pl = ta.pivotlow(low, janus_pivot_left, janus_pivot_right)
var float last_ph1 = na, var float last_ph2 = na
var float last_pl1 = na, var float last_pl2 = na
if not na(ph)
    last_ph2 := last_ph1
    last_ph1 := ph
if not na(pl)
    last_pl2 := last_pl1
    last_pl1 := pl
janus_vote = not na(last_ph2) and not na(last_pl2) ?
    (last_ph1 > last_ph2 and last_pl1 > last_pl2 ? 1 :
     last_ph1 < last_ph2 and last_pl1 < last_pl2 ? -1 : 0) : 0

// ─── 6. AUGURY GRID — MACD Quality Signal ────────────────────────
[macd_l, sig_l, _] = ta.macd(close, augury_macd_fast, augury_macd_slow, augury_macd_signal)
augury_trending = adx_val > augury_adx_min
rsi_ag = ta.rsi(close, augury_rsi_period)
vol_ok = volume > ta.sma(volume, 20)
augury_vote = ta.crossover(macd_l, sig_l) and augury_trending and rsi_ag < 75 and vol_ok ? 1 :
              ta.crossunder(macd_l, sig_l) and augury_trending and rsi_ag > 25 and vol_ok ? -1 : 0

// ─── 7. HARMONIC OSCILLATOR — 7 Components ───────────────────────
rsi_h = ta.rsi(close, harmonic_rsi)
[stk, _] = ta.stoch(rsi_h, rsi_h, rsi_h, harmonic_stoch_k)
[macd_h, sig_h, _] = ta.macd(close, 12, 26, 9)
trend_ema_h = ta.ema(close, harmonic_ema_trend)
mom_h = ta.mom(close, harmonic_mom_period)
vol_ema_h = ta.ema(volume, 20)

h_bull = (rsi_h > 50 ? 1 : 0) + (stk > 50 ? 1 : 0) + (macd_h > sig_h ? 1 : 0) +
         (close > trend_ema_h ? 1 : 0) + (mom_h > 0 ? 1 : 0) +
         (close > close[1] and volume > vol_ema_h ? 1 : 0)
h_bear = (rsi_h < 50 ? 1 : 0) + (stk < 50 ? 1 : 0) + (macd_h < sig_h ? 1 : 0) +
         (close < trend_ema_h ? 1 : 0) + (mom_h < 0 ? 1 : 0) +
         (close < close[1] and volume > vol_ema_h ? 1 : 0)
harmonic_vote = h_bull >= 5 ? 1 : h_bear >= 5 ? -1 : 0

// ─── CONFLUENCE ──────────────────────────────────────────────────
bull_count = (pent_vote == 1 ? 1 : 0) + (omni_vote == 1 ? 1 : 0) +
             (oracle_vote == 1 ? 1 : 0) + (plutus_vote == 1 ? 1 : 0) +
             (janus_vote == 1 ? 1 : 0) + (augury_vote == 1 ? 1 : 0) +
             (harmonic_vote == 1 ? 1 : 0)
bear_count = (pent_vote == -1 ? 1 : 0) + (omni_vote == -1 ? 1 : 0) +
             (oracle_vote == -1 ? 1 : 0) + (plutus_vote == -1 ? 1 : 0) +
             (janus_vote == -1 ? 1 : 0) + (augury_vote == -1 ? 1 : 0) +
             (harmonic_vote == -1 ? 1 : 0)

atr_val = ta.atr(atr_period)
long_entry = bull_count >= min_confluence and bear_count < min_confluence
short_entry = bear_count >= min_confluence and bull_count < min_confluence

if long_entry
    strategy.entry("Long", strategy.long)
    strategy.exit("Long Exit", "Long",
                  stop=close - atr_val * atr_sl_mult,
                  limit=close + atr_val * atr_tp_mult)

if short_entry
    strategy.entry("Short", strategy.short)
    strategy.exit("Short Exit", "Short",
                  stop=close + atr_val * atr_sl_mult,
                  limit=close - atr_val * atr_tp_mult)

// ─── Dashboard ───────────────────────────────────────────────────
var label dash = na
label.delete(dash)
dash := label.new(bar_index, high,
    "CONFLUENCE: " + str.tostring(math.max(bull_count, bear_count)) + "/7 " +
    (bull_count > bear_count ? "BULL" : bear_count > bull_count ? "BEAR" : "FLAT"),
    style=label.style_label_down, size=size.small,
    color=bull_count >= min_confluence ? color.green :
          bear_count >= min_confluence ? color.red : color.gray)
"""


# Allow direct instantiation
Strategy = EliteSevenConfluenceV1
