"""
Technical indicator library.

All functions take a pandas Series or DataFrame and return a Series.
Designed to match TradingView/Pine Script indicator behavior.
"""

import numpy as np
import pandas as pd


# ─── Moving Averages ────────────────────────────────────────────────────────

def sma(series: pd.Series, period: int) -> pd.Series:
    """Simple Moving Average."""
    return series.rolling(window=period).mean()


def ema(series: pd.Series, period: int) -> pd.Series:
    """Exponential Moving Average."""
    return series.ewm(span=period, adjust=False).mean()


def wma(series: pd.Series, period: int) -> pd.Series:
    """Weighted Moving Average."""
    weights = np.arange(1, period + 1, dtype=float)
    return series.rolling(window=period).apply(
        lambda x: np.dot(x, weights) / weights.sum(), raw=True
    )


def hull_ma(series: pd.Series, period: int) -> pd.Series:
    """Hull Moving Average — fast, low-lag MA."""
    half = int(period / 2)
    sqrt_period = int(np.sqrt(period))
    wma_half = wma(series, half)
    wma_full = wma(series, period)
    return wma(2 * wma_half - wma_full, sqrt_period)


# ─── Oscillators ────────────────────────────────────────────────────────────

def rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """Relative Strength Index (Wilder's smoothing)."""
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = (-delta).clip(lower=0)

    avg_gain = gain.ewm(alpha=1/period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1/period, min_periods=period, adjust=False).mean()

    rs = avg_gain / avg_loss.replace(0, np.nan)
    return 100 - (100 / (1 + rs))


def stochastic(high: pd.Series, low: pd.Series, close: pd.Series,
               k_period: int = 14, d_period: int = 3) -> tuple[pd.Series, pd.Series]:
    """Stochastic Oscillator. Returns (%K, %D)."""
    lowest_low = low.rolling(window=k_period).min()
    highest_high = high.rolling(window=k_period).max()
    k = 100 * (close - lowest_low) / (highest_high - lowest_low).replace(0, np.nan)
    d = sma(k, d_period)
    return k, d


def cci(high: pd.Series, low: pd.Series, close: pd.Series, period: int = 20) -> pd.Series:
    """Commodity Channel Index."""
    tp = (high + low + close) / 3
    ma = sma(tp, period)
    mad = tp.rolling(window=period).apply(lambda x: np.abs(x - x.mean()).mean(), raw=True)
    return (tp - ma) / (0.015 * mad).replace(0, np.nan)


# ─── MACD ───────────────────────────────────────────────────────────────────

def macd(series: pd.Series, fast: int = 12, slow: int = 26,
         signal: int = 9) -> tuple[pd.Series, pd.Series, pd.Series]:
    """
    MACD indicator.
    Returns (macd_line, signal_line, histogram).
    """
    fast_ema = ema(series, fast)
    slow_ema = ema(series, slow)
    macd_line = fast_ema - slow_ema
    signal_line = ema(macd_line, signal)
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram


# ─── Volatility ─────────────────────────────────────────────────────────────

def atr(high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> pd.Series:
    """Average True Range."""
    prev_close = close.shift(1)
    tr1 = high - low
    tr2 = (high - prev_close).abs()
    tr3 = (low - prev_close).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    return tr.ewm(alpha=1/period, min_periods=period, adjust=False).mean()


def bollinger_bands(series: pd.Series, period: int = 20,
                    std_dev: float = 2.0) -> tuple[pd.Series, pd.Series, pd.Series]:
    """
    Bollinger Bands.
    Returns (upper, middle, lower).
    """
    middle = sma(series, period)
    std = series.rolling(window=period).std()
    upper = middle + std_dev * std
    lower = middle - std_dev * std
    return upper, middle, lower


def keltner_channels(high: pd.Series, low: pd.Series, close: pd.Series,
                     ema_period: int = 20, atr_period: int = 10,
                     atr_mult: float = 1.5) -> tuple[pd.Series, pd.Series, pd.Series]:
    """
    Keltner Channels.
    Returns (upper, middle, lower).
    """
    middle = ema(close, ema_period)
    atr_val = atr(high, low, close, atr_period)
    upper = middle + atr_mult * atr_val
    lower = middle - atr_mult * atr_val
    return upper, middle, lower


def squeeze(high: pd.Series, low: pd.Series, close: pd.Series,
            bb_period: int = 20, bb_std: float = 2.0,
            kc_period: int = 20, kc_atr_period: int = 10,
            kc_mult: float = 1.5) -> tuple[pd.Series, pd.Series]:
    """
    TTM Squeeze detector.
    Returns (squeeze_on: bool Series, momentum: Series).
    Squeeze is ON when Bollinger Bands are inside Keltner Channels.
    """
    bb_upper, _, bb_lower = bollinger_bands(close, bb_period, bb_std)
    kc_upper, _, kc_lower = keltner_channels(high, low, close, kc_period, kc_atr_period, kc_mult)
    squeeze_on = (bb_lower > kc_lower) & (bb_upper < kc_upper)

    # Momentum: linear regression of (close - midline) over kc_period
    midline = (highest(high, kc_period) + lowest(low, kc_period)) / 2
    midline = (midline + sma(close, kc_period)) / 2
    momentum = close - midline
    return squeeze_on, momentum


# ─── Trend ──────────────────────────────────────────────────────────────────

def supertrend(high: pd.Series, low: pd.Series, close: pd.Series,
               period: int = 10, multiplier: float = 3.0) -> tuple[pd.Series, pd.Series]:
    """
    SuperTrend indicator.
    Returns (supertrend_line, direction) where direction is 1 (up) or -1 (down).
    """
    atr_val = atr(high, low, close, period)
    hl2 = (high + low) / 2
    upper_band = hl2 + multiplier * atr_val
    lower_band = hl2 - multiplier * atr_val

    st = pd.Series(np.nan, index=close.index)
    direction = pd.Series(1, index=close.index)

    for i in range(period, len(close)):
        if i == period:
            st.iloc[i] = upper_band.iloc[i]
            direction.iloc[i] = -1
            continue

        prev_st = st.iloc[i - 1]
        prev_dir = direction.iloc[i - 1]

        if prev_dir == 1:  # Was bullish
            current_lower = max(lower_band.iloc[i], prev_st) if not np.isnan(prev_st) else lower_band.iloc[i]
            if close.iloc[i] < current_lower:
                st.iloc[i] = upper_band.iloc[i]
                direction.iloc[i] = -1
            else:
                st.iloc[i] = current_lower
                direction.iloc[i] = 1
        else:  # Was bearish
            current_upper = min(upper_band.iloc[i], prev_st) if not np.isnan(prev_st) else upper_band.iloc[i]
            if close.iloc[i] > current_upper:
                st.iloc[i] = lower_band.iloc[i]
                direction.iloc[i] = 1
            else:
                st.iloc[i] = current_upper
                direction.iloc[i] = -1

    return st, direction


def adx(high: pd.Series, low: pd.Series, close: pd.Series,
        period: int = 14) -> tuple[pd.Series, pd.Series, pd.Series]:
    """
    Average Directional Index.
    Returns (adx, plus_di, minus_di).
    """
    prev_high = high.shift(1)
    prev_low = low.shift(1)

    plus_dm = (high - prev_high).clip(lower=0)
    minus_dm = (prev_low - low).clip(lower=0)

    # Zero out when the other is larger
    plus_dm[plus_dm < minus_dm] = 0
    minus_dm[minus_dm < plus_dm] = 0

    atr_val = atr(high, low, close, period)

    plus_di = 100 * (plus_dm.ewm(alpha=1/period, min_periods=period, adjust=False).mean() /
                     atr_val.replace(0, np.nan))
    minus_di = 100 * (minus_dm.ewm(alpha=1/period, min_periods=period, adjust=False).mean() /
                      atr_val.replace(0, np.nan))

    dx = 100 * ((plus_di - minus_di).abs() / (plus_di + minus_di).replace(0, np.nan))
    adx_val = dx.ewm(alpha=1/period, min_periods=period, adjust=False).mean()

    return adx_val, plus_di, minus_di


# ─── Support / Utility ──────────────────────────────────────────────────────

def highest(series: pd.Series, period: int) -> pd.Series:
    """Highest value over N bars."""
    return series.rolling(window=period).max()


def lowest(series: pd.Series, period: int) -> pd.Series:
    """Lowest value over N bars."""
    return series.rolling(window=period).min()


def crossover(a: pd.Series, b: pd.Series) -> pd.Series:
    """True when `a` crosses above `b`."""
    return (a > b) & (a.shift(1) <= b.shift(1))


def crossunder(a: pd.Series, b: pd.Series) -> pd.Series:
    """True when `a` crosses below `b`."""
    return (a < b) & (a.shift(1) >= b.shift(1))


def change(series: pd.Series, period: int = 1) -> pd.Series:
    """Change from N bars ago."""
    return series.diff(period)


def pivothigh(high: pd.Series, left: int, right: int) -> pd.Series:
    """Pivot high detection (True at the pivot bar, after `right` bars confirm)."""
    result = pd.Series(np.nan, index=high.index)
    for i in range(left, len(high) - right):
        pivot = high.iloc[i]
        left_ok = all(high.iloc[i - j] <= pivot for j in range(1, left + 1))
        right_ok = all(high.iloc[i + j] < pivot for j in range(1, right + 1))
        if left_ok and right_ok:
            result.iloc[i + right] = pivot  # Signal appears `right` bars later
    return result


def pivotlow(low: pd.Series, left: int, right: int) -> pd.Series:
    """Pivot low detection (True at the pivot bar, after `right` bars confirm)."""
    result = pd.Series(np.nan, index=low.index)
    for i in range(left, len(low) - right):
        pivot = low.iloc[i]
        left_ok = all(low.iloc[i - j] >= pivot for j in range(1, left + 1))
        right_ok = all(low.iloc[i + j] > pivot for j in range(1, right + 1))
        if left_ok and right_ok:
            result.iloc[i + right] = pivot
    return result


# ─── Volume ────────────────────────────────────────────────────────────

def obv(close: pd.Series, volume: pd.Series) -> pd.Series:
    """On Balance Volume."""
    direction = close.diff().apply(lambda x: 1 if x > 0 else (-1 if x < 0 else 0))
    return (volume * direction).cumsum()


# ─── Stochastic RSI ───────────────────────────────────────────────────

def stoch_rsi(series: pd.Series, rsi_period: int = 14, stoch_period: int = 14,
              k_smooth: int = 3, d_smooth: int = 3) -> tuple[pd.Series, pd.Series]:
    """Stochastic RSI. Returns (%K, %D)."""
    rsi_val = rsi(series, rsi_period)
    lowest_rsi = rsi_val.rolling(window=stoch_period).min()
    highest_rsi = rsi_val.rolling(window=stoch_period).max()
    denom = (highest_rsi - lowest_rsi).replace(0, np.nan)
    stoch_raw = 100 * (rsi_val - lowest_rsi) / denom
    k = sma(stoch_raw, k_smooth)
    d = sma(k, d_smooth)
    return k, d


def momentum(series: pd.Series, period: int = 10) -> pd.Series:
    """Momentum (rate of change as percentage)."""
    shifted = series.shift(period).replace(0, np.nan)
    return (series / shifted) * 100 - 100
