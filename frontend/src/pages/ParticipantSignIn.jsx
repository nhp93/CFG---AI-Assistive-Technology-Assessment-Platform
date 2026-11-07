import { useEffect, useRef, useState } from 'react'
import { load, navigate } from '../prefs.js'
import { ensureSession, sessionRepository } from '../sessions/store'
import { projectVision } from '../sessions/project'

export default function ParticipantSignIn() {
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const hasVisionResults = Boolean(load('visionAssessment', {})?.completedAt)

  useEffect(() => inputRef.current?.focus(), [])

  function submit(event) {
    event.preventDefault()
    const participant = displayName.trim()
    if (!participant) {
      setError('Enter a participant name or reference code to continue.')
      inputRef.current?.focus()
      return
    }

    const session = ensureSession(participant)
    const vision = projectVision(load('visionAssessment', {}), load('visualFlow', {}), {
      palette: load('palette', 'standard'),
      baseFontSizePx: load('fontSize', 20),
      zoom: load('zoom', 1),
      largeText: load('largeText', false),
      colorTheme: load('colorTheme', 'dark'),
    })
    sessionRepository.patch(session.id, (current) => ({
      ...current,
      displayName: participant,
      updatedAt: new Date().toISOString(),
      vision: {
        ...current.vision,
        ...vision,
        startedAt: current.vision?.startedAt ?? vision.startedAt,
        completedAt: vision.completedAt ?? new Date().toISOString(),
        largeText: load('largeText', false),
        colorTheme: load('colorTheme', 'dark'),
      },
    }))
    navigate('/telemetry-assessment')
  }

  return (
    <main id="main-content" role="main" className="page-shell">
      <article className="tactile-card triage-card" aria-labelledby="participant-signin-heading">
        <div className="mcq-top-row">
          <span className="step-badge">{hasVisionResults ? 'Visual Preferences Ready' : 'Ready to Continue'}</span>
          <span className="branch-badge">Participant Sign-In</span>
        </div>
        <h1 id="participant-signin-heading" tabIndex={-1} className="mcq-question-title">Save your assessment</h1>
        <p className="intro readable">
          {hasVisionResults
            ? 'Your visual settings are active. Enter your participant name or reference code so we can save these preferences with your assessment. This does not create an online account.'
            : 'Enter your participant name or reference code to save this assessment. This does not create an online account.'}
        </p>
        <form onSubmit={submit} noValidate>
          <div className="participant-field">
            <label htmlFor="participant-identifier">Participant name or reference code</label>
            <input ref={inputRef} id="participant-identifier" name="participant" type="text" autoComplete="off"
              maxLength={80} value={displayName} aria-invalid={!!error}
              aria-describedby={error ? 'participant-signin-help participant-signin-error' : 'participant-signin-help'}
              onChange={(event) => { setDisplayName(event.target.value); setError('') }} />
            <p id="participant-signin-help">This label identifies the assessment in the staff dashboard. Do not enter a password.</p>
            {error && <p id="participant-signin-error" className="participant-error" role="alert">{error}</p>}
          </div>
          <div className="mcq-footer-actions">
            <button type="button" className="tactile-btn secondary-btn" onClick={() => navigate(hasVisionResults ? '/results' : '/acuity')}>
              ← Back
            </button>
            <button type="submit" className="tactile-btn primary-btn mcq-next-btn">Save &amp; Continue →</button>
          </div>
        </form>
      </article>
    </main>
  )
}
