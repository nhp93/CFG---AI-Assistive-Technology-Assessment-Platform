import { useEffect, useRef, useState } from 'react'
import { PALETTES, applyFontSize, applyPalette, load, navigate, save, useStored } from '../prefs.js'
import { patchCurrentVision } from '../sessions/store'

const MIN = 16, MAX = 32, STEP = 2
const clamp = (px) => Math.min(MAX, Math.max(MIN, px))

export default function ColorVision() {
  const [size, setSize] = useState(() => load('fontSize', 20))
  const [palette, setPalette] = useStored('palette', 'standard')
  const headingRef = useRef(null)
  const step = (d) => setSize((s) => clamp(s + d))

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  useEffect(() => {
    applyFontSize(size)
    patchCurrentVision({ palette, baseFontSizePx: size })
  }, [palette, size])

  useEffect(() => {
    applyPalette(palette)
  }, [palette])

  function next() {
    save('fontSize', size)
    navigate('/assessment')
  }

  return (
    <main id="main-content" role="main" className="page-shell">
      <article className="tactile-card mcq-card" aria-labelledby="color-vision-heading">
        <div className="mcq-top-row">
          <span className="step-badge">Visual Comfort Calibration</span>
          <span className="branch-badge">Color &amp; Text Size</span>
        </div>

        <h1 id="color-vision-heading" ref={headingRef} tabIndex={-1} className="mcq-question-title">
          Color Vision &amp; Text Size Calibration
        </h1>

        <p className="intro readable">
          Choose the colors and text size that are easiest for you to distinguish. After this, you’ll proceed to the visual comfort check.
        </p>

        {/* Section 1: Text Size */}
        <section aria-labelledby="text-size-heading" style={{ margin: '1.5rem 0' }}>
          <h2 id="text-size-heading" style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            1. Text Size
          </h2>
          <p className="readable" style={{ color: 'var(--text-muted)' }}>
            Use the buttons or drag the slider until the sample text below feels easy and natural to read.
          </p>

          <div className="size-controls" style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
            <button
              type="button"
              className="tactile-btn secondary-btn"
              style={{ minWidth: '3.5rem', minHeight: '3rem', fontSize: '1.2rem', fontWeight: 800 }}
              aria-label="Decrease text size"
              onClick={() => step(-STEP)}
            >
              A−
            </button>
            <input
              type="range"
              id="font-size-slider"
              min={MIN}
              max={MAX}
              step={STEP}
              value={size}
              style={{ flex: 1, minHeight: '2.5rem', accentColor: 'var(--btn-accent-bg)', cursor: 'pointer' }}
              aria-valuetext={`${size} pixels`}
              onChange={(e) => setSize(Number(e.target.value))}
            />
            <button
              type="button"
              className="tactile-btn secondary-btn"
              style={{ minWidth: '3.5rem', minHeight: '3rem', fontSize: '1.4rem', fontWeight: 800 }}
              aria-label="Increase text size"
              onClick={() => step(STEP)}
            >
              A+
            </button>
          </div>

          <div style={{ display: 'inline-block', padding: '0.3rem 0.85rem', backgroundColor: 'var(--bg-elevated)', border: '0.12rem solid var(--border-color)', borderRadius: '9999px', fontWeight: 800, marginBottom: '0.75rem' }}>
            Current Size: {size}px
          </div>

          <div
            className="preview-reading-box"
            role="region"
            aria-label="Text size sample reading text"
            style={{
              fontSize: `${size}px`,
              lineHeight: 1.5,
              padding: '1.25rem',
              border: '0.15rem solid var(--border-color)',
              borderRadius: '0.5rem',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              transition: 'font-size 0.12s ease',
              margin: '0.5rem 0 1.5rem',
            }}
          >
            The quick brown fox jumps over the lazy dog. Reading should feel effortless, comfortable, and clear.
          </div>
        </section>

        <hr style={{ border: 0, borderTop: '0.12rem solid var(--border-color)', margin: '1.5rem 0' }} />

        {/* Section 2: Color Palette */}
        <section aria-labelledby="palette-heading" style={{ margin: '1.5rem 0' }}>
          <h2 id="palette-heading" style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            2. Color Palette
          </h2>
          <p id="palette-desc" className="readable" style={{ color: 'var(--text-muted)' }}>
            Choose the palette that gives you the best contrast and clarity.
          </p>

          <ul className="mcq-options-list" role="radiogroup" aria-labelledby="palette-heading" style={{ marginTop: '1rem' }}>
            {PALETTES.map(([value, label, colors]) => {
              const isSelected = palette === value
              return (
                <li key={value} className="mcq-option-item">
                  <button
                    type="button"
                    className={`tactile-btn mcq-option-btn ${isSelected ? 'selected' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => setPalette(value)}
                  >
                    <span className="option-indicator" aria-hidden="true">{isSelected ? '●' : '○'}</span>
                    <div className="option-content" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span className="option-label" style={{ fontWeight: 800 }}>{label}</span>
                      <span className="swatches" aria-hidden="true" style={{ display: 'flex', gap: '0.4rem' }}>
                        {colors.map((c) => (
                          <span
                            key={c}
                            className="swatch"
                            style={{
                              display: 'inline-block',
                              width: '1.8rem',
                              height: '1.8rem',
                              borderRadius: '0.3rem',
                              border: '0.12rem solid var(--border-color)',
                              background: c,
                            }}
                          />
                        ))}
                      </span>
                    </div>
                    {isSelected && <span className="selection-pill" aria-hidden="true">✓ Selected</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <div className="mcq-footer-actions">
          <button type="button" className="tactile-btn secondary-btn" onClick={() => navigate('/visual-settings')}>
            ← Back
          </button>
          <button type="button" className="tactile-btn primary-btn mcq-next-btn" onClick={next}>
            Continue to Comfort Check →
          </button>
        </div>
      </article>
    </main>
  )
}
