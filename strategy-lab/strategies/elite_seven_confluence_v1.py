"""
Elite Seven Confluence v1 — Faithful Pine Script translations.

Rebuilt from actual indicator source code (all 7 received).
Each indicator module produces a directional vote (+1 bull, -1 bear, 0 neutral).
Entries fire when min_confluence indicators agree on direction.

The Seven (from Pine Script v6 source):
    1. Pentarch       — 3-factor regime vote + double-smoothed Pilot Line
    2. OmniDeck       — 9-subsystem weighted confluence panel
    3. Volume Oracle   — 7-factor regime scoring + ACCUM/DIST state machine
    4. Plutus Flow     — Spike-clipped OBV, SMA(20) basis, Z-score + FlipGuard
    5. Janus Atlas     — HH/HL/LH/LL market structure via pivots
    6. Augury Grid     — MACD histogram crossover + 9 hard filters + 12-factor score
    7. Harmonic Osc.   — 7-component voting + composite oscillator crossover
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import (
    ema, sma, rsi, atr, macd, adx, supertrend, squeeze,
    bollinger_bands, keltner_channels, stochastic,
    obv, stoch_rsi, momentum, rma, roc, robust_normalize,
    crossover, crossunder, pivothigh, pivotlow, highest, lowest,
)


class EliteSevenConfluenceV1:
    name = "elite_seven_confluence"
    version = "1.0"
    description = "7-indicator confluence — faithful Pine Script translations"

    params = {
        # ── Confluence & Risk ────────────────
        "min_confluence": 4,
        "atr_period": 14,
        "atr_sl_mult": 1.5,
        "atr_tp_mult": 3.0,
    }

    # ─────────────────────────────────────────────────────────────────────
    #  1. PENTARCH — Cycle Phase Detection (from Pine Script v6)
    #
    #  Core logic:
    #  - Pilot Line = EMA(EMA(close, 34), 3) — double-smoothed
    #  - 3-factor regime vote: EMA34>EMA55, Close>PilotLine, SlopeUp
    #  - Regime = needs 2/3 votes
    #  - Stochastic(14) for momentum direction
    #  - Vote: regime_bull AND stoch rising → +1
    # ─────────────────────────────────────────────────────────────────────
    def _pentarch(self, df: pd.DataFrame) -> pd.Series:
        close = df["Close"]
        high = df["High"]
        low = df["Low"]

        ema34 = ema(close, 34)
        ema55 = ema(close, 55)
        pilot_line = ema(ema(close, 34), 3)  # Double-smoothed

        # Pilot Line slope
        pl_slope = pilot_line - pilot_line.shift(1)
        pl_slope_ma = ema(pl_slope, 5)
        atr_val = atr(high, low, close, 20)
        slope_dead = atr_val * 0.02
        slope_up = pl_slope_ma > slope_dead
        slope_dn = pl_slope_ma < -slope_dead

        # 3-factor vote
        vote1_bull = ema34 > ema55
        vote2_bull = close > pilot_line
        vote3_bull = slope_up
        vote1_bear = ema34 < ema55
        vote2_bear = close < pilot_line
        vote3_bear = slope_dn

        bull_votes = vote1_bull.astype(int) + vote2_bull.astype(int) + vote3_bull.astype(int)
        bear_votes = vote1_bear.astype(int) + vote2_bear.astype(int) + vote3_bear.astype(int)

        regime_bull = bull_votes >= 2
        regime_bear = bear_votes >= 2

        # Stochastic(14) for momentum
        stoch_k, stoch_d = stochastic(high, low, close, 14, 3)
        stoch_k_smooth = sma(stoch_k, 3)
        stoch_rising = stoch_k_smooth > stoch_k_smooth.shift(1)

        signal = pd.Series(0, index=df.index)
        signal[regime_bull & stoch_rising] = 1
        signal[regime_bear & ~stoch_rising] = -1
        return signal

    # ─────────────────────────────────────────────────────────────────────
    #  2. OMNIDECK — 9-Subsystem Weighted Confluence (from Pine Script v6)
    #
    #  Weights: EC=1.5, Squeeze=1.5, SuperTrend=1.0, BMSB=0.5,
    #           EMA_Stack=1.0, S/D=1.5, Sweep=2.0, Regime=0.5, RCS=1.0
    #
    #  For backtesting we implement the 5 most robust subsystems:
    #  SuperTrend(2/3/4 ATR consensus), EMA Stack(50/100/200),
    #  BMSB(SMA20+EMA21), Regime(4-vote), Exhaustion Counter
    # ─────────────────────────────────────────────────────────────────────
    def _omnideck(self, df: pd.DataFrame) -> pd.Series:
        close = df["Close"]
        high = df["High"]
        low = df["Low"]

        conf_bull = 0.0
        conf_bear = 0.0

        # --- SuperTrend Consensus (WT=1.0): 2/3/4 ATR, 2-of-3 vote ---
        _, dir2 = supertrend(high, low, close, 10, 2.0)
        _, dir3 = supertrend(high, low, close, 10, 3.0)
        _, dir4 = supertrend(high, low, close, 10, 4.0)
        up_count = (dir2 == 1).astype(int) + (dir3 == 1).astype(int) + (dir4 == 1).astype(int)
        st_bull = up_count >= 2
        st_bear = up_count < 2
        st_bull_w = st_bull.astype(float) * 1.0
        st_bear_w = st_bear.astype(float) * 1.0

        # --- EMA Stack (WT=1.0): 50/100/200 alignment ---
        e50 = ema(close, 50)
        e100 = ema(close, 100)
        e200 = ema(close, 200)
        ema_bull = ((e50 > e100) & (e100 > e200)).astype(float) * 1.0
        ema_bear = ((e50 < e100) & (e100 < e200)).astype(float) * 1.0

        # --- BMSB (WT=0.5): SMA(20) + EMA(21) band ---
        bmsb_sma = sma(close, 20)
        bmsb_ema = ema(close, 21)
        bmsb_upper = pd.concat([bmsb_sma, bmsb_ema], axis=1).max(axis=1)
        bmsb_lower = pd.concat([bmsb_sma, bmsb_ema], axis=1).min(axis=1)
        bmsb_bull = (close > bmsb_upper).astype(float) * 0.5
        bmsb_bear = (close < bmsb_lower).astype(float) * 0.5

        # --- Regime (WT=0.5): 4-vote system matching OmniDeck's regime ---
        ema_f = ema(close, 34)
        ema_s = ema(close, 55)
        pl = ema(close, 100)
        atr_val = atr(high, low, close, 20)
        hyst = atr_val * 0.05

        pl_slope_raw = pl - pl.shift(1)
        pl_slope_ma = ema(pl_slope_raw, 5)
        slope_dead = atr_val * 0.02
        slope_up = (pl_slope_ma > slope_dead) & (pl_slope_ma > pl_slope_ma.shift(1))
        slope_dn = (pl_slope_ma < -slope_dead) & (pl_slope_ma < pl_slope_ma.shift(1))

        adx_val, plus_di, minus_di = adx(high, low, close, 14)
        di_diff = plus_di - minus_di
        di_gate = 5.0

        rv1b = ema_f > ema_s
        rv2b = close > (pl + hyst)
        rv3b = slope_up
        rv4b = di_diff > di_gate
        rv1e = ema_f < ema_s
        rv2e = close < (pl - hyst)
        rv3e = slope_dn
        rv4e = (-di_diff) > di_gate

        rbull = (rv1b.astype(int) + rv2b.astype(int) + rv3b.astype(int) + rv4b.astype(int)) >= 3
        rbear = (rv1e.astype(int) + rv2e.astype(int) + rv3e.astype(int) + rv4e.astype(int)) >= 3

        regime_bull_w = rbull.astype(float) * 0.5
        regime_bear_w = rbear.astype(float) * 0.5

        # --- Exhaustion Counter (WT=1.5): close < close[4] count ---
        buy_setup = pd.Series(0, index=df.index)
        sell_setup = pd.Series(0, index=df.index)
        close_4 = close.shift(4)
        for i in range(4, len(df)):
            if close.iloc[i] < close_4.iloc[i]:
                buy_setup.iloc[i] = buy_setup.iloc[i-1] + 1
                sell_setup.iloc[i] = 0
            elif close.iloc[i] > close_4.iloc[i]:
                sell_setup.iloc[i] = sell_setup.iloc[i-1] + 1
                buy_setup.iloc[i] = 0

        # 9-count = potential reversal
        td9_bull = (buy_setup >= 9).astype(float) * 1.5    # oversold → bullish
        td9_bear = (sell_setup >= 9).astype(float) * 1.5   # overbought → bearish
        td8_bull = ((buy_setup == 8) & (buy_setup < 9)).astype(float) * 1.0
        td8_bear = ((sell_setup == 8) & (sell_setup < 9)).astype(float) * 1.0

        # --- Squeeze Break (WT=1.5) ---
        sq_on, sq_mom = squeeze(high, low, close)
        sq_releasing = sq_on.shift(1).fillna(False) & ~sq_on
        sqz_bull = (sq_releasing & (sq_mom > 0)).astype(float) * 1.5
        sqz_bear = (sq_releasing & (sq_mom < 0)).astype(float) * 1.5

        # Sum all weights
        total_bull = st_bull_w + ema_bull + bmsb_bull + regime_bull_w + td9_bull + td8_bull + sqz_bull
        total_bear = st_bear_w + ema_bear + bmsb_bear + regime_bear_w + td9_bear + td8_bear + sqz_bear

        net = total_bull - total_bear
        signal = pd.Series(0, index=df.index)
        signal[net >= 2.5] = 1
        signal[net <= -2.5] = -1
        return signal

    # ─────────────────────────────────────────────────────────────────────
    #  3. VOLUME ORACLE — Regime Detection (from Pine Script v6)
    #
    #  7-factor regime scoring:
    #  - Price velocity (×30), Acceleration (×15), EMA trend (±25/12),
    #    EMA spread (×8), Flow imbalance (×200), Flow shift (×100),
    #    Volume confirmation (±10)
    #  - Regime: ACCUMULATION when EMA-smoothed score > flip_threshold
    #  - Signal: vol_spike AND trend AND flow_ratio AND regime AND delta
    # ─────────────────────────────────────────────────────────────────────
    def _volume_oracle(self, df: pd.DataFrame) -> pd.Series:
        close = df["Close"]
        high = df["High"]
        low = df["Low"]
        vol = df["Volume"].replace(0, np.nan).ffill().fillna(1)
        op = df["Open"]

        # Adaptive params for H4 (swing trading)
        velocity_len = 5
        regime_len = 50
        flow_len = 15

        # Price velocity
        close_shifted = close.shift(velocity_len).replace(0, np.nan)
        price_velocity = (close - close_shifted) / close_shifted * 100

        # Price acceleration
        accel_len = 3
        price_accel = price_velocity - price_velocity.shift(accel_len)

        # EMA trend alignment
        ema_fast = ema(close, 8)
        ema_mid = ema(close, 21)
        ema_slow = ema(close, 55)

        trend_bull = (ema_fast > ema_mid) & (ema_mid > ema_slow) & (close > ema_fast)
        trend_bear = (ema_fast < ema_mid) & (ema_mid < ema_slow) & (close < ema_fast)
        trend_bull_soft = (ema_fast > ema_slow) & (close > ema_mid)
        trend_bear_soft = (ema_fast < ema_slow) & (close < ema_mid)

        ema_spread = (ema_fast - ema_slow) / ema_slow.replace(0, np.nan) * 100

        # Volume-weighted flow
        bar_range = (high - low).replace(0, 0.0001)
        bar_position = (close - low) / bar_range
        is_bull_bar = close >= op

        bull_flow = pd.Series(0.0, index=df.index)
        bear_flow = pd.Series(0.0, index=df.index)
        for shift_i in range(flow_len):
            v = vol.shift(shift_i).fillna(0)
            bp = bar_position.shift(shift_i).fillna(0.5)
            ib = is_bull_bar.shift(shift_i).fillna(False).astype(bool)
            bull_flow += v * bp * ib.astype(float)
            bear_flow += v * (1 - bp) * (~ib).astype(float)

        flow_total = (bull_flow + bear_flow).replace(0, np.nan)
        bull_frac = bull_flow / flow_total
        bull_frac = bull_frac.fillna(0.5)
        flow_shift = bull_frac - bull_frac.shift(1)

        # Elevated volume
        avg_vol = sma(vol, regime_len)
        elevated_vol = vol > (avg_vol * 1.2)

        # Regime score (matching Pine Script weights)
        score = pd.Series(0.0, index=df.index)
        score += price_velocity.fillna(0) * 30.0
        score += price_accel.fillna(0) * 15.0

        score[trend_bull] += 25.0
        score[trend_bull_soft & ~trend_bull] += 12.0
        score[trend_bear] -= 25.0
        score[trend_bear_soft & ~trend_bear] -= 12.0

        score += ema_spread.fillna(0) * 8.0
        score += (bull_frac - 0.5) * 200.0
        score += flow_shift.fillna(0) * 100.0
        score[elevated_vol & (score > 0)] += 10.0
        score[elevated_vol & (score < 0)] -= 10.0

        regime_ema = ema(score, 3)

        # Regime state (simplified — no multi-bar confirmation for vectorized)
        flip_threshold = 25.0
        accumulation = regime_ema > flip_threshold
        distribution = regime_ema < -flip_threshold

        # Volume spike detection (log z-score)
        log_vol = np.log(vol.clip(lower=1))
        vol_mu = sma(log_vol, 100)
        vol_sd = log_vol.rolling(100).std().replace(0, 1e-10)
        vol_z = (log_vol - vol_mu) / vol_sd
        vol_spike = vol_z >= 2.0

        # Bull/bear flow ratio
        flow_ratio = 0.62
        bull_flow_ok = bull_frac >= flow_ratio
        bear_flow_ok = (1 - bull_frac) >= flow_ratio

        # Bar delta
        bar_delta_bull = close >= op
        bar_delta_bear = close < op

        # Exhaustion detection
        climax_threshold = 3.5
        bull_exhaustion = (vol_z > climax_threshold) & (close < op) & (close < (high + low) / 2)
        bear_exhaustion = (vol_z > climax_threshold) & (close > op) & (close > (high + low) / 2)

        signal = pd.Series(0, index=df.index)
        # Trend following mode signals
        bull_sig = vol_spike & trend_bull & bull_flow_ok & accumulation & bar_delta_bull & ~bull_exhaustion
        bear_sig = vol_spike & trend_bear & bear_flow_ok & distribution & bar_delta_bear & ~bear_exhaustion

        signal[bull_sig] = 1
        signal[bear_sig] = -1

        # Fallback: use regime alone as softer signal when no vol spike
        signal[(signal == 0) & accumulation & trend_bull_soft & bull_flow_ok] = 1
        signal[(signal == 0) & distribution & trend_bear_soft & bear_flow_ok] = -1

        return signal

    # ─────────────────────────────────────────────────────────────────────
    #  4. PLUTUS FLOW — Statistical OBV Analysis (from Pine Script v6)
    #
    #  Core: Spike-clipped OBV + SMA(20) basis + ±2σ bands + Z-score
    #  Signal: OBV crosses above basis (with FlipGuard gate)
    #  Bias: Z-score > 0 = bullish, Z-score < 0 = bearish
    # ─────────────────────────────────────────────────────────────────────
    def _plutus_flow(self, df: pd.DataFrame) -> pd.Series:
        close = df["Close"]
        vol = df["Volume"].replace(0, np.nan).ffill().fillna(1)

        # Spike-clipped OBV (cap volume at 3x RMA(50))
        clip_len = 50
        clip_mult = 3.0
        vol_avg = rma(vol, clip_len)
        vol_eff = vol.clip(upper=clip_mult * vol_avg)

        direction = close.diff().apply(lambda x: 1.0 if x > 0 else (-1.0 if x < 0 else 0.0))
        obv_clipped = (direction * vol_eff.fillna(0)).cumsum()

        # Basis and bands
        basis_len = 20
        band_k = 2.0
        basis = sma(obv_clipped, basis_len)
        resid = obv_clipped - basis
        sigma = resid.rolling(basis_len).std().replace(0, 1e-10)

        # Z-score
        z_score = (obv_clipped - basis) / sigma

        # Cross signals
        cross_up = crossover(obv_clipped, basis)
        cross_dn = crossunder(obv_clipped, basis)

        # FlipGuard: min 3 bars between opposite crosses
        flip_bars = 3
        signal = pd.Series(0, index=df.index)
        last_cross_up_bar = -999
        last_cross_dn_bar = -999

        for i in range(len(df)):
            if cross_up.iloc[i] if not pd.isna(cross_up.iloc[i]) else False:
                if i - last_cross_dn_bar >= flip_bars:
                    signal.iloc[i] = 1
                    last_cross_up_bar = i
            elif cross_dn.iloc[i] if not pd.isna(cross_dn.iloc[i]) else False:
                if i - last_cross_up_bar >= flip_bars:
                    signal.iloc[i] = -1
                    last_cross_dn_bar = i

        # Fill between signals with bias from Z-score
        signal_filled = pd.Series(0, index=df.index)
        obv_above = obv_clipped > basis
        z_positive = z_score > 0
        signal_filled[obv_above & z_positive] = 1
        signal_filled[~obv_above & ~z_positive] = -1

        # Use cross signals where they fire, otherwise use bias
        result = signal_filled.copy()
        result[signal == 1] = 1
        result[signal == -1] = -1

        return result

    # ─────────────────────────────────────────────────────────────────────
    #  5. JANUS ATLAS — Market Structure (from Pine Script v6)
    #
    #  Core: Pivot detection → HH/HL/LH/LL → msTrend state machine
    #  Uses ATR-filtered pivot significance
    # ─────────────────────────────────────────────────────────────────────
    def _janus_atlas(self, df: pd.DataFrame) -> pd.Series:
        left = 5
        right = 5

        ph = pivothigh(df["High"], left, right)
        pl = pivotlow(df["Low"], left, right)

        signal = pd.Series(0, index=df.index)
        last_ph1 = np.nan
        last_ph2 = np.nan
        last_pl1 = np.nan
        last_pl2 = np.nan

        for i in range(len(df)):
            if not np.isnan(ph.iloc[i]):
                last_ph2 = last_ph1
                last_ph1 = ph.iloc[i]
            if not np.isnan(pl.iloc[i]):
                last_pl2 = last_pl1
                last_pl1 = pl.iloc[i]

            if np.isnan(last_ph2) or np.isnan(last_pl2):
                continue

            hh = last_ph1 > last_ph2
            hl = last_pl1 > last_pl2
            lh = last_ph1 < last_ph2
            ll = last_pl1 < last_pl2

            if hh and hl:
                signal.iloc[i] = 1
            elif lh and ll:
                signal.iloc[i] = -1

        return signal

    # ─────────────────────────────────────────────────────────────────────
    #  6. AUGURY GRID — Signal Quality Scanner (from Pine Script v6)
    #
    #  Core f_scan() function:
    #  - Trigger: MACD(12,26,9) histogram crossover
    #  - 9 Hard Filters: trend, EMA200, ADX≥20, volume spike (1.3x),
    #    RSI not extreme, not extended, momentum aligned, histogram OK,
    #    structure check
    #  - 12-factor scoring (0-100), need ≥70
    # ─────────────────────────────────────────────────────────────────────
    def _augury_grid(self, df: pd.DataFrame) -> pd.Series:
        close = df["Close"]
        high = df["High"]
        low = df["Low"]
        vol = df["Volume"].replace(0, np.nan).ffill().fillna(1)
        op = df["Open"]

        # EMAs
        ema21 = ema(close, 21)
        ema55 = ema(close, 55)
        ema200 = ema(close, 200)

        # MACD(12,26,9) histogram
        macd_line, sig_line, hist = macd(close, 12, 26, 9)
        hist_prev = hist.shift(1)

        # Histogram crossover (trigger)
        hist_cross_up = (hist > 0) & (hist_prev <= 0)
        hist_cross_dn = (hist < 0) & (hist_prev >= 0)

        # RSI
        rsi_val = rsi(close, 14)

        # ADX
        adx_val, plus_di, minus_di = adx(high, low, close, 14)

        # Volume spike: volume >= 1.3x SMA(20)
        vol_sma = sma(vol, 20)
        vol_spike = vol >= (vol_sma * 1.3)

        # ATR for extension check
        atr_val = atr(high, low, close, 14)

        # Trend alignment
        trend_bull = (ema21 > ema55) & (close > ema21)
        trend_bear = (ema21 < ema55) & (close < ema21)

        # EMA200 alignment
        ema200_bull = close > ema200
        ema200_bear = close < ema200

        # Extension blocker: |close - ema21| / ATR > 2.5
        extension = ((close - ema21).abs() / atr_val.replace(0, np.nan)) > 2.5

        # RSI not extreme
        rsi_ok_bull = rsi_val < 75
        rsi_ok_bear = rsi_val > 25

        # Momentum aligned
        roc5 = roc(close, 5)
        mom_bull = roc5 > 0
        mom_bear = roc5 < 0

        # Histogram quality: rising for bull, falling for bear
        hist_rising = hist > hist_prev
        hist_falling = hist < hist_prev

        # Scoring (simplified 12-factor to key components)
        score_bull = pd.Series(0.0, index=df.index)
        score_bull += trend_bull.astype(float) * 15      # trend
        score_bull += ema200_bull.astype(float) * 10      # ema200
        score_bull += (adx_val > 20).astype(float) * 10   # adx
        score_bull += vol_spike.astype(float) * 10         # volume
        score_bull += rsi_ok_bull.astype(float) * 10       # rsi
        score_bull += mom_bull.astype(float) * 10          # momentum
        score_bull += hist_rising.astype(float) * 10       # histogram
        score_bull += (~extension).astype(float) * 10      # not extended
        score_bull += ((plus_di > minus_di) & (adx_val > 15)).astype(float) * 15  # structure

        score_bear = pd.Series(0.0, index=df.index)
        score_bear += trend_bear.astype(float) * 15
        score_bear += ema200_bear.astype(float) * 10
        score_bear += (adx_val > 20).astype(float) * 10
        score_bear += vol_spike.astype(float) * 10
        score_bear += rsi_ok_bear.astype(float) * 10
        score_bear += mom_bear.astype(float) * 10
        score_bear += hist_falling.astype(float) * 10
        score_bear += (~extension).astype(float) * 10
        score_bear += ((minus_di > plus_di) & (adx_val > 15)).astype(float) * 15

        # Hard filter gates (ALL must pass)
        bull_gate = (
            hist_cross_up &
            trend_bull &
            ema200_bull &
            (adx_val >= 20) &
            vol_spike &
            rsi_ok_bull &
            ~extension &
            mom_bull &
            hist_rising &
            (score_bull >= 70)
        )

        bear_gate = (
            hist_cross_dn &
            trend_bear &
            ema200_bear &
            (adx_val >= 20) &
            vol_spike &
            rsi_ok_bear &
            ~extension &
            mom_bear &
            hist_falling &
            (score_bear >= 70)
        )

        signal = pd.Series(0, index=df.index)
        signal[bull_gate] = 1
        signal[bear_gate] = -1
        return signal

    # ─────────────────────────────────────────────────────────────────────
    #  7. HARMONIC OSCILLATOR — 7-Component Voting (from Pine Script v6)
    #
    #  Components: MACD, RSI, StochRSI, Trend(EMA20), Momentum(ROC5),
    #              Volume, DivergenceZone
    #  Composite: robustly-normalized average, EMA(7) smoothed
    #  Signal: votes >= 5 OR composite crossover in extreme zone
    # ─────────────────────────────────────────────────────────────────────
    def _harmonic_oscillator(self, df: pd.DataFrame) -> pd.Series:
        close = df["Close"]
        high = df["High"]
        low = df["Low"]
        vol = df["Volume"].replace(0, np.nan).ffill().fillna(1)
        op = df["Open"]

        # --- MACD Component ---
        macd_line, sig_line, hist = macd(close, 12, 26, 9)
        d_hist = hist - hist.shift(1)
        macd_bull = ((hist > 0) & (d_hist > 0)) | ((hist < 0) & (d_hist > 0) & (d_hist > d_hist.shift(1)))
        macd_bear = ((hist < 0) & (d_hist < 0)) | ((hist > 0) & (d_hist < 0) & (d_hist < d_hist.shift(1)))

        # --- RSI Component ---
        rsi_raw = rsi(close, 14)
        rsi_b = rma(rsi_raw, 5)
        sl_up = rsi_b > rsi_b.shift(1)
        sl_dn = rsi_b < rsi_b.shift(1)
        rsi_bull = ((rsi_b > 50) & sl_up) | ((rsi_b < 30) & sl_up) | (rsi_b > rsi_b.shift(2) + 3)
        rsi_bear = ((rsi_b < 50) & sl_dn) | ((rsi_b > 70) & sl_dn) | (rsi_b < rsi_b.shift(2) - 3)

        # --- Stochastic RSI Component ---
        ll_r = rsi_raw.rolling(14).min()
        hh_r = rsi_raw.rolling(14).max()
        denom = (hh_r - ll_r).replace(0, np.nan)
        k_raw = 100.0 * (rsi_raw - ll_r) / denom
        k_sm = ema(k_raw.fillna(50), 3)
        d_sm = ema(k_sm, 3)
        k_slope = ema(k_sm - k_sm.shift(1), 3)
        srsi_bull = ((k_sm > d_sm) & (k_slope > 0)) | ((k_sm < 30) & (k_slope > 0))
        srsi_bear = ((k_sm < d_sm) & (k_slope < 0)) | ((k_sm > 70) & (k_slope < 0))

        # --- Trend Component (EMA 20) ---
        ema20 = ema(close, 20)
        ema20_slope = ema20 - ema20.shift(1)
        trend_bull = (close > ema20) & (ema20_slope > 0)
        trend_bear = (close < ema20) & (ema20_slope < 0)

        # --- Momentum Component (ROC 5) ---
        roc_val = roc(close, 5)
        roc_smooth = ema(roc_val.fillna(0), 3)
        mom_bull = (roc_smooth > 0) & (roc_smooth > roc_smooth.shift(1))
        mom_bear = (roc_smooth < 0) & (roc_smooth < roc_smooth.shift(1))

        # --- Volume Component ---
        vol_avg = sma(vol, 20)
        vol_ratio = vol / vol_avg.replace(0, np.nan)
        vol_bull = (close > op) & (vol_ratio >= 1.2)
        vol_bear = (close < op) & (vol_ratio >= 1.2)

        # --- Divergence Zone Component ---
        div_r = 3
        div_bull_zone = (k_sm < 15) & (close > close.shift(div_r))
        div_bear_zone = (k_sm > 85) & (close < close.shift(div_r))

        # Vote counting
        votes_long = (
            macd_bull.astype(int) + rsi_bull.astype(int) + srsi_bull.astype(int) +
            trend_bull.astype(int) + mom_bull.astype(int) + vol_bull.astype(int) +
            div_bull_zone.astype(int)
        )
        votes_short = (
            macd_bear.astype(int) + rsi_bear.astype(int) + srsi_bear.astype(int) +
            trend_bear.astype(int) + mom_bear.astype(int) + vol_bear.astype(int) +
            div_bear_zone.astype(int)
        )

        # Composite oscillator
        macd_n = robust_normalize(hist, 200, 3.0)
        rsi_n = robust_normalize(rsi_b, 200, 3.0)
        srsi_n = robust_normalize(k_sm, 200, 3.0)
        comp_raw = (rsi_n + srsi_n + macd_n) / 3.0
        comp = ema(comp_raw.fillna(50), 7)
        comp_s = ema(comp, 3)

        # Signal: 5+ votes = strong, OR composite crossover
        signal = pd.Series(0, index=df.index)
        signal[votes_long >= 5] = 1
        signal[votes_short >= 5] = -1

        # Also catch composite crossovers in extreme zones
        bull_cross = crossover(comp, comp_s)
        bear_cross = crossunder(comp, comp_s)
        signal[(signal == 0) & bull_cross & (comp < 30)] = 1
        signal[(signal == 0) & bear_cross & (comp > 70)] = -1

        return signal

    # ═════════════════════════════════════════════════════════════════════
    #  MAIN SIGNAL GENERATOR
    # ═════════════════════════════════════════════════════════════════════
    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        p = self.params

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

        # Prevent same-bar conflict
        conflict = (df["bull_votes"] >= min_c) & (df["bear_votes"] >= min_c)
        df.loc[conflict, "signal"] = 0

        # SL/TP
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
        return "// See individual indicator Pine Script source files for full logic"


Strategy = EliteSevenConfluenceV1
