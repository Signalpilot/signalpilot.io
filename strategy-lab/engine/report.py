"""
Report generator — pretty-prints backtest results.
"""

from tabulate import tabulate
from .metrics import grade


GRADE_SYMBOLS = {
    "excellent": "★★★",
    "good": "★★",
    "minimum": "★",
    "fail": "✗",
}


def print_results(symbol: str, timeframe: str, metrics: dict):
    """Print formatted results for a single backtest run."""
    grades = grade(metrics)

    print(f"\n{'─' * 60}")
    print(f"  {symbol} | {timeframe}")
    print(f"{'─' * 60}")

    rows = [
        ["Total Trades", metrics["total_trades"], grades.get("sample_size", "")],
        ["Win Rate", f"{metrics['win_rate']}%", ""],
        ["Profit Factor", metrics["profit_factor"], grades.get("profit_factor", "")],
        ["Sharpe Ratio", metrics["sharpe_ratio"], grades.get("sharpe_ratio", "")],
        ["Max Drawdown", f"{metrics['max_drawdown_pct']}%", grades.get("max_drawdown", "")],
        ["Net Return", f"{metrics['net_return_pct']}%", ""],
        ["Avg R:R", f"{metrics['avg_rr']}:1", grades.get("avg_rr", "")],
        ["Avg Win", f"{metrics['avg_win_pct']}%", ""],
        ["Avg Loss", f"{metrics['avg_loss_pct']}%", ""],
        ["Best Trade", f"{metrics['best_trade_pct']}%", ""],
        ["Worst Trade", f"{metrics['worst_trade_pct']}%", ""],
        ["Expectancy", f"{metrics['expectancy_pct']}%", ""],
        ["Win Streak", metrics["win_streak"], ""],
        ["Loss Streak", metrics["loss_streak"], ""],
        ["Avg Duration", f"{metrics['avg_duration_hrs']}h", ""],
    ]

    # Replace grade keys with symbols
    for row in rows:
        if row[2] in GRADE_SYMBOLS:
            row[2] = GRADE_SYMBOLS[row[2]]

    print(tabulate(rows, headers=["Metric", "Value", "Grade"], tablefmt="simple"))


def print_summary(all_results: dict):
    """
    Print a summary table across all symbol/timeframe combinations.

    all_results: {(symbol, timeframe): metrics_dict}
    """
    print(f"\n{'═' * 70}")
    print(f"  STRATEGY PERFORMANCE SUMMARY")
    print(f"{'═' * 70}")

    rows = []
    for (symbol, tf), m in sorted(all_results.items()):
        grades = grade(m)
        pass_count = sum(1 for v in grades.values() if v != "fail")
        total_checks = len(grades)

        rows.append([
            f"{symbol}/{tf}",
            m["total_trades"],
            f"{m['win_rate']}%",
            m["profit_factor"],
            m["sharpe_ratio"],
            f"{m['max_drawdown_pct']}%",
            f"{m['net_return_pct']}%",
            f"{m['avg_rr']}:1",
            f"{pass_count}/{total_checks}",
        ])

    print(tabulate(
        rows,
        headers=["Pair/TF", "Trades", "WR%", "PF", "Sharpe", "MaxDD", "Net%", "R:R", "Pass"],
        tablefmt="simple",
        numalign="right",
    ))

    # Overall verdict
    all_grades = {}
    for (_, _), m in all_results.items():
        for k, v in grade(m).items():
            all_grades.setdefault(k, []).append(v)

    fails = sum(1 for vs in all_grades.values() for v in vs if v == "fail")
    total = sum(len(vs) for vs in all_grades.values())
    pass_rate = ((total - fails) / total * 100) if total > 0 else 0

    print(f"\n  Overall pass rate: {pass_rate:.0f}% ({total - fails}/{total} checks passed)")

    if pass_rate >= 80:
        print("  Verdict: STRATEGY IS VIABLE — ready for Pine Script export")
    elif pass_rate >= 60:
        print("  Verdict: PROMISING — needs iteration on weak areas")
    else:
        print("  Verdict: NEEDS WORK — significant changes required")
    print()
