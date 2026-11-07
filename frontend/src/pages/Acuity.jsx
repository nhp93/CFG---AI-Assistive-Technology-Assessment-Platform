import { useEffect, useRef, useState } from 'react'
import { navigate, useStored } from '../prefs.js'
import { patchCurrentVision } from '../sessions/store'

export default function Acuity() {
  const [answer, setAnswer] = useStored('acuityAtLeast2070', '')
  const [error, setError] = useState(false)
  const formRef = useRef(null)
  const errorRef = useRef(null)

  useEffect(() => {
    if (answer === 'yes' || answer === 'no') patchCurrentVision({ acuityAtLeast2070: answer })
  }, [answer])

  useEffect(() => {
    function onKey(e) {
      if (e.altKey || e.ctrlKey || e.metaKey || e.target.matches('input, textarea, select') || e.target.isContentEditable) return
      if (e.code === 'Space') {
        if (e.target.closest('button, a')) return
        e.preventDefault()
        formRef.current?.requestSubmit()
        return
      }
      const value = { f: 'yes', j: 'no' }[e.key.toLowerCase()]
      if (!value) return
      e.preventDefault()
      const radio = formRef.current?.querySelector(`input[value="${value}"]`)
      if (radio) {
        radio.checked = true
        setAnswer(value)
        patchCurrentVision({ acuityAtLeast2070: value })
        setError(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [setAnswer])

  function submit(e) {
    e.preventDefault()
    if (!answer) {
      setError(true)
      return setTimeout(() => errorRef.current?.focus())
    }
    navigate(answer === 'yes' ? '/acuity-not-required' : '/visual-settings')
  }

  return (
    <main id="main">
      <h1 tabIndex={-1}>Is your visual acuity 20/70 or worse?</h1>
      <p className="intro">For example, 20/200. If you know your visual acuity from an eye-care professional, please answer based on that. This is not a vision test.</p>
      <form ref={formRef} onSubmit={submit} noValidate>
        <fieldset className="question" aria-describedby="acuity-shortcuts">
          <legend>Has an eye-care professional told you that your visual acuity is 20/70 or worse?</legend>
          <div className="options">
            {['yes', 'no'].map((value) => (
              <label key={value} className="option">
                <input type="radio" name="acuity" value={value} checked={answer === value}
                      onChange={() => { setAnswer(value); setError(false) }} />
                <span className="option-text">{value === 'yes' ? 'Yes' : 'No'}</span>
              </label>
            ))}
          </div>
          <p id="acuity-shortcuts" className="shortcut-hint">Keyboard shortcuts: F = Yes, J = No, Space = Next.</p>
          <div ref={errorRef} className="message message-error" role="alert" tabIndex={-1} hidden={!error}>Please choose Yes or No to continue.</div>
        </fieldset>
        <div className="actions">
          <button type="button" className="button button-secondary" onClick={() => navigate('/')}>Back to welcome</button>
          <button type="submit" className="button button-primary">Next</button>
        </div>
      </form>
    </main>
  )
}
