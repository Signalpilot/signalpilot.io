# Cover prompts for the Soro auto-posts

Fifteen prompts, one per post. Paste the **style block** first, then one
**subject block**, into Gemini. Save each result as `<slug>.webp` (or .png),
put them all in one folder, and then:

    python3 scripts/soro/covers.py ~/Desktop/covers
    python3 scripts/soro/localise.py

That copies them into `blog/assets/soro-covers/`, points every card at them,
and carries the change into all eleven locale blogs.

**No text in the image.** The blog cards already print the title, and they
print it in eleven languages, so an English title baked into the picture would
sit under a German headline on `/blog/de/`. The category word is the one
exception: it is short, and it is given per post below in case you want it
rendered in the corner. If Gemini garbles it, drop it rather than keep it.

---

## Style block

> Editorial cover illustration for a trading education article, 16:9,
> 1600 x 900. Dark, cinematic, restrained. Background near-black #05070d
> deepening to #0c101b. Cool blues as the only saturated colour: #5b8aff for
> structure, #76ddff for the single point of emphasis, #b5c0d8 for secondary
> detail. One warm accent #f9a23c allowed on at most one element. Flat vector
> and thin-line geometry with a faint film grain, not photorealism, not 3D
> render, not neon cyberpunk. Generous negative space in the lower third. No
> text, no lettering, no numbers, no watermark, no logo, no human faces, no
> stock-photo traders at desks, no rising green arrows, no dollar signs, no
> bull or bear imagery.

---

## Subject blocks

**1. pentarch-cycle-phases-explained** — category: MARKET CYCLES
> Five distinct markers spaced along one continuous wave, each a different
> geometric glyph, the third one lit in #76ddff while the rest sit in #5b8aff.
> The wave reads as one continuous behaviour being segmented, not as a price
> chart.

**2. tradingview-indicators-free-trial** — category: TOOLS
> A single translucent panel floating over a faint grid, with three empty slots
> waiting to be filled and one already occupied. The sense is evaluation before
> commitment: a tool being examined, not used.

**3. risk-management-rules-for-traders** — category: RISK MANAGEMENT
> Seven concentric boundary lines around a small bright core, the outermost
> ones fading. Containment rather than defence. One boundary in #f9a23c marks
> the limit that matters.

**4. tradingview-breakout-confirmation-indicator-guide** — category: TECHNICAL ANALYSIS
> A horizontal band being crossed by a rising form, with a second faint form
> that stopped short of it. Two outcomes from one level, the confirmed one lit,
> the failed one nearly invisible.

**5. how-to-avoid-late-trade-entries** — category: EXECUTION
> One shape in motion and a second shape arriving behind it, separated by a
> measurable gap rendered as a thin bracket. The gap is the subject, not the
> movement.

**6. momentum-confirmation-trading-indicator-explained** — category: INDICATORS
> Two waveforms stacked, the upper one still advancing while the lower one has
> already flattened. The divergence between them is the focal point, marked by
> a single #76ddff tick.

**7. what-a-market-cycle-indicator-shows** — category: MARKET CYCLES
> A circle divided into four unequal arcs, each arc a different line weight, one
> arc brightened. Beside it a flattened version of the same circle as a wave, so
> the cycle and the timeline read as the same object.

**8. volume-regime-trading-strategy** — category: VOLUME
> A field of vertical bars of varying height sorted into two clearly separated
> densities, quiet on the left in #b5c0d8 and active on the right in #5b8aff,
> with the boundary between them a single bright vertical line.

**9. wyckoff-accumulation-indicator** — category: MARKET STRUCTURE
> A tight horizontal range holding steady while a mass quietly accumulates
> beneath it, drawn as layered sediment bands growing denser toward the base.
> Compression above, build-up below.

**10. how-to-scan-stocks-on-tradingview** — category: TOOLS
> A wide scatter of small identical marks passing through a narrowing funnel of
> thin lines, emerging as four distinct marks in #76ddff. Filtering, not
> searching.

**11. automatic-support-resistance-indicator-explained** — category: TECHNICAL ANALYSIS
> Several horizontal levels at different brightnesses drawn automatically across
> a faint price form, the strongest level fully lit and the weakest almost gone.
> The hierarchy between levels is the subject.

**12. obv-divergence-strategy** — category: VOLUME
> Two lines running in parallel and then separating, one continuing up and one
> turning down, with the point of separation marked by a small open circle in
> #f9a23c.

**13. how-to-identify-accumulation-in-stocks** — category: MARKET STRUCTURE
> A narrowing wedge of price compression with repeated failed downward probes
> below it, each probe shorter than the last, rendered as fading thin strokes.

**14. multi-timeframe-support-resistance** — category: TECHNICAL ANALYSIS
> Three translucent planes stacked in shallow perspective, each carrying its own
> horizontal levels, with one level aligning across all three and lit in
> #76ddff. Agreement across scales.

**15. how-to-tell-if-an-indicator-repaints** — category: INDICATORS
> The same curve drawn twice in slight offset, one solid and one ghosted, as if
> the past changed after the fact. A thin vertical line marks where the two
> versions diverge.
