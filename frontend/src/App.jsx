import { useEffect, useRef, useState } from 'react'
import { load, navigate, save } from './prefs.js'
import Home from './pages/Home.jsx'
import Acuity from './pages/Acuity.jsx'
import AcuityNotRequired from './pages/AcuityNotRequired.jsx'
import VisualSettings from './pages/VisualSettings.jsx'
import ColorVision from './pages/ColorVision.jsx'
import Assessment, { Results } from './pages/Assessment.jsx'
import AssessmentScreen from './pages/AssessmentScreen.tsx'
import SkillsResults from './pages/SkillsResults.tsx'
import Contact from './pages/Contact.jsx'
import StaffDashboard, { StaffLogin } from './pages/Staff.jsx'
import { getCurrentSession, patchCurrentVision, useSessionDatabaseStatus } from './sessions/store'

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
  '/contact': Contact,
  '/staff-login': StaffLogin,
  '/staff': StaffDashboard,
}

const getPath = () => window.location.hash.slice(1) || '/'

export default function App() {
  const [path, setPath] = useState(getPath)
  const currentSession = getCurrentSession()
  const databaseStatus = useSessionDatabaseStatus()

  // Braille Institute High-Contrast Settings
  const [largeText, setLargeText] = useState(() => load('largeText', false))
  const [colorTheme, setColorTheme] = useState(() => load('colorTheme', 'dark')) // 'dark' | 'light'
  const [contrastMenuOpen, setContrastMenuOpen] = useState(false)
  const contrastMenuRef = useRef(null)

  const Page = ROUTES[path] || (path.startsWith('/staff/') ? StaffDashboard : Home)
  const isHome = Page === Home
  const isStaff = Page === StaffDashboard || Page === StaffLogin

  // Track hash changes
  useEffect(() => {
    const onHash = () => setPath(getPath())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Close contrast dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(e) {
      if (contrastMenuRef.current && !contrastMenuRef.current.contains(e.target)) {
        setContrastMenuOpen(false)
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape' && contrastMenuOpen) {
        setContrastMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [contrastMenuOpen])

  // Apply Large Text and Theme to <html>
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('large-text', largeText)
    save('largeText', largeText)
    try {
      if (getCurrentSession()) patchCurrentVision({ largeText })
    } catch {
      // ignore
    }
  }, [largeText])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = colorTheme
    save('colorTheme', colorTheme)
    try {
      if (getCurrentSession()) patchCurrentVision({ colorTheme })
    } catch {
      // ignore
    }
  }, [colorTheme])

  // Route changes: manage classes, scroll, and auto-focus <h1> for screen readers
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('home', isHome)
    root.classList.toggle('staff', isStaff)
    window.scrollTo(0, 0)

    // Focus the first heading for screen reader announcement without synthetic voiceover
    const heading = document.querySelector('main h1, [data-route-focus]')
    heading?.focus()
  }, [path, isHome, isStaff])

  function toggleLargeText() {
    setLargeText((prev) => {
      const next = !prev
      window.dispatchEvent(new Event('lions:ui-tweak'))
      return next
    })
  }

  function selectTheme(theme) {
    setColorTheme(theme)
    window.dispatchEvent(new Event('lions:ui-tweak'))
  }

  return (
    <div className="app-shell">
      {/* 1. WCAG Landmark: Skip to main content */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* 2. WCAG Landmark: Header with persistent Braille Institute widget */}
      <header role="banner" className="app-header">
        <div className="brand-wrapper">
          <a href="#/" className="brand-link" aria-label="Lions Services Home">
            <span className="brand-badge" aria-hidden="true">LIONS SERVICES</span>
            <span className="brand-title">Assistive Technology Check</span>
          </a>

          {!isHome && !isStaff && currentSession?.displayName && (
            <div
              className="participant-session-pill"
              role="status"
              aria-label={`Current candidate: ${currentSession.displayName}`}
            >
              <span className="participant-dot" aria-hidden="true">●</span>
              <span className="participant-name">{currentSession.displayName}</span>
              <span className="participant-code">({currentSession.code})</span>
            </div>
          )}
        </div>

        <nav role="navigation" aria-label="Accessibility & quick tools" className="header-nav">
          {/* Braille Institute "Text Size & Contrast" Popover Menu */}
          <div className="contrast-menu-container" ref={contrastMenuRef}>
            <button
              type="button"
              className="tactile-btn header-contrast-btn"
              aria-haspopup="true"
              aria-expanded={contrastMenuOpen}
              aria-controls="contrast-popover"
              onClick={() => setContrastMenuOpen((prev) => !prev)}
            >
              Text Size & Contrast ▾
            </button>

            {contrastMenuOpen && (
              <div
                id="contrast-popover"
                className="contrast-popover-menu"
                role="region"
                aria-label="Text Size and Contrast Options"
              >
                <div className="popover-title">Visual Comfort Settings</div>

                {/* Option 1: Large Text */}
                <label className="popover-checkbox-label">
                  <input
                    type="checkbox"
                    className="oversized-checkbox"
                    checked={largeText}
                    onChange={toggleLargeText}
                  />
                  <span className="checkbox-text">
                    <strong>Large Text (150%)</strong>
                    <small>Proportionally scales text, cards, and buttons</small>
                  </span>
                </label>

                <hr className="popover-divider" />

                <div className="popover-subtitle">Contrast Mode:</div>

                {/* Option 2: Light Mode */}
                <label className="popover-radio-label">
                  <input
                    type="radio"
                    name="colorTheme"
                    value="light"
                    className="oversized-radio"
                    checked={colorTheme === 'light'}
                    onChange={() => selectTheme('light')}
                  />
                  <span className="radio-text">
                    <strong>Light Mode</strong>
                    <small>Black on Soft Cyan/White with Yellow Accents</small>
                  </span>
                </label>

                {/* Option 3: Dark Mode */}
                <label className="popover-radio-label">
                  <input
                    type="radio"
                    name="colorTheme"
                    value="dark"
                    className="oversized-radio"
                    checked={colorTheme === 'dark'}
                    onChange={() => selectTheme('dark')}
                  />
                  <span className="radio-text">
                    <strong>Dark Mode</strong>
                    <small>High-Contrast Amber on Pitch Black</small>
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Persistent CTA: Contact / Staff Review */}
          {!isStaff && (
            <button
              type="button"
              className="tactile-btn header-staff-btn"
              onClick={() => navigate('/contact')}
            >
              👤 Contact / Staff Review
            </button>
          )}

          {isHome && (
            <a className="tactile-btn header-login-link" href="#/staff-login">
              Staff Portal
            </a>
          )}
        </nav>
      </header>

      {/* Database Status Alert */}
      {databaseStatus.state === 'offline' && (
        <aside className="database-warning" role="alert">
          The local session database is offline. Answers are saved locally in this browser.
        </aside>
      )}

      {/* 3. WCAG Landmark: Main Content rendered by active route */}
      <Page path={path} />

      {/* 4. WCAG Landmark: Footer */}
      <footer role="contentinfo" className="app-footer">
        <div className="footer-status-row">
          <div className="footer-badge">
            <span className="footer-dot" aria-hidden="true">●</span>
            <span>Braille Institute High-Visibility Style &bull; WCAG 2.1 AAA</span>
          </div>
          <div className="footer-badge">
            <span>Text: {largeText ? '150% (Large)' : '112.5% (Default)'} &bull; {colorTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className="footer-links">
            <a href="#/contact" className="footer-link">Contact Lions Services</a>
            <span aria-hidden="true">&bull;</span>
            <a href="tel:7043324161" className="footer-link">(704) 332-4161</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
