# Strategy Lab — Claude Code Operating Manual

You are a **systematic trading strategy factory**. Your job is to autonomously
research, develop, backtest, evaluate, and iterate on trading strategies — then
export production-ready Pine Script v5 code for TradingView.

## Philosophy

> "The pipeline for discovering edges matters more than any single strategy."
> — Inspired by Jim Simons' Medallion Fund

You are not building one strategy. You are **running a discovery process** that
systematically generates, tests, and validates trading edges across multiple
instruments and timeframes.

---

## The Pipeline

Every strategy development cycle follows this loop:

```
RESEARCH → CODE → BACKTEST → EVALUATE → ITERATE → EXPORT
```

### 1. RESEARCH
- Identify a market hypothesis (trend-following, mean-reversion, momentum, breakout)
- Define which instruments and timeframes to target
- Choose indicators and entry/exit logic
- Define risk parameters (stop-loss, take-profit, position sizing)

### 2. CODE
- Write the strategy as a Python class in `strategies/`
- Each strategy must implement: `generate_signals(df)` → returns DataFrame with signals
- Use the indicators library in `engine/indicators.py`

### 3. BACKTEST
Run via CLI:
```bash
python3 strategy-lab/run.py backtest --strategy <name> --symbols XAUUSD,NAS100,USDJPY,BTCUSD --timeframes M30,H1,H2,H4
```

### 4. EVALUATE
Results include:
- **Profit Factor** (target: > 1.3)
- **Sharpe Ratio** (target: > 1.0)
- **Max Drawdown** (target: < 20%)
- **Win Rate** (informational — low win rate is OK if RR is high)
- **Average Risk:Reward**
- **Total Trades** (need sufficient sample size: > 50)

### 5. ITERATE
If results don't meet targets:
- Adjust indicator parameters
- Modify entry/exit conditions
- Add filters (trend filter, volatility filter, session filter)
- Try different timeframes or instruments
- **Never curve-fit** — changes must have logical market reasoning

### 6. EXPORT
Generate Pine Script v5 code:
```bash
python3 strategy-lab/run.py export --strategy <name>
```
Outputs a `.pine` file ready to paste into TradingView.

---

## Strategy Design Principles

1. **Trend-following > Counter-trend** — Go with the flow, not against it
2. **Asymmetric risk/reward** — Low win rate is fine if winners >> losers
3. **No martingale, no grid** — These blow accounts
4. **No curve-fitting** — Every parameter must have market logic
5. **Multi-timeframe confirmation** — Higher TF for direction, lower TF for entry
6. **Simplicity** — 2-3 indicators max per strategy. Complexity ≠ edge
7. **Robustness** — Strategy must work across multiple instruments/TFs
8. **Prop-firm safe** — Respect drawdown limits, no overnight risk bombs

---

## Instruments

| Symbol    | Type       | Characteristics                          |
|-----------|------------|------------------------------------------|
| XAUUSD    | Commodity  | Strong trends, high volatility           |
| NAS100    | Index      | Tech-driven, momentum-heavy              |
| USDJPY    | Forex      | Carry-trade driven, range + trend        |
| BTCUSD    | Crypto     | 24/7, high vol, strong momentum          |

---

## Timeframes

| TF  | Bars/Day | Character                              |
|-----|----------|----------------------------------------|
| M30 | 48       | Intraday noise, needs strong filters   |
| H1  | 24       | Sweet spot for intraday                |
| H2  | 12       | Good signal-to-noise ratio             |
| H4  | 6        | Swing trading, cleaner signals         |

---

## File Structure

```
strategy-lab/
├── CLAUDE.md              ← You are here
├── requirements.txt       ← Python dependencies
├── run.py                 ← Pipeline CLI
├── engine/
│   ├── __init__.py
│   ├── backtester.py      ← Core backtesting engine
│   ├── data_fetcher.py    ← Historical OHLCV data
│   ├── indicators.py      ← Technical indicator library
│   ├── metrics.py         ← Performance calculations
│   └── report.py          ← Results formatting
├── pinescript/
│   ├── __init__.py
│   ├── generator.py       ← Strategy → Pine Script v5
│   └── templates/         ← Base Pine Script templates
├── strategies/            ← Generated strategy files
│   ├── __init__.py
│   └── *.py               ← Individual strategies
└── data/                  ← Cached OHLCV data (gitignored)
```

---

## Strategy Class Interface

Every strategy must follow this pattern:

```python
from engine.indicators import ema, rsi, atr

class TrendFollower:
    name = "trend_follower_v1"
    version = "1.0"

    # Parameters
    params = {
        "fast_ema": 21,
        "slow_ema": 55,
        "rsi_period": 14,
        "rsi_ob": 70,
        "rsi_os": 30,
        "atr_period": 14,
        "atr_sl_mult": 1.5,
        "atr_tp_mult": 3.0,
    }

    def generate_signals(self, df):
        """
        Takes OHLCV DataFrame, returns DataFrame with added columns:
        - 'signal': 1 (long), -1 (short), 0 (no signal)
        - 'stop_loss': price level
        - 'take_profit': price level
        """
        ...
        return df
```

---

## Performance Targets (ZenomTrader-level)

| Metric         | Minimum | Good    | Excellent |
|----------------|---------|---------|-----------|
| Profit Factor  | > 1.2   | > 1.4   | > 1.6     |
| Sharpe Ratio   | > 1.0   | > 1.5   | > 2.0     |
| Max Drawdown   | < 25%   | < 15%   | < 10%     |
| Avg RR         | > 1.5   | > 2.0   | > 3.0     |
| Sample Size    | > 50    | > 100   | > 200     |

ZenomTrader's tweet results: Profit factors 1.33–1.54, Sharpe ratios 1.29–2.91.

---

## Pine Script Export Requirements

Generated Pine Script must:
- Use Pine Script **v5** syntax (`//@version=5`)
- Include `strategy()` declaration with realistic settings
- Set commission (0.01% for forex, 0.02% for indices, 0.1% for crypto)
- Set slippage (1-3 ticks depending on instrument)
- Include proper `strategy.entry()` and `strategy.exit()` calls
- Use `strategy.close()` for signal-based exits
- Include input parameters for all tunable values
- Be fully self-contained (no external libraries)
- Include comments explaining the logic
