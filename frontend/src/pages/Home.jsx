import { useRef, useState } from 'react'
import { navigate } from '../prefs.js'
import { ensureSession } from '../sessions/store'

export default function Home() {
  const [participant, setParticipant] = useState('')
  const [error, setError] = useState('')
  const participantInput = useRef(null)

  function startAssessment(event) {
    event.preventDefault()
    const displayName = participant.trim()
    if (!displayName) {
      setError('Enter a participant name or reference code to continue.')
      participantInput.current?.focus()
      return
    }
    ensureSession(displayName)
    navigate('/acuity')
  }

  return (
    <main className="main-viewport" id="main-content">
      <section className="card-container" aria-labelledby="page-heading">
        <div className="card-badge-row">
          <span className="step-pill">Welcome</span>
        </div>
        <h1 id="page-heading" className="welcome-heading" tabIndex={-1}>
          Welcome to Your Assistive Technology Check
        </h1>
        <p className="instruction-paragraph">
          This is not an exam. There are no right or wrong answers. We are finding the screen settings, colors, text sizes, and tools that fit you best.
        </p>
        <form onSubmit={startAssessment}>
          <div className="participant-field">
            <label htmlFor="participant-identifier">Participant name or reference code</label>
            <input
              ref={participantInput}
              id="participant-identifier"
              name="participant"
              type="text"
              autoComplete="off"
              maxLength={80}
              required
              value={participant}
              aria-describedby={error ? 'participant-help participant-error' : 'participant-help'}
              aria-invalid={!!error}
              onChange={(event) => {
                setParticipant(event.target.value)
                setError('')
              }}
            />
            <p id="participant-help">This label identifies the assessment in the staff dashboard. It does not create an account.</p>
            {error && <p id="participant-error" className="participant-error" role="alert">{error}</p>}
          </div>
          <div className="action-group" role="group" aria-label="Primary Actions">
            <button type="submit" className="btn-primary-action" aria-label="Start comfort check">
            <div className="btn-content-left">
              <span className="btn-title">Start Comfort Check</span>
              <span className="btn-subtitle">Find your ideal text size, contrast &amp; screen settings</span>
            </div>
            <div className="btn-arrow-disc" aria-hidden="true">
              <svg className="arrow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
