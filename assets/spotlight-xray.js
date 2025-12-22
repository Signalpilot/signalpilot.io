/**
 * SPOTLIGHT X-RAY EFFECT
 * Reveals scrolling algorithm code through a cursor-following spotlight
 */

(function() {
  'use strict';

  // Don't run on mobile or if reduced motion preferred
  if (window.matchMedia('(max-width: 768px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Pine Script / Trading Algorithm code snippets
  const codeSnippets = [
    // Column 1 - Cycle Detection
    `// PENTARCH™ Cycle Detection
// Signal Pilot Labs

//@version=5
indicator("Cycle Phase Detection")

// Core cycle states
var int cyclePhase = 0
var float cycleStrength = 0.0

// TD Sequential Counter
tdCount = ta.valuewhen(
  close > close[4],
  bar_index, 0
)

// Ignition Detection
ignitionSignal =
  volume > ta.sma(volume, 20) * 1.5
  and close > open
  and rsi > 50

// Warning Phase Logic
warningPhase =
  ta.crossunder(macdLine, signalLine)
  and rsi > 70
  and volume < ta.sma(volume, 10)

// Capitulation Detection
capSignal =
  ta.lowest(close, 14) == close
  and volume > ta.sma(volume, 20) * 2
  and rsi < 30

// Phase Classification
if ignitionSignal
    cyclePhase := 1  // IGNITION
else if warningPhase
    cyclePhase := 2  // WARNING
else if capSignal
    cyclePhase := 3  // CAPITULATION

// Signal Strength Calculation
cycleStrength :=
  math.abs(close - ta.ema(close, 21))
  / ta.atr(14) * 100

plotshape(cyclePhase == 1,
  style=shape.triangleup,
  color=color.green)`,

    // Column 2 - Signal Processing
    `// Signal Processing Engine
// Non-Repainting Logic

//@version=5

// Confirmed bar only
var float confirmedSignal = na

// Wait for bar close
if barstate.isconfirmed
    confirmedSignal := calculateSignal()

// Multi-timeframe confluence
htfTrend = request.security(
  syminfo.tickerid,
  "240",  // 4H timeframe
  ta.ema(close, 50),
  lookahead=barmerge.lookahead_off
)

// Trend alignment score
trendScore = 0
trendScore += close > ta.ema(close, 20) ? 1 : 0
trendScore += close > ta.ema(close, 50) ? 1 : 0
trendScore += close > htfTrend ? 1 : 0

// Volume profile analysis
volumeProfile = ta.sma(volume, 20)
relativeVolume = volume / volumeProfile

// Volatility adjustment
atrMultiplier = ta.atr(14) / close * 100

// Dynamic threshold
threshold =
  atrMultiplier > 3 ? 0.8 :
  atrMultiplier > 2 ? 0.6 :
  0.4

// Final signal generation
validSignal =
  trendScore >= 2
  and relativeVolume > 1.2
  and confirmedSignal > threshold`,

    // Column 3 - Risk Management
    `// Risk Management Module
// Position Sizing Algorithm

struct RiskParams
    float maxRisk = 0.02
    float atrMult = 2.0
    int maxPositions = 5
end

// Calculate position size
calcPositionSize(entry, stop, risk) =>
    riskAmount = strategy.equity * risk
    pointRisk = math.abs(entry - stop)
    size = riskAmount / pointRisk
    math.min(size, strategy.equity * 0.25)

// Dynamic stop loss
dynamicStop =
  ta.lowest(low, 14) - ta.atr(14) * 0.5

// Take profit levels
tp1 = entry + (entry - stop) * 1.5
tp2 = entry + (entry - stop) * 2.5
tp3 = entry + (entry - stop) * 4.0

// Trailing stop logic
var float trailStop = na
if strategy.position_size > 0
    trailStop := math.max(
      trailStop,
      close - ta.atr(14) * 2
    )

// Heat map calculation
portfolioHeat =
  openRisk / strategy.equity * 100

// Risk alerts
if portfolioHeat > 6
    alert("⚠️ Portfolio heat > 6%")`,

    // Column 4 - Pattern Recognition
    `// Pattern Recognition AI
// Neural Network Scoring

//@version=5

// Feature extraction
features = array.new_float(12)

array.set(features, 0, ta.rsi(close, 14))
array.set(features, 1, ta.cci(close, 20))
array.set(features, 2, ta.mfi(hlc3, 14))
array.set(features, 3, relativeVolume)

// Momentum features
array.set(features, 4, ta.roc(close, 10))
array.set(features, 5, ta.mom(close, 14))

// Volatility features
array.set(features, 6, bbWidth)
array.set(features, 7, atrPercent)

// Trend features
array.set(features, 8, adxValue)
array.set(features, 9, trendStrength)

// Pattern scores
array.set(features, 10, engulfScore)
array.set(features, 11, divergenceScore)

// Weighted scoring
weights = array.from(
  0.15, 0.10, 0.10, 0.12,
  0.08, 0.08, 0.07, 0.07,
  0.08, 0.05, 0.05, 0.05
)

// Calculate prediction
prediction = 0.0
for i = 0 to 11
    prediction +=
      array.get(features, i) *
      array.get(weights, i)

// Normalize output
confidence =
  (prediction - 30) / 40 * 100

// Signal classification
signal = confidence > 70 ? 1 :
         confidence < 30 ? -1 : 0`
  ];

  // Create the X-ray layer
  function createXrayLayer() {
    const hero = document.querySelector('.hero');
    if (!hero) return null;

    // Create main container
    const xrayLayer = document.createElement('div');
    xrayLayer.className = 'xray-layer';
    xrayLayer.setAttribute('aria-hidden', 'true');

    // Create code container
    const codeContainer = document.createElement('div');
    codeContainer.className = 'xray-code-container';

    // Add code columns (duplicate for seamless scroll)
    codeSnippets.forEach((code, index) => {
      const column = document.createElement('div');
      column.className = 'xray-code-column';
      column.style.setProperty('--scroll-duration', `${25 + index * 5}s`);

      // Duplicate content for seamless loop
      column.textContent = code + '\n\n' + code;
      codeContainer.appendChild(column);
    });

    // Add scanline effect
    const scanline = document.createElement('div');
    scanline.className = 'xray-scanline';

    xrayLayer.appendChild(codeContainer);
    xrayLayer.appendChild(scanline);

    // Insert into hero
    hero.style.position = 'relative';
    hero.insertBefore(xrayLayer, hero.firstChild);

    return xrayLayer;
  }

  // Mouse tracking with smooth interpolation
  function initMouseTracking(xrayLayer) {
    const hero = document.querySelector('.hero');
    if (!hero || !xrayLayer) return;

    let currentX = 50;
    let currentY = 50;
    let targetX = 50;
    let targetY = 50;
    let isActive = false;
    let rafId = null;

    // Smooth interpolation
    function lerp(start, end, factor) {
      return start + (end - start) * factor;
    }

    // Animation loop
    function animate() {
      if (!isActive) {
        rafId = null;
        return;
      }

      // Smooth follow (adjust 0.15 for faster/slower)
      currentX = lerp(currentX, targetX, 0.15);
      currentY = lerp(currentY, targetY, 0.15);

      xrayLayer.style.setProperty('--spotlight-x', `${currentX}%`);
      xrayLayer.style.setProperty('--spotlight-y', `${currentY}%`);

      rafId = requestAnimationFrame(animate);
    }

    // Mouse move handler
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width) * 100;
      targetY = ((e.clientY - rect.top) / rect.height) * 100;

      if (!isActive) {
        isActive = true;
        xrayLayer.classList.add('active');

        // Start from current mouse position
        currentX = targetX;
        currentY = targetY;

        if (!rafId) animate();
      }
    });

    // Mouse leave - shrink spotlight
    hero.addEventListener('mouseleave', () => {
      isActive = false;
      xrayLayer.classList.remove('active');
    });
  }

  // Initialize on DOM ready
  function init() {
    const xrayLayer = createXrayLayer();
    if (xrayLayer) {
      initMouseTracking(xrayLayer);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
