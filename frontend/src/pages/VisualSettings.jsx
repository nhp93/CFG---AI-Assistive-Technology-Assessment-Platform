// Color-vision routing gate before the adaptive vision assessment.
import { useEffect, useRef, useState } from 'react'
import { applyPalette, load, navigate, save } from '../prefs.js'
import { patchCurrentVision } from '../sessions/store'

export default function VisualSettings() {
  const [choice, setChoice] = useState(() => load('visualFlow', {}).colorblind ?? '')
  const [error, setError] = useState(false)
  const headingRef = useRef(null)
  const errorRef = useRef(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  function selectChoice(value) {
    setChoice(value)
    save('visualFlow', { ...load('visualFlow', {}), colorblind: value })
    patchCurrentVision({ colorVisionDifference: value })
    setError(false)
  }

  function handleContinue(e) {
    e.preventDefault()
    if (!choice) {
      setError(true)
      setTimeout(() => errorRef.current?.focus(), 50)
      return
    }

    save('palette', 'standard')
    applyPalette('standard')
    if (choice === 'yes') {
      navigate('/color-vision')
    } else {
      navigate('/assessment')
    }
  }

  return (
    <main id="main-content" role="main" className="page-shell">
      <article className="tactile-card triage-card" aria-labelledby="colorblind-heading">
        <div className="mcq-top-row">
          <span className="step-badge">Visual Comfort Check</span>
          <span className="branch-badge">Color Vision Check</span>
        </div>

        <h1 id="colorblind-heading" ref={headingRef} tabIndex={-1} className="mcq-question-title">
          Do you have color blindness or a color-vision difference?
        </h1>

        <p className="intro readable">
          Your answer helps us personalize the colors and contrast used in the assessment. This is not a medical test.
        </p>

        <ul className="mcq-options-list" role="list">
          <li className="mcq-option-item">
            <button
              type="button"
              className={`tactile-btn mcq-option-btn ${choice === 'yes' ? 'selected' : ''}`}
              aria-pressed={choice === 'yes'}
              onClick={() => selectChoice('yes')}
            >
              <span className="option-indicator" aria-hidden="true">{choice === 'yes' ? '●' : '○'}</span>
              <div className="option-content">
                <span className="option-label">Yes — I have a color-vision difference</span>
                <span className="option-desc">I have trouble distinguishing certain colors, such as red/green or blue/yellow. Let me choose a custom palette.</span>
              </div>
              {choice === 'yes' && <span className="selection-pill" aria-hidden="true">✓ Selected</span>}
            </button>
          </li>

          <li className="mcq-option-item">
            <button
              type="button"
              className={`tactile-btn mcq-option-btn ${choice === 'no' ? 'selected' : ''}`}
              aria-pressed={choice === 'no'}
              onClick={() => selectChoice('no')}
            >
              <span className="option-indicator" aria-hidden="true">{choice === 'no' ? '●' : '○'}</span>
              <div className="option-content">
                <span className="option-label">No — Standard color vision</span>
                <span className="option-desc">I can distinguish colors normally, or I prefer standard high-contrast styling.</span>
              </div>
              {choice === 'no' && <span className="selection-pill" aria-hidden="true">✓ Selected</span>}
            </button>
          </li>
        </ul>

        {error && (
          <div ref={errorRef} className="message message-error" role="alert" tabIndex={-1}>
            Please select Yes or No to continue.
          </div>
        )}

        <div className="mcq-footer-actions">
          <button type="button" className="tactile-btn secondary-btn" onClick={() => navigate('/acuity')}>
            ← Back
          </button>
          <button type="button" className="tactile-btn primary-btn mcq-next-btn" onClick={handleContinue}>
            Continue →
          </button>
        </div>
      </article>
    </main>
  )
}
