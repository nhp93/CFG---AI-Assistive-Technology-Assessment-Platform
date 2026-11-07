import type { KeyboardEvent, MouseEvent } from 'react'
import { useQuestionTelemetry } from './useQuestionTelemetry'
import type { McqQuestion, QuestionTelemetry } from './types'
import './assessment.css'

interface Props {
  question: McqQuestion
  step: number
  totalSteps: number
  fontScale: number
  theme: string
  isSubmitting: boolean
  onFontScale: (size: number) => void
  onToggleTheme: () => void
  onContinue: (telemetry: QuestionTelemetry) => void
  onStaffHelp: () => void
}

export default function McqQuestionCard({ question, step, totalSteps, fontScale, theme,
  isSubmitting, onFontScale, onToggleTheme, onContinue, onStaffHelp }: Props) {
  const telemetry = useQuestionTelemetry(question.id)
  const stop = (e: MouseEvent) => e.stopPropagation()

  function continueQuestion(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    if (!telemetry.selectedOption) return
    onContinue(telemetry.finalizeQuestion())
  }

  function optionKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? index + 1
      : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? index - 1 : -1
    if (next < 0) return
    e.preventDefault()
    const options = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
    const target = options?.[(next + question.options.length) % question.options.length]
    target?.focus()
    if (target) telemetry.handleOptionSelect(target.dataset.optionId ?? '')
  }

  return (
    <main className="mcq-page">
      <section className="mcq-shell" data-theme={theme} onClick={telemetry.handleContainerClick}>
        <header className="mcq-header">
          <div>
            <p className="mcq-brand">Lions Services <span aria-hidden="true">•</span> Skills Assessment</p>
            <p className="mcq-progress" aria-live="polite">Question {step} of {totalSteps}</p>
          </div>
          <button className="mcq-help" type="button" onClick={(e) => { stop(e); onStaffHelp() }}>Ask for Staff Help</button>
        </header>

        <div className="mcq-display-controls" role="group" aria-label="Assessment display controls">
          <span>Text size</span>
          <button type="button" aria-label="Decrease text size" disabled={fontScale <= 16}
            onClick={(e) => { stop(e); onFontScale(Math.max(16, fontScale - 2)); telemetry.recordUiTweak() }}>A−</button>
          <span aria-live="polite">{fontScale}px</span>
          <button type="button" aria-label="Increase text size" disabled={fontScale >= 36}
            onClick={(e) => { stop(e); onFontScale(Math.min(36, fontScale + 2)); telemetry.recordUiTweak() }}>A+</button>
          <button type="button" aria-pressed={theme === 'yellow-on-black'}
            onClick={(e) => { stop(e); onToggleTheme(); telemetry.recordUiTweak() }}>
            Switch to {theme === 'yellow-on-black' ? 'white' : 'yellow'} on black
          </button>
        </div>

        <h1 className="mcq-title" tabIndex={-1}>{question.title}</h1>
        {question.instruction && <p className="mcq-instruction">{question.instruction}</p>}
        <div className="mcq-options" role="radiogroup" aria-label={question.title}>
          {question.options.map((option, index) => (
            <button key={option.id} type="button" role="radio" aria-checked={telemetry.selectedOption === option.id}
              data-option-id={option.id} tabIndex={0} className="mcq-option"
              onMouseEnter={() => telemetry.handleOptionHover(option.id)}
              onClick={(e) => telemetry.handleOptionSelect(option.id, e)}
              onKeyDown={(e) => optionKeyDown(e, index)}>
              <span className="mcq-option-label">{option.label}</span>
              {option.description && <span className="mcq-option-description">{option.description}</span>}
              {telemetry.selectedOption === option.id && <span className="mcq-selected">Selected</span>}
            </button>
          ))}
        </div>

        <div className="mcq-actions">
          <button type="button" className="mcq-next" disabled={!telemetry.selectedOption || isSubmitting} onClick={continueQuestion}>
            {isSubmitting ? 'Saving assessment…' : 'Confirm & Next Question'}
          </button>
        </div>
      </section>
    </main>
  )
}
