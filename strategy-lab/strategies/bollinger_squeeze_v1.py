"""
Bollinger Band Squeeze v1 — Volatility compression → expansion breakout.

When Bollinger Bands contract inside Keltner Channels (TTM Squeeze),
price is coiling. When the squeeze releases, we ride the expansion.

Entry: Squeeze OFF (bands expanding) + momentum direction + trend confirmation
Exit: ATR-based SL/TP
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from engine.indicators import (
    ema, sma, rsi, atr, adx, macd, squeeze,
    bollinger_bands, keltner_channels, crossover, crossunder
)


class BollingerSqueezeV1:
    name = "bollinger_squeeze"
    version = "1.0"
    description = "Bollinger Squeeze: volatility compression breakout"

    params = {
        # Squeeze detection
        "bb_period": 20,
        "bb_std": 2.0,
        "kc_period": 20,
        "kc_atr_period": 10,
        "kc_mult": 1.5,

        # Trend filter
        "ema_fast": 9,
        "ema_slow": 21,
        "ema_trend": 50,

        # Momentum confirmation
        "macd_fast": 12,
        "macd_slow": 26,
        "macd_signal": 9,
        "rsi_period": 14,

        # Squeeze duration filter
        "min_squeeze_bars": 6,

        # Risk management
        "atr_period": 14,
        "atr_sl_mult": 1.5,
        "atr_tp_mult": 3.5,

        # Volatility filter
        "vol_lookback": 100,
        "vol_min_pctile": 5,
        "vol_max_pctile": 95,
    }

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        p = self.params

        # Squeeze detection
        squeeze_on, mom = squeeze(
            df["High"], df["Low"], df["Close"],
            p["bb_period"], p["bb_std"],
            p["kc_period"], p["kc_atr_period"], p["kc_mult"]
        )
        df["squeeze_on"] = squeeze_on
        df["momentum"] = mom

        # Count consecutive squeeze bars
        squeeze_count = pd.Series(0, index=df.index)
        count = 0
        for i in range(len(df)):
            if squeeze_on.iloc[i]:
                count += 1
            else:
                count = 0
            squeeze_count.iloc[i] = count
        df["squeeze_count"] = squeeze_count

        # Squeeze just released (was on, now off)
        df["squeeze_release"] = (~df["squeeze_on"]) & (df["squeeze_on"].shift(1).fillna(False))
        # Was in squeeze long enough
        df["good_squeeze"] = df["squeeze_count"].shift(1) >= p["min_squeeze_bars"]

        # Momentum direction
        df["mom_up"] = (df["momentum"] > 0) & (df["momentum"] > df["momentum"].shift(1))
        df["mom_down"] = (df["momentum"] < 0) & (df["momentum"] < df["momentum"].shift(1))

        # Trend EMAs
        df["ema_fast"] = ema(df["Close"], p["ema_fast"])
        df["ema_slow"] = ema(df["Close"], p["ema_slow"])
        df["ema_trend"] = ema(df["Close"], p["ema_trend"])
        df["trend_up"] = (df["ema_fast"] > df["ema_slow"]) & (df["Close"] > df["ema_trend"])
        df["trend_down"] = (df["ema_fast"] < df["ema_slow"]) & (df["Close"] < df["ema_trend"])

        # MACD confirmation
        macd_line, signal_line, histogram = macd(
            df["Close"], p["macd_fast"], p["macd_slow"], p["macd_signal"]
        )
        df["macd_bull"] = histogram > 0
        df["macd_bear"] = histogram < 0

        # RSI filter
        df["rsi"] = rsi(df["Close"], p["rsi_period"])

        # ATR
        df["atr"] = atr(df["High"], df["Low"], df["Close"], p["atr_period"])

        # Volatility filter
        atr_pctile = df["atr"].rolling(p["vol_lookback"]).rank(pct=True) * 100
        df["vol_ok"] = (atr_pctile >= p["vol_min_pctile"]) & (atr_pctile <= p["vol_max_pctile"])

        # ── Signal generation ──────────────────────────────────────────
        df["signal"] = 0
        df["stop_loss"] = np.nan
        df["take_profit"] = np.nan

        # LONG: Squeeze releases + momentum up + trend up + MACD bull
        long_cond = (
            df["squeeze_release"] &
            df["good_squeeze"] &
            df["mom_up"] &
            df["trend_up"] &
            df["macd_bull"] &
            (df["rsi"] > 40) & (df["rsi"] < 75) &
            df["vol_ok"]
        )

        # SHORT: Squeeze releases + momentum down + trend down + MACD bear
        short_cond = (
            df["squeeze_release"] &
            df["good_squeeze"] &
            df["mom_down"] &
            df["trend_down"] &
            df["macd_bear"] &
            (df["rsi"] > 25) & (df["rsi"] < 60) &
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
// Bollinger Squeeze v1 — TTM Squeeze breakout
// Squeeze fires when BB inside KC, momentum determines direction
"""


Strategy = BollingerSqueezeV1
