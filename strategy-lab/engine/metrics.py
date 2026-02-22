"""
Performance metrics calculator.

Computes standard trading strategy metrics from a list of trades.
"""

import numpy as np
import pandas as pd


def compute(trades: list[dict], equity_curve: pd.Series = None) -> dict:
    """
    Compute performance metrics from trade list.

    Each trade dict has:
        - entry_price, exit_price
        - entry_time, exit_time
        - direction: 'long' or 'short'
        - pnl: realized P&L (points)
        - pnl_pct: realized P&L (%)

    Returns dict of metrics.
    """
    if not trades:
        return _empty_metrics()

    pnls = np.array([t["pnl_pct"] for t in trades])
    wins = pnls[pnls > 0]
    losses = pnls[pnls < 0]

    total = len(pnls)
    n_wins = len(wins)
    n_losses = len(losses)
    win_rate = n_wins / total if total > 0 else 0

    # Profit factor
    gross_profit = wins.sum() if len(wins) > 0 else 0
    gross_loss = abs(losses.sum()) if len(losses) > 0 else 0
    profit_factor = gross_profit / gross_loss if gross_loss > 0 else float("inf")

    # Average win/loss
    avg_win = wins.mean() if len(wins) > 0 else 0
    avg_loss = abs(losses.mean()) if len(losses) > 0 else 0
    avg_rr = avg_win / avg_loss if avg_loss > 0 else float("inf")

    # Net return
    net_return = pnls.sum()

    # Sharpe ratio (annualized, assuming ~252 trading days)
    if len(pnls) > 1 and pnls.std() > 0:
        trades_per_year = _estimate_trades_per_year(trades)
        sharpe = (pnls.mean() / pnls.std()) * np.sqrt(trades_per_year)
    else:
        sharpe = 0.0

    # Max drawdown from equity curve
    if equity_curve is not None and len(equity_curve) > 0:
        max_dd = _max_drawdown(equity_curve)
    else:
        max_dd = _max_drawdown_from_trades(pnls)

    # Expectancy (avg P&L per trade)
    expectancy = pnls.mean()

    # Longest winning/losing streaks
    win_streak, loss_streak = _streaks(pnls)

    # Duration stats
    durations = []
    for t in trades:
        if t.get("entry_time") and t.get("exit_time"):
            dur = (t["exit_time"] - t["entry_time"]).total_seconds() / 3600
            durations.append(dur)
    avg_duration_hrs = np.mean(durations) if durations else 0

    return {
        "total_trades": total,
        "wins": n_wins,
        "losses": n_losses,
        "win_rate": round(win_rate * 100, 1),
        "profit_factor": round(profit_factor, 2),
        "sharpe_ratio": round(sharpe, 2),
        "max_drawdown_pct": round(max_dd, 2),
        "net_return_pct": round(net_return, 2),
        "avg_win_pct": round(avg_win, 3),
        "avg_loss_pct": round(avg_loss, 3),
        "avg_rr": round(avg_rr, 2),
        "expectancy_pct": round(expectancy, 3),
        "best_trade_pct": round(pnls.max(), 3),
        "worst_trade_pct": round(pnls.min(), 3),
        "win_streak": win_streak,
        "loss_streak": loss_streak,
        "avg_duration_hrs": round(avg_duration_hrs, 1),
    }


def _empty_metrics() -> dict:
    return {
        "total_trades": 0,
        "wins": 0,
        "losses": 0,
        "win_rate": 0,
        "profit_factor": 0,
        "sharpe_ratio": 0,
        "max_drawdown_pct": 0,
        "net_return_pct": 0,
        "avg_win_pct": 0,
        "avg_loss_pct": 0,
        "avg_rr": 0,
        "expectancy_pct": 0,
        "best_trade_pct": 0,
        "worst_trade_pct": 0,
        "win_streak": 0,
        "loss_streak": 0,
        "avg_duration_hrs": 0,
    }


def _max_drawdown(equity: pd.Series) -> float:
    """Max drawdown as percentage from equity curve."""
    peak = equity.expanding().max()
    dd = (equity - peak) / peak * 100
    return abs(dd.min()) if len(dd) > 0 else 0


def _max_drawdown_from_trades(pnls: np.ndarray) -> float:
    """Approximate max drawdown from sequential P&L percentages."""
    cumulative = np.cumsum(pnls)
    peak = np.maximum.accumulate(cumulative)
    dd = cumulative - peak
    return abs(dd.min()) if len(dd) > 0 else 0


def _streaks(pnls: np.ndarray) -> tuple[int, int]:
    """Calculate longest winning and losing streaks."""
    max_win = max_loss = 0
    cur_win = cur_loss = 0
    for p in pnls:
        if p > 0:
            cur_win += 1
            cur_loss = 0
            max_win = max(max_win, cur_win)
        elif p < 0:
            cur_loss += 1
            cur_win = 0
            max_loss = max(max_loss, cur_loss)
        else:
            cur_win = cur_loss = 0
    return max_win, max_loss


def _estimate_trades_per_year(trades: list[dict]) -> float:
    """Estimate annualized trade frequency."""
    if len(trades) < 2:
        return 252
    first = trades[0].get("entry_time")
    last = trades[-1].get("exit_time") or trades[-1].get("entry_time")
    if first and last:
        span_days = (last - first).total_seconds() / 86400
        if span_days > 0:
            return (len(trades) / span_days) * 365
    return 252


def grade(metrics: dict) -> dict:
    """
    Grade each metric: 'excellent', 'good', 'minimum', or 'fail'.
    Based on ZenomTrader-level targets.
    """
    grades = {}

    pf = metrics["profit_factor"]
    if pf >= 1.6:
        grades["profit_factor"] = "excellent"
    elif pf >= 1.4:
        grades["profit_factor"] = "good"
    elif pf >= 1.2:
        grades["profit_factor"] = "minimum"
    else:
        grades["profit_factor"] = "fail"

    sr = metrics["sharpe_ratio"]
    if sr >= 2.0:
        grades["sharpe_ratio"] = "excellent"
    elif sr >= 1.5:
        grades["sharpe_ratio"] = "good"
    elif sr >= 1.0:
        grades["sharpe_ratio"] = "minimum"
    else:
        grades["sharpe_ratio"] = "fail"

    dd = metrics["max_drawdown_pct"]
    if dd <= 10:
        grades["max_drawdown"] = "excellent"
    elif dd <= 15:
        grades["max_drawdown"] = "good"
    elif dd <= 25:
        grades["max_drawdown"] = "minimum"
    else:
        grades["max_drawdown"] = "fail"

    rr = metrics["avg_rr"]
    if rr >= 3.0:
        grades["avg_rr"] = "excellent"
    elif rr >= 2.0:
        grades["avg_rr"] = "good"
    elif rr >= 1.5:
        grades["avg_rr"] = "minimum"
    else:
        grades["avg_rr"] = "fail"

    n = metrics["total_trades"]
    if n >= 200:
        grades["sample_size"] = "excellent"
    elif n >= 100:
        grades["sample_size"] = "good"
    elif n >= 50:
        grades["sample_size"] = "minimum"
    else:
        grades["sample_size"] = "fail"

    return grades
