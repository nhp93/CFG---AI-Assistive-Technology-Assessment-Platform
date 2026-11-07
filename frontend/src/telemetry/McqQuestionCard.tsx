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
  initialAnswer?: string | null
  onContinue: (telemetry: QuestionTelemetry) => void
  onBack?: () => void
  onStaffReview?: () => void
}

export default function McqQuestionCard({
  question,
  step,
  totalSteps,
  isSubmitting,
  initialAnswer = null,
  onContinue,
  onBack,
  onStaffReview,
}: Props) {
  const telemetry = useQuestionTelemetry(question.id, initialAnswer)
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

        {/* Tactile Segmented Progress Pill Bar */}
        <div
          className="segmented-progress-track"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`Question progress: ${step} of ${totalSteps}`}
        >
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepNum = i + 1
            const isCompleted = stepNum < step
            const isCurrent = stepNum === step
            return (
              <div
                key={i}
                className={`progress-segment ${isCompleted ? 'segment-completed' : ''} ${isCurrent ? 'segment-current' : ''}`}
                title={`Step ${stepNum} of ${totalSteps}${isCompleted ? ' (Completed)' : isCurrent ? ' (Current)' : ''}`}
              >
                <span className="segment-label" aria-hidden="true">
                  {isCompleted ? '✓' : stepNum}
                </span>
              </div>
            )
          })}
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
          <div className="mcq-footer-left" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {onBack && (
              <button
                type="button"
                className="tactile-btn secondary-btn mcq-back-btn"
                onClick={onBack}
              >
                ← Back
              </button>
            )}

            {onStaffReview && (
              <button
                type="button"
                className="tactile-btn secondary-btn request-staff-btn"
                onClick={onStaffReview}
              >
                👤 Request In-Person Staff Review
              </button>
            )}
          </div>

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
