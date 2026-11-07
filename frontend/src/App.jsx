import { useCallback, useEffect, useRef, useState } from 'react'
import { applyFontSize, applyPalette, applyZoom, load, navigate, save } from './prefs.js'
import Home from './pages/Home.jsx'
import Acuity from './pages/Acuity.jsx'
import AcuityNotRequired from './pages/AcuityNotRequired.jsx'
import VisualSettings from './pages/VisualSettings.jsx'
import ColorVision from './pages/ColorVision.jsx'
import Assessment, { Results } from './pages/Assessment.jsx'
import AssessmentScreen from './pages/AssessmentScreen.tsx'
import SkillsResults from './pages/SkillsResults.tsx'
import StaffDashboard, { StaffLogin } from './pages/Staff.jsx'
import { useSessionDatabaseStatus } from './sessions/store'

// Hash routes work on refresh and direct links without server configuration or a router dependency.
const ROUTES = {
  '/': Home,
  '/acuity': Acuity,
  '/acuity-not-required': AcuityNotRequired,
  '/visual-settings': VisualSettings,
  '/color-vision': ColorVision,
  '/assessment': Assessment,
  '/results': Results,
  '/telemetry-assessment': AssessmentScreen,
  '/skills-results': SkillsResults,
  '/staff-login': StaffLogin,
  '/staff': StaffDashboard,
}
const ZOOMS = [1, 1.2, 1.4, 1.6, 1.8, 2]
const getPath = () => window.location.hash.slice(1) || '/'

applyFontSize(load('fontSize', 20))
applyPalette(load('palette', 'standard'))

export default function App() {
  const [path, setPath] = useState(getPath)
  const databaseStatus = useSessionDatabaseStatus()
  const [zoom, setZoom] = useState(() => load('zoom', 1))
  const [helpOpen, setHelpOpen] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const lastKey = useRef(0)
  const dismissRef = useRef(null)
  const Page = ROUTES[path] || (path.startsWith('/staff/') ? StaffDashboard : Home)
  const isHome = Page === Home
  const isSkillsAssessment = path === '/telemetry-assessment'
  const isStaff = Page === StaffDashboard || Page === StaffLogin

  useEffect(() => {
    const onHash = () => setPath(getPath())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // New page: start at the top and move focus to its heading so screen readers announce it.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('home', isHome)
    root.classList.toggle('staff', isStaff)
    if (!['/assessment', '/results', '/telemetry-assessment', '/skills-results'].includes(path)) {
      delete root.dataset.assessmentContrast
      delete root.dataset.assessmentCursor
    }
    window.scrollTo(0, 0)
    const heading = document.querySelector('main [data-route-focus]') || document.querySelector('main h1')
    heading?.focus()
  }, [path, isHome, isStaff])

  useEffect(() => {
    applyZoom(zoom)
    save('zoom', zoom)
  }, [zoom])

  useEffect(() => {
    if (!helpOpen) return
    const previous = document.activeElement
    dismissRef.current.focus()
    return () => previous?.focus?.()
  }, [helpOpen])

  const changeZoom = useCallback((level) => {
    setZoom(level)
    setAnnouncement(`Zoom ${Math.round(level * 100)} percent`)
    if (isSkillsAssessment) window.dispatchEvent(new Event('lions:ui-tweak'))
  }, [isSkillsAssessment])

  // Escape = staff help, + / - = zoom, J on the home screen = start. 300ms tremor guard.
  useEffect(() => {
    function onKey(e) {
      if (Date.now() - lastKey.current < 300 || e.ctrlKey || e.altKey || e.metaKey) return
      if (e.target.matches('input:not([type=range]):not([type=radio]), textarea, select') || e.target.isContentEditable) return
      const key = e.key.toLowerCase()
      let action = null
      if (key === 'escape' && !isSkillsAssessment && !isStaff) action = () => setHelpOpen((open) => !open)
      else if (helpOpen) { if (key === 'enter') action = () => setHelpOpen(false) }
      else if (key === '+' || key === '=') action = () => { const next = ZOOMS.find((l) => l > zoom + 0.05); if (next) changeZoom(next) }
      else if (key === '-' || key === '_') action = () => { const prev = [...ZOOMS].reverse().find((l) => l < zoom - 0.05); if (prev) changeZoom(prev) }
      else if (key === 'j' && isHome) action = () => navigate('/acuity')
      if (!action) return
      e.preventDefault()
      lastKey.current = Date.now()
      action()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [changeZoom, helpOpen, zoom, isHome, isSkillsAssessment, isStaff])

  return (
    <>
      <div id="aria-live-announcer" className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>

      <header className="app-header">
        <div className="brand-wrapper">
          <span className="brand-badge" aria-label="Lions Services Incorporated">Lions Services</span>
          <span className="brand-title">Assistive Tech Check</span>
        </div>
        <div className="zoom-controls" role="region" aria-label="ZoomText Magnifier Controls">
          <span className="zoom-label">Zoom:</span>
          {ZOOMS.map((level) => {
            const pct = Math.round(level * 100)
            return (
              <button key={level} type="button" className={'zoom-btn' + (level === zoom ? ' active' : '')}
                aria-pressed={level === zoom} aria-label={`Zoom ${pct} percent`} onClick={() => changeZoom(level)}>
                {pct}%
              </button>
            )
          })}
          {!isStaff && (
            <button type="button" className="staff-help-btn" aria-haspopup="dialog"
              aria-label="Request staff assistance" onClick={() => setHelpOpen(true)}>
              {!isSkillsAssessment && <span className="key-badge esc" aria-hidden="true">Esc</span>} Staff Help
            </button>
          )}
          {isHome && <a className="staff-login-btn" href="#/staff-login">Staff Login</a>}
        </div>
      </header>

      {databaseStatus.state === 'offline' && (
        <p className="database-warning" role="alert">
          The assessment database is unavailable. Answers are cached in this browser but have not been saved to the shared database.
        </p>
      )}

      <Page path={path} />

      {isHome && (
        <footer className="app-footer">
          <div className="status-group">
            <div className="status-badge">
              <span className="pulse-dot" aria-hidden="true"></span>
              <span>Mode: Tactile Navigation Ready</span>
            </div>
            <div className="status-badge">Zoom: {Math.round(zoom * 100)}%</div>
          </div>
          <div className="status-badge"><span>High-Contrast Dark &bull; WCAG 2.2 AAA</span></div>
        </footer>
      )}

      <div className={'modal-overlay' + (helpOpen ? ' open' : '')} role="dialog" aria-modal="true"
        aria-labelledby="staff-dialog-title" aria-hidden={!helpOpen}>
        <div className="modal-dialog">
          <h2 id="staff-dialog-title">Staff Assistance Alerted</h2>
          <p>A Lions Services assessor has been notified and is coming to assist you. Please stay seated.</p>
          <div className="modal-actions">
            <button type="button" className="btn-modal-dismiss" ref={dismissRef} onClick={() => setHelpOpen(false)}>
              Return to Check [ Press Esc or Enter ]
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
