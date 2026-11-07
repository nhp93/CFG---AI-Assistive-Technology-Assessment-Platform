import { useEffect, useRef } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import { useQuestionTelemetry } from './useQuestionTelemetry'
import type { McqQuestion, QuestionTelemetry } from './types'
import './assessment.css'

interface Props {
  question: McqQuestion
  step: number
  totalSteps: number
  isSubmitting: boolean
  onContinue: (telemetry: QuestionTelemetry) => void
  onStaffReview?: () => void
}

export default function McqQuestionCard({
  question,
  step,
  totalSteps,
  isSubmitting,
  onContinue,
  onStaffReview,
}: Props) {
  const telemetry = useQuestionTelemetry(question.id)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Auto-focus <h1> on question mount so screen readers automatically announce it
  useEffect(() => {
    headingRef.current?.focus()
  }, [question.id])

  function handleCardClick(e: MouseEvent<HTMLElement>) {
    // Check if the click was directly on the container or background
    if ((e.target as HTMLElement).closest('button, a, input, label')) return
    telemetry.handleContainerClick(e)
  }

  function continueQuestion(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    if (!telemetry.selectedOption) return
    onContinue(telemetry.finalizeQuestion())
  }

  function handleOptionKey(e: KeyboardEvent<HTMLButtonElement>, optionId: string) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      telemetry.handleOptionSelect(optionId, e)
    }
  }

  return (
    <div className="mcq-container" onClick={handleCardClick}>
      <article className="tactile-card mcq-card" aria-labelledby="question-heading">
        <div className="mcq-top-row">
          <span className="step-badge" aria-label={`Question ${step} of ${totalSteps}`}>
            Question {step} of {totalSteps}
          </span>
          <span className="branch-badge">Adaptive Assessment</span>
        </div>

        <h1
          id="question-heading"
          ref={headingRef}
          tabIndex={-1}
          className="mcq-question-title"
        >
          {question.title}
        </h1>

        {question.instruction && (
          <p id="question-instruction" className="mcq-instruction-text">
            {question.instruction}
          </p>
        )}

        <ul
          className="mcq-options-list"
          role="list"
          aria-describedby={question.instruction ? 'question-instruction' : undefined}
        >
          {question.options.map((option, index) => {
            const isSelected = telemetry.selectedOption === option.id
            return (
              <li key={option.id} className="mcq-option-item">
                <button
                  type="button"
                  id={`opt-${option.id}`}
                  className={`tactile-btn mcq-option-btn ${isSelected ? 'selected' : ''}`}
                  aria-pressed={isSelected}
                  onMouseEnter={() => telemetry.handleOptionHover(option.id)}
                  onClick={(e) => telemetry.handleOptionSelect(option.id, e)}
                  onKeyDown={(e) => handleOptionKey(e, option.id)}
                >
                  <span className="option-indicator" aria-hidden="true">
                    {isSelected ? '●' : '○'}
                  </span>
                  <div className="option-content">
                    <span className="option-label">{option.label}</span>
                    {option.description && (
                      <span className="option-desc">{option.description}</span>
                    )}
                  </div>
                  {isSelected && (
                    <span className="selection-pill" aria-hidden="true">
                      ✓ Selected
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        <div className="mcq-footer-actions">
          {onStaffReview && (
            <button
              type="button"
              className="tactile-btn secondary-btn request-staff-btn"
              onClick={onStaffReview}
            >
              👤 Request In-Person Staff Review
            </button>
          )}

          <button
            type="button"
            className="tactile-btn primary-btn mcq-next-btn"
            disabled={!telemetry.selectedOption || isSubmitting}
            onClick={continueQuestion}
          >
            {isSubmitting ? 'Saving Assessment…' : 'Confirm & Next Question →'}
          </button>
        </div>
      </article>
    </div>
  )
}
