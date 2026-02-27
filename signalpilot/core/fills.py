"""
Fill Tracker — polls order statuses and reconciles actual fills against expected.

Solves the core problem: the bot was recording PnL the moment an order was *placed*,
not when it was *filled*. This module tracks every order from placement to terminal
state and only updates risk/PnL on confirmed fills.

Also handles the nightmare scenario: arb leg 1 fills but leg 2 doesn't, leaving
a naked directional position that must be unwound.
"""
import logging
import time
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)

POLL_INTERVAL = 0.5  # seconds between polls
POLL_TIMEOUT = 10.0  # give up polling after this
STALE_ORDER_AGE = 120.0  # cancel orders older than this if still open


class OrderState(str, Enum):
    PENDING = "PENDING"      # placed, not yet confirmed
    OPEN = "OPEN"            # confirmed live on book
    FILLED = "FILLED"        # fully filled
    PARTIAL = "PARTIAL"      # partially filled
    CANCELLED = "CANCELLED"  # cancelled (by us or exchange)
    FAILED = "FAILED"        # placement failed or unknown
    EXPIRED = "EXPIRED"      # timed out without fill


@dataclass
class TrackedOrder:
    order_id: str
    token_id: str
    side: str        # "BUY" or "SELL"
    price: float
    size: float
    strategy: str    # "arb", "mm", "latency"
    group_id: str    # links legs of multi-leg trades (e.g. arb YES + NO)
    state: OrderState = OrderState.PENDING
    filled_size: float = 0.0
    filled_price: float = 0.0
    placed_at: float = field(default_factory=time.time)
    resolved_at: float = 0.0
    pnl_recorded: bool = False

    @property
    def is_terminal(self) -> bool:
        return self.state in (OrderState.FILLED, OrderState.CANCELLED,
                              OrderState.FAILED, OrderState.EXPIRED)

    @property
    def age(self) -> float:
        return time.time() - self.placed_at

    @property
    def unfilled_size(self) -> float:
        return self.size - self.filled_size


@dataclass
class TradeGroup:
    """A group of related orders (e.g. both legs of an arb)."""
    group_id: str
    strategy: str
    orders: list[TrackedOrder] = field(default_factory=list)
    expected_pnl_per_share: float = 0.0
    created_at: float = field(default_factory=time.time)

    @property
    def all_filled(self) -> bool:
        return all(o.state == OrderState.FILLED for o in self.orders)

    @property
    def any_filled(self) -> bool:
        return any(o.state == OrderState.FILLED for o in self.orders)

    @property
    def all_terminal(self) -> bool:
        return all(o.is_terminal for o in self.orders)

    @property
    def has_naked_leg(self) -> bool:
        """One leg filled but another didn't — dangerous."""
        if len(self.orders) < 2:
            return False
        filled = [o for o in self.orders if o.state == OrderState.FILLED]
        failed = [o for o in self.orders if o.state in
                  (OrderState.CANCELLED, OrderState.FAILED, OrderState.EXPIRED)]
        return len(filled) > 0 and len(failed) > 0

    @property
    def filled_orders(self) -> list[TrackedOrder]:
        return [o for o in self.orders if o.state == OrderState.FILLED]

    @property
    def unfilled_orders(self) -> list[TrackedOrder]:
        return [o for o in self.orders if not o.is_terminal]

    @property
    def min_filled_size(self) -> float:
        """Smallest fill across all legs — the guaranteed arb size."""
        filled = self.filled_orders
        if not filled:
            return 0.0
        return min(o.filled_size for o in filled)


class FillTracker:
    """
    Central fill tracking system. All order placements go through here.
    Polls for fill status and reconciles PnL only on confirmed fills.
    """

    def __init__(self, client, risk):
        # Import types here to avoid circular imports at module level
        self.client = client
        self.risk = risk
        self.orders: dict[str, TrackedOrder] = {}
        self.groups: dict[str, TradeGroup] = {}
        self._group_counter = 0

    def new_group_id(self, strategy: str) -> str:
        self._group_counter += 1
        return f"{strategy}_{self._group_counter}_{int(time.time())}"

    def track_order(self, order_response: dict, token_id: str, side: str,
                    price: float, size: float, strategy: str,
                    group_id: str) -> TrackedOrder | None:
        """Register an order for tracking. Returns TrackedOrder or None if response invalid."""
        order_id = ""
        if isinstance(order_response, dict):
            order_id = str(order_response.get("orderID", order_response.get("id", "")))

        if not order_id:
            logger.error("Cannot track order — no orderID in response: %s", order_response)
            return None

        order = TrackedOrder(
            order_id=order_id,
            token_id=token_id,
            side=side,
            price=price,
            size=size,
            strategy=strategy,
            group_id=group_id,
        )
        self.orders[order_id] = order

        # Add to group
        if group_id not in self.groups:
            self.groups[group_id] = TradeGroup(group_id=group_id, strategy=strategy)
        self.groups[group_id].orders.append(order)

        logger.info("TRACKING: %s %s %s %.0f @ $%.4f [group=%s]",
                     strategy, side, token_id[:12], size, price, group_id)
        return order

    def poll_order(self, order_id: str) -> OrderState:
        """Poll a single order and update its state."""
        order = self.orders.get(order_id)
        if not order or order.is_terminal:
            return order.state if order else OrderState.FAILED

        status_str = self.client.check_fill_status(order_id)

        if status_str == "FILLED":
            order.state = OrderState.FILLED
            order.filled_size = order.size
            order.filled_price = order.price
            order.resolved_at = time.time()
            logger.info("FILL CONFIRMED: %s %s %.0f @ $%.4f [%s]",
                         order.side, order.token_id[:12], order.size, order.price, order.order_id)

        elif status_str == "PARTIAL":
            order.state = OrderState.PARTIAL
            # Try to get actual filled size from order details
            detail = self.client.get_order(order_id)
            if detail and isinstance(detail, dict):
                order.filled_size = float(detail.get("size_matched",
                                          detail.get("filled_size", 0)))
                if order.filled_size > 0:
                    order.filled_price = float(detail.get("average_price",
                                               detail.get("price", order.price)))

        elif status_str == "OPEN":
            order.state = OrderState.OPEN

        elif status_str == "CANCELLED":
            order.state = OrderState.CANCELLED
            order.resolved_at = time.time()
            logger.info("ORDER CANCELLED: %s %s [%s]",
                         order.side, order.token_id[:12], order.order_id)

        elif status_str == "UNKNOWN":
            if order.age > STALE_ORDER_AGE:
                order.state = OrderState.FAILED
                order.resolved_at = time.time()
                logger.warning("ORDER LOST: %s %s [%s] — marking FAILED after %.0fs",
                               order.side, order.token_id[:12], order.order_id, order.age)

        return order.state

    def poll_group(self, group_id: str) -> TradeGroup | None:
        """Poll all orders in a group and return the group."""
        group = self.groups.get(group_id)
        if not group:
            return None

        for order in group.orders:
            if not order.is_terminal:
                self.poll_order(order.order_id)

        return group

    def poll_until_terminal(self, order_id: str,
                            timeout: float = POLL_TIMEOUT) -> OrderState:
        """Block until an order reaches a terminal state or times out."""
        start = time.time()
        while time.time() - start < timeout:
            state = self.poll_order(order_id)
            if state in (OrderState.FILLED, OrderState.CANCELLED, OrderState.FAILED):
                return state
            time.sleep(POLL_INTERVAL)

        # Timed out — mark as expired if still open
        order = self.orders.get(order_id)
        if order and not order.is_terminal:
            order.state = OrderState.EXPIRED
            order.resolved_at = time.time()
            logger.warning("ORDER TIMED OUT: %s %s [%s] after %.1fs",
                           order.side, order.token_id[:12], order.order_id, timeout)
        return order.state if order else OrderState.FAILED

    def reconcile_group(self, group_id: str) -> dict:
        """
        Reconcile a trade group after all orders are terminal.
        Returns a summary with actual PnL and any naked positions.

        This is where the real accounting happens.
        """
        group = self.groups.get(group_id)
        if not group:
            return {"error": "group not found"}

        result = {
            "group_id": group_id,
            "strategy": group.strategy,
            "all_filled": group.all_filled,
            "has_naked_leg": group.has_naked_leg,
            "pnl": 0.0,
            "naked_positions": [],
        }

        if group.all_filled:
            # Best case: all legs filled. Record actual PnL.
            if group.strategy == "arb":
                # For arb: profit = shares * (1.0 - total_cost_per_share)
                total_cost = sum(o.filled_size * o.filled_price for o in group.orders)
                min_shares = group.min_filled_size
                # Each complete set pays $1.00
                revenue = min_shares * 1.0
                pnl = revenue - total_cost
                result["pnl"] = pnl

                # Record to risk manager
                for order in group.orders:
                    if not order.pnl_recorded:
                        self.risk.record_fill(order.token_id, order.side,
                                              order.filled_size, order.filled_price)
                        order.pnl_recorded = True
                self.risk.record_pnl(pnl)
                logger.info("ARB RECONCILED [%s]: PnL=$%.4f (%.0f shares)",
                             group_id, pnl, min_shares)

            elif group.strategy in ("mm", "latency"):
                # Single-leg trades: record position, PnL comes later on close
                for order in group.orders:
                    if not order.pnl_recorded:
                        self.risk.record_fill(order.token_id, order.side,
                                              order.filled_size, order.filled_price)
                        order.pnl_recorded = True

        elif group.has_naked_leg:
            # Nightmare: partial execution on multi-leg trade
            logger.critical("NAKED LEG DETECTED in group %s", group_id)
            for order in group.filled_orders:
                if not order.pnl_recorded:
                    self.risk.record_fill(order.token_id, order.side,
                                          order.filled_size, order.filled_price)
                    order.pnl_recorded = True
                result["naked_positions"].append({
                    "token_id": order.token_id,
                    "side": order.side,
                    "size": order.filled_size,
                    "price": order.filled_price,
                })

        return result

    def try_unwind_naked_leg(self, order: TrackedOrder) -> bool:
        """
        Attempt to sell a naked position at market to limit damage.
        Returns True if the unwind order was placed.
        """
        logger.warning("UNWINDING naked %s position: %s %.0f @ $%.4f",
                        order.side, order.token_id[:12], order.filled_size, order.filled_price)

        try:
            if order.side == "BUY":
                # We bought shares we don't want — sell them
                best_bid = self.client.get_best_bid(order.token_id)
                if best_bid and best_bid > 0:
                    result = self.client.sell_limit(
                        order.token_id, best_bid, order.filled_size
                    )
                    if result:
                        logger.info("UNWIND PLACED: SELL %s %.0f @ $%.4f",
                                     order.token_id[:12], order.filled_size, best_bid)
                        loss = order.filled_size * (order.filled_price - best_bid)
                        self.risk.record_pnl(-loss)
                        return True
        except Exception as e:
            logger.critical("UNWIND FAILED for %s: %s — MANUAL INTERVENTION NEEDED",
                            order.token_id[:12], e)
        return False

    def cancel_and_expire_stale(self):
        """Cancel orders that have been open too long without filling."""
        for order in self.orders.values():
            if order.state in (OrderState.OPEN, OrderState.PENDING) and \
               order.age > STALE_ORDER_AGE:
                try:
                    self.client.cancel_order(order.order_id)
                    order.state = OrderState.EXPIRED
                    order.resolved_at = time.time()
                    logger.info("STALE ORDER EXPIRED: %s %s [%s] age=%.0fs",
                                 order.side, order.token_id[:12], order.order_id, order.age)
                except Exception as e:
                    logger.error("Failed to cancel stale order %s: %s", order.order_id, e)

    def poll_all_pending(self) -> list[str]:
        """Poll all non-terminal orders. Returns list of group_ids that became fully terminal."""
        resolved_groups = []
        seen_groups = set()

        for order in list(self.orders.values()):
            if not order.is_terminal:
                self.poll_order(order.order_id)
                seen_groups.add(order.group_id)

        for gid in seen_groups:
            group = self.groups.get(gid)
            if group and group.all_terminal:
                resolved_groups.append(gid)

        return resolved_groups

    def get_pending_count(self) -> int:
        return sum(1 for o in self.orders.values() if not o.is_terminal)

    def get_summary(self) -> dict:
        states = {}
        for o in self.orders.values():
            states[o.state.value] = states.get(o.state.value, 0) + 1
        return {
            "total_orders": len(self.orders),
            "total_groups": len(self.groups),
            "pending": self.get_pending_count(),
            "by_state": states,
        }
