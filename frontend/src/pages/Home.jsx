import { ensureSession, setCurrentSessionId } from '../sessions/store'
import { navigate, save } from '../prefs.js'

export default function Home() {
  function startAssessment(event) {
    event.preventDefault()
    // Create an anonymous session so the vision preferences can be recorded before identification.
    setCurrentSessionId(null)
    ensureSession()
    localStorage.removeItem('skillsAssessment')
    localStorage.removeItem('recommendationFeedback')
    localStorage.removeItem('visionAssessment')
    save('visualFlow', {})
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
          This is not an exam. There are no right or wrong answers. We’ll first set up the screen to match your visual preferences, then save your assessment under your participant name or reference code.
        </p>
        <form onSubmit={startAssessment}>
          <div className="action-group" role="group" aria-label="Primary Actions">
            <button type="submit" className="btn-primary-action" aria-label="Start comfort check">
              <div className="btn-content-left">
                <span className="btn-title">Start Comfort Check</span>
                <span className="btn-subtitle">Set up text, contrast, and other visual preferences</span>
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
