"""
Portfolio Orchestrator.

Runs multiple strategies across multiple instruments, combines equity curves,
and measures diversification benefit.

Key insight from research: N uncorrelated strategies of Sharpe S
combine to Sharpe = S * sqrt(N). This is how Medallion runs.
"""

import numpy as np
import pandas as pd
from .data_fetcher import fetch
from .backtester import Backtester
from .backtester_leveraged import LeveragedBacktester
from .metrics import compute


def run_portfolio(configs: list, backtester_kwargs: dict = None,
                  allocation: str = "equal",
                  initial_capital: float = 10000) -> dict:
    """
    Run a portfolio of strategies and combine results.

    Args:
        configs: List of dicts, each with:
            {
                "strategy": strategy_instance,
                "symbol": "BTCUSD",
                "timeframe": "H4",
                "leveraged": False,
                "bt_kwargs": {},     # optional per-strategy overrides
                "weight": 0.25,      # optional for weighted allocation
            }
        backtester_kwargs: Default kwargs for all backtesters
        allocation: "equal" or "weighted" (uses config weights)
        initial_capital: Total portfolio capital

    Returns:
        {
            "strategies": [
                {
                    "name": str,
                    "symbol": str,
                    "timeframe": str,
                    "metrics": dict,
                    "trades": list,
                    "equity_curve": pd.Series,
                    "weight": float,
                }
            ],
            "portfolio_metrics": dict,
            "portfolio_equity": pd.Series,
            "diversification_ratio": float,
            "correlation_matrix": pd.DataFrame,
            "sharpe_improvement": float,
            "verdict": str,
        }
    """
    if not configs:
        return {"error": "No strategy configurations provided."}

    bt_defaults = backtester_kwargs or {}
    n_strategies = len(configs)

    # Assign weights
    if allocation == "equal":
        weights = [1.0 / n_strategies] * n_strategies
    else:
        total_w = sum(c.get("weight", 1.0 / n_strategies) for c in configs)
        weights = [c.get("weight", 1.0 / n_strategies) / total_w for c in configs]

    results = []
    errors = []

    # Commission rates (same as run.py)
    commissions = {
        "XAUUSD": 0.01, "XAGUSD": 0.01, "WTIUSD": 0.01,
        "NGUSD": 0.01, "COPPUSD": 0.01,
        "NAS100": 0.02, "SP500": 0.02, "DOW30": 0.02, "RUSS2K": 0.02,
        "USDJPY": 0.01, "EURUSD": 0.01, "GBPUSD": 0.01,
        "AUDUSD": 0.01, "USDCAD": 0.01, "GBPJPY": 0.01, "EURJPY": 0.01,
    }

    for i, config in enumerate(configs):
        strategy = config["strategy"]
        symbol = config["symbol"]
        timeframe = config["timeframe"]
        leveraged = config.get("leveraged", False)
        bt_kwargs = {**bt_defaults, **config.get("bt_kwargs", {})}
        weight = weights[i]
        capital = initial_capital * weight

        try:
            df = fetch(symbol, timeframe)
            df = strategy.generate_signals(df)

            if leveraged:
                bt = LeveragedBacktester(initial_capital=capital, **bt_kwargs)
            else:
                commission = commissions.get(symbol, 0.05)
                kw = {"initial_capital": capital, "commission_pct": commission,
                      "slippage_pct": 0.01, "risk_per_trade_pct": 1.0}
                kw.update(bt_kwargs)
                bt = Backtester(**kw)

            result = bt.run(df)
            metrics = compute(result["trades"], result["equity_curve"])

            results.append({
                "name": f"{strategy.name}_v{strategy.version}",
                "symbol": symbol,
                "timeframe": timeframe,
                "metrics": metrics,
                "trades": result["trades"],
                "equity_curve": result["equity_curve"],
                "weight": weight,
            })

        except Exception as e:
            errors.append(f"{strategy.name} {symbol} {timeframe}: {e}")

    if not results:
        return {"error": f"All strategies failed: {'; '.join(errors)}"}

    # Combine equity curves
    portfolio_equity = _combine_equity_curves(results, initial_capital)

    # Portfolio-level metrics
    all_trades = []
    for r in results:
        all_trades.extend(r["trades"])
    all_trades.sort(key=lambda t: t.get("entry_time") or pd.Timestamp.min)

    portfolio_metrics = compute(all_trades, portfolio_equity)

    # Correlation matrix of daily returns
    corr_matrix = _correlation_matrix(results)

    # Diversification metrics
    individual_sharpes = [r["metrics"]["sharpe_ratio"] for r in results]
    avg_individual_sharpe = np.mean(individual_sharpes) if individual_sharpes else 0
    portfolio_sharpe = portfolio_metrics["sharpe_ratio"]

    # Theoretical max: S * sqrt(N) if all uncorrelated
    theoretical_max = avg_individual_sharpe * np.sqrt(len(results)) if avg_individual_sharpe > 0 else 0

    # Diversification ratio: how much of theoretical benefit we capture
    if theoretical_max > 0:
        div_ratio = portfolio_sharpe / theoretical_max
    else:
        div_ratio = 0

    # Sharpe improvement over best individual
    best_individual = max(individual_sharpes) if individual_sharpes else 0
    sharpe_improvement = ((portfolio_sharpe - best_individual) / best_individual * 100
                          if best_individual > 0 else 0)

    # Verdict
    if portfolio_sharpe >= 1.5 and div_ratio >= 0.5:
        verdict = "STRONG PORTFOLIO — Meaningful diversification benefit captured"
    elif portfolio_sharpe >= 1.0:
        verdict = "VIABLE PORTFOLIO — Combined edge is real, diversification helps"
    elif portfolio_sharpe >= 0.5:
        verdict = "MARGINAL PORTFOLIO — Some benefit from combination, needs stronger individual strategies"
    else:
        verdict = "WEAK PORTFOLIO — Individual strategies too weak to combine effectively"

    return {
        "strategies": [{k: v for k, v in r.items() if k != "trades"}
                       for r in results],
        "errors": errors,
        "portfolio_metrics": portfolio_metrics,
        "portfolio_equity": portfolio_equity,
        "individual_sharpes": {f"{r['name']}_{r['symbol']}_{r['timeframe']}":
                               r["metrics"]["sharpe_ratio"] for r in results},
        "avg_individual_sharpe": round(avg_individual_sharpe, 2),
        "portfolio_sharpe": portfolio_sharpe,
        "theoretical_max_sharpe": round(theoretical_max, 2),
        "diversification_ratio": round(div_ratio, 2),
        "sharpe_improvement": round(sharpe_improvement, 1),
        "correlation_matrix": corr_matrix,
        "all_trades": all_trades,
        "verdict": verdict,
    }


def _combine_equity_curves(results: list, initial_capital: float) -> pd.Series:
    """
    Combine individual equity curves into a portfolio equity curve.

    Each strategy's equity is weighted and summed. Uses union of all timestamps.
    """
    # Collect all equity curves, normalized to returns
    curves = {}
    for r in results:
        ec = r["equity_curve"].dropna()
        if len(ec) < 2:
            continue
        label = f"{r['name']}_{r['symbol']}_{r['timeframe']}"
        curves[label] = ec

    if not curves:
        return pd.Series(dtype=float)

    # Align all curves on union of timestamps, forward-fill
    combined_df = pd.DataFrame(curves)
    combined_df = combined_df.sort_index()
    combined_df = combined_df.ffill()

    # Sum all equity curves (each already sized by its weight allocation)
    portfolio = combined_df.sum(axis=1)

    return portfolio


def _correlation_matrix(results: list) -> pd.DataFrame:
    """
    Compute pairwise correlation of strategy returns.

    Uses daily returns from equity curves. Low correlation = good diversification.
    """
    returns = {}
    for r in results:
        ec = r["equity_curve"].dropna()
        if len(ec) < 10:
            continue
        label = f"{r['name']}_{r['symbol']}"
        daily = ec.pct_change().dropna()
        if len(daily) > 0:
            returns[label] = daily

    if len(returns) < 2:
        return pd.DataFrame()

    df = pd.DataFrame(returns)
    # Align on common index
    df = df.dropna()
    if len(df) < 5:
        return pd.DataFrame()

    return df.corr().round(3)


def print_portfolio(result: dict):
    """Pretty-print portfolio analysis results."""
    from tabulate import tabulate

    if "error" in result:
        print(f"\n  Portfolio Error: {result['error']}")
        return

    print(f"\n{'═' * 70}")
    print(f"  PORTFOLIO ANALYSIS")
    print(f"{'═' * 70}")

    # Individual strategy performance
    rows = []
    for s in result["strategies"]:
        m = s["metrics"]
        rows.append([
            f"{s['name']}",
            s['symbol'],
            s['timeframe'],
            f"{s['weight']*100:.0f}%",
            m["total_trades"],
            m["sharpe_ratio"],
            m["profit_factor"],
            f"{m['max_drawdown_pct']:.1f}%",
            f"{m['net_return_pct']:.1f}%",
        ])

    print(f"\n  Individual Strategies:")
    print(tabulate(
        rows,
        headers=["Strategy", "Symbol", "TF", "Weight", "Trades",
                 "Sharpe", "PF", "MaxDD", "Net%"],
        tablefmt="simple",
        numalign="right",
    ))

    # Portfolio summary
    pm = result["portfolio_metrics"]
    print(f"\n{'─' * 50}")
    print(f"  Portfolio Combined:")
    summary = [
        ["Total Trades", pm["total_trades"]],
        ["Portfolio Sharpe", pm["sharpe_ratio"]],
        ["Profit Factor", pm["profit_factor"]],
        ["Max Drawdown", f"{pm['max_drawdown_pct']:.1f}%"],
        ["Net Return", f"{pm['net_return_pct']:.1f}%"],
        ["Win Rate", f"{pm['win_rate']}%"],
    ]
    print(tabulate(summary, headers=["Metric", "Value"], tablefmt="simple"))

    # Diversification analysis
    print(f"\n{'─' * 50}")
    print(f"  Diversification Analysis:")
    div_rows = [
        ["Avg Individual Sharpe", f"{result['avg_individual_sharpe']:.2f}"],
        ["Portfolio Sharpe", f"{result['portfolio_sharpe']:.2f}"],
        ["Theoretical Max (if uncorrelated)", f"{result['theoretical_max_sharpe']:.2f}"],
        ["Diversification Ratio", f"{result['diversification_ratio']:.2f}",],
        ["Sharpe Improvement vs Best", f"{result['sharpe_improvement']:.1f}%"],
    ]
    print(tabulate(div_rows, headers=["Metric", "Value"], tablefmt="simple"))

    # Correlation matrix
    corr = result.get("correlation_matrix")
    if corr is not None and not corr.empty:
        print(f"\n  Correlation Matrix:")
        print(corr.to_string())

    if result.get("errors"):
        print(f"\n  Errors: {', '.join(result['errors'])}")

    print(f"\n  Verdict: {result['verdict']}")
    print()
