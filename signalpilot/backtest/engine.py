"""
Backtesting engine — replays historical data through strategies.

Simulates:
- Order book state (synthetic bid/ask from historical prices)
- Fill execution (instant fill at historical price — optimistic)
- Fee calculation (dynamic fees for crypto markets, 0% for standard)
- PnL tracking per trade and cumulative

Does NOT simulate:
- Book depth / slippage (assumes infinite liquidity — shows BEST CASE)
- Partial fills
- Network latency
- Other bots competing for the same opportunities

Results should be treated as an upper bound on real performance.
"""
import logging
import time
from dataclasses import dataclass, field

from signalpilot.backtest.data import (
    HistoricalMarket, BinanceCandle,
    fetch_resolved_markets, fetch_price_history,
    fetch_binance_klines, build_historical_markets,
)
from signalpilot.core.client import PolymarketClient
from signalpilot.quant import (
    sharpe_ratio, sharpe_std_error, probabilistic_sharpe_ratio,
    deflated_sharpe_ratio, expected_max_sr, max_drawdown as calc_max_drawdown,
    walk_forward_efficiency, walk_forward_splits, kelly_for_arb,
)

logger = logging.getLogger(__name__)


@dataclass
class BacktestTrade:
    """A single simulated trade."""
    timestamp: str
    market: str
    strategy: str
    side: str
    token: str
    price: float
    size: float
    fee: float
    pnl: float


@dataclass
class BacktestResult:
    """Summary of a backtest run with statistical validation (#15-#18)."""
    strategy: str
    markets_scanned: int
    opportunities_found: int
    trades_executed: int
    total_pnl: float
    win_rate: float
    avg_profit_per_trade: float
    max_drawdown: float
    trades: list[BacktestTrade] = field(default_factory=list)
    equity_curve: list[float] = field(default_factory=list)
    # Statistical validation — computed by compute_validation()
    sharpe: float = 0.0
    sharpe_se: float = 0.0
    psr: float = 0.0       # Probabilistic Sharpe Ratio — >0.95 means statistically significant
    dsr: float = 0.0       # Deflated Sharpe Ratio — adjusts for multiple testing
    is_significant: bool = False  # True if PSR > 0.95

    def compute_validation(self, num_strategies_tested: int = 3):
        """Compute Sharpe, PSR (#16), and DSR (#17) from trade results."""
        if not self.trades:
            return
        returns = [t.pnl for t in self.trades]
        n = len(returns)

        self.sharpe = sharpe_ratio(returns)
        self.sharpe_se = sharpe_std_error(self.sharpe, n)

        # Compute skewness and kurtosis for PSR
        mean_r = sum(returns) / n
        var = sum((r - mean_r) ** 2 for r in returns) / n if n > 0 else 0
        std = var ** 0.5 if var > 0 else 1e-9
        skew = sum((r - mean_r) ** 3 for r in returns) / (n * std ** 3) if n > 2 else 0
        kurt = sum((r - mean_r) ** 4 for r in returns) / (n * std ** 4) if n > 3 else 3

        # PSR: probability our SR exceeds 0 (the null benchmark)
        self.psr = probabilistic_sharpe_ratio(self.sharpe, 0.0, n, skew, kurt)

        # DSR: adjust for the fact that we tested multiple strategies
        sr_zero = expected_max_sr(num_strategies_tested, n)
        self.dsr = deflated_sharpe_ratio(self.sharpe, sr_zero, n, skew, kurt)

        self.is_significant = self.psr > 0.95

    def print_summary(self):
        self.compute_validation()

        print(f"\n{'='*60}")
        print(f"  BACKTEST RESULTS: {self.strategy}")
        print(f"{'='*60}")
        print(f"  Markets scanned:      {self.markets_scanned}")
        print(f"  Opportunities found:  {self.opportunities_found}")
        print(f"  Trades executed:      {self.trades_executed}")
        print(f"  Total PnL:            ${self.total_pnl:+.4f}")
        print(f"  Win rate:             {self.win_rate:.1%}")
        print(f"  Avg profit/trade:     ${self.avg_profit_per_trade:+.4f}")
        print(f"  Max drawdown:         ${self.max_drawdown:.4f}")
        print(f"{'─'*60}")
        print(f"  STATISTICAL VALIDATION (#15-#18)")
        print(f"  Sharpe Ratio:         {self.sharpe:.3f} (SE={self.sharpe_se:.3f})")
        print(f"  PSR (vs SR=0):        {self.psr:.3f}  {'SIGNIFICANT' if self.psr > 0.95 else 'NOT significant'}")
        print(f"  DSR (multi-test adj): {self.dsr:.3f}  {'SURVIVES' if self.dsr > 0.95 else 'DOES NOT survive'} correction")
        if self.psr <= 0.95:
            print(f"  WARNING: Results may be due to chance (PSR={self.psr:.2f} < 0.95)")
        print(f"{'='*60}\n")

        if self.trades:
            print("  Last 10 trades:")
            for t in self.trades[-10:]:
                print(f"    {t.market[:40]}  {t.side} @ ${t.price:.4f}  "
                      f"PnL=${t.pnl:+.4f}  fee=${t.fee:.4f}")


def backtest_arb(capital: float = 1000, fee_rate: float = 0.0625,
                 min_profit: float = 0.005, max_shares: float = 500,
                 limit: int = 200) -> BacktestResult:
    """
    Backtest the structural arb strategy against resolved markets.

    For each resolved binary market, checks if YES_ask + NO_ask < $1.00 - fees
    using historical price snapshots.
    """
    logger.info("Starting arb backtest — fetching %d resolved markets", limit)
    raw = fetch_resolved_markets(limit=limit)
    markets = build_historical_markets(raw)

    trades: list[BacktestTrade] = []
    equity_curve = [capital]
    balance = capital
    peak = capital
    max_dd = 0.0
    opps = 0

    for market in markets:
        # Get price history for both tokens
        yes_history = fetch_price_history(market.yes_token, interval="1h")
        no_history = fetch_price_history(market.no_token, interval="1h")

        if not yes_history or not no_history:
            continue

        # Align timestamps and check for arb at each point
        # Use the simpler approach: check the last known prices before resolution
        yes_prices = {h.get("t", 0): float(h.get("p", 0)) for h in yes_history if h.get("p")}
        no_prices = {h.get("t", 0): float(h.get("p", 0)) for h in no_history if h.get("p")}

        if not yes_prices or not no_prices:
            continue

        # Check multiple time points for opportunities
        common_times = sorted(set(yes_prices.keys()) & set(no_prices.keys()))

        for ts in common_times:
            yes_ask = yes_prices[ts]
            no_ask = no_prices[ts]

            if yes_ask <= 0 or no_ask <= 0 or yes_ask >= 1 or no_ask >= 1:
                continue

            combined = yes_ask + no_ask
            fee_yes = PolymarketClient.calc_dynamic_fee(yes_ask, fee_rate)
            fee_no = PolymarketClient.calc_dynamic_fee(no_ask, fee_rate)
            total_fee = fee_yes + fee_no
            net_profit_per_share = 1.0 - combined - total_fee

            if net_profit_per_share > min_profit:
                opps += 1
                cost_per_set = combined + total_fee
                shares = min(balance / cost_per_set, max_shares)
                if shares < 1:
                    continue

                total_cost = shares * cost_per_set
                pnl = shares * net_profit_per_share

                trade = BacktestTrade(
                    timestamp=str(ts),
                    market=market.question[:60],
                    strategy="arb",
                    side="BUY_BOTH",
                    token=f"{market.yes_token[:8]}+{market.no_token[:8]}",
                    price=cost_per_set,
                    size=shares,
                    fee=total_fee * shares,
                    pnl=pnl,
                )
                trades.append(trade)
                balance += pnl
                equity_curve.append(balance)

                if balance > peak:
                    peak = balance
                dd = peak - balance
                if dd > max_dd:
                    max_dd = dd

    wins = sum(1 for t in trades if t.pnl > 0)
    total_pnl = sum(t.pnl for t in trades)

    return BacktestResult(
        strategy="arb",
        markets_scanned=len(markets),
        opportunities_found=opps,
        trades_executed=len(trades),
        total_pnl=total_pnl,
        win_rate=wins / len(trades) if trades else 0,
        avg_profit_per_trade=total_pnl / len(trades) if trades else 0,
        max_drawdown=max_dd,
        trades=trades,
        equity_curve=equity_curve,
    )


def backtest_latency(capital: float = 200, min_btc_change: float = 0.05,
                     fee_rate: float = 0.0625, limit: int = 200) -> BacktestResult:
    """
    Backtest the latency arb strategy.

    For each 5-minute window in Binance BTC data, checks if the price move
    was large enough to generate a signal, then simulates buying on Polymarket
    at the historical price and settling at market resolution.
    """
    logger.info("Starting latency arb backtest — fetching Binance klines")

    # Get 5-minute BTC candles (last 7 days)
    end_ms = int(time.time() * 1000)
    start_ms = end_ms - (7 * 24 * 60 * 60 * 1000)
    candles = fetch_binance_klines(
        interval="5m", start_time=start_ms, end_time=end_ms, limit=1000
    )

    if not candles:
        logger.warning("No Binance data available for backtest")
        return BacktestResult(
            strategy="latency", markets_scanned=0, opportunities_found=0,
            trades_executed=0, total_pnl=0, win_rate=0, avg_profit_per_trade=0,
            max_drawdown=0,
        )

    # Also get resolved crypto markets to check actual Polymarket prices
    raw_markets = fetch_resolved_markets(limit=limit, min_volume=100)
    crypto_markets = [
        m for m in build_historical_markets(raw_markets)
        if "5" in m.question and "minute" in m.question.lower()
        and any(c in m.question.upper() for c in ("BTC", "BITCOIN"))
    ]

    trades: list[BacktestTrade] = []
    equity_curve = [capital]
    balance = capital
    peak = capital
    max_dd = 0.0
    opps = 0

    for candle in candles:
        change_pct = abs(candle.close - candle.open) / candle.open * 100
        if change_pct < min_btc_change:
            continue

        opps += 1
        direction = "UP" if candle.close > candle.open else "DOWN"

        # Estimate entry price (what Polymarket would show mid-candle)
        # Conservative: assume we enter at 0.55 implied probability
        entry_price = 0.55
        fee = PolymarketClient.calc_dynamic_fee(entry_price, fee_rate)

        # Estimate fair value based on how the candle closed
        fair_value = 0.60 + min(change_pct / 0.2, 1.0) * 0.20

        # Simulate: did the 5-min candle close in our direction?
        # Use intra-candle high/low to estimate outcome probability
        candle_range = candle.high - candle.low
        if candle_range > 0:
            if direction == "UP":
                # What fraction of the range was upward?
                close_position = (candle.close - candle.low) / candle_range
            else:
                close_position = (candle.high - candle.close) / candle_range
        else:
            close_position = 0.5

        # Binary outcome: did we win?
        won = close_position > 0.5
        payout = 1.0 if won else 0.0

        size_usdc = min(50.0, balance * 0.05)
        shares = size_usdc / entry_price
        cost = shares * (entry_price + fee)
        revenue = shares * payout
        pnl = revenue - cost

        if balance < cost:
            continue

        trade = BacktestTrade(
            timestamp=str(candle.open_time),
            market=f"BTC 5min {direction} ({change_pct:.3f}%)",
            strategy="latency",
            side=f"BUY_{'YES' if direction == 'UP' else 'NO'}",
            token="btc_5min",
            price=entry_price,
            size=shares,
            fee=fee * shares,
            pnl=pnl,
        )
        trades.append(trade)
        balance += pnl
        equity_curve.append(balance)

        if balance > peak:
            peak = balance
        dd = peak - balance
        if dd > max_dd:
            max_dd = dd

    wins = sum(1 for t in trades if t.pnl > 0)
    total_pnl = sum(t.pnl for t in trades)

    return BacktestResult(
        strategy="latency",
        markets_scanned=len(candles),
        opportunities_found=opps,
        trades_executed=len(trades),
        total_pnl=total_pnl,
        win_rate=wins / len(trades) if trades else 0,
        avg_profit_per_trade=total_pnl / len(trades) if trades else 0,
        max_drawdown=max_dd,
        trades=trades,
        equity_curve=equity_curve,
    )


# ── Walk-Forward Validation (#13, #14) ───────────────────────────

@dataclass
class WalkForwardResult:
    """Result of walk-forward analysis."""
    strategy: str
    num_folds: int
    is_sharpes: list[float]     # In-sample Sharpe per fold
    oos_sharpes: list[float]    # Out-of-sample Sharpe per fold
    wfe_per_fold: list[float]   # Walk-Forward Efficiency per fold
    avg_wfe: float              # Average WFE across folds
    oos_total_pnl: float        # Total OOS PnL
    is_overfit: bool            # True if avg WFE < 0.3

    def print_summary(self):
        print(f"\n{'='*60}")
        print(f"  WALK-FORWARD VALIDATION: {self.strategy}")
        print(f"{'='*60}")
        print(f"  Folds:          {self.num_folds}")
        print(f"  Avg WFE:        {self.avg_wfe:.3f}  {'OK' if 0.3 <= self.avg_wfe <= 1.2 else 'SUSPECT'}")
        print(f"  OOS Total PnL:  ${self.oos_total_pnl:+.4f}")
        print(f"  Overfit:        {'YES — DO NOT TRADE' if self.is_overfit else 'No'}")
        print(f"{'─'*60}")
        for i, (is_sr, oos_sr, wfe) in enumerate(
            zip(self.is_sharpes, self.oos_sharpes, self.wfe_per_fold)
        ):
            status = "OK" if 0.3 <= wfe <= 1.2 else "OVERFIT" if wfe < 0.3 else "LUCKY"
            print(f"  Fold {i+1}: IS_SR={is_sr:+.3f}  OOS_SR={oos_sr:+.3f}  WFE={wfe:.3f}  {status}")
        print(f"{'='*60}\n")


def walk_forward_arb(
    capital: float = 1000,
    fee_rate: float = 0.0625,
    in_sample_frac: float = 0.7,
    limit: int = 300,
) -> WalkForwardResult:
    """
    Walk-forward validation for the arb strategy (#13, #14).

    Splits resolved markets into in-sample and out-of-sample windows.
    Runs the arb scanner on each, computes WFE = OOS_performance / IS_performance.
    """
    logger.info("Starting walk-forward arb — fetching %d markets", limit)
    raw = fetch_resolved_markets(limit=limit, min_volume=500)
    markets = build_historical_markets(raw)

    if len(markets) < 20:
        logger.warning("Not enough markets for walk-forward (%d)", len(markets))
        return WalkForwardResult(
            strategy="arb", num_folds=0, is_sharpes=[], oos_sharpes=[],
            wfe_per_fold=[], avg_wfe=0, oos_total_pnl=0, is_overfit=True,
        )

    # Create folds
    fold_size = max(10, len(markets) // 5)
    is_size = int(fold_size * in_sample_frac)
    oos_size = fold_size - is_size
    splits = walk_forward_splits(len(markets), is_size, oos_size)

    is_sharpes = []
    oos_sharpes = []
    wfe_list = []
    oos_total_pnl = 0.0

    for (is_start, is_end), (oos_start, oos_end) in splits:
        is_markets = markets[is_start:is_end]
        oos_markets = markets[oos_start:oos_end]

        is_pnls = _run_arb_on_markets(is_markets, capital, fee_rate)
        oos_pnls = _run_arb_on_markets(oos_markets, capital, fee_rate)

        is_sr = sharpe_ratio(is_pnls) if is_pnls else 0.0
        oos_sr = sharpe_ratio(oos_pnls) if oos_pnls else 0.0
        wfe = walk_forward_efficiency(is_sr, oos_sr) if is_sr != 0 else 0.0

        is_sharpes.append(is_sr)
        oos_sharpes.append(oos_sr)
        wfe_list.append(wfe)
        oos_total_pnl += sum(oos_pnls)

    avg_wfe = sum(wfe_list) / len(wfe_list) if wfe_list else 0

    return WalkForwardResult(
        strategy="arb",
        num_folds=len(splits),
        is_sharpes=is_sharpes,
        oos_sharpes=oos_sharpes,
        wfe_per_fold=wfe_list,
        avg_wfe=avg_wfe,
        oos_total_pnl=oos_total_pnl,
        is_overfit=avg_wfe < 0.3,
    )


def _run_arb_on_markets(
    markets: list[HistoricalMarket], capital: float, fee_rate: float,
) -> list[float]:
    """Run arb scan on a list of markets, return list of per-trade PnLs."""
    pnls = []
    for market in markets:
        yes_history = fetch_price_history(market.yes_token, interval="1h")
        no_history = fetch_price_history(market.no_token, interval="1h")
        if not yes_history or not no_history:
            continue

        yes_prices = {h.get("t", 0): float(h.get("p", 0)) for h in yes_history if h.get("p")}
        no_prices = {h.get("t", 0): float(h.get("p", 0)) for h in no_history if h.get("p")}
        common = sorted(set(yes_prices.keys()) & set(no_prices.keys()))

        for ts in common:
            ya, na = yes_prices[ts], no_prices[ts]
            if ya <= 0 or na <= 0 or ya >= 1 or na >= 1:
                continue
            fee_y = PolymarketClient.calc_dynamic_fee(ya, fee_rate)
            fee_n = PolymarketClient.calc_dynamic_fee(na, fee_rate)
            net = 1.0 - ya - na - fee_y - fee_n
            if net > 0.005:
                cost = ya + na + fee_y + fee_n
                kelly_f = kelly_for_arb(net, cost)
                shares = min((capital * kelly_f) / cost, 500) if cost > 0 else 0
                if shares >= 1:
                    pnls.append(shares * net)
    return pnls
