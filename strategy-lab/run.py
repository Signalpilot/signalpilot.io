#!/usr/bin/env python3
"""
Strategy Lab — Pipeline CLI

Usage:
    python3 run.py backtest    --strategy <name> [--symbols SYM1,SYM2] [--timeframes TF1,TF2]
    python3 run.py walkforward --strategy <name> [--symbols SYM1,SYM2] [--timeframes TF1,TF2] [--windows 5]
    python3 run.py montecarlo  --strategy <name> [--symbols SYM1,SYM2] [--timeframes TF1,TF2] [--sims 1000]
    python3 run.py portfolio   --strategies s1,s2 [--symbols SYM1,SYM2] [--timeframes TF1,TF2]
    python3 run.py export      --strategy <name> [--output <path>]
    python3 run.py fetch       [--symbols SYM1,SYM2] [--timeframes TF1,TF2]
    python3 run.py list

The autonomous loop:
    RESEARCH → CODE → BACKTEST → VALIDATE → SIMULATE → COMBINE → EXPORT
"""

import sys
import argparse
import importlib
import importlib.util
from pathlib import Path

# Ensure strategy-lab is on the path
ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT))


DEFAULT_SYMBOLS = ["XAUUSD", "NAS100", "USDJPY", "BTCUSD"]
DEFAULT_TIMEFRAMES = ["M30", "H1", "H2", "H4"]

CRYPTO_SYMBOLS = ["BTCUSD", "ETHUSD", "SOLUSD"]
CRYPTO_TIMEFRAMES = ["H4"]

# Strategies that use the leveraged backtester
LEVERAGED_STRATEGIES = {"crypto_leverage"}


def load_strategy(name: str):
    """Dynamically load a strategy module by name."""
    strategy_dir = ROOT / "strategies"
    module_path = strategy_dir / f"{name}.py"

    if not module_path.exists():
        available = [f.stem for f in strategy_dir.glob("*.py") if f.stem != "__init__"]
        print(f"Error: Strategy '{name}' not found.")
        print(f"Available strategies: {', '.join(available) if available else 'none'}")
        sys.exit(1)

    spec = importlib.util.spec_from_file_location(name, module_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    if hasattr(module, "Strategy"):
        return module.Strategy()
    else:
        # Find first class in module
        for attr_name in dir(module):
            attr = getattr(module, attr_name)
            if isinstance(attr, type) and hasattr(attr, "generate_signals"):
                return attr()

    print(f"Error: No strategy class found in {name}.py")
    sys.exit(1)


def cmd_backtest(args):
    """Run backtests across all symbol/timeframe combinations."""
    from engine.data_fetcher import fetch
    from engine.backtester import Backtester
    from engine.backtester_leveraged import LeveragedBacktester
    from engine.metrics import compute
    from engine.report import print_results, print_summary

    strategy = load_strategy(args.strategy)
    is_leveraged = strategy.name in LEVERAGED_STRATEGIES
    leverage = getattr(args, "leverage", None) or getattr(strategy, "params", {}).get("leverage", 1)

    # Auto-select crypto defaults for leveraged strategies
    if is_leveraged:
        symbols = args.symbols.split(",") if args.symbols else CRYPTO_SYMBOLS
        timeframes = args.timeframes.split(",") if args.timeframes else CRYPTO_TIMEFRAMES
    else:
        symbols = args.symbols.split(",") if args.symbols else DEFAULT_SYMBOLS
        timeframes = args.timeframes.split(",") if args.timeframes else DEFAULT_TIMEFRAMES

    print(f"\n{'═' * 70}")
    print(f"  STRATEGY LAB — Backtesting: {strategy.name} v{strategy.version}")
    if is_leveraged:
        print(f"  Mode: LEVERAGED PERPS ({leverage}x)")
    print(f"  Symbols: {', '.join(symbols)}")
    print(f"  Timeframes: {', '.join(timeframes)}")
    print(f"{'═' * 70}")

    # Commission rates per instrument type (default 0.05 for crypto)
    commissions = {
        "XAUUSD": 0.01,   # Commodity
        "XAGUSD": 0.01,   # Commodity
        "WTIUSD": 0.01,   # Commodity
        "NGUSD":  0.01,   # Commodity
        "COPPUSD": 0.01,  # Commodity
        "NAS100": 0.02,   # Index
        "USTEC":  0.02,   # Index alias
        "SP500":  0.02,   # Index
        "DOW30":  0.02,   # Index
        "RUSS2K": 0.02,   # Index
        "USDJPY": 0.01,   # Forex
        "EURUSD": 0.01,   # Forex
        "GBPUSD": 0.01,   # Forex
        "AUDUSD": 0.01,   # Forex
        "USDCAD": 0.01,   # Forex
        "GBPJPY": 0.01,   # Forex
        "EURJPY": 0.01,   # Forex
    }
    # Default: 0.05 for all crypto

    print("\n  Fetching data...")
    all_results = {}
    total_liquidations = 0
    total_funding = 0.0

    for symbol in symbols:
        for tf in timeframes:
            try:
                # Fetch data
                df = fetch(symbol, tf)
                print(f"  ✓ {symbol} {tf}: {len(df)} bars")

                # Generate signals
                df = strategy.generate_signals(df)

                # Count signals
                n_long = (df["signal"] == 1).sum()
                n_short = (df["signal"] == -1).sum()
                print(f"    Signals: {n_long} long, {n_short} short")

                # Run backtest (leveraged or standard)
                if is_leveraged:
                    bt = LeveragedBacktester(
                        initial_capital=10000,
                        leverage=leverage,
                        maker_fee_pct=0.02,
                        taker_fee_pct=0.04,
                        slippage_pct=0.02,
                        risk_per_trade_pct=1.0,
                        funding_rate_pct=0.01,
                    )
                else:
                    commission = commissions.get(symbol, 0.05)
                    bt = Backtester(
                        initial_capital=10000,
                        commission_pct=commission,
                        slippage_pct=0.01,
                        risk_per_trade_pct=1.0,
                    )

                result = bt.run(df)

                # Print leveraged-specific info
                if is_leveraged:
                    liqs = result.get("liquidations", 0)
                    fund = result.get("total_funding_paid", 0)
                    total_liquidations += liqs
                    total_funding += fund
                    if liqs > 0:
                        print(f"    ⚠ Liquidations: {liqs}")
                    print(f"    Funding paid: ${fund:.2f}")

                # Compute metrics
                metrics = compute(result["trades"], result["equity_curve"])
                all_results[(symbol, tf)] = metrics

                # Print individual results
                print_results(symbol, tf, metrics)

            except Exception as e:
                print(f"  ✗ {symbol} {tf}: {e}")

    # Print summary
    if all_results:
        print_summary(all_results)
        if is_leveraged:
            print(f"  Leverage: {leverage}x | Liquidations: {total_liquidations} | Total funding: ${total_funding:.2f}\n")

    return all_results


def cmd_walkforward(args):
    """Run walk-forward validation to test if edge is real."""
    from engine.data_fetcher import fetch
    from engine.walk_forward import walk_forward, print_walk_forward
    from engine.backtester import Backtester
    from engine.backtester_leveraged import LeveragedBacktester

    strategy = load_strategy(args.strategy)
    is_leveraged = strategy.name in LEVERAGED_STRATEGIES
    leverage = getattr(args, "leverage", None) or getattr(strategy, "params", {}).get("leverage", 1)

    if is_leveraged:
        symbols = args.symbols.split(",") if args.symbols else CRYPTO_SYMBOLS
        timeframes = args.timeframes.split(",") if args.timeframes else CRYPTO_TIMEFRAMES
    else:
        symbols = args.symbols.split(",") if args.symbols else DEFAULT_SYMBOLS
        timeframes = args.timeframes.split(",") if args.timeframes else DEFAULT_TIMEFRAMES

    n_windows = getattr(args, "windows", 5) or 5

    commissions = {
        "XAUUSD": 0.01, "XAGUSD": 0.01, "WTIUSD": 0.01,
        "NGUSD": 0.01, "COPPUSD": 0.01,
        "NAS100": 0.02, "SP500": 0.02, "DOW30": 0.02, "RUSS2K": 0.02,
        "USDJPY": 0.01, "EURUSD": 0.01, "GBPUSD": 0.01,
        "AUDUSD": 0.01, "USDCAD": 0.01, "GBPJPY": 0.01, "EURJPY": 0.01,
    }

    for symbol in symbols:
        for tf in timeframes:
            try:
                df = fetch(symbol, tf)
                print(f"\n  Fetched {symbol} {tf}: {len(df)} bars")

                bt_kwargs = {}
                if is_leveraged:
                    bt_kwargs = {
                        "leverage": leverage,
                        "maker_fee_pct": 0.02,
                        "taker_fee_pct": 0.04,
                        "slippage_pct": 0.02,
                        "risk_per_trade_pct": 1.0,
                        "funding_rate_pct": 0.01,
                    }
                else:
                    commission = commissions.get(symbol, 0.05)
                    bt_kwargs = {
                        "commission_pct": commission,
                        "slippage_pct": 0.01,
                        "risk_per_trade_pct": 1.0,
                    }

                result = walk_forward(
                    strategy, df,
                    n_windows=n_windows,
                    backtester_kwargs=bt_kwargs,
                    leveraged=is_leveraged,
                )
                print_walk_forward(result, strategy.name, symbol, tf)

            except Exception as e:
                print(f"  ✗ {symbol} {tf}: {e}")


def cmd_montecarlo(args):
    """Run Monte Carlo simulation to test edge robustness."""
    from engine.data_fetcher import fetch
    from engine.backtester import Backtester
    from engine.backtester_leveraged import LeveragedBacktester
    from engine.monte_carlo import monte_carlo, print_monte_carlo

    strategy = load_strategy(args.strategy)
    is_leveraged = strategy.name in LEVERAGED_STRATEGIES
    leverage = getattr(args, "leverage", None) or getattr(strategy, "params", {}).get("leverage", 1)

    if is_leveraged:
        symbols = args.symbols.split(",") if args.symbols else CRYPTO_SYMBOLS
        timeframes = args.timeframes.split(",") if args.timeframes else CRYPTO_TIMEFRAMES
    else:
        symbols = args.symbols.split(",") if args.symbols else DEFAULT_SYMBOLS
        timeframes = args.timeframes.split(",") if args.timeframes else DEFAULT_TIMEFRAMES

    n_sims = getattr(args, "sims", 1000) or 1000

    commissions = {
        "XAUUSD": 0.01, "XAGUSD": 0.01, "WTIUSD": 0.01,
        "NGUSD": 0.01, "COPPUSD": 0.01,
        "NAS100": 0.02, "SP500": 0.02, "DOW30": 0.02, "RUSS2K": 0.02,
        "USDJPY": 0.01, "EURUSD": 0.01, "GBPUSD": 0.01,
        "AUDUSD": 0.01, "USDCAD": 0.01, "GBPJPY": 0.01, "EURJPY": 0.01,
    }

    for symbol in symbols:
        for tf in timeframes:
            try:
                df = fetch(symbol, tf)
                print(f"\n  Fetched {symbol} {tf}: {len(df)} bars")

                df = strategy.generate_signals(df)

                if is_leveraged:
                    bt = LeveragedBacktester(
                        initial_capital=10000, leverage=leverage,
                        maker_fee_pct=0.02, taker_fee_pct=0.04,
                        slippage_pct=0.02, risk_per_trade_pct=1.0,
                        funding_rate_pct=0.01,
                    )
                else:
                    commission = commissions.get(symbol, 0.05)
                    bt = Backtester(
                        initial_capital=10000, commission_pct=commission,
                        slippage_pct=0.01, risk_per_trade_pct=1.0,
                    )

                result = bt.run(df)

                if not result["trades"]:
                    print(f"  ✗ {symbol} {tf}: No trades generated")
                    continue

                mc_result = monte_carlo(
                    result["trades"],
                    initial_capital=10000,
                    n_simulations=n_sims,
                )
                print_monte_carlo(mc_result, f"{strategy.name} | {symbol} {tf}")

            except Exception as e:
                print(f"  ✗ {symbol} {tf}: {e}")


def cmd_portfolio(args):
    """Run portfolio of strategies and measure diversification benefit."""
    from engine.portfolio import run_portfolio, print_portfolio

    strategy_names = args.strategies.split(",")
    symbols = args.symbols.split(",") if args.symbols else DEFAULT_SYMBOLS[:2]
    timeframes = args.timeframes.split(",") if args.timeframes else ["H4"]

    configs = []
    for name in strategy_names:
        strategy = load_strategy(name.strip())
        is_leveraged = strategy.name in LEVERAGED_STRATEGIES

        strat_symbols = symbols
        if is_leveraged:
            strat_symbols = [s for s in symbols if s in
                             {"BTCUSD", "ETHUSD", "SOLUSD", "BNBUSD", "XRPUSD",
                              "ADAUSD", "AVAXUSD", "LINKUSD", "DOTUSD", "DOGEUSD"}]
            if not strat_symbols:
                strat_symbols = CRYPTO_SYMBOLS[:1]

        for symbol in strat_symbols:
            for tf in timeframes:
                bt_kwargs = {}
                if is_leveraged:
                    leverage = getattr(strategy, "params", {}).get("leverage", 10)
                    bt_kwargs = {
                        "leverage": leverage,
                        "maker_fee_pct": 0.02,
                        "taker_fee_pct": 0.04,
                        "slippage_pct": 0.02,
                        "risk_per_trade_pct": 1.0,
                        "funding_rate_pct": 0.01,
                    }

                configs.append({
                    "strategy": strategy,
                    "symbol": symbol,
                    "timeframe": tf,
                    "leveraged": is_leveraged,
                    "bt_kwargs": bt_kwargs,
                })

    print(f"\n  Running portfolio: {len(configs)} strategy-symbol-timeframe combinations...")
    result = run_portfolio(configs, initial_capital=10000)
    print_portfolio(result)


def cmd_export(args):
    """Export a strategy to Pine Script v5."""
    from pinescript.generator import generate

    strategy = load_strategy(args.strategy)

    output = args.output
    if not output:
        output = str(ROOT / "strategies" / f"{strategy.name}_v{strategy.version}.pine")

    pine_code = generate(strategy, output_path=output)

    print(f"\n  Pine Script v5 exported successfully!")
    print(f"  File: {output}")
    print(f"  Lines: {len(pine_code.splitlines())}")
    print(f"\n  Copy and paste into TradingView to test.")


def cmd_fetch(args):
    """Pre-fetch and cache data."""
    from engine.data_fetcher import fetch_multi

    symbols = args.symbols.split(",") if args.symbols else DEFAULT_SYMBOLS
    timeframes = args.timeframes.split(",") if args.timeframes else DEFAULT_TIMEFRAMES

    print(f"\n  Fetching data for {len(symbols)} symbols x {len(timeframes)} timeframes...\n")
    data = fetch_multi(symbols, timeframes)
    print(f"\n  Cached {len(data)} datasets.")


def cmd_list(args):
    """List available strategies."""
    strategy_dir = ROOT / "strategies"
    strategies = [f.stem for f in strategy_dir.glob("*.py") if f.stem != "__init__"]

    if not strategies:
        print("\n  No strategies found. Create one in strategy-lab/strategies/")
        return

    print(f"\n  Available strategies:")
    print(f"  {'─' * 40}")
    for name in sorted(strategies):
        try:
            s = load_strategy(name)
            print(f"  • {s.name} v{s.version} — {getattr(s, 'description', 'No description')}")
        except Exception:
            print(f"  • {name} (error loading)")


def main():
    parser = argparse.ArgumentParser(
        description="Strategy Lab — Pine Script Strategy Factory",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 run.py list
  python3 run.py backtest --strategy trend_follower_v1
  python3 run.py backtest --strategy trend_follower_v1 --symbols XAUUSD,NAS100 --timeframes H1,H4
  python3 run.py backtest --strategy crypto_leverage_v1 --leverage 10
  python3 run.py walkforward --strategy trend_follower_v1 --windows 5
  python3 run.py montecarlo --strategy trend_follower_v1 --sims 1000
  python3 run.py portfolio --strategies trend_follower_v1,mean_reversion_v1 --symbols BTCUSD,XAUUSD
  python3 run.py export --strategy trend_follower_v1
  python3 run.py fetch --symbols XAUUSD,BTCUSD --timeframes H1,H4
        """
    )

    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # backtest
    bt = subparsers.add_parser("backtest", help="Run backtest across symbols/timeframes")
    bt.add_argument("--strategy", "-s", required=True, help="Strategy module name")
    bt.add_argument("--symbols", help=f"Comma-separated symbols (default: {','.join(DEFAULT_SYMBOLS)})")
    bt.add_argument("--timeframes", help=f"Comma-separated timeframes (default: {','.join(DEFAULT_TIMEFRAMES)})")
    bt.add_argument("--leverage", "-l", type=float, default=None, help="Override leverage (for leveraged strategies)")

    # walkforward
    wf = subparsers.add_parser("walkforward", help="Walk-forward validation (is the edge real?)")
    wf.add_argument("--strategy", "-s", required=True, help="Strategy module name")
    wf.add_argument("--symbols", help=f"Comma-separated symbols (default: {','.join(DEFAULT_SYMBOLS)})")
    wf.add_argument("--timeframes", help=f"Comma-separated timeframes (default: {','.join(DEFAULT_TIMEFRAMES)})")
    wf.add_argument("--windows", "-w", type=int, default=5, help="Number of walk-forward windows (default: 5)")
    wf.add_argument("--leverage", "-l", type=float, default=None, help="Override leverage")

    # montecarlo
    mc = subparsers.add_parser("montecarlo", help="Monte Carlo simulation (is it luck?)")
    mc.add_argument("--strategy", "-s", required=True, help="Strategy module name")
    mc.add_argument("--symbols", help=f"Comma-separated symbols (default: {','.join(DEFAULT_SYMBOLS)})")
    mc.add_argument("--timeframes", help=f"Comma-separated timeframes (default: {','.join(DEFAULT_TIMEFRAMES)})")
    mc.add_argument("--sims", type=int, default=1000, help="Number of simulations (default: 1000)")
    mc.add_argument("--leverage", "-l", type=float, default=None, help="Override leverage")

    # portfolio
    pf = subparsers.add_parser("portfolio", help="Portfolio orchestrator (combine strategies)")
    pf.add_argument("--strategies", required=True, help="Comma-separated strategy names")
    pf.add_argument("--symbols", help=f"Comma-separated symbols (default: first 2 of {','.join(DEFAULT_SYMBOLS)})")
    pf.add_argument("--timeframes", help="Comma-separated timeframes (default: H4)")

    # export
    ex = subparsers.add_parser("export", help="Export strategy to Pine Script v5")
    ex.add_argument("--strategy", "-s", required=True, help="Strategy module name")
    ex.add_argument("--output", "-o", help="Output file path")

    # fetch
    ft = subparsers.add_parser("fetch", help="Pre-fetch and cache OHLCV data")
    ft.add_argument("--symbols", help=f"Comma-separated symbols (default: {','.join(DEFAULT_SYMBOLS)})")
    ft.add_argument("--timeframes", help=f"Comma-separated timeframes (default: {','.join(DEFAULT_TIMEFRAMES)})")

    # list
    subparsers.add_parser("list", help="List available strategies")

    args = parser.parse_args()

    if args.command == "backtest":
        cmd_backtest(args)
    elif args.command == "walkforward":
        cmd_walkforward(args)
    elif args.command == "montecarlo":
        cmd_montecarlo(args)
    elif args.command == "portfolio":
        cmd_portfolio(args)
    elif args.command == "export":
        cmd_export(args)
    elif args.command == "fetch":
        cmd_fetch(args)
    elif args.command == "list":
        cmd_list(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
