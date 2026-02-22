"""
Historical OHLCV data fetcher.

Uses Yahoo Finance download endpoint directly (no yfinance dependency).
Supports multiple instruments and timeframes with local parquet caching.
"""

import io
import pandas as pd
import requests
from datetime import datetime, timedelta
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

# Yahoo Finance ticker mapping
SYMBOL_MAP = {
    "XAUUSD": "GC=F",       # Gold futures
    "NAS100": "NQ=F",       # Nasdaq 100 futures
    "USTEC":  "NQ=F",       # Alias
    "USDJPY": "USDJPY=X",   # USD/JPY forex
    "BTCUSD": "BTC-USD",    # Bitcoin
}

# Yahoo Finance interval values
INTERVAL_MAP = {
    "M30": "30m",
    "H1":  "1h",
    "H2":  "1h",   # Resample from 1h
    "H4":  "1h",   # Resample from 1h
    "D1":  "1d",
}

# Maximum lookback (Yahoo limits intraday to ~60d for 30m, ~730d for 1h)
MAX_LOOKBACK = {
    "M30": 59,
    "H1":  729,
    "H2":  729,
    "H4":  729,
    "D1":  3650,
}

YF_BASE = "https://query1.finance.yahoo.com/v8/finance/chart"
HEADERS = {"User-Agent": "Mozilla/5.0"}


def _cache_path(symbol: str, timeframe: str) -> Path:
    return DATA_DIR / f"{symbol}_{timeframe}.parquet"


def _resample_ohlcv(df: pd.DataFrame, target_tf: str) -> pd.DataFrame:
    """Resample 1h data to H2 or H4."""
    rule = {"H2": "2h", "H4": "4h"}.get(target_tf)
    if rule is None:
        return df
    return df.resample(rule).agg({
        "Open": "first",
        "High": "max",
        "Low": "min",
        "Close": "last",
        "Volume": "sum",
    }).dropna()


def _download_yahoo(ticker: str, interval: str, period1: int, period2: int) -> pd.DataFrame:
    """Download OHLCV from Yahoo Finance v8 chart API."""
    url = f"{YF_BASE}/{ticker}"
    params = {
        "period1": period1,
        "period2": period2,
        "interval": interval,
        "includePrePost": "false",
        "events": "div,splits",
    }

    resp = requests.get(url, params=params, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    chart = data.get("chart", {})
    result = chart.get("result")
    if not result:
        error = chart.get("error", {})
        raise RuntimeError(f"Yahoo API error: {error.get('description', 'unknown')}")

    result = result[0]
    timestamps = result.get("timestamp", [])
    quote = result.get("indicators", {}).get("quote", [{}])[0]

    if not timestamps:
        raise RuntimeError(f"No data returned for {ticker}")

    df = pd.DataFrame({
        "Open": quote.get("open"),
        "High": quote.get("high"),
        "Low": quote.get("low"),
        "Close": quote.get("close"),
        "Volume": quote.get("volume"),
    }, index=pd.to_datetime(timestamps, unit="s", utc=True))

    df.index.name = "Date"
    return df.dropna(subset=["Open", "High", "Low", "Close"])


def fetch(symbol: str, timeframe: str, days: int = None, use_cache: bool = True) -> pd.DataFrame:
    """
    Fetch OHLCV data for a symbol and timeframe.

    Args:
        symbol: One of XAUUSD, NAS100, USTEC, USDJPY, BTCUSD
        timeframe: One of M30, H1, H2, H4, D1
        days: Number of days of history (default: max available)
        use_cache: Whether to use/update parquet cache

    Returns:
        DataFrame with columns: Open, High, Low, Close, Volume
        Index: DatetimeIndex (UTC)
    """
    ticker = SYMBOL_MAP.get(symbol.upper())
    if ticker is None:
        raise ValueError(f"Unknown symbol: {symbol}. Available: {list(SYMBOL_MAP.keys())}")
    if timeframe not in INTERVAL_MAP:
        raise ValueError(f"Unknown timeframe: {timeframe}. Available: {list(INTERVAL_MAP.keys())}")

    max_days = MAX_LOOKBACK[timeframe]
    days = min(days or max_days, max_days)

    cache_file = _cache_path(symbol, timeframe)

    # Return cache if fresh (< 1 hour)
    if use_cache and cache_file.exists():
        age = datetime.now().timestamp() - cache_file.stat().st_mtime
        if age < 3600:
            df = pd.read_parquet(cache_file)
            if len(df) > 0:
                return df

    # Download
    now = datetime.utcnow()
    start = now - timedelta(days=days)
    period1 = int(start.timestamp())
    period2 = int(now.timestamp())
    interval = INTERVAL_MAP[timeframe]

    df = _download_yahoo(ticker, interval, period1, period2)

    # Resample H2/H4
    if timeframe in ("H2", "H4"):
        df = _resample_ohlcv(df, timeframe)

    # Cache
    if use_cache:
        df.to_parquet(cache_file)

    return df


def fetch_multi(symbols: list[str], timeframes: list[str], days: int = None) -> dict:
    """
    Fetch data for multiple symbols and timeframes.

    Returns:
        Dict of {(symbol, timeframe): DataFrame}
    """
    results = {}
    for symbol in symbols:
        for tf in timeframes:
            try:
                df = fetch(symbol, tf, days=days)
                results[(symbol, tf)] = df
                print(f"  ✓ {symbol} {tf}: {len(df)} bars ({df.index[0].date()} → {df.index[-1].date()})")
            except Exception as e:
                print(f"  ✗ {symbol} {tf}: {e}")
    return results


if __name__ == "__main__":
    print("Fetching sample data...\n")
    symbols = ["XAUUSD", "NAS100", "USDJPY", "BTCUSD"]
    timeframes = ["H1", "H4"]
    data = fetch_multi(symbols, timeframes)
    print(f"\nFetched {len(data)} datasets.")
