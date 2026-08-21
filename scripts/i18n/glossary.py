# -*- coding: utf-8 -*-
"""Terms that must survive translation unchanged.

Two reasons a term is locked:
  1. It is a product or brand name. Translating it breaks the link between the
     lesson and the thing being taught.
  2. It is an industry term that traders in the target language use in English.
     Translating it makes the lesson read as though written by someone who does
     not trade.

The verifier fails a translated lesson if a locked term present in the English
source is missing from the translation.
"""

PRODUCTS = [
    "Signal Pilot", "Signal Pilot Labs", "Elite Seven",
    "Pentarch", "Volume Oracle", "Janus Atlas", "Plutus Flow",
    "Harmonic Oscillator", "Augury Grid", "Omnideck",
    "Pilot Line", "TradingView", "Discord", "Pine Script",
]

# The five cycle events. Codes never change; the long forms are the brand's
# own vocabulary and stay in English so they match what prints on the chart.
CYCLE = [
    "TD", "IGN", "WRN", "CAP", "BDN",
    "Touchdown", "Ignition", "Climax", "Breakdown",
]

# Indicator and market-structure abbreviations traders use in English.
TECHNICAL = [
    "VWAP", "TWAP", "ATR", "RSI", "EMA", "SMA", "MACD", "CVD", "ADX", "VIX",
    "POC", "HVN", "LVN", "FVG", "HTF", "LTF", "OBV", "HFT", "API", "ETF",
    "P&L", "R:R", "OHLC", "COT", "DOM", "SL", "TP", "PDH", "PDL",
    "order flow", "order book", "dark pool", "market maker", "tape reading",
    "spoofing", "backtest", "backtesting", "drawdown", "slippage",
]

LOCKED = PRODUCTS + CYCLE + TECHNICAL

# Terms that are locked only as whole words (short codes would otherwise match
# inside ordinary words in the target language).
WORD_BOUNDED = set(CYCLE + [t for t in TECHNICAL if t.isupper() or len(t) <= 4])

# Phrases that must never appear in any translation, because they are claims
# the brand does not make. Checked case-insensitively against the output.
BANNED_SUBSTRINGS = [
    "guaranteed profit", "risk-free", "risk free", "no risk", "can't lose",
    "cannot lose", "sure thing", "get rich",
]
