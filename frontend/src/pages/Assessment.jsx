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

  // Tactile shortcuts: F = Yes, J = No (while asking), Space = Next when focus is outside a control.
  useEffect(() => {
    function onKey(e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      if (e.code === 'Space') {
        if (e.target.closest('button, input, select, textarea, a')) return
        e.preventDefault()
        return next()
      }
      const key = e.key.toLowerCase()
      if (confirming || (key !== 'f' && key !== 'j')) return
      e.preventDefault()
      answer(key === 'f')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

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
    <main id="main">
      <h1 tabIndex={-1}>Adaptive Vision Assessment</h1>
      <p className="intro readable">
        Try a few settings and tell us whether each one feels comfortable. Your answers help set up the website for you.
        This is a comfort check, not a medical or vision test.
      </p>

      <p className="progress" aria-live="polite">Module {m + 1} of {MODULES.length}: {mod.name}</p>
      {!confirming && <p className="shortcut-hint">Keyboard shortcuts: F = Yes, J = No, Space = Next.</p>}
      {speechChoice !== null && window.speechSynthesis && (
        <>
          <div className="actions">
            <button type="button" className="button button-secondary"
              onClick={() => speak(titleRef.current.textContent + '. ' + bodyRef.current.textContent, MODULES[2].options[speechChoice][1])}>
              Hear these instructions at {MODULES[2].options[speechChoice][0]}
            </button>
            <button type="button" className="button button-secondary" onClick={stopSpeech}>Stop speech</button>
          </div>
          <p>Pause your screen reader before playing speech.</p>
        </>
      )}
      <section className="applied-settings" aria-live="polite" hidden={!progress.length}>
        <h2>Progress and saved settings</h2>
        <ul>{progress.map((line) => <li key={line}>{line}</li>)}</ul>
      </section>

      <section className="question" aria-labelledby="step-title">
        <h2 id="step-title" tabIndex={-1} ref={titleRef}>
          {confirming ? `Choose your preferred ${mod.name.toLowerCase()} setting` : mod.q}
        </h2>
        <div ref={bodyRef}>
          {confirming ? (
            <>
              <p>{firstYes
                ? 'Pick the option you prefer. It does not have to be the smallest or fastest one that worked.'
                : 'None of the options you tried felt comfortable. Choose the closest one, or select Skip.'}</p>
              <div className="options" role="radiogroup" aria-labelledby="step-title">
                {mod.options.map(([label], k) => {
                  const t = rec.tested.find((x) => x[0] === k)
                  return (
                    <label key={label} className="option">
                      <input type="radio" name="choice" checked={k === cur}
                        onChange={() => update((s, r) => { r.draftChoice = k }, false)} />
                      <span className="option-text">{label} ({t ? (t[1] ? 'comfortable' : 'not comfortable') : 'not tried'})</span>
                    </label>
                  )
                })}
              </div>
            </>
          ) : <p>Now showing: <strong>{option[0]}</strong></p>}
        </div>
        {sample}
      </section>

      <div ref={errorRef} className="message message-error" role="alert" tabIndex={-1} hidden={!error}>{error}</div>

      {!confirming && (
        <div className="actions">
          <button type="button" className="button button-secondary" onClick={() => answer(true)}>Yes</button>
          <button type="button" className="button button-secondary" onClick={() => answer(false)}>No</button>
        </div>
      )}
      <div className="actions">
        <button type="button" className="button button-secondary" onClick={back}>Back</button>
        <button type="button" className="button button-secondary" onClick={skip}>Skip</button>
        <button type="button" className="button button-primary" onClick={next}>
          {!confirming ? 'Choose preference' : m === LAST ? 'See results' : 'Next module'}
        </button>
      </div>
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
    <main id="main">
      <h1 tabIndex={-1}>Your Results</h1>
      <p className="intro readable">Here are the visual comfort settings you selected.</p>

      <section className="question" aria-labelledby="results-heading">
        <h2 id="results-heading">Your visual comfort preferences</h2>
        {visualPreferences.length
          ? <ul>{visualPreferences.map(({ label, value }) => <li key={label}>{label}: <strong>{value}</strong></li>)}</ul>
          : <p>No preferences were confirmed. You can return to the vision assessment to choose settings.</p>}
      </section>

      <div className="actions">
        <button type="button" className="button button-secondary" onClick={() => navigate('/assessment')}>Back</button>
        <button type="button" className="button button-secondary" onClick={startSkillsAssessment}>Continue to Skills Assessment</button>
        <button type="button" className="button button-primary" onClick={startOver}>Start over</button>
      </div>
    </main>
  )
}
