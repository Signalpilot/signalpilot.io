"""
Real-time data feeds via WebSocket.
- Polymarket order book updates
- Binance BTC/USDT trade stream (for latency arb)
"""
import asyncio
import json
import logging
import time
from collections.abc import Callable

import websockets

logger = logging.getLogger(__name__)

POLYMARKET_WS = "wss://ws-subscriptions-clob.polymarket.com/ws/market"


class PolymarketFeed:
    """
    Streams real-time order book updates for subscribed token IDs.
    Calls `on_update(token_id, best_bid, best_ask)` on every change.
    """

    def __init__(self, on_update: Callable[[str, float, float], None]):
        self.on_update = on_update
        self._subscribed: set[str] = set()
        self._ws = None
        self._running = False

    def subscribe(self, token_id: str):
        self._subscribed.add(token_id)

    def subscribe_many(self, token_ids: list[str]):
        self._subscribed.update(token_ids)

    async def run(self):
        self._running = True
        while self._running:
            try:
                async with websockets.connect(POLYMARKET_WS) as ws:
                    self._ws = ws
                    # Subscribe to all token IDs
                    for token_id in self._subscribed:
                        sub_msg = {
                            "type": "market",
                            "assets_ids": [token_id],
                        }
                        await ws.send(json.dumps(sub_msg))
                    logger.info("Polymarket WS connected, subscribed to %d tokens", len(self._subscribed))

                    async for raw in ws:
                        try:
                            msg = json.loads(raw)
                            self._handle_message(msg)
                        except json.JSONDecodeError:
                            continue
            except (websockets.ConnectionClosed, ConnectionError) as e:
                logger.warning("Polymarket WS disconnected: %s — reconnecting in 2s", e)
                await asyncio.sleep(2)
            except Exception as e:
                logger.error("Polymarket WS error: %s — reconnecting in 5s", e)
                await asyncio.sleep(5)

    def _handle_message(self, msg: dict):
        """Parse L2 book update and extract best bid/ask."""
        event_type = msg.get("event_type", "")
        if event_type not in ("book", "price_change", "last_trade_price"):
            return

        asset_id = msg.get("asset_id", "")
        if not asset_id:
            return

        # Extract best bid/ask from the message
        market = msg.get("market", {})
        bids = market.get("bids", [])
        asks = market.get("asks", [])

        best_bid = float(max(bids, key=lambda b: float(b["price"]))["price"]) if bids else 0.0
        best_ask = float(min(asks, key=lambda a: float(a["price"]))["price"]) if asks else 1.0

        self.on_update(asset_id, best_bid, best_ask)

    async def stop(self):
        self._running = False
        if self._ws:
            await self._ws.close()


class BinanceFeed:
    """
    Streams BTC/USDT trades from Binance for latency arbitrage.
    Calls `on_price(price, timestamp_ms)` on every trade.
    """

    def __init__(self, ws_url: str, on_price: Callable[[float, int], None]):
        self.ws_url = ws_url
        self.on_price = on_price
        self._ws = None
        self._running = False
        self.last_price: float = 0.0
        self.last_ts: int = 0

    async def run(self):
        self._running = True
        while self._running:
            try:
                async with websockets.connect(self.ws_url) as ws:
                    self._ws = ws
                    logger.info("Binance WS connected")
                    async for raw in ws:
                        try:
                            msg = json.loads(raw)
                            price = float(msg["p"])
                            ts = int(msg["T"])
                            self.last_price = price
                            self.last_ts = ts
                            self.on_price(price, ts)
                        except (json.JSONDecodeError, KeyError):
                            continue
            except (websockets.ConnectionClosed, ConnectionError) as e:
                logger.warning("Binance WS disconnected: %s — reconnecting in 2s", e)
                await asyncio.sleep(2)
            except Exception as e:
                logger.error("Binance WS error: %s — reconnecting in 5s", e)
                await asyncio.sleep(5)

    async def stop(self):
        self._running = False
        if self._ws:
            await self._ws.close()
