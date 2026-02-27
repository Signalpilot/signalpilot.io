"""
Quick scanner — see arbitrage opportunities without running the full bot.

Usage:
    python scan.py              # Scan all markets once
    python scan.py --loop       # Continuous scanning every 30s
"""
import sys
import time
import logging

from signalpilot.config import Settings
from signalpilot.core.client import PolymarketClient
from signalpilot.core.risk import RiskManager
from signalpilot.strategies.arb_scanner import ArbScanner

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


def scan_once(scanner: ArbScanner, client: PolymarketClient):
    print("\n" + "=" * 70)
    print(f"SCAN @ {time.strftime('%H:%M:%S')}")
    print("=" * 70)

    # 1. Scan 5-min BTC markets
    print("\n--- 5-Minute BTC Markets ---")
    try:
        crypto_markets = client.get_crypto_5min_markets()
        print(f"Found {len(crypto_markets)} active 5-min BTC markets")
        for m in crypto_markets[:5]:
            token_ids = m.get("clobTokenIds", [])
            if len(token_ids) >= 2:
                yes_ask = client.get_best_ask(token_ids[0])
                no_ask = client.get_best_ask(token_ids[1])
                if yes_ask is None or no_ask is None:
                    print(f"  {m.get('question', '?')[:60]} — empty book")
                    continue
                combined = yes_ask + no_ask
                fee = client.calc_dynamic_fee(yes_ask) + client.calc_dynamic_fee(no_ask)
                net = 1.0 - combined - fee
                depth_yes = client.get_book_depth_at_price(token_ids[0], "BUY", yes_ask)
                depth_no = client.get_book_depth_at_price(token_ids[1], "BUY", no_ask)
                marker = " <<< ARB" if net > 0.005 else ""
                print(f"  {m.get('question', '?')[:60]}")
                print(f"    YES=${yes_ask:.4f} ({depth_yes:.0f})  NO=${no_ask:.4f} ({depth_no:.0f})  "
                      f"combined=${combined:.4f}  fee=${fee:.4f}  net=${net:.4f}{marker}")
    except Exception as e:
        print(f"  Error: {e}")

    # 2. Scan general binary markets
    print("\n--- Binary Markets (top 20 by volume) ---")
    try:
        markets = client.get_active_markets(limit=50)
        binary = [m for m in markets if len(m.get("clobTokenIds", [])) == 2]
        binary.sort(key=lambda m: float(m.get("volume", 0)), reverse=True)
        for m in binary[:20]:
            token_ids = m["clobTokenIds"]
            yes_ask = client.get_best_ask(token_ids[0])
            no_ask = client.get_best_ask(token_ids[1])
            if yes_ask is None or no_ask is None:
                continue
            combined = yes_ask + no_ask
            net = 1.0 - combined
            vol = float(m.get("volume", 0))
            marker = " <<< ARB" if net > 0.005 else ""
            print(f"  [{vol:>12,.0f}] {m.get('question', '?')[:50]}  YES=${yes_ask:.3f} NO=${no_ask:.3f} gap=${net:+.4f}{marker}")
    except Exception as e:
        print(f"  Error: {e}")

    # 3. Scan NegRisk events (only validated ones)
    print("\n--- NegRisk Events (validated, 3+ outcomes) ---")
    try:
        events = client.get_events()
        negrisk = [e for e in events if e.get("negRisk", False) and len(e.get("markets", [])) >= 3]
        print(f"Found {len(negrisk)} validated NegRisk events")
        for event in negrisk[:10]:
            event_markets = event.get("markets", [])
            total = 0.0
            outcomes = []
            skip = False
            for em in event_markets:
                tids = em.get("clobTokenIds", [])
                if tids:
                    ask = client.get_best_ask(tids[0])
                    if ask is None:
                        skip = True
                        break
                    total += ask
                    outcomes.append((em.get("outcome", "?")[:20], ask))
                else:
                    skip = True
                    break
            if skip:
                continue
            net = 1.0 - total
            marker = " <<< ARB" if net > 0.005 else ""
            title = event.get("title", event.get("slug", "?"))[:50]
            print(f"  {title} ({len(event_markets)} outcomes) sum=${total:.4f} gap=${net:+.4f}{marker}")
            for name, ask in outcomes[:6]:
                print(f"    {name}: ${ask:.4f}")
            if len(outcomes) > 6:
                print(f"    ... and {len(outcomes) - 6} more")
    except Exception as e:
        print(f"  Error: {e}")

    print(f"\n{scanner.status()}")


def main():
    settings = Settings()
    settings.dry_run = True
    client = PolymarketClient(settings)
    risk = RiskManager(settings, client)
    scanner = ArbScanner(client, risk, settings)

    loop = "--loop" in sys.argv

    if loop:
        print("Continuous scanning mode (Ctrl+C to stop)")
        while True:
            scan_once(scanner, client)
            time.sleep(30)
    else:
        scan_once(scanner, client)


if __name__ == "__main__":
    main()
