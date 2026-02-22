#!/usr/bin/env python3
"""
Strategy Lab — Pipeline CLI

Usage:
    python3 run.py backtest --strategy <name> [--symbols SYM1,SYM2] [--timeframes TF1,TF2]
    python3 run.py export   --strategy <name> [--output <path>]
    python3 run.py fetch    [--symbols SYM1,SYM2] [--timeframes TF1,TF2]
    python3 run.py list

The autonomous loop:
    RESEARCH → CODE → BACKTEST → EVALUATE → ITERATE → EXPORT
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

    # Commission rates per instrument type
    commissions = {
        "XAUUSD": 0.01,   # Commodity
        "NAS100": 0.02,   # Index
        "USTEC":  0.02,   # Index alias
        "USDJPY": 0.01,   # Forex
        "BTCUSD": 0.05,   # Crypto
        "ETHUSD": 0.05,   # Crypto
        "SOLUSD": 0.05,   # Crypto
        "BNBUSD": 0.05,   # Crypto
        "XRPUSD": 0.05,   # Crypto
    }

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
                    commission = commissions.get(symbol, 0.02)
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
  python3 run.py backtest --strategy crypto_leverage_v1 --symbols BTCUSD,ETHUSD --timeframes H1,H4 --leverage 20
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
