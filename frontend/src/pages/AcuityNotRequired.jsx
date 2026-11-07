import { navigate } from '../prefs.js'

export default function AcuityNotRequired() {
  return (
    <main id="main">
      <h1 tabIndex={-1}>This questionnaire is not required for this range</h1>
      <p className="intro">Based on your answer, this questionnaire is not required for your visual acuity range. You can return to the welcome page.</p>
      <div className="actions">
        <button type="button" className="button button-primary" onClick={() => navigate('/')}>Return to welcome</button>
      </div>
    </main>
  )
}
