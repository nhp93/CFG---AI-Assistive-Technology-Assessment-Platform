// Adaptive Vision Assessment: a comfort preference check, not a clinical test.
import { useEffect, useRef, useState } from 'react'
import { MODULES, PALETTES, applyFontSize, load, navigate, save, useStored } from '../prefs.js'
import { ensureSession, sessionRepository } from '../sessions/store'
import { projectVision } from '../sessions/project'

const TEXT = 'Reading should feel easy, not tiring. This sample helps find a setting that works well for you.'
const SPEECH = 'Welcome to the assessment. Please listen carefully and choose the speaking speed that feels most comfortable.'

const KEY = 'visionAssessment'
const LAST = MODULES.length - 1
const fresh = () => ({ m: 0, recs: MODULES.map(() => ({ tested: [], confirm: false, choice: null, draftChoice: null, skipped: false })) })
const stopSpeech = () => window.speechSynthesis?.cancel()
const selected = (rec) => rec.draftChoice ?? rec.choice ?? null
const paletteLabel = () => PALETTES.find((p) => p[0] === load('palette', 'standard'))?.[1] ?? 'Standard'

// Next option to test, or -1 when testing should stop. Never repeats a tested option.
function nextIndex(mod, rec) {
  const seen = rec.tested.map((t) => t[0]), last = rec.tested.at(-1)
  const n = !last ? mod.start : mod.ordered ? last[0] + (last[1] ? -1 : 1) : seen.length
  return n >= 0 && n < mod.options.length && !seen.includes(n) ? n : -1
}

// Apply each module's chosen (or draft) setting to the whole page so it stays active in later modules.
function applyAssessment(state, baseFontSize) {
  const root = document.documentElement
  const [mag, contrast, speech, cursor] = state.recs.map(selected)
  const size = mag === null ? baseFontSize : MODULES[0].options[mag][1].fontSize
  save('fontSize', size)
  applyFontSize(size)
  if (contrast === null) delete root.dataset.assessmentContrast
  else root.dataset.assessmentContrast = contrast
  if (speech === null) localStorage.removeItem('speechRate')
  else save('speechRate', MODULES[2].options[speech][1])
  if (cursor === null) delete root.dataset.assessmentCursor
  else root.dataset.assessmentCursor = MODULES[3].options[cursor][1]
}

function speak(text, rate) {
  stopSpeech()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = rate
  window.speechSynthesis.speak(u)
}

export default function Assessment() {
  const [state, setState] = useStored(KEY, fresh())
  const [baseFontSize] = useState(() => load('fontSize', 20))
  const [error, setError] = useState('')

  useEffect(() => {
    const current = ensureSession()
    const projected = projectVision(state, load('visualFlow', {}), {
      palette: load('palette', 'standard'),
      baseFontSizePx: baseFontSize,
      zoom: load('zoom', 1),
    })
    sessionRepository.patch(current.id, (session) => ({
      ...session,
      updatedAt: new Date().toISOString(),
      vision: {
        ...session.vision,
        ...projected,
        startedAt: session.vision?.startedAt || projected.startedAt,
        completedAt: session.vision?.completedAt ?? (state.completedAt ?? null),
        acuityAtLeast2070: projected.acuityAtLeast2070 ?? session.vision.acuityAtLeast2070,
        colorVisionDifference: projected.colorVisionDifference ?? session.vision.colorVisionDifference,
      },
    }))
  }, [state, baseFontSize])
  const [pos, setPos] = useState({ x: 40, y: 40 })
  const titleRef = useRef(null)
  const bodyRef = useRef(null)
  const errorRef = useRef(null)
  const trialStartRef = useRef(Date.now())

  const m = Math.min(state.m, LAST), mod = MODULES[m], rec = state.recs[m]
  const i = nextIndex(mod, rec), confirming = rec.confirm || i < 0
  const firstYes = rec.tested.find((t) => t[1])
  const cur = confirming ? (selected(rec) ?? firstYes?.[0] ?? null) : i
  const option = mod.options[cur]
  const speechChoice = selected(state.recs[2])
  const colorblind = load('visualFlow', {}).colorblind

  useEffect(() => applyAssessment(state, baseFontSize), [state, baseFontSize])
  useEffect(() => stopSpeech, [m, cur])
  useEffect(() => {
    trialStartRef.current = Date.now()
  }, [m, cur])

  // Save a new step, reset per-step UI, and move focus to the new question.
  function update(change, focus = true) {
    const next = structuredClone(state)
    next.m = m
    change(next, next.recs[m])
    setState(next)
    setError('')
    if (focus) setTimeout(() => titleRef.current?.focus())
  }

  const answer = (yes) => {
    const elapsed = Date.now() - trialStartRef.current
    update((s, r) => r.tested.push([cur, yes, { timeSpentMs: elapsed }]))
  }

  function finishModule(s) {
    if (m === LAST) {
      s.completedAt = new Date().toISOString()
      navigate('/results')
    } else {
      s.m = m + 1
    }
  }

  function skip() {
    update((s, r) => { r.skipped = true; r.choice = null; r.draftChoice = null; finishModule(s) })
  }

  function next() {
    if (!confirming) return update((s, r) => { r.confirm = true })
    if (cur === null) {
      setError('Please choose an option, or select Skip.')
      return setTimeout(() => errorRef.current?.focus())
    }
    update((s, r) => { r.choice = cur; r.draftChoice = null; r.skipped = false; finishModule(s) })
  }

  // Back undoes the last step: leave the choice list, then undo answers, then return to the previous module or page.
  function back() {
    if (m === 0 && !rec.tested.length && !rec.confirm) return navigate(colorblind === 'yes' ? '/color-vision' : '/visual-settings')
    update((s, r) => {
      if (r.confirm && i >= 0) r.confirm = false
      else if (r.tested.length) { r.tested.pop(); r.confirm = false }
      else { s.m = m - 1; s.recs[m - 1].skipped = false }
    })
  }



  function movePointer(area, x, y) {
    setPos({ x: Math.max(0, Math.min(x, area.clientWidth - 20)), y: Math.max(0, Math.min(y, area.clientHeight - 20)) })
  }

  function onMouseMove(e) {
    const r = e.currentTarget.getBoundingClientRect()
    movePointer(e.currentTarget, e.clientX - r.left, e.clientY - r.top)
  }

  function onCursorKey(e) {
    const d = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }[e.key]
    if (!d) return
    e.preventDefault()
    movePointer(e.currentTarget, pos.x + d[0], pos.y + d[1])
  }

  // "Progress and saved settings": palette (color path) plus each module's status and trials.
  const progress = MODULES.map((mod, k) => {
    const r = state.recs[k], choice = selected(r)
    const trials = r.tested.map(([o, yes]) => `${mod.options[o][0]}: ${yes ? 'Yes' : 'No'}`)
    const value = r.choice !== null && r.draftChoice == null ? 'Selected ' + mod.options[r.choice][0]
      : choice !== null ? 'Choosing ' + mod.options[choice][0]
        : r.skipped ? 'Skipped' : trials.length ? 'In progress' : null
    return value && `${mod.name}: ${value}${trials.length ? ' — ' + trials.join(', ') : ''}`
  }).filter(Boolean)
  if (colorblind === 'yes') progress.unshift('Color palette: ' + paletteLabel())

  let sample
  if (!option) sample = <p>Select an option above to preview it.</p>
  else if (m === 2) sample = (
    <>
      <p className="sample">“{SPEECH}”</p>
      <p>If you use a screen reader, pause it before playing the sample.</p>
      {window.speechSynthesis ? (
        <div className="actions">
          <button type="button" className="button button-secondary" onClick={() => speak(SPEECH, option[1])}>Play sample at {option[0]}</button>
          <button type="button" className="button button-secondary" onClick={stopSpeech}>Stop</button>
        </div>
      ) : <p>Speech is not available in this browser. Please select Skip.</p>}
    </>
  )
  else if (m === 3) sample = (
    <>
      <div className="cursor-area" tabIndex={0} aria-label="Pointer practice area" aria-describedby="cursor-help"
        onMouseMove={onMouseMove} onKeyDown={onCursorKey}>
        <svg className={'pointer pointer-' + option[1]} style={{ left: pos.x, top: pos.y }} viewBox="-1 -1 19 26" aria-hidden="true">
          <path d="M1 1v19l5-5 3 8 3-1-3-8h7z" />
        </svg>
      </div>
      <p id="cursor-help">Move your mouse inside the box, or select the box and press the arrow keys, to move the pointer.</p>
    </>
  )
  else sample = <p className="sample" style={option[1]}>{TEXT}</p>

  return (
    <main id="main-content" role="main" className="page-shell">
      <article className="tactile-card mcq-card" aria-labelledby="assessment-heading">
        <div className="mcq-top-row">
          <span className="step-badge">Module {m + 1} of {MODULES.length}</span>
          <span className="branch-badge">{mod.name} Calibration</span>
        </div>

        <h1 id="assessment-heading" tabIndex={-1} className="mcq-question-title">
          Adaptive Vision Calibration
        </h1>
        <p className="intro readable">
          Try a few settings and tell us whether each one feels comfortable. Your answers help set up the website for you.
          This is a comfort check, not a medical or vision test.
        </p>

        {speechChoice !== null && window.speechSynthesis && (
          <div style={{ margin: '1rem 0' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="tactile-btn secondary-btn"
                onClick={() => speak(titleRef.current.textContent + '. ' + bodyRef.current.textContent, MODULES[2].options[speechChoice][1])}
              >
                🔊 Hear these instructions at {MODULES[2].options[speechChoice][0]}
              </button>
              <button type="button" className="tactile-btn secondary-btn" onClick={stopSpeech}>Stop speech</button>
            </div>
            <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>Pause your screen reader before playing speech.</small>
          </div>
        )}

        <section className="applied-settings" aria-live="polite" hidden={!progress.length} style={{ margin: '1rem 0', padding: '0.85rem', backgroundColor: 'var(--bg-elevated)', borderRadius: '0.4rem', border: '0.12rem solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>Progress and saved settings</h2>
          <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>{progress.map((line) => <li key={line}>{line}</li>)}</ul>
        </section>

        <section className="question" aria-labelledby="step-title" style={{ margin: '1.5rem 0' }}>
          <h2 id="step-title" tabIndex={-1} ref={titleRef} style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            {confirming ? `Choose your preferred ${mod.name.toLowerCase()} setting` : mod.q}
          </h2>
          <div ref={bodyRef}>
            {confirming ? (
              <>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {firstYes
                    ? 'Pick the option you prefer. It does not have to be the smallest or fastest one that worked.'
                    : 'None of the options you tried felt comfortable. Choose the closest one, or select Skip.'}
                </p>
                <ul className="mcq-options-list" role="radiogroup" aria-labelledby="step-title">
                  {mod.options.map(([label], k) => {
                    const t = rec.tested.find((x) => x[0] === k)
                    const isChecked = k === cur
                    return (
                      <li key={label} className="mcq-option-item">
                        <button
                          type="button"
                          className={`tactile-btn mcq-option-btn ${isChecked ? 'selected' : ''}`}
                          aria-pressed={isChecked}
                          onClick={() => update((s, r) => { r.draftChoice = k }, false)}
                        >
                          <span className="option-indicator" aria-hidden="true">{isChecked ? '●' : '○'}</span>
                          <div className="option-content">
                            <span className="option-label" style={{ fontWeight: 800 }}>{label}</span>
                            <span className="option-desc" style={{ color: 'var(--text-muted)' }}>
                              {t ? (t[1] ? '✓ Comfortable' : '✕ Not comfortable') : 'Not tried yet'}
                            </span>
                          </div>
                          {isChecked && <span className="selection-pill" aria-hidden="true">✓ Selected</span>}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </>
            ) : <p style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Now testing: <strong>{option[0]}</strong></p>}
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-elevated)', border: '0.12rem solid var(--border-color)', borderRadius: '0.45rem', margin: '1rem 0' }}>
            {sample}
          </div>
        </section>

        <div ref={errorRef} className="message message-error" role="alert" tabIndex={-1} hidden={!error}>{error}</div>

        {!confirming && (
          <div style={{ display: 'flex', gap: '1rem', margin: '1.25rem 0' }}>
            <button
              type="button"
              className="tactile-btn primary-btn"
              style={{ minWidth: '7rem', fontSize: '1.15rem' }}
              onClick={() => answer(true)}
            >
              ✓ Yes (Comfortable)
            </button>
            <button
              type="button"
              className="tactile-btn secondary-btn"
              style={{ minWidth: '7rem', fontSize: '1.15rem' }}
              onClick={() => answer(false)}
            >
              ✕ No (Not Comfortable)
            </button>
          </div>
        )}

        <div className="mcq-footer-actions">
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="tactile-btn secondary-btn" onClick={back}>Back</button>
            <button type="button" className="tactile-btn secondary-btn" onClick={skip}>Skip</button>
          </div>
          <button type="button" className="tactile-btn primary-btn mcq-next-btn" onClick={next}>
            {!confirming ? 'Choose preference' : m === LAST ? 'See results →' : 'Next module →'}
          </button>
        </div>
      </article>
    </main>
  )
}

export function Results() {
  const [state, setState] = useStored(KEY, fresh())

  useEffect(() => {
    const current = ensureSession()
    const now = new Date().toISOString()
    sessionRepository.patch(current.id, (session) => ({
      ...session,
      updatedAt: now,
      completedAt: session.completedAt ?? now,
      vision: {
        ...session.vision,
        completedAt: session.vision?.completedAt ?? now,
      },
    }))
  }, [])

  const visualPreferences = MODULES.map((module, index) => {
    const choice = state.recs[index].choice
    return choice !== null && !state.recs[index].skipped
      ? { label: module.name, value: module.options[choice][0] }
      : null
  }).filter(Boolean)

  // Keep the assessment's chosen contrast, cursor, and text size active on this page too.
  useEffect(() => applyAssessment(state, load('fontSize', 20)), [state])

  function startOver() {
    applyAssessment(fresh(), load('fontSize', 20))
    setState(fresh())
    save('visualFlow', {})
    navigate('/')
  }

  function startSkillsAssessment() {
    localStorage.removeItem('skillsAssessment')
    navigate('/telemetry-assessment')
  }

  return (
    <main id="main-content" role="main" className="page-shell">
      <article className="tactile-card mcq-card" aria-labelledby="results-heading">
        <div className="mcq-top-row">
          <span className="step-badge">Visual Check Complete</span>
          <span className="branch-badge">Confirmed Preferences</span>
        </div>

        <h1 id="results-heading" tabIndex={-1} className="mcq-question-title">Your Visual Comfort Settings</h1>
        <p className="intro readable">Here are the screen and comfort preferences you selected.</p>

        <section style={{ margin: '1.5rem 0', padding: '1.25rem', backgroundColor: 'var(--bg-elevated)', borderRadius: '0.5rem', border: '0.12rem solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Your visual comfort preferences</h2>
          {visualPreferences.length
            ? <ul style={{ paddingLeft: '1.4rem' }}>{visualPreferences.map(({ label, value }) => <li key={label} style={{ marginBottom: '0.4rem' }}>{label}: <strong>{value}</strong></li>)}</ul>
            : <p>No preferences were confirmed. You can return to the vision assessment to choose settings.</p>}
        </section>

        <div className="mcq-footer-actions">
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="tactile-btn secondary-btn" onClick={() => navigate('/assessment')}>Back</button>
            <button type="button" className="tactile-btn secondary-btn" onClick={startOver}>Start over</button>
          </div>
          <button type="button" className="tactile-btn primary-btn mcq-next-btn" onClick={startSkillsAssessment}>
            Continue to Adaptive Assessment →
          </button>
        </div>
      </article>
    </main>
  )
}
