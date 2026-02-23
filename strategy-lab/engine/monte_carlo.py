"""
Monte Carlo Simulation Engine.

Tests whether a strategy's edge is genuine or just lucky sequencing.
Two methods:
1. Trade Shuffling — randomize trade order, see if results depend on sequence
2. Trade Skipping — randomly remove trades, see if edge survives

If the edge is real, shuffled/skipped results should cluster near the original.
If it's luck, results will scatter wildly.
"""

import numpy as np
import pandas as pd


def monte_carlo(trades: list, initial_capital: float = 10000,
                n_simulations: int = 1000, skip_pct: float = 0.10,
                confidence: float = 0.95, seed: int = None) -> dict:
    """
    Run Monte Carlo simulation on a list of trades.

    Args:
        trades: List of trade dicts (must have pnl_pct and pnl_dollar)
        initial_capital: Starting capital for equity curve simulation
        n_simulations: Number of random permutations/samples
        skip_pct: Fraction of trades to randomly remove in skip test
        confidence: Confidence level for intervals (0.95 = 95%)
        seed: Random seed for reproducibility

    Returns:
        {
            "original": {net_return, sharpe, max_dd, profit_factor, ...},
            "shuffle": {
                "net_return": {mean, median, p5, p95, std},
                "sharpe": {mean, median, p5, p95, std},
                "max_drawdown": {mean, median, p5, p95, std},
                "profit_factor": {mean, median, p5, p95, std},
                "win_rate": {mean, median, p5, p95, std},
            },
            "skip": { same structure },
            "edge_confidence": float,  # % of shuffles with positive expectancy
            "ruin_probability": float, # % of shuffles hitting >30% drawdown
            "verdict": str,
        }
    """
    if not trades or len(trades) < 5:
        return {"error": f"Need at least 5 trades, got {len(trades)}."}

    rng = np.random.default_rng(seed)

    pnl_pcts = np.array([t["pnl_pct"] for t in trades])
    pnl_dollars = np.array([t.get("pnl_dollar", t.get("pnl", 0)) for t in trades])

    # Original metrics
    original = _compute_mc_metrics(pnl_pcts, pnl_dollars, initial_capital)

    # --- Trade Shuffling ---
    shuffle_results = _run_shuffle(pnl_pcts, pnl_dollars, initial_capital,
                                   n_simulations, rng)

    # --- Trade Skipping ---
    skip_results = _run_skip(pnl_pcts, pnl_dollars, initial_capital,
                             n_simulations, skip_pct, rng)

    # Edge confidence: % of shuffle simulations with positive net return
    edge_confidence = np.mean(shuffle_results["net_returns"] > 0) * 100

    # Ruin probability: % of simulations hitting >30% drawdown
    ruin_probability = np.mean(shuffle_results["max_dds"] > 30) * 100

    # Skip survival: % of skip simulations still profitable
    skip_survival = np.mean(skip_results["net_returns"] > 0) * 100

    alpha = 1 - confidence
    p_low = alpha / 2 * 100
    p_high = (1 - alpha / 2) * 100

    shuffle_summary = _summarize(shuffle_results, p_low, p_high)
    skip_summary = _summarize(skip_results, p_low, p_high)

    # Verdict
    if edge_confidence >= 95 and skip_survival >= 90 and ruin_probability < 5:
        verdict = "ROBUST EDGE — Survives both shuffle and skip tests with high confidence"
    elif edge_confidence >= 80 and skip_survival >= 75:
        verdict = "PROBABLE EDGE — Results are likely not due to luck, but some fragility exists"
    elif edge_confidence >= 60:
        verdict = "UNCERTAIN — Edge may exist but is sensitive to trade sequence/selection"
    else:
        verdict = "NO EDGE — Results are likely due to lucky trade sequencing"

    return {
        "n_trades": len(trades),
        "n_simulations": n_simulations,
        "skip_pct": skip_pct,
        "confidence_level": confidence,
        "original": original,
        "shuffle": shuffle_summary,
        "skip": skip_summary,
        "edge_confidence": round(edge_confidence, 1),
        "skip_survival": round(skip_survival, 1),
        "ruin_probability": round(ruin_probability, 1),
        "verdict": verdict,
    }


def _compute_mc_metrics(pnl_pcts: np.ndarray, pnl_dollars: np.ndarray,
                        initial_capital: float) -> dict:
    """Compute metrics from arrays of P&L values."""
    net_return = pnl_pcts.sum()

    wins = pnl_pcts[pnl_pcts > 0]
    losses = pnl_pcts[pnl_pcts < 0]
    win_rate = len(wins) / len(pnl_pcts) * 100 if len(pnl_pcts) > 0 else 0

    gross_profit = wins.sum() if len(wins) > 0 else 0
    gross_loss = abs(losses.sum()) if len(losses) > 0 else 0
    profit_factor = gross_profit / gross_loss if gross_loss > 0 else float("inf")

    # Sharpe from trade returns
    if len(pnl_pcts) > 1 and pnl_pcts.std() > 0:
        sharpe = (pnl_pcts.mean() / pnl_pcts.std()) * np.sqrt(min(len(pnl_pcts), 252))
    else:
        sharpe = 0.0

    # Max drawdown from cumulative equity
    equity = initial_capital + np.cumsum(pnl_dollars)
    peak = np.maximum.accumulate(equity)
    dd_pct = (equity - peak) / peak * 100
    max_dd = abs(dd_pct.min()) if len(dd_pct) > 0 else 0

    expectancy = pnl_pcts.mean()

    return {
        "net_return": round(net_return, 2),
        "sharpe": round(sharpe, 2),
        "max_drawdown": round(max_dd, 2),
        "profit_factor": round(min(profit_factor, 99.99), 2),
        "win_rate": round(win_rate, 1),
        "expectancy": round(expectancy, 3),
        "total_trades": len(pnl_pcts),
    }


def _run_shuffle(pnl_pcts: np.ndarray, pnl_dollars: np.ndarray,
                 initial_capital: float, n_sims: int,
                 rng: np.random.Generator) -> dict:
    """Shuffle trade order n_sims times, compute metrics for each."""
    n = len(pnl_pcts)
    net_returns = np.zeros(n_sims)
    sharpes = np.zeros(n_sims)
    max_dds = np.zeros(n_sims)
    profit_factors = np.zeros(n_sims)
    win_rates = np.zeros(n_sims)

    for i in range(n_sims):
        idx = rng.permutation(n)
        shuffled_pcts = pnl_pcts[idx]
        shuffled_dollars = pnl_dollars[idx]

        net_returns[i] = shuffled_pcts.sum()

        wins = shuffled_pcts[shuffled_pcts > 0]
        losses = shuffled_pcts[shuffled_pcts < 0]
        gp = wins.sum() if len(wins) > 0 else 0
        gl = abs(losses.sum()) if len(losses) > 0 else 0
        profit_factors[i] = min(gp / gl if gl > 0 else 99.99, 99.99)
        win_rates[i] = len(wins) / n * 100

        if n > 1 and shuffled_pcts.std() > 0:
            sharpes[i] = (shuffled_pcts.mean() / shuffled_pcts.std()) * np.sqrt(min(n, 252))

        equity = initial_capital + np.cumsum(shuffled_dollars)
        peak = np.maximum.accumulate(equity)
        dd = (equity - peak) / np.where(peak > 0, peak, 1) * 100
        max_dds[i] = abs(dd.min()) if len(dd) > 0 else 0

    return {
        "net_returns": net_returns,
        "sharpes": sharpes,
        "max_dds": max_dds,
        "profit_factors": profit_factors,
        "win_rates": win_rates,
    }


def _run_skip(pnl_pcts: np.ndarray, pnl_dollars: np.ndarray,
              initial_capital: float, n_sims: int, skip_pct: float,
              rng: np.random.Generator) -> dict:
    """Randomly remove skip_pct of trades n_sims times."""
    n = len(pnl_pcts)
    n_keep = max(1, int(n * (1 - skip_pct)))
    net_returns = np.zeros(n_sims)
    sharpes = np.zeros(n_sims)
    max_dds = np.zeros(n_sims)
    profit_factors = np.zeros(n_sims)
    win_rates = np.zeros(n_sims)

    for i in range(n_sims):
        idx = rng.choice(n, size=n_keep, replace=False)
        idx.sort()  # Maintain chronological order
        kept_pcts = pnl_pcts[idx]
        kept_dollars = pnl_dollars[idx]

        net_returns[i] = kept_pcts.sum()

        wins = kept_pcts[kept_pcts > 0]
        losses = kept_pcts[kept_pcts < 0]
        gp = wins.sum() if len(wins) > 0 else 0
        gl = abs(losses.sum()) if len(losses) > 0 else 0
        profit_factors[i] = min(gp / gl if gl > 0 else 99.99, 99.99)
        win_rates[i] = len(wins) / len(kept_pcts) * 100 if len(kept_pcts) > 0 else 0

        if len(kept_pcts) > 1 and kept_pcts.std() > 0:
            sharpes[i] = (kept_pcts.mean() / kept_pcts.std()) * np.sqrt(min(len(kept_pcts), 252))

        equity = initial_capital + np.cumsum(kept_dollars)
        peak = np.maximum.accumulate(equity)
        dd = (equity - peak) / np.where(peak > 0, peak, 1) * 100
        max_dds[i] = abs(dd.min()) if len(dd) > 0 else 0

    return {
        "net_returns": net_returns,
        "sharpes": sharpes,
        "max_dds": max_dds,
        "profit_factors": profit_factors,
        "win_rates": win_rates,
    }


def _summarize(results: dict, p_low: float, p_high: float) -> dict:
    """Compute summary statistics for simulation results."""
    summary = {}
    metric_map = {
        "net_return": "net_returns",
        "sharpe": "sharpes",
        "max_drawdown": "max_dds",
        "profit_factor": "profit_factors",
        "win_rate": "win_rates",
    }

    for label, key in metric_map.items():
        arr = results[key]
        summary[label] = {
            "mean": round(float(np.mean(arr)), 2),
            "median": round(float(np.median(arr)), 2),
            f"p{int(p_low)}": round(float(np.percentile(arr, p_low)), 2),
            f"p{int(p_high)}": round(float(np.percentile(arr, p_high)), 2),
            "std": round(float(np.std(arr)), 2),
        }

    return summary


def print_monte_carlo(result: dict, strategy_name: str = ""):
    """Pretty-print Monte Carlo simulation results."""
    from tabulate import tabulate

    if "error" in result:
        print(f"\n  Monte Carlo Error: {result['error']}")
        return

    header = "MONTE CARLO SIMULATION"
    if strategy_name:
        header += f" — {strategy_name}"

    print(f"\n{'═' * 70}")
    print(f"  {header}")
    print(f"  {result['n_trades']} trades x {result['n_simulations']} simulations")
    print(f"{'═' * 70}")

    # Original vs Shuffle comparison
    orig = result["original"]
    shuf = result["shuffle"]
    skip = result["skip"]

    rows = []
    for metric, label in [("net_return", "Net Return %"),
                          ("sharpe", "Sharpe Ratio"),
                          ("max_drawdown", "Max Drawdown %"),
                          ("profit_factor", "Profit Factor"),
                          ("win_rate", "Win Rate %")]:
        s = shuf[metric]
        k = skip[metric]
        p_keys = [key for key in s.keys() if key.startswith("p")]
        p_low_key = min(p_keys, key=lambda x: int(x[1:]))
        p_high_key = max(p_keys, key=lambda x: int(x[1:]))

        rows.append([
            label,
            f"{orig[metric]:.2f}" if metric != "win_rate" else f"{orig[metric]:.1f}",
            f"{s['median']:.2f}",
            f"[{s[p_low_key]:.2f}, {s[p_high_key]:.2f}]",
            f"{k['median']:.2f}",
            f"[{k[p_low_key]:.2f}, {k[p_high_key]:.2f}]",
        ])

    print(f"\n  Trade Shuffling ({result['n_simulations']}x) + Trade Skipping ({int(result['skip_pct']*100)}% removed)")
    print(tabulate(
        rows,
        headers=["Metric", "Original", "Shuffle Med", "Shuffle CI", "Skip Med", "Skip CI"],
        tablefmt="simple",
        numalign="right",
    ))

    # Confidence metrics
    print(f"\n{'─' * 50}")
    conf_rows = [
        ["Edge Confidence", f"{result['edge_confidence']:.1f}%",
         "★★★" if result['edge_confidence'] >= 95 else (
             "★★" if result['edge_confidence'] >= 80 else "✗")],
        ["Skip Survival", f"{result['skip_survival']:.1f}%",
         "★★★" if result['skip_survival'] >= 90 else (
             "★★" if result['skip_survival'] >= 75 else "✗")],
        ["Ruin Probability", f"{result['ruin_probability']:.1f}%",
         "★★★" if result['ruin_probability'] < 5 else (
             "★★" if result['ruin_probability'] < 15 else "✗")],
    ]
    print(tabulate(conf_rows, headers=["Metric", "Value", "Grade"], tablefmt="simple"))

    print(f"\n  Verdict: {result['verdict']}")
    print()
