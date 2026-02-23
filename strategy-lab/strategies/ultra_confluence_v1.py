"""
Ultra Confluence v1 — Combines FULL STRATEGY signals into one mega-system.

Instead of scoring individual indicators, this runs actual complete strategies
as sub-engines and only enters when multiple FULL strategies agree.

Sub-strategies:
1. MTF Trend v2 (Hull MA H4 trend + StochRSI H1 timing)
2. StochRSI Momentum v1 (pullback entries in trends)
3. Bollinger Squeeze v1 (volatility compression breakout)
4. Donchian Breakout v1 (Turtle Trading channel breakout)
5. Meta Confluence v1 (6-indicator scoring system)

Entry: min_agree strategies must fire on the SAME bar or within the lookback window.
This is the ultimate filter — only the highest conviction setups pass.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import atr


class UltraConfluenceV1:
    name = "ultra_confluence"
    version = "1.0"
    description = "Ultra Confluence: 5 full strategies must agree (need 3+)"

    params = {
        # How many strategies must agree
        "min_agree": 3,

        # Lookback window: strategies don't always fire on exact same bar
        # Allow agreement within N bars
        "agree_window": 3,

        # Risk management (tightest of all — ultra-high conviction)
        "atr_period": 14,
        "atr_sl_mult": 1.0,
        "atr_tp_mult": 3.5,

        # Volatility filter
        "vol_lookback": 100,
        "vol_min_pctile": 10,
        "vol_max_pctile": 95,
    }

    def _load_strategy(self, name):
        """Load a strategy class by module name."""
        mod = __import__(f"strategies.{name}", fromlist=["Strategy"])
        return mod.Strategy()

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        p = self.params

        # ── Run all sub-strategies ─────────────────────────────────────
        strategy_names = [
            "stochrsi_momentum_v1",
            "bollinger_squeeze_v1",
            "donchian_breakout_v1",
            "meta_confluence_v1",
        ]

        # Try loading MTF v2 — it needs H1 data to resample to H4
        # If the data is already H4, the resample will just pass through
        try:
            strategy_names.insert(0, "mtf_trend_v2")
        except Exception:
            pass

        sub_signals = {}
        for name in strategy_names:
            try:
                strat = self._load_strategy(name)
                result = strat.generate_signals(df)
                sub_signals[name] = result["signal"]
            except Exception:
                # If a sub-strategy fails (e.g., wrong timeframe), skip it
                continue

        if len(sub_signals) < 2:
            # Not enough strategies loaded — return no signals
            df["signal"] = 0
            df["stop_loss"] = np.nan
            df["take_profit"] = np.nan
            return df

        # ── Count agreement within window ──────────────────────────────
        window = p["agree_window"]

        # For each bar, count how many strategies signaled long/short
        # within the last `window` bars
        bull_counts = pd.Series(0, index=df.index, dtype=int)
        bear_counts = pd.Series(0, index=df.index, dtype=int)

        for name, sig in sub_signals.items():
            # Recent long signal: any +1 within last N bars
            bull_recent = (sig == 1).rolling(window=window, min_periods=1).max().fillna(0).astype(int)
            bear_recent = (sig == -1).rolling(window=window, min_periods=1).max().fillna(0).astype(int)
            bull_counts += bull_recent
            bear_counts += bear_recent

        df["ultra_bull_count"] = bull_counts
        df["ultra_bear_count"] = bear_counts

        # ATR
        df["atr"] = atr(df["High"], df["Low"], df["Close"], p["atr_period"])

        # Volatility filter
        atr_pctile = df["atr"].rolling(p["vol_lookback"]).rank(pct=True) * 100
        df["vol_ok"] = (atr_pctile >= p["vol_min_pctile"]) & (atr_pctile <= p["vol_max_pctile"])

        # ── Signal generation ──────────────────────────────────────────
        df["signal"] = 0
        df["stop_loss"] = np.nan
        df["take_profit"] = np.nan

        long_cond = (df["ultra_bull_count"] >= p["min_agree"]) & df["vol_ok"]
        short_cond = (df["ultra_bear_count"] >= p["min_agree"]) & df["vol_ok"]

        df.loc[long_cond, "signal"] = 1
        df.loc[short_cond, "signal"] = -1

        # If both fire (conflict), no signal
        both = long_cond & short_cond
        df.loc[both, "signal"] = 0

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
// Ultra Confluence v1 — Multiple full strategies must agree
// Runs MTF v2 + StochRSI + Bollinger Squeeze + Donchian + Meta Confluence
// Only enters when 3+ complete strategies fire within 3-bar window
"""


Strategy = UltraConfluenceV1
