"""
Donchian Breakout v1 — Channel breakout (Turtle Trading) for crypto.

Core insight: The original Turtle Trading system used Donchian channel
breakouts and returned ~80% annually. Crypto has even higher volatility
and trend persistence than commodities, making this potentially stronger.

Mechanism:
- Buy when price breaks above N-period high (new high = momentum)
- Sell when price breaks below N-period low
- Shorter channel for exits (faster exit than entry)
- ADX filter: only trade when trend is developing
- Volatility filter: skip dead and extreme markets
- ATR-based position sizing

The beauty: this strategy has NO moving average lag. It trades the
actual price structure — new highs and new lows.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import (
    highest, lowest, ema, rsi, atr, adx, supertrend
)


class DonchianBreakoutV1:
    name = "donchian_breakout"
    version = "1.0"
    description = "Donchian channel breakout (Turtle Trading) for crypto"

    params = {
        # Entry channel
        "entry_period": 20,        # Break above 20-period high

        # Exit channel (shorter = faster exit)
        "exit_period": 10,         # Exit when price hits 10-period low/high

        # Trend filter
        "adx_period": 14,
        "adx_min": 20,
        "ema_period": 55,          # Only long above EMA, short below

        # RSI filter
        "rsi_period": 14,
        "rsi_max_long": 75,
        "rsi_min_short": 25,

        # Risk management
        "atr_period": 14,
        "atr_sl_mult": 2.0,       # Wider stop — breakouts need room
        "atr_tp_mult": 4.0,       # Very wide TP — ride the breakout

        # Volatility filter
        "vol_lookback": 100,
        "vol_min_pctile": 10,
        "vol_max_pctile": 95,
    }

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        p = self.params

        # ── Donchian channels ─────────────────────────────────────────
        # Entry channel: N-period high/low (shifted 1 to avoid lookahead)
        df["dc_upper"] = highest(df["High"], p["entry_period"]).shift(1)
        df["dc_lower"] = lowest(df["Low"], p["entry_period"]).shift(1)

        # Exit channel: shorter period
        df["dc_exit_upper"] = highest(df["High"], p["exit_period"]).shift(1)
        df["dc_exit_lower"] = lowest(df["Low"], p["exit_period"]).shift(1)

        # ── Confirmation indicators ───────────────────────────────────
        df["ema"] = ema(df["Close"], p["ema_period"])
        df["rsi"] = rsi(df["Close"], p["rsi_period"])
        df["atr"] = atr(df["High"], df["Low"], df["Close"], p["atr_period"])

        adx_val, plus_di, minus_di = adx(df["High"], df["Low"], df["Close"], p["adx_period"])
        df["adx"] = adx_val
        df["plus_di"] = plus_di
        df["minus_di"] = minus_di

        # Volatility filter
        atr_pctile = df["atr"].rolling(p["vol_lookback"]).rank(pct=True) * 100
        df["vol_ok"] = (atr_pctile >= p["vol_min_pctile"]) & (atr_pctile <= p["vol_max_pctile"])

        # ── Breakout detection ────────────────────────────────────────
        # Price closes above upper channel = upside breakout
        df["break_up"] = (df["Close"] > df["dc_upper"]) & (df["Close"].shift(1) <= df["dc_upper"].shift(1))
        # Price closes below lower channel = downside breakout
        df["break_down"] = (df["Close"] < df["dc_lower"]) & (df["Close"].shift(1) >= df["dc_lower"].shift(1))

        # ── Signal generation ─────────────────────────────────────────
        df["signal"] = 0
        df["stop_loss"] = np.nan
        df["take_profit"] = np.nan

        # LONG: Upside breakout + price above EMA + ADX trending + RSI ok
        long_cond = (
            df["break_up"] &
            (df["Close"] > df["ema"]) &
            (df["adx"] > p["adx_min"]) &
            (df["plus_di"] > df["minus_di"]) &
            (df["rsi"] < p["rsi_max_long"]) &
            df["vol_ok"]
        )

        # SHORT: Downside breakout + price below EMA + ADX trending + RSI ok
        short_cond = (
            df["break_down"] &
            (df["Close"] < df["ema"]) &
            (df["adx"] > p["adx_min"]) &
            (df["minus_di"] > df["plus_di"]) &
            (df["rsi"] > p["rsi_min_short"]) &
            df["vol_ok"]
        )

        df.loc[long_cond, "signal"] = 1
        df.loc[short_cond, "signal"] = -1

        # SL/TP
        long_mask = df["signal"] == 1
        df.loc[long_mask, "stop_loss"] = df.loc[long_mask, "Close"] - p["atr_sl_mult"] * df.loc[long_mask, "atr"]
        df.loc[long_mask, "take_profit"] = df.loc[long_mask, "Close"] + p["atr_tp_mult"] * df.loc[long_mask, "atr"]

        short_mask = df["signal"] == -1
        df.loc[short_mask, "stop_loss"] = df.loc[short_mask, "Close"] + p["atr_sl_mult"] * df.loc[short_mask, "atr"]
        df.loc[short_mask, "take_profit"] = df.loc[short_mask, "Close"] - p["atr_tp_mult"] * df.loc[short_mask, "atr"]

        # De-duplicate
        signals = df["signal"].values.copy()
        last_signal = 0
        for i in range(len(signals)):
            if signals[i] != 0:
                if signals[i] == last_signal:
                    signals[i] = 0
                else:
                    last_signal = signals[i]
            elif last_signal != 0:
                last_signal = 0
        df["signal"] = signals

        df.loc[df["signal"] == 0, "stop_loss"] = np.nan
        df.loc[df["signal"] == 0, "take_profit"] = np.nan

        return df

    def pine_script(self) -> str:
        return """
// ─── Donchian Breakout (Turtle Trading) ──────────────────────────────
dc_upper = ta.highest(high, entry_period)[1]
dc_lower = ta.lowest(low, entry_period)[1]
ema_val = ta.ema(close, ema_period)
rsi_val = ta.rsi(close, rsi_period)
atr_val = ta.atr(atr_period)
[adx_val, plus_di, minus_di] = ta.dmi(adx_period, adx_period)

break_up = close > dc_upper and close[1] <= dc_upper[1]
break_down = close < dc_lower and close[1] >= dc_lower[1]

long_entry = break_up and close > ema_val and adx_val > adx_min and plus_di > minus_di and rsi_val < rsi_max_long
short_entry = break_down and close < ema_val and adx_val > adx_min and minus_di > plus_di and rsi_val > rsi_min_short

if long_entry
    strategy.entry("DC Long", strategy.long)
    strategy.exit("DC Long X", "DC Long", stop=close - atr_val * atr_sl_mult, limit=close + atr_val * atr_tp_mult)

if short_entry
    strategy.entry("DC Short", strategy.short)
    strategy.exit("DC Short X", "DC Short", stop=close + atr_val * atr_sl_mult, limit=close - atr_val * atr_tp_mult)

plot(dc_upper, "DC Upper", color=color.green, linewidth=2)
plot(dc_lower, "DC Lower", color=color.red, linewidth=2)
plot(ema_val, "EMA", color=color.gray, linewidth=1)
"""


Strategy = DonchianBreakoutV1
