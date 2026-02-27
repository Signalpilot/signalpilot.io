"""
Core Polymarket client — wraps py-clob-client with helpers for
market discovery (Gamma API), order book access, and order execution.

Gamma API calls use httpx.AsyncClient so they don't block the event loop.
CLOB SDK calls (py-clob-client) are synchronous — run via asyncio.to_thread
when called from async contexts.
"""
import asyncio
import logging
import time

import httpx
from py_clob_client.client import ClobClient
from py_clob_client.clob_types import OrderArgs, MarketOrderArgs, OrderType
from py_clob_client.order_builder.constants import BUY, SELL

from signalpilot.config import Settings

logger = logging.getLogger(__name__)

# How long to wait before considering an order "stale" (not yet filled)
FILL_POLL_TIMEOUT = 5.0
FILL_POLL_INTERVAL = 0.5


class OrderError(Exception):
    """Raised when an order placement fails or returns an error response."""


class PolymarketClient:
    """Unified client for Polymarket CLOB + Gamma APIs."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.dry_run = settings.dry_run

        # Read-only client (always available)
        self.clob = ClobClient(settings.polymarket_clob_url)

        # Authenticated client (only if credentials provided)
        self._authed = False
        if settings.has_credentials:
            self.clob = ClobClient(
                settings.polymarket_clob_url,
                key=settings.private_key_str,
                chain_id=settings.polygon_chain_id,
                signature_type=settings.signature_type,
                funder=settings.funder_address,
            )
            try:
                creds = self.clob.create_or_derive_api_creds()
                self.clob.set_api_creds(creds)
                self._authed = True
                logger.info("Authenticated with Polymarket CLOB")
            except Exception as e:
                if not settings.dry_run:
                    raise RuntimeError(f"Live mode requires authentication. Failed: {e}") from e
                logger.warning("Failed to authenticate: %s — running read-only", e)

        # Async HTTP client for Gamma API (non-blocking)
        self._async_http = httpx.AsyncClient(timeout=10)
        # Sync HTTP client for use in non-async contexts (scan.py)
        self._sync_http = httpx.Client(timeout=10)

    @property
    def is_authenticated(self) -> bool:
        return self._authed

    async def close(self):
        """Close HTTP clients cleanly."""
        await self._async_http.aclose()
        self._sync_http.close()

    # ── Market Discovery (Gamma API) — async ─────────────────────

    async def async_get_active_markets(self, limit: int = 100, tag: str | None = None) -> list[dict]:
        """Fetch active markets from the Gamma API (non-blocking)."""
        params: dict = {"active": "true", "closed": "false", "limit": limit}
        if tag:
            params["tag"] = tag
        resp = await self._async_http.get(
            f"{self.settings.polymarket_gamma_url}/markets", params=params
        )
        resp.raise_for_status()
        return resp.json()

    async def async_get_crypto_5min_markets(self) -> list[dict]:
        """Fetch active 5-minute crypto markets (non-blocking)."""
        markets = await self.async_get_active_markets(limit=200)
        return [
            m for m in markets
            if "5" in m.get("question", "") and "minute" in m.get("question", "").lower()
            and any(coin in m.get("question", "").upper() for coin in ("BTC", "BITCOIN"))
        ]

    async def async_get_events(self, slug: str | None = None) -> list[dict]:
        """Fetch events from the Gamma API (non-blocking)."""
        params: dict = {"active": "true", "closed": "false", "limit": 50}
        if slug:
            params["slug"] = slug
        resp = await self._async_http.get(
            f"{self.settings.polymarket_gamma_url}/events", params=params
        )
        resp.raise_for_status()
        return resp.json()

    # ── Market Discovery (Gamma API) — sync (for scan.py) ────────

    def get_active_markets(self, limit: int = 100, tag: str | None = None) -> list[dict]:
        params: dict = {"active": "true", "closed": "false", "limit": limit}
        if tag:
            params["tag"] = tag
        resp = self._sync_http.get(f"{self.settings.polymarket_gamma_url}/markets", params=params)
        resp.raise_for_status()
        return resp.json()

    def get_crypto_5min_markets(self) -> list[dict]:
        markets = self.get_active_markets(limit=200)
        return [
            m for m in markets
            if "5" in m.get("question", "") and "minute" in m.get("question", "").lower()
            and any(coin in m.get("question", "").upper() for coin in ("BTC", "BITCOIN"))
        ]

    def get_events(self, slug: str | None = None) -> list[dict]:
        params: dict = {"active": "true", "closed": "false", "limit": 50}
        if slug:
            params["slug"] = slug
        resp = self._sync_http.get(f"{self.settings.polymarket_gamma_url}/events", params=params)
        resp.raise_for_status()
        return resp.json()

    # ── Order Book ───────────────────────────────────────────────

    def get_order_book(self, token_id: str) -> dict:
        """Fetch order book. Handles both dict and OrderBookSummary responses."""
        book = self.clob.get_order_book(token_id)
        if hasattr(book, "__dict__") and not isinstance(book, dict):
            return vars(book)
        return book

    def get_price(self, token_id: str, side: str = "BUY") -> float:
        resp = self.clob.get_price(token_id, side)
        if isinstance(resp, dict):
            price = float(resp.get("price", 0))
        else:
            price = float(getattr(resp, "price", 0))
        if price <= 0:
            raise ValueError(f"Invalid price {price} for token {token_id}")
        return price

    def get_midpoint(self, token_id: str) -> float:
        resp = self.clob.get_midpoint(token_id)
        if isinstance(resp, dict):
            mid = float(resp.get("mid", 0))
        else:
            mid = float(getattr(resp, "mid", 0))
        if mid <= 0:
            raise ValueError(f"Invalid midpoint {mid} for token {token_id}")
        return mid

    def get_best_ask(self, token_id: str) -> float | None:
        """Returns best ask price, or None if book is empty."""
        book = self.get_order_book(token_id)
        asks = book.get("asks", [])
        if not asks:
            return None
        return float(min(asks, key=lambda a: float(a["price"]))["price"])

    def get_best_bid(self, token_id: str) -> float | None:
        """Returns best bid price, or None if book is empty."""
        book = self.get_order_book(token_id)
        bids = book.get("bids", [])
        if not bids:
            return None
        return float(max(bids, key=lambda b: float(b["price"]))["price"])

    def get_book_depth_at_price(self, token_id: str, side: str, price: float) -> float:
        """Returns total size available at or better than the given price."""
        book = self.get_order_book(token_id)
        if side == "BUY":
            asks = book.get("asks", [])
            return sum(float(a["size"]) for a in asks if float(a["price"]) <= price)
        else:
            bids = book.get("bids", [])
            return sum(float(b["size"]) for b in bids if float(b["price"]) >= price)

    # ── Async wrappers for CLOB calls (run sync SDK in thread) ───

    async def async_get_order_book(self, token_id: str) -> dict:
        return await asyncio.to_thread(self.get_order_book, token_id)

    async def async_get_best_ask(self, token_id: str) -> float | None:
        return await asyncio.to_thread(self.get_best_ask, token_id)

    async def async_get_best_bid(self, token_id: str) -> float | None:
        return await asyncio.to_thread(self.get_best_bid, token_id)

    async def async_get_midpoint(self, token_id: str) -> float:
        return await asyncio.to_thread(self.get_midpoint, token_id)

    async def async_get_book_depth_at_price(self, token_id: str, side: str, price: float) -> float:
        return await asyncio.to_thread(self.get_book_depth_at_price, token_id, side, price)

    async def async_buy_limit(self, token_id: str, price: float, size: float) -> dict:
        return await asyncio.to_thread(self.buy_limit, token_id, price, size)

    async def async_sell_limit(self, token_id: str, price: float, size: float) -> dict:
        return await asyncio.to_thread(self.sell_limit, token_id, price, size)

    async def async_cancel_order(self, order_id: str) -> dict | None:
        return await asyncio.to_thread(self.cancel_order, order_id)

    # ── Order Execution ──────────────────────────────────────────

    def buy_limit(self, token_id: str, price: float, size: float) -> dict:
        """Place a limit buy order (GTC). Returns order response."""
        if price <= 0 or price >= 1 or size <= 0:
            raise ValueError(f"Invalid order params: price={price}, size={size}")
        if self.dry_run:
            logger.info("[DRY RUN] BUY LIMIT token=%s price=%.4f size=%.2f", token_id, price, size)
            return {"dry_run": True, "side": "BUY", "price": price, "size": size, "status": "placed"}
        self._require_auth()
        order = OrderArgs(token_id=token_id, price=price, size=size, side=BUY)
        signed = self.clob.create_order(order)
        resp = self.clob.post_order(signed, OrderType.GTC)
        self._check_order_response(resp, "BUY", token_id, price, size)
        return resp

    def sell_limit(self, token_id: str, price: float, size: float) -> dict:
        if price <= 0 or price >= 1 or size <= 0:
            raise ValueError(f"Invalid order params: price={price}, size={size}")
        if self.dry_run:
            logger.info("[DRY RUN] SELL LIMIT token=%s price=%.4f size=%.2f", token_id, price, size)
            return {"dry_run": True, "side": "SELL", "price": price, "size": size, "status": "placed"}
        self._require_auth()
        order = OrderArgs(token_id=token_id, price=price, size=size, side=SELL)
        signed = self.clob.create_order(order)
        resp = self.clob.post_order(signed, OrderType.GTC)
        self._check_order_response(resp, "SELL", token_id, price, size)
        return resp

    def buy_market(self, token_id: str, amount_usdc: float) -> dict:
        """Place a market buy order (FOK)."""
        if amount_usdc <= 0:
            raise ValueError(f"Invalid market order amount: {amount_usdc}")
        if self.dry_run:
            logger.info("[DRY RUN] BUY MARKET token=%s amount=$%.2f", token_id, amount_usdc)
            return {"dry_run": True, "side": "BUY", "amount": amount_usdc, "status": "placed"}
        self._require_auth()
        order = MarketOrderArgs(token_id=token_id, amount=amount_usdc, side=BUY)
        signed = self.clob.create_market_order(order)
        resp = self.clob.post_order(signed, OrderType.FOK)
        self._check_order_response(resp, "BUY_MARKET", token_id, 0, amount_usdc)
        return resp

    def cancel_order(self, order_id: str) -> dict | None:
        if self.dry_run:
            logger.info("[DRY RUN] CANCEL order=%s", order_id)
            return {"dry_run": True, "cancelled": order_id}
        self._require_auth()
        return self.clob.cancel(order_id)

    def cancel_all(self) -> dict | None:
        if self.dry_run:
            logger.info("[DRY RUN] CANCEL ALL")
            return {"dry_run": True, "cancelled": "all"}
        self._require_auth()
        return self.clob.cancel_all()

    def get_open_orders(self) -> list[dict]:
        """Fetch all open orders from the CLOB."""
        if self.dry_run:
            return []
        self._require_auth()
        resp = self.clob.get_orders()
        if isinstance(resp, list):
            return resp
        return []

    def get_order(self, order_id: str) -> dict | None:
        """Fetch a single order's status by ID."""
        if self.dry_run:
            return {"orderID": order_id, "status": "MATCHED", "dry_run": True}
        self._require_auth()
        try:
            resp = self.clob.get_order(order_id)
            if hasattr(resp, "__dict__") and not isinstance(resp, dict):
                return vars(resp)
            return resp
        except Exception as e:
            logger.debug("Failed to fetch order %s: %s", order_id, e)
            return None

    def check_fill_status(self, order_id: str) -> str:
        """
        Check if an order has been filled.
        Returns: 'FILLED', 'PARTIAL', 'OPEN', 'CANCELLED', or 'UNKNOWN'.
        """
        if self.dry_run:
            return "FILLED"  # Dry run always assumes fill
        order = self.get_order(order_id)
        if not order:
            return "UNKNOWN"
        status = str(order.get("status", order.get("order_status", "UNKNOWN"))).upper()
        if status in ("MATCHED", "FILLED"):
            return "FILLED"
        if "PARTIAL" in status:
            return "PARTIAL"
        if status in ("LIVE", "OPEN", "ACTIVE"):
            return "OPEN"
        if status in ("CANCELLED", "CANCELED"):
            return "CANCELLED"
        return status

    def poll_for_fill(self, order_id: str, timeout: float = FILL_POLL_TIMEOUT) -> str:
        """
        Poll an order until it fills, is cancelled, or times out.
        Returns final status.
        """
        if self.dry_run:
            return "FILLED"
        start = time.time()
        while time.time() - start < timeout:
            status = self.check_fill_status(order_id)
            if status in ("FILLED", "CANCELLED", "UNKNOWN"):
                return status
            time.sleep(FILL_POLL_INTERVAL)
        return self.check_fill_status(order_id)  # Final check

    # ── Fee Calculation ──────────────────────────────────────────

    @staticmethod
    def calc_dynamic_fee(price: float, fee_rate: float = 0.0625) -> float:
        """Calculate the dynamic taker fee for short-duration crypto markets."""
        return price * (1.0 - price) * fee_rate

    # ── Internals ────────────────────────────────────────────────

    def _require_auth(self):
        if not self._authed:
            raise RuntimeError("Cannot execute orders without authentication. Set PRIVATE_KEY and FUNDER_ADDRESS.")

    @staticmethod
    def _check_order_response(resp: dict, side: str, token_id: str, price: float, size: float):
        """Validate the CLOB response after order placement."""
        if not resp:
            raise OrderError(f"Empty response for {side} {token_id} @ {price} x {size}")
        if isinstance(resp, dict):
            if resp.get("error") or resp.get("status") == "error":
                raise OrderError(
                    f"Order rejected: {resp.get('error', resp.get('message', resp))} "
                    f"for {side} {token_id} @ {price} x {size}"
                )
