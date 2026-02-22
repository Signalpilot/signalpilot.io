"""
Walk-Forward Validation Engine.

The gold standard for testing if a strategy edge is real vs overfit.
Splits data into rolling in-sample (IS) / out-of-sample (OOS) windows,
backtests on each, and computes Walk-Forward Efficiency (WFE).

Key metrics:
- WFE > 50%: Strategy likely has real edge
- WFE 30-50%: Marginal — needs scrutiny
- WFE < 30%: Likely overfit

Also computes Deflated Sharpe Ratio (DSR) that adjusts for multiple
testing / data-snooping bias.
"""

import numpy as np
import pandas as pd
from .backtester import Backtester
from .backtester_leveraged import LeveragedBacktester
from .metrics import compute


def walk_forward(strategy, df: pd.DataFrame, n_windows: int = 5,
                 is_ratio: float = 0.8, backtester_kwargs: dict = None,
                 leveraged: bool = False) -> dict:
    """
    Run walk-forward analysis on a strategy.

    Args:
        strategy: Strategy instance with generate_signals(df) method
        df: OHLCV DataFrame (full history)
        n_windows: Number of rolling IS/OOS windows
        is_ratio: Fraction of each window used for in-sample (e.g. 0.8 = 4:1 IS:OOS)
        backtester_kwargs: Dict of kwargs for Backtester/LeveragedBacktester
        leveraged: Use LeveragedBacktester if True

    Returns:
        {
            "windows": [
                {
                    "window": int,
                    "is_start": datetime, "is_end": datetime,
                    "oos_start": datetime, "oos_end": datetime,
                    "is_bars": int, "oos_bars": int,
                    "is_metrics": dict, "oos_metrics": dict,
                    "is_sharpe": float, "oos_sharpe": float,
                    "wfe": float,  # OOS/IS Sharpe ratio
                }
            ],
            "avg_wfe": float,
            "median_wfe": float,
            "oos_sharpe_avg": float,
            "oos_sharpe_std": float,
            "oos_profit_factor_avg": float,
            "oos_max_drawdown_avg": float,
            "oos_net_return_avg": float,
            "deflated_sharpe": float,
            "total_oos_trades": int,
            "combined_oos_metrics": dict,
            "verdict": str,
        }
    """
    total_bars = len(df)
    if total_bars < 200:
        return {"error": f"Not enough data ({total_bars} bars). Need at least 200."}

    # Calculate window boundaries using anchored walk-forward:
    # Each window advances by a fixed step, IS grows or stays fixed
    step_size = total_bars // (n_windows + 1)
    window_size = int(step_size / (1 - is_ratio))  # Total window size
    is_size = int(window_size * is_ratio)
    oos_size = window_size - is_size

    if oos_size < 30:
        # Fallback: ensure minimum OOS size
        oos_size = max(30, total_bars // (n_windows * 3))
        is_size = oos_size * 4
        window_size = is_size + oos_size

    bt_kwargs = backtester_kwargs or {}
    windows = []
    all_oos_trades = []

    for w in range(n_windows):
        # Sliding window positions
        oos_end_idx = total_bars - (n_windows - w - 1) * oos_size
        oos_start_idx = oos_end_idx - oos_size
        is_start_idx = max(0, oos_start_idx - is_size)

        if is_start_idx >= oos_start_idx or oos_start_idx >= oos_end_idx:
            continue
        if oos_end_idx > total_bars:
            oos_end_idx = total_bars

        # Slice data
        is_data = df.iloc[is_start_idx:oos_start_idx].copy()
        oos_data = df.iloc[oos_start_idx:oos_end_idx].copy()

        if len(is_data) < 50 or len(oos_data) < 10:
            continue

        # Generate signals on each slice independently
        try:
            is_signals = strategy.generate_signals(is_data)
            oos_signals = strategy.generate_signals(oos_data)
        except Exception:
            continue

        # Run backtests
        if leveraged:
            bt_is = LeveragedBacktester(**bt_kwargs)
            bt_oos = LeveragedBacktester(**bt_kwargs)
        else:
            bt_is = Backtester(**bt_kwargs)
            bt_oos = Backtester(**bt_kwargs)

        try:
            is_result = bt_is.run(is_signals)
            oos_result = bt_oos.run(oos_signals)
        except Exception:
            continue

        is_metrics = compute(is_result["trades"], is_result["equity_curve"])
        oos_metrics = compute(oos_result["trades"], oos_result["equity_curve"])

        is_sharpe = is_metrics["sharpe_ratio"]
        oos_sharpe = oos_metrics["sharpe_ratio"]

        # Walk-Forward Efficiency
        if is_sharpe > 0:
            wfe = (oos_sharpe / is_sharpe) * 100
        elif is_sharpe == 0 and oos_sharpe == 0:
            wfe = 0.0
        else:
            wfe = -100.0  # IS was negative, doesn't matter

        all_oos_trades.extend(oos_result["trades"])

        windows.append({
            "window": w + 1,
            "is_start": is_data.index[0],
            "is_end": is_data.index[-1],
            "oos_start": oos_data.index[0],
            "oos_end": oos_data.index[-1],
            "is_bars": len(is_data),
            "oos_bars": len(oos_data),
            "is_metrics": is_metrics,
            "oos_metrics": oos_metrics,
            "is_sharpe": is_sharpe,
            "oos_sharpe": oos_sharpe,
            "is_pf": is_metrics["profit_factor"],
            "oos_pf": oos_metrics["profit_factor"],
            "is_trades": is_metrics["total_trades"],
            "oos_trades": oos_metrics["total_trades"],
            "wfe": round(wfe, 1),
        })

    if not windows:
        return {"error": "No valid walk-forward windows could be created."}

    # Aggregate OOS metrics
    wfe_values = [w["wfe"] for w in windows]
    oos_sharpes = [w["oos_sharpe"] for w in windows]
    oos_pfs = [w["oos_pf"] for w in windows]
    oos_dds = [w["oos_metrics"]["max_drawdown_pct"] for w in windows]
    oos_returns = [w["oos_metrics"]["net_return_pct"] for w in windows]

    avg_wfe = np.mean(wfe_values)
    median_wfe = np.median(wfe_values)
    oos_sharpe_avg = np.mean(oos_sharpes)
    oos_sharpe_std = np.std(oos_sharpes) if len(oos_sharpes) > 1 else 0

    # Combined OOS metrics from all OOS trades
    combined_oos = compute(all_oos_trades, None) if all_oos_trades else {}

    # Deflated Sharpe Ratio
    dsr = _deflated_sharpe(
        observed_sharpe=oos_sharpe_avg,
        n_trials=n_windows,
        n_trades=len(all_oos_trades),
        skew=_skewness(all_oos_trades),
        kurtosis=_kurtosis(all_oos_trades),
    )

    # Verdict
    if avg_wfe >= 50 and oos_sharpe_avg >= 0.8:
        verdict = "REAL EDGE — Walk-forward confirms strategy robustness"
    elif avg_wfe >= 30 and oos_sharpe_avg >= 0.5:
        verdict = "MARGINAL — Some edge detected but needs improvement"
    elif avg_wfe >= 0:
        verdict = "WEAK — Limited out-of-sample performance, likely some overfitting"
    else:
        verdict = "OVERFIT — Strategy fails out-of-sample, edge is illusory"

    return {
        "windows": windows,
        "avg_wfe": round(avg_wfe, 1),
        "median_wfe": round(median_wfe, 1),
        "oos_sharpe_avg": round(oos_sharpe_avg, 2),
        "oos_sharpe_std": round(oos_sharpe_std, 2),
        "oos_profit_factor_avg": round(np.mean(oos_pfs), 2),
        "oos_max_drawdown_avg": round(np.mean(oos_dds), 2),
        "oos_net_return_avg": round(np.mean(oos_returns), 2),
        "deflated_sharpe": round(dsr, 3),
        "total_oos_trades": len(all_oos_trades),
        "combined_oos_metrics": combined_oos,
        "verdict": verdict,
    }


def _deflated_sharpe(observed_sharpe: float, n_trials: int,
                     n_trades: int, skew: float, kurtosis: float) -> float:
    """
    Deflated Sharpe Ratio (Bailey & Lopez de Prado, 2014).

    Adjusts Sharpe for multiple testing bias. Returns the probability
    that the observed Sharpe is greater than what you'd expect from
    random trials.

    DSR > 0.95: Very likely real edge
    DSR 0.5-0.95: Possible edge, more data needed
    DSR < 0.5: Likely data-snooped
    """
    from scipy import stats

    if n_trades < 2 or n_trials < 1:
        return 0.0

    # Expected max Sharpe from random trials (Euler-Mascheroni)
    euler = 0.5772
    e_max_sharpe = (1 - euler) * stats.norm.ppf(1 - 1 / n_trials) + \
                   euler * stats.norm.ppf(1 - 1 / (n_trials * np.e))

    if e_max_sharpe < 0:
        e_max_sharpe = 0

    # Standard error of Sharpe estimate
    se_sharpe = np.sqrt(
        (1 + 0.5 * observed_sharpe**2 - skew * observed_sharpe +
         ((kurtosis - 3) / 4) * observed_sharpe**2) / n_trades
    )

    if se_sharpe <= 0:
        return 0.0

    # DSR = P(SR > E[max SR])
    z = (observed_sharpe - e_max_sharpe) / se_sharpe
    dsr = stats.norm.cdf(z)

    return dsr


def _skewness(trades: list) -> float:
    """Calculate skewness of trade returns."""
    if len(trades) < 3:
        return 0.0
    pnls = np.array([t["pnl_pct"] for t in trades])
    n = len(pnls)
    mean = pnls.mean()
    std = pnls.std()
    if std == 0:
        return 0.0
    return (n / ((n - 1) * (n - 2))) * np.sum(((pnls - mean) / std) ** 3)


def _kurtosis(trades: list) -> float:
    """Calculate excess kurtosis of trade returns."""
    if len(trades) < 4:
        return 3.0
    pnls = np.array([t["pnl_pct"] for t in trades])
    n = len(pnls)
    mean = pnls.mean()
    std = pnls.std()
    if std == 0:
        return 3.0
    kurt = np.mean(((pnls - mean) / std) ** 4)
    return kurt


def print_walk_forward(result: dict, strategy_name: str = "",
                       symbol: str = "", timeframe: str = ""):
    """Pretty-print walk-forward analysis results."""
    from tabulate import tabulate

    if "error" in result:
        print(f"\n  Walk-Forward Error: {result['error']}")
        return

    header = "WALK-FORWARD ANALYSIS"
    if strategy_name:
        header += f" — {strategy_name}"
    if symbol:
        header += f" | {symbol} {timeframe}"

    print(f"\n{'═' * 70}")
    print(f"  {header}")
    print(f"{'═' * 70}")

    # Window details
    rows = []
    for w in result["windows"]:
        rows.append([
            f"W{w['window']}",
            f"{w['is_bars']}",
            f"{w['oos_bars']}",
            f"{w['is_sharpe']:.2f}",
            f"{w['oos_sharpe']:.2f}",
            f"{w['is_pf']:.2f}",
            f"{w['oos_pf']:.2f}",
            f"{w['is_trades']}",
            f"{w['oos_trades']}",
            f"{w['wfe']:.0f}%",
        ])

    print(tabulate(
        rows,
        headers=["Window", "IS Bars", "OOS Bars", "IS Sharpe", "OOS Sharpe",
                  "IS PF", "OOS PF", "IS Trades", "OOS Trades", "WFE"],
        tablefmt="simple",
        numalign="right",
    ))

    # Summary
    print(f"\n{'─' * 50}")
    summary = [
        ["Avg WFE", f"{result['avg_wfe']:.1f}%",
         "★★★" if result['avg_wfe'] >= 50 else ("★★" if result['avg_wfe'] >= 30 else "✗")],
        ["Median WFE", f"{result['median_wfe']:.1f}%", ""],
        ["OOS Sharpe (avg)", f"{result['oos_sharpe_avg']:.2f}",
         "★★★" if result['oos_sharpe_avg'] >= 1.0 else ("★★" if result['oos_sharpe_avg'] >= 0.5 else "✗")],
        ["OOS Sharpe (std)", f"{result['oos_sharpe_std']:.2f}",
         "★★★" if result['oos_sharpe_std'] < 0.5 else ("★★" if result['oos_sharpe_std'] < 1.0 else "✗")],
        ["OOS Profit Factor", f"{result['oos_profit_factor_avg']:.2f}", ""],
        ["OOS Max DD (avg)", f"{result['oos_max_drawdown_avg']:.1f}%", ""],
        ["OOS Net Return (avg)", f"{result['oos_net_return_avg']:.1f}%", ""],
        ["Deflated Sharpe (DSR)", f"{result['deflated_sharpe']:.3f}",
         "★★★" if result['deflated_sharpe'] >= 0.95 else ("★★" if result['deflated_sharpe'] >= 0.5 else "✗")],
        ["Total OOS Trades", result['total_oos_trades'], ""],
    ]

    print(tabulate(summary, headers=["Metric", "Value", "Grade"], tablefmt="simple"))

    print(f"\n  Verdict: {result['verdict']}")
    print()
