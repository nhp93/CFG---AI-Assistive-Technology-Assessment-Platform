// Color-vision routing gate before the adaptive vision assessment.
import { useEffect, useRef, useState } from 'react'
import { applyPalette, navigate, save, useStored } from '../prefs.js'

export default function VisualSettings() {
  const [flow, setFlow] = useStored('visualFlow', {})
  const [error, setError] = useState(false)
  const formRef = useRef(null)
  const errorRef = useRef(null)

  // F selects Yes, J selects No, and Space advances when focus is outside a control.
  useEffect(() => {
    function onKey(e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      if (e.code === 'Space') {
        if (e.target.closest('button, input, select, textarea, a')) return
        e.preventDefault()
        formRef.current.requestSubmit()
        return
      }
      const value = { f: 'yes', j: 'no' }[e.key.toLowerCase()]
      if (!value) return
      e.preventDefault()
      formRef.current.querySelector(`input[value="${value}"]`).click()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  function submit(e) {
    e.preventDefault()
    if (!flow.colorblind) {
      setError(true)
      return setTimeout(() => errorRef.current?.focus())
    }
    // Start each person's color palette questions from the neutral palette.
    save('palette', 'standard')
    applyPalette('standard')
    navigate(flow.colorblind === 'yes' ? '/color-vision' : '/assessment')
  }

  return (
    <main id="main">
      <h1 tabIndex={-1}>Do you have color blindness or a color-vision difference?</h1>
      <p className="intro">Your answer helps us personalize the colors used in the assessment. This is not a medical test.</p>
      <form ref={formRef} onSubmit={submit} noValidate>
        <fieldset className="question" aria-describedby="shortcut-hint">
          <legend>Choose one answer</legend>
          <div className="options">
            {['yes', 'no'].map((v) => (
              <label key={v} className="option">
                <input type="radio" name="colorblind" value={v} checked={flow.colorblind === v}
                  onChange={() => { setFlow({ colorblind: v }); setError(false) }} />
                <span className="option-text">{v === 'yes' ? 'Yes' : 'No'}</span>
              </label>
            ))}
          </div>
          <p id="shortcut-hint" className="shortcut-hint">Keyboard shortcuts: F = Yes, J = No, Space = Next. Standard radio-button keys also work.</p>
          <div ref={errorRef} className="message message-error" role="alert" tabIndex={-1} hidden={!error}>Please choose Yes or No to continue.</div>
        </fieldset>
        <div className="actions">
          <button type="button" className="button button-secondary" onClick={() => navigate('/')}>Back to welcome</button>
          <button type="submit" className="button button-primary">Next</button>
        </div>
      </form>
    </main>
  )
}
