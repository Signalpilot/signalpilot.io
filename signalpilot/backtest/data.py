"""
Historical data fetcher for backtesting.

Pulls from:
1. Polymarket Gamma API — resolved markets with final outcomes
2. CLOB Data API — historical OHLCV candle data for token prices
3. Binance — historical BTC/USDT klines for latency arb backtesting
"""
import json
import logging
import os
import time
from dataclasses import dataclass

import httpx

logger = logging.getLogger(__name__)

GAMMA_URL = "https://gamma-api.polymarket.com"
DATA_API_URL = "https://data-api.polymarket.com"
BINANCE_API = "https://api.binance.com/api/v3"
CACHE_DIR = os.path.join(
    "/app/data" if os.path.isdir("/app/data") else ".", "backtest_cache"
)


@dataclass
class HistoricalMarket:
    """A resolved Polymarket market with outcome data."""
    question: str
    slug: str
    yes_token: str
    no_token: str
    outcome: str          # "Yes" or "No"
    outcome_price: float  # Final settlement price (1.0 or 0.0)
    end_date: str
    volume: float
    neg_risk: bool
    event_slug: str
    price_history: list[dict]  # [{timestamp, yes_price, no_price}, ...]


@dataclass
class BinanceCandle:
    """A single BTC/USDT kline."""
    open_time: int    # ms timestamp
    open: float
    high: float
    low: float
    close: float
    volume: float
    close_time: int


def _ensure_cache_dir():
    os.makedirs(CACHE_DIR, exist_ok=True)


def fetch_resolved_markets(limit: int = 200, min_volume: float = 1000) -> list[dict]:
    """Fetch resolved (closed) markets from Gamma API."""
    _ensure_cache_dir()
    cache_file = os.path.join(CACHE_DIR, f"resolved_{limit}_{int(min_volume)}.json")

    # Use cache if less than 1 hour old
    if os.path.exists(cache_file):
        age = time.time() - os.path.getmtime(cache_file)
        if age < 3600:
            with open(cache_file) as f:
                return json.load(f)

    client = httpx.Client(timeout=30)
    markets = []
    offset = 0

    while len(markets) < limit:
        resp = client.get(f"{GAMMA_URL}/markets", params={
            "closed": "true",
            "limit": min(100, limit - len(markets)),
            "offset": offset,
            "volume_num_min": min_volume,
            "order": "volume",
        })
        resp.raise_for_status()
        batch = resp.json()
        if not batch:
            break
        markets.extend(batch)
        offset += len(batch)

    client.close()

    with open(cache_file, "w") as f:
        json.dump(markets, f)

    logger.info("Fetched %d resolved markets", len(markets))
    return markets


def fetch_price_history(token_id: str, interval: str = "1h",
                        fidelity: int = 60) -> list[dict]:
    """
    Fetch historical price data for a token from the CLOB Data API.
    Returns list of {t: timestamp, p: price} entries.

    interval: "1m", "5m", "1h", "1d"
    fidelity: seconds between data points (60 = 1 min)
    """
    _ensure_cache_dir()
    cache_file = os.path.join(CACHE_DIR, f"prices_{token_id[:16]}_{interval}.json")

    if os.path.exists(cache_file):
        age = time.time() - os.path.getmtime(cache_file)
        if age < 3600:
            with open(cache_file) as f:
                return json.load(f)

    client = httpx.Client(timeout=30)
    try:
        resp = client.get(f"{DATA_API_URL}/prices", params={
            "market": token_id,
            "interval": interval,
            "fidelity": fidelity,
        })
        resp.raise_for_status()
        data = resp.json()

        # Normalize to [{t, p}] format
        history = []
        if isinstance(data, dict) and "history" in data:
            history = data["history"]
        elif isinstance(data, list):
            history = data

        with open(cache_file, "w") as f:
            json.dump(history, f)

        return history
    except Exception as e:
        logger.warning("Failed to fetch price history for %s: %s", token_id[:12], e)
        return []
    finally:
        client.close()


def fetch_binance_klines(symbol: str = "BTCUSDT", interval: str = "1m",
                          start_time: int | None = None,
                          end_time: int | None = None,
                          limit: int = 1000) -> list[BinanceCandle]:
    """Fetch historical klines from Binance."""
    _ensure_cache_dir()
    cache_key = f"binance_{symbol}_{interval}_{start_time}_{end_time}"
    cache_file = os.path.join(CACHE_DIR, f"{cache_key}.json")

    if os.path.exists(cache_file):
        age = time.time() - os.path.getmtime(cache_file)
        if age < 3600:
            with open(cache_file) as f:
                raw = json.load(f)
                return [BinanceCandle(*r[:7]) for r in raw]

    client = httpx.Client(timeout=30)
    params: dict = {"symbol": symbol, "interval": interval, "limit": limit}
    if start_time:
        params["startTime"] = start_time
    if end_time:
        params["endTime"] = end_time

    try:
        resp = client.get(f"{BINANCE_API}/klines", params=params)
        resp.raise_for_status()
        raw = resp.json()

        with open(cache_file, "w") as f:
            json.dump(raw, f)

        return [BinanceCandle(
            open_time=int(r[0]),
            open=float(r[1]),
            high=float(r[2]),
            low=float(r[3]),
            close=float(r[4]),
            volume=float(r[5]),
            close_time=int(r[6]),
        ) for r in raw]
    except Exception as e:
        logger.warning("Failed to fetch Binance klines: %s", e)
        return []
    finally:
        client.close()


def build_historical_markets(raw_markets: list[dict]) -> list[HistoricalMarket]:
    """Convert raw Gamma API markets into structured HistoricalMarket objects."""
    results = []
    for m in raw_markets:
        token_ids = m.get("clobTokenIds", [])
        if len(token_ids) < 2:
            continue

        # Determine outcome
        outcome_str = m.get("outcome", m.get("resolution", ""))
        if not outcome_str:
            outcomes_list = m.get("outcomes", [])
            if outcomes_list:
                outcome_str = outcomes_list[0] if m.get("resolutionSource") else ""

        results.append(HistoricalMarket(
            question=m.get("question", ""),
            slug=m.get("slug", ""),
            yes_token=token_ids[0],
            no_token=token_ids[1],
            outcome=str(outcome_str),
            outcome_price=1.0 if str(outcome_str).lower() in ("yes", "1", "true") else 0.0,
            end_date=m.get("endDate", m.get("end_date_iso", "")),
            volume=float(m.get("volume", 0)),
            neg_risk=m.get("negRisk", False),
            event_slug=m.get("eventSlug", ""),
            price_history=[],
        ))

    return results
