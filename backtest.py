"""
Run backtests against historical Polymarket and Binance data.

Usage:
    python backtest.py              # Run all backtests
    python backtest.py arb          # Arb strategy only
    python backtest.py latency      # Latency arb only
    python backtest.py walkforward  # Walk-forward validation (arb)
    python backtest.py --capital 500 --markets 100  # Custom params
"""
import argparse
import logging
import sys

from signalpilot.backtest.engine import backtest_arb, backtest_latency, walk_forward_arb

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)


def main():
    parser = argparse.ArgumentParser(description="SignalPilot Backtester")
    parser.add_argument("strategy", nargs="?", default="all",
                        choices=["all", "arb", "latency", "walkforward"],
                        help="Which strategy to backtest")
    parser.add_argument("--capital", type=float, default=1000,
                        help="Starting capital in USDC")
    parser.add_argument("--markets", type=int, default=200,
                        help="Number of historical markets to fetch")
    parser.add_argument("--fee-rate", type=float, default=0.0625,
                        help="Dynamic fee rate for crypto markets")
    args = parser.parse_args()

    print(f"""
╔══════════════════════════════════════════════════════╗
║  SignalPilot Backtester                              ║
╠══════════════════════════════════════════════════════╣
║  Strategy:  {args.strategy:<40s}║
║  Capital:   ${args.capital:<39,.0f}║
║  Markets:   {args.markets:<40d}║
║  Fee rate:  {args.fee_rate:<40.4f}║
╠══════════════════════════════════════════════════════╣
║  NOTE: Results assume instant fills with no          ║
║  slippage. Real performance will be worse.           ║
╚══════════════════════════════════════════════════════╝
""")

    if args.strategy in ("all", "arb"):
        result = backtest_arb(
            capital=args.capital,
            fee_rate=args.fee_rate,
            limit=args.markets,
        )
        result.print_summary()

    if args.strategy in ("all", "latency"):
        result = backtest_latency(
            capital=min(args.capital * 0.2, 200),
            fee_rate=args.fee_rate,
            limit=args.markets,
        )
        result.print_summary()

    if args.strategy in ("all", "walkforward"):
        wf_result = walk_forward_arb(
            capital=args.capital,
            fee_rate=args.fee_rate,
            limit=args.markets,
        )
        wf_result.print_summary()


if __name__ == "__main__":
    main()
