import { useEffect, useRef, useState } from 'react'
import { load, navigate, save } from '../prefs.js'
import { patchCurrentVision } from '../sessions/store'

export default function Acuity() {
  const [answer, setAnswer] = useState(() => load('visualFlow', {}).acuityAtLeast2070 ?? '')
  const [error, setError] = useState(false)
  const headingRef = useRef(null)
  const errorRef = useRef(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  useEffect(() => {
    if (answer === 'yes' || answer === 'no') patchCurrentVision({ acuityAtLeast2070: answer })
  }, [answer])

  function selectChoice(value) {
    setAnswer(value)
    save('visualFlow', { ...load('visualFlow', {}), acuityAtLeast2070: value })
    patchCurrentVision({ acuityAtLeast2070: value })
    setError(false)
  }

  function handleContinue(e) {
    e.preventDefault()
    if (!answer) {
      setError(true)
      setTimeout(() => errorRef.current?.focus(), 50)
      return
    }

    // 20/70 Triage Gate:
    // Better than 20/70 ("no"): bypass the low-vision calibration, then identify the session.
    // 20/70 or worse ("yes"): complete the 3-step visual calibration first.
    if (answer === 'no') {
      navigate('/participant-sign-in')
    } else {
      navigate('/visual-settings')
    }
  }

  return (
    <main id="main-content" role="main" className="page-shell">
      <article className="tactile-card triage-card" aria-labelledby="acuity-heading">
        <div className="mcq-top-row">
          <span className="step-badge">Initial Triage Gate</span>
          <span className="branch-badge">Visual Acuity Check</span>
        </div>

        <h1 id="acuity-heading" ref={headingRef} tabIndex={-1} className="mcq-question-title">
          Has an eye-care professional told you that your visual acuity is 20/70 or worse?
        </h1>

        <p className="intro readable">
          For example, 20/70, 20/200, or legal blindness in your better eye with correction.
          This helps us decide whether you need a 3-step visual comfort check before signing in and starting the questionnaire.
        </p>

        <ul className="mcq-options-list" role="list">
          <li className="mcq-option-item">
            <button
              type="button"
              className={`tactile-btn mcq-option-btn ${answer === 'yes' ? 'selected' : ''}`}
              aria-pressed={answer === 'yes'}
              onClick={() => selectChoice('yes')}
            >
              <span className="option-indicator" aria-hidden="true">{answer === 'yes' ? '●' : '○'}</span>
              <div className="option-content">
                <span className="option-label">Yes — 20/70 or worse</span>
                <span className="option-desc">I have moderate to severe low vision. I want to customize my font size, contrast, and speech settings first.</span>
              </div>
              {answer === 'yes' && <span className="selection-pill" aria-hidden="true">✓ Selected</span>}
            </button>
          </li>

          <li className="mcq-option-item">
            <button
              type="button"
              className={`tactile-btn mcq-option-btn ${answer === 'no' ? 'selected' : ''}`}
              aria-pressed={answer === 'no'}
              onClick={() => selectChoice('no')}
            >
              <span className="option-indicator" aria-hidden="true">{answer === 'no' ? '●' : '○'}</span>
              <div className="option-content">
                <span className="option-label">No — Better than 20/70 (or Not Sure)</span>
                <span className="option-desc">I can skip the extra visual calibration and continue to participant sign-in.</span>
              </div>
              {answer === 'no' && <span className="selection-pill" aria-hidden="true">✓ Selected</span>}
            </button>
          </li>
        </ul>

        <div ref={errorRef} className="message message-error" role="alert" tabIndex={-1} hidden={!error}>
          Please select Yes or No to proceed.
        </div>

        <div className="mcq-footer-actions">
          <button type="button" className="tactile-btn secondary-btn" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          <button type="button" className="tactile-btn primary-btn" onClick={handleContinue}>
            Continue →
          </button>
        </div>
      </article>
    </main>
  )
}
