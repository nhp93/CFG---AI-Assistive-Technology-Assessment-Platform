import { useEffect, useState } from 'react'
import { PALETTES, applyFontSize, applyPalette, load, navigate, save, useStored } from '../prefs.js'
import { patchCurrentVision } from '../sessions/store'

const MIN = 16, MAX = 32, STEP = 2
const clamp = (px) => Math.min(MAX, Math.max(MIN, px))

export default function ColorVision() {
  const [size, setSize] = useState(() => load('fontSize', 20))
  const [palette, setPalette] = useStored('palette', 'standard')
  const step = (d) => setSize((s) => clamp(s + d))

  useEffect(() => applyFontSize(size), [size])
  useEffect(() => { patchCurrentVision({ palette, baseFontSizePx: size }) }, [palette, size])
  // Text size is only saved by Next; leaving another way restores the saved size.
  useEffect(() => () => applyFontSize(load('fontSize', 20)), [])
  useEffect(() => applyPalette(palette), [palette])

  // F = smaller, J = larger. Skipped while typing or with modifier keys.
  useEffect(() => {
    function onKey(e) {
      const key = e.key.toLowerCase()
      if ((key !== 'f' && key !== 'j') || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return
      if (e.target.matches('input:not([type=range]):not([type=radio]), textarea, select') || e.target.isContentEditable) return
      e.preventDefault()
      setSize((s) => clamp(s + (key === 'j' ? STEP : -STEP)))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  function next() {
    save('fontSize', size)
    navigate('/assessment')
  }

  return (
    <main id="main">
      <h1 tabIndex={-1}>Color Vision Settings</h1>
      <p className="intro readable">Choose the colors that are easiest for you to distinguish. After these questions, you’ll continue to the visual comfort check.</p>

      <section className="question" aria-labelledby="text-size-heading">
        <h2 id="text-size-heading">Text Size</h2>
        <div className="size-controls">
          <button type="button" className="button button-secondary" aria-label="Decrease text size" onClick={() => step(-STEP)}>A−</button>
          <label htmlFor="font-size-slider" className="visually-hidden">Text size</label>
          <input type="range" id="font-size-slider" min={MIN} max={MAX} step={STEP} value={size}
            aria-valuetext={size + ' pixels'} onChange={(e) => setSize(Number(e.target.value))} />
          <button type="button" className="button button-secondary" aria-label="Increase text size" onClick={() => step(STEP)}>A+</button>
        </div>
        <p>Keyboard shortcuts: Press F to decrease text size or J to increase it.</p>
        <p aria-live="polite">Current size: <strong>{size}px</strong></p>
        <p className="preview readable">
          The quick brown fox jumps over the lazy dog. Adjust the text size until it feels comfortable to read.
        </p>
      </section>

      <section className="question" aria-labelledby="palette-heading">
        <h2 id="palette-heading">Color Palette</h2>
        <p id="palette-desc">Choose the colors that are easiest for you to distinguish. You can preview each option before continuing.</p>
        <div className="options palettes" role="radiogroup" aria-labelledby="palette-heading" aria-describedby="palette-desc">
          {PALETTES.map(([value, label, colors]) => (
            <label key={value} className="option">
              <input type="radio" name="palette" value={value} checked={palette === value} onChange={() => setPalette(value)} />
              <span className="option-text">{label}</span>
              <span className="swatches" aria-hidden="true">
                {colors.map((c) => <span key={c} className="swatch" style={{ background: c }}></span>)}
              </span>
            </label>
          ))}
        </div>
        <div className="preview" role="region" aria-labelledby="palette-preview-heading">
          <h3 id="palette-preview-heading">Preview: Sample Heading</h3>
          <p className="readable">This is how text, buttons, and status labels will look with the selected palette.</p>
          <span className="badge badge-primary">✓ Complete</span>
          <span className="badge badge-highlight">! Needs review</span>
        </div>
      </section>

      <div className="actions">
        <button type="button" className="button button-secondary" onClick={() => navigate('/visual-settings')}>Back</button>
        <button type="button" className="button button-primary" onClick={next}>Next</button>
      </div>
    </main>
  )
}
