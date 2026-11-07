import { useEffect, useState } from 'react'
import { navigate, useStored } from '../prefs.js'
import { ensureSession, sessionRepository } from '../sessions/store'
import { projectSkills } from '../sessions/project'
import {
  getAdaptiveQuestionPath,
  getAdaptiveRecommendations,
  calculateAssessmentScore,
  LIMITATIONS,
} from '../telemetry/assessmentTree'
import McqQuestionCard from '../telemetry/McqQuestionCard'
import type { McqQuestion, QuestionTelemetry } from '../telemetry/types'

type FlowState = {
  schemaVersion: number
  contextComplete: boolean
  currentQuestion: string
  answers: Record<string, string>
  metrics: QuestionTelemetry[]
  submitted: boolean
  score: number | null
  recommendations: any[]
}

const createFlow = (): FlowState => ({
  schemaVersion: 4,
  contextComplete: false,
  currentQuestion: 'primary_focus',
  answers: {},
  metrics: [],
  submitted: false,
  score: null,
  recommendations: [],
})

function buildAnswerDetails(answers: Record<string, string>, path: McqQuestion[]) {
  const contextOption = LIMITATIONS.options.find((option) => option.id === answers.limitation)
  const context = contextOption ? [{
    questionId: LIMITATIONS.id,
    prompt: LIMITATIONS.title,
    answerId: contextOption.id,
    answerLabel: contextOption.label,
  }] : []
  const decisionAnswers = path.flatMap((item) => {
    const option = item.options.find((candidate) => candidate.id === answers[item.id])
    return option ? [{ questionId: item.id, prompt: item.title, answerId: option.id, answerLabel: option.label }] : []
  })
  return [...context, ...decisionAnswers]
}

export default function AssessmentScreen() {
  const [storedFlow, setFlow] = useStored('skillsAssessment', createFlow())
  const flow: FlowState = storedFlow?.schemaVersion === 4 ? storedFlow : createFlow()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (storedFlow?.schemaVersion !== 4) {
      setFlow(flow)
    }
  }, [flow, setFlow, storedFlow?.schemaVersion])

  const questionPath = getAdaptiveQuestionPath(flow.answers)
  const foundIndex = questionPath.findIndex((q) => q.id === flow.currentQuestion)
  const questionIndex = foundIndex >= 0 ? foundIndex : 0
  const question: McqQuestion = questionPath[questionIndex] || questionPath[0]
  const step = questionIndex + 1
  const totalSteps = questionPath.length

  function continueFromContext() {
    if (!flow.answers.limitation) return
    setFlow({
      ...flow,
      answers: { limitation: flow.answers.limitation },
      metrics: [],
      contextComplete: true,
      currentQuestion: 'primary_focus',
    })
  }

  async function continueWith(metrics: QuestionTelemetry) {
    if (isSubmitting) return
    const answer = metrics.selectedOption
    if (!answer) return

    const nextAnswers = { ...flow.answers, [question.id]: answer }
    const nextMetrics = [...flow.metrics, metrics]

    // Calculate next question in adaptive path based on new answers
    const nextPath = getAdaptiveQuestionPath(nextAnswers)
    const nextQuestion = nextPath[questionIndex + 1]

    if (nextQuestion) {
      const nextFlow: FlowState = {
        ...flow,
        currentQuestion: nextQuestion.id,
        answers: nextAnswers,
        metrics: nextMetrics,
      }
      setFlow(nextFlow)

      const session = ensureSession()
      sessionRepository.patch(session.id, (current) => ({
        ...current,
        updatedAt: new Date().toISOString(),
        skills: projectSkills({
          startedAt: session.skills?.startedAt ?? new Date().toISOString(),
          submitted: false,
          completedAt: null,
          limitation: nextAnswers.limitation ?? null,
          impact: nextAnswers[`impact_${nextAnswers.limitation}`] ?? null,
          answers: nextAnswers,
          answerDetails: buildAnswerDetails(nextAnswers, nextPath),
          metrics: nextMetrics,
          goal: nextAnswers.goal ?? nextAnswers.primary_focus ?? 'explore',
          detail: nextAnswers.task ?? 'personal',
        }),
      }))
      return
    }

    // All questions completed!
    setIsSubmitting(true)
    const finalScore = calculateAssessmentScore(nextAnswers)
    const recommendations = getAdaptiveRecommendations(nextAnswers)

    const finalFlow: FlowState = {
      ...flow,
      answers: nextAnswers,
      metrics: nextMetrics,
      submitted: true,
      score: finalScore,
      recommendations,
    }
    setFlow(finalFlow)

    const now = new Date().toISOString()
    const session = ensureSession()
    const skillResponses = nextPath.flatMap((item) => {
      const answerId = nextAnswers[item.id]
      const option = item.options.find((candidate) => candidate.id === answerId)
      if (!option || typeof option.score !== 'number') return []
      return [{
        questionId: item.id,
        prompt: item.title,
        answerId,
        answerLabel: option.label,
        score: option.score,
        weight: item.weight ?? 1,
      }]
    })

    const projectedSkills = projectSkills({
      startedAt: session.skills?.startedAt ?? now,
      submitted: true,
      completedAt: now,
      score: finalScore,
      skillResponses,
      answerDetails: buildAnswerDetails(nextAnswers, nextPath),
      metrics: nextMetrics,
      limitation: nextAnswers.limitation ?? null,
      impact: nextAnswers[`impact_${nextAnswers.limitation}`] ?? null,
      goal: nextAnswers.goal ?? 'personal',
      detail: nextAnswers.task ?? 'general',
      tool: nextAnswers.current_tools ?? null,
      support: nextAnswers.support_preference ?? null,
      recommendation: {
        title: recommendations[0]?.title ?? 'Personalized Assistive Technology Plan',
        tool: recommendations[0]?.description ?? 'Review adaptive tools with an assessor.',
        accessTip: recommendations[0]?.accessTip ?? 'Keep using your high-contrast text and display settings.',
        nextStep: 'Request an in-person staff review or equipment consultation.',
      },
      fontScale: 20,
      theme: 'high-contrast',
    })

    sessionRepository.patch(session.id, (current) => ({
      ...current,
      updatedAt: now,
      completedAt: now,
      skills: projectedSkills,
    }))

    setIsSubmitting(false)
    navigate('/skills-results')
  }

  function handleBack() {
    if (questionIndex <= 0) {
      setFlow({
        ...flow,
        answers: { limitation: flow.answers.limitation },
        metrics: [],
        contextComplete: false,
        currentQuestion: 'primary_focus',
      })
      return
    }
    const prevQuestion = questionPath[questionIndex - 1]
    if (prevQuestion) {
      const retainedQuestionIds = new Set(questionPath.slice(0, questionIndex - 1).map((item) => item.id))
      const nextAnswers = Object.fromEntries(
        Object.entries(flow.answers).filter(([id]) => id === 'limitation' || retainedQuestionIds.has(id)),
      )
      const nextMetrics = flow.metrics.slice(0, Math.max(0, questionIndex - 1))
      setFlow({
        ...flow,
        currentQuestion: prevQuestion.id,
        answers: nextAnswers,
        metrics: nextMetrics,
      })
    }
  }

  function handleStaffReview() {
    navigate('/contact')
  }

  if (!flow.contextComplete) {
    const selectedLimitation = flow.answers.limitation ?? null
    return (
      <main id="main-content" role="main" className="page-shell">
        <article className="tactile-card mcq-card" aria-labelledby="vision-context-heading">
          <div className="mcq-top-row">
            <span className="step-badge">Vision context</span>
            <span className="branch-badge">Before the 10-question assessment</span>
          </div>
          <h1 id="vision-context-heading" className="mcq-question-title">{LIMITATIONS.title}</h1>
          <p className="mcq-instruction-text">{LIMITATIONS.instruction} This helps staff understand your experience; it does not affect your ability score.</p>
          <ul className="mcq-options-list" role="radiogroup" aria-labelledby="vision-context-heading">
            {LIMITATIONS.options.map((option) => {
              const active = selectedLimitation === option.id
              return (
                <li key={option.id} className="mcq-option-item">
                  <button type="button" className={`tactile-btn mcq-option-btn ${active ? 'selected' : ''}`} aria-pressed={active}
                    onClick={() => setFlow({ ...flow, answers: { ...flow.answers, limitation: option.id } })}>
                    <span className="option-indicator" aria-hidden="true">{active ? '●' : '○'}</span>
                    <span className="option-content"><span className="option-label">{option.label}</span></span>
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="mcq-footer-actions">
            <button type="button" className="tactile-btn secondary-btn" onClick={() => navigate('/acuity')}>← Back</button>
            <button type="button" className="tactile-btn primary-btn mcq-next-btn" disabled={!selectedLimitation} onClick={continueFromContext}>
              Continue to assessment →
            </button>
          </div>
        </article>
      </main>
    )
  }

  return (
    <main id="main-content" role="main" className="page-shell">
      <McqQuestionCard
        key={question.id}
        question={question}
        step={step}
        totalSteps={totalSteps}
        isSubmitting={isSubmitting}
        initialAnswer={flow.answers[question.id] ?? null}
        onContinue={continueWith}
        onBack={handleBack}
        onStaffReview={handleStaffReview}
      />
    </main>
  )
}
