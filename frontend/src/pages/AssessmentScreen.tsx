import { useEffect, useState } from 'react'
import { navigate, useStored } from '../prefs.js'
import { ensureSession, sessionRepository } from '../sessions/store'
import { projectSkills } from '../sessions/project'
import {
  getAdaptiveQuestionPath,
  getAdaptiveRecommendations,
  calculateAssessmentScore,
} from '../telemetry/assessmentTree'
import McqQuestionCard from '../telemetry/McqQuestionCard'
import type { McqQuestion, QuestionTelemetry } from '../telemetry/types'

type FlowState = {
  schemaVersion: number
  currentQuestion: string
  answers: Record<string, string>
  metrics: QuestionTelemetry[]
  submitted: boolean
  score: number | null
  recommendations: any[]
}

const createFlow = (): FlowState => ({
  schemaVersion: 3,
  currentQuestion: 'primary_focus',
  answers: {},
  metrics: [],
  submitted: false,
  score: null,
  recommendations: [],
})

export default function AssessmentScreen() {
  const [storedFlow, setFlow] = useStored('skillsAssessment', createFlow())
  const flow: FlowState = storedFlow?.schemaVersion === 3 ? storedFlow : createFlow()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (storedFlow?.schemaVersion !== 3) {
      setFlow(flow)
    }
  }, [flow, setFlow, storedFlow?.schemaVersion])

  const questionPath = getAdaptiveQuestionPath(flow.answers)
  const foundIndex = questionPath.findIndex((q) => q.id === flow.currentQuestion)
  const questionIndex = foundIndex >= 0 ? foundIndex : 0
  const question: McqQuestion = questionPath[questionIndex] || questionPath[0]
  const step = questionIndex + 1
  const totalSteps = questionPath.length

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
          answers: nextAnswers,
          metrics: nextMetrics,
          goal: nextAnswers.primary_focus ?? 'explore',
          detail: nextAnswers.career_path_choice ?? 'personal',
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
    const skillResponses = Object.entries(nextAnswers).map(([qId, ans]) => ({
      questionId: qId,
      prompt: nextPath.find((q) => q.id === qId)?.title ?? qId,
      answerId: ans,
      answerLabel: nextPath.find((q) => q.id === qId)?.options.find((o) => o.id === ans)?.label ?? ans,
      score: 85,
      weight: 1,
    }))

    const projectedSkills = projectSkills({
      startedAt: session.skills?.startedAt ?? now,
      submitted: true,
      completedAt: now,
      score: finalScore,
      skillResponses,
      metrics: nextMetrics,
      goal: nextAnswers.primary_focus ?? 'personal',
      detail: nextAnswers.career_path_choice ?? nextAnswers.personal_home ?? 'general',
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
      navigate('/acuity')
      return
    }
    const prevQuestion = questionPath[questionIndex - 1]
    if (prevQuestion) {
      const nextAnswers = { ...flow.answers }
      delete nextAnswers[question.id]
      const nextMetrics = flow.metrics.slice(0, -1)
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
