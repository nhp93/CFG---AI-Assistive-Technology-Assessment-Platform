import { navigate } from '../prefs.js'

export default function Home() {
  return (
    <main className="main-viewport" id="main-content">
      <section className="card-container" aria-labelledby="page-heading">
        <div className="card-badge-row">
          <span className="step-pill">Screen 1 of 4 &bull; Sensory Baseline</span>
        </div>
        <h1 id="page-heading" className="welcome-heading" tabIndex={-1}>
          Welcome to Your Assistive Technology Check
        </h1>
        <p className="instruction-paragraph">
          This is not an exam. There are no right or wrong answers. We are finding the screen settings, colors, text sizes, and tools that fit you best.
        </p>
        <div className="action-group" role="group" aria-label="Primary Actions">
          <button type="button" className="btn-primary-action" aria-label="Start comfort check" onClick={() => navigate('/visual-settings')}>
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
      </section>
    </main>
  )
}
