# SIGNAL PILOT INDICATOR REFERENCE (CORRECT)
## Source: Live Site docs.signalpilot.io (January 2026)

---

## 1. PENTARCH v1.0 (The Sovereign ⚜️)
**Type:** Overlay Indicator
**Purpose:** Cycle Phase Detection with 4-Layer System

### The 5 Cycle Signals

| Signal | Color | Position | Meaning |
|--------|-------|----------|---------|
| **TD** | Purple | Below candle | Early-cycle reversal on selling exhaustion |
| **IGN** | Teal | Below candle | Breakout confirmation with conviction |
| **WRN** | Yellow | Above candle | Early weakness in uptrends |
| **CAP** | Orange | Above candle | Late-cycle exhaustion with volume spikes |
| **BDN** | Red | Above candle | Bearish structure break |

### 4-Layer Detection System
All 4 layers must confirm at bar close:
1. **Regime Classification** - Bullish/bearish/neutral structure analysis
2. **Pilot Line Distance** - Oversold/overbought threshold measurement
3. **NanoFlow Momentum** - Directional momentum validation
4. **Bar Close Confirmation** - Prevents mid-bar false signals

### Components
- **Pilot Line** - Dynamic trend reference line (blue=bearish, green=bullish, gray=neutral)
- **Regime Bars** - Candle body colors showing structure (green/red/gray)
- **NanoFlow** - Momentum oscillator (-100 to +100) in separate panel

---

## 2. VOLUME ORACLE v1.0 (The Prophet 🔮)
**Type:** Panel Indicator
**Purpose:** Regime-Based Volume Intelligence with Position Management

### 5 Backend Systems
1. **Market Structure Detection** - Swing patterns (HH/HL vs LH/LL)
2. **Volume Footprint Detection** - Bar classification (Momentum, Absorption, Spike, Normal)
3. **Regime Stability Index** - Flip frequency tracking
4. **Confluence Scoring** - Multi-factor support evaluation
5. **Signal Density Tracking** - Clustering identification

### Regime States

| Regime | Color | Bias |
|--------|-------|------|
| **ACCUMULATION** | Green | Bullish |
| **DISTRIBUTION** | Red | Bearish |
| **NEUTRAL** | Gray | None |

### Signals
- **🟢 BULL Signal (↑)** - Bullish conditions with quality rating
- **🔴 BEAR Signal (↓)** - Bearish conditions with quality rating

### Quality Ratings
- ⭐⭐⭐ Elite (80-100%)
- ⭐⭐ Premium (60-79%)
- ⭐ Standard (40-59%)

### Position Management System
- **Stop Loss:** 1.5× ATR
- **Target 1:** 2.0× ATR (50% exit)
- **Target 2:** 3.5× ATR
- **Trailing Stop:** Enabled after T1
- **Breakeven:** Auto-move at 1.0× ATR

---

## 3. JANUS ATLAS v1.0 (The Cartographer 🗺️)
**Type:** Overlay Indicator
**Purpose:** Multi-Timeframe Auto-Levels (60+ types)

### Level Categories (9 Total)

#### 1. Classic Timeframe Levels
Daily/Weekly/Monthly/Quarterly/Yearly High, Low, Open, Close + Midpoints + Pivot Points

#### 2. VWAP Family
- Current: dVWAP, wVWAP, mVWAP, qVWAP, yVWAP
- Previous: pdVWAP, pwVWAP, pmVWAP, pqVWAP, pyVWAP
- Bands: ±1σ, ±2σ standard deviation

#### 3. Volume Profile
Daily/Weekly/Monthly/Quarterly/Yearly POC, VAH, VAL

#### 4. Naked POC (nPOC)
Previous session POC levels untouched by price

#### 5. Session Levels
- Asian: AsH, AsL, AsO, AsC
- London: EuH, EuL, EuO, EuC
- New York: NAH, NAL, NAO, NAC

#### 6. Market Structure
Swing High/Low, BOS (Break of Structure), CHoCH (Change of Character)

#### 7. Opening Range
High/Low/Midpoint (5-60 minute configurable)

#### 8. Gap Levels
Daily gaps, weekend gaps, CME futures gaps, fill detection

#### 9. Fair Value Gaps (FVG)
Bullish/Bearish FVG detection

### Additional Features
- Fibonacci Levels (8 levels)
- Confluence Zones (3+ level clustering)
- Distance Table
- Custom Sessions
- Killzones

---

## 4. PLUTUS FLOW v1.0 (The Scales ⚖️)
**Type:** Panel Indicator
**Purpose:** 4-Layer OBV Analysis System

### 4-Layer System
1. **OBV Line** - Cumulative volume tracking
2. **Flow Ribbon** - Trend direction (green=bullish, red=bearish)
3. **Statistical Bands** - Extreme zones (±2σ)
4. **Divergence Detection** - Automated price-volume disagreement

### OBV Calculation
- Close > Previous: OBV + Volume
- Close < Previous: OBV - Volume
- Close = Previous: OBV unchanged
- **Adaptive volume filtering** caps outlier bars

### Trend Ribbons
- **Green Ribbon** = OBV above basis (accumulation)
- **Red Ribbon** = OBV below basis (distribution)
- **Cross Signals** = Dots when OBV crosses basis

### Divergence Types

| Type | Pattern | Meaning |
|------|---------|---------|
| **Bullish** | Price LL, OBV HL | Reversal up |
| **Bearish** | Price HH, OBV LH | Reversal down |
| **Hidden Bullish** | Price HL, OBV LL | Continuation up |
| **Hidden Bearish** | Price LH, OBV HH | Continuation down |

### Extreme Zone Signals
- **White dots** = Entry to ±2σ zone
- **Yellow dots** = Exit from extreme zone

---

## 5. HARMONIC OSCILLATOR v1.0 (The Arbiter 🎵)
**Type:** Panel Indicator
**Purpose:** 7-Component Voting System with Regime Detection

### The 7 Voting Components

| # | Component | Function |
|---|-----------|----------|
| 1 | **RSI** | Momentum-aware RSI with directional confirmation |
| 2 | **Stochastic RSI** | Smoothed stochastic with slope analysis |
| 3 | **MACD** | Histogram acceleration detection |
| 4 | **EMA Trend** | Price position relative to trend with slope |
| 5 | **Momentum** | Rate of change analysis |
| 6 | **Volume** | Confirming volume on directional candles |
| 7 | **Divergence Zone** | Extreme zone detection with price confirmation |

### Regime Classification

| Regime | Votes | Composite Level | Meaning |
|--------|-------|-----------------|---------|
| **TRENDING▲/▼** | 6-7 | Above 65 / Below 35 | Strong directional momentum |
| **BIAS▲/▼** | 4-5 | Above 55 / Below 45 | Moderate directional lean |
| **RANGING** | 0-3 | 45-55 | No directional consensus |

### Signal Modes
- **Conservative** - 6+ votes required
- **Balanced** - 5+ votes required
- **Aggressive** - 4+ votes required

### Features
- Vote count display (X/7)
- Divergence detection (BULL DIV, BEAR DIV)
- HTF (Higher Timeframe) filter
- Overbought/oversold zones (70/30)

---

## 6. AUGURY GRID v1.0 (The Watchman 👁️)
**Type:** Screener/Table
**Purpose:** Multi-Symbol Scanner (7 symbols × 3 timeframes = 21 scans)

### Signal Detection
- **MACD histogram crossovers** (primary method)
- **15+ confluence filters** (ADX, trend, EMA200, RSI, volume, momentum)
- **Quality scoring** (0-100, displayed as ★/★★/★★★)

### Display Columns (9)

| Column | Data |
|--------|------|
| **#** | Rank (best first) |
| **Sym** | Symbol ticker |
| **TF** | Timeframe |
| **Bias** | Bull/Bear + star rating |
| **Age** | Time since signal |
| **Entry** | Signal price |
| **SL** | Stop loss (ATR) |
| **TP** | Take profit targets |
| **P&L** | Current profit/loss % |

### Multi-TF Confluence
- 🔗 = 2-timeframe agreement
- 🔗🔗 = 3-timeframe agreement

### Status Codes
- ⏳ = Pending filters
- 💀 = Failed/expired

---

## 7. OMNIDECK v1.0 (The Commander ⚔️)
**Type:** All-in-One Overlay
**Purpose:** 10 Professional Systems Combined

### The 10 Systems

| # | System | Function |
|---|--------|----------|
| 1 | **TD Sequential** | Exhaustion counter (1-9) detecting reversals |
| 2 | **Squeeze Detector** | Volatility breakouts (BB vs Keltner) |
| 3 | **Liquidity Sweeps** | Stop-hunt detection (💧 🩸 markers) |
| 4 | **EMA Trio** | 50/100/200 moving averages |
| 5 | **SuperTrend** | Adaptive trend-following ribbon |
| 6 | **BMSB** | Bull Market Support Band (20 SMA + 21 EMA) |
| 7 | **Regime Box** | Background color (green/red/gray) |
| 8 | **Supply/Demand Zones** | Key levels with ⭐ quality ratings |
| 9 | **Candlestick Patterns** | 16 RCS patterns (Hammer, Engulfing, etc.) |
| 10 | **Meta Tools** | Integration layer coordinating all systems |

### Features
- **38 total alerts** across all systems
- **Confluence Score Panel** (1-10 alignment scale)
- **Non-repainting** Supply/Demand zones

---

## KEY CORRECTIONS FOR CONTENT PLAN

### Pentarch
| WRONG | CORRECT |
|-------|---------|
| SOS (Sign of Strength) | Does NOT exist |
| SOW (Sign of Weakness) | Does NOT exist |
| AUT (Autumn) | Does NOT exist |
| Signals: TD, IGN, SOS, SOW, AUT | Signals: TD, IGN, WRN, CAP, BDN |

### Volume Oracle
| WRONG | CORRECT |
|-------|---------|
| Expansion regime | ACCUMULATION (Green) |
| Contraction regime | DISTRIBUTION (Red) |
| Transition regime | NEUTRAL (Gray) |

### Harmonic Oscillator
| WRONG | CORRECT |
|-------|---------|
| 3 components (MACD, RSI, StochRSI) | 7 components |
| NanoFlow, KFlow, Enhanced RSI | RSI, StochRSI, MACD, EMA Trend, Momentum, Volume, Divergence Zone |

### OmniDeck
| WRONG | CORRECT |
|-------|---------|
| NanoFlow component | Does NOT exist in OmniDeck |
| Pilot Line component | Does NOT exist in OmniDeck |
| Pentarch signals included | TD Sequential (different system) |

---

## SOURCES (Verified January 2026)
- https://docs.signalpilot.io/pentarch-v10/
- https://docs.signalpilot.io/volume-oracle-v10/
- https://docs.signalpilot.io/janus-atlas-v10/
- https://docs.signalpilot.io/plutus-flow-v10/
- https://docs.signalpilot.io/harmonic-oscillator-v10/
- https://docs.signalpilot.io/augury-grid-v10/
- https://docs.signalpilot.io/omnideck-v10/
