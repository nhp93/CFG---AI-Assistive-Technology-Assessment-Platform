import { useEffect, useState } from 'react'
import { applyFontSize, load, navigate, save, useStored } from '../prefs.js'
import { ensureSession, sessionRepository } from '../sessions/store'
import { projectSkills } from '../sessions/project'
import { calculateAbilityScore, getQuestionPath, getRecommendation } from '../telemetry/assessmentTree'
import McqQuestionCard from '../telemetry/McqQuestionCard'
import type { McqQuestion, QuestionTelemetry } from '../telemetry/types'

type FlowState = {
  schemaVersion: number
  currentQuestion: string
  limitation: string | null
  impact: string | null
  goal: string | null
  detail: string | null
  tool: string | null
  support: string | null
  answers: Record<string, string>
  metrics: QuestionTelemetry[]
  skillResponses: Array<{ questionId: string; prompt: string; answerId: string; answerLabel: string; score: number; weight: number }>
  score: number | null
  submitted: boolean
  recommendation: ReturnType<typeof getRecommendation> | null
  initialFontScale: number
  initialTheme: string
  fontScale: number
  theme: string
}

const getVisionTheme = () => {
  const contrast = document.documentElement.dataset.assessmentContrast
  const contrastThemes: Record<string, string> = {
    '0': 'black-on-white', '1': 'white-on-black', '2': 'yellow-on-black',
    '3': 'black-on-yellow', '4': 'dim',
  }
  if (contrast && contrastThemes[contrast]) return contrastThemes[contrast]
  const palette = load('palette', 'standard')
  if (palette === 'blue-orange') return 'blue-orange'
  if (palette === 'blue-yellow') return 'blue-yellow'
  if (palette === 'monochrome') return 'monochrome'
  return 'white-on-black'
}

const createFlow = (): FlowState => {
  const fontScale = load('fontSize', 20)
  const theme = getVisionTheme()
  return {
    schemaVersion: 2, currentQuestion: 'limitation', limitation: null, impact: null, goal: null, detail: null,
    tool: null, support: null, answers: {}, metrics: [], skillResponses: [],
    score: null, submitted: false, recommendation: null,
    initialFontScale: fontScale, initialTheme: theme, fontScale, theme,
  }
}

export default function AssessmentScreen() {
  const [storedFlow, setFlow] = useStored('skillsAssessment', createFlow())
  const flow: FlowState = storedFlow.schemaVersion === 2 ? storedFlow : createFlow()
  const [staffOpen, setStaffOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [theme, setTheme] = useState(flow.theme)
  const [fontScale, setFontScale] = useState(flow.fontScale)

  useEffect(() => {
    if (storedFlow.schemaVersion !== 2) setFlow(flow)
  }, [flow, setFlow, storedFlow.schemaVersion])
  const questionPath = getQuestionPath(flow)
  const foundQuestionIndex = questionPath.findIndex((item) => item.id === flow.currentQuestion)
  const questionIndex = foundQuestionIndex >= 0 ? foundQuestionIndex : 0
  const question: McqQuestion = questionPath[questionIndex]
  const step = questionIndex + 1
  const totalSteps = questionPath.length

  function changeFontScale(size: number) {
    setFontScale(size)
    applyFontSize(size)
    save('fontSize', size)
    setFlow({ ...flow, fontScale: size })
  }

  function toggleTheme() {
    const next = theme === 'yellow-on-black' ? 'white-on-black' : 'yellow-on-black'
    setTheme(next)
    setFlow({ ...flow, theme: next })
  }

  async function continueWith(metrics: QuestionTelemetry) {
    if (isSubmitting) return
    const answer = metrics.selectedOption
    if (!answer) return
    const next = { ...flow, answers: { ...flow.answers, [question.id]: answer }, metrics: [...flow.metrics, metrics] }
    if (question.id === 'limitation') next.limitation = answer
    else if (question.id.startsWith('impact_')) next.impact = answer
    else if (question.id === 'goal') next.goal = answer
    else if (question.id === 'tool_familiarity') next.tool = answer
    else if (question.id === 'support_preference') next.support = answer
    else if (!question.id.startsWith('skill_')) next.detail = answer

    let skillResponses = flow.skillResponses
    if (question.id.startsWith('skill_')) {
      const skillOption = question.options.find((option) => option.id === answer)
      if (skillOption?.score === undefined) return
      skillResponses = [...flow.skillResponses, {
        questionId: question.id,
        prompt: question.title,
        answerId: answer,
        answerLabel: skillOption.label,
        score: skillOption.score,
        weight: question.weight ?? 1,
      }]
      next.skillResponses = skillResponses
    }

    const nextQuestion = getQuestionPath(next)[questionIndex + 1]
    if (nextQuestion) {
      next.currentQuestion = nextQuestion.id
      setFlow(next)
      const session = ensureSession()
      const projectedSkills = projectSkills({
        ...next,
        startedAt: session.skills?.startedAt ?? new Date().toISOString(),
        submitted: false,
        completedAt: null,
        fontScale,
        theme,
      })
      sessionRepository.patch(session.id, (current) => ({
        ...current,
        updatedAt: new Date().toISOString(),
        skills: projectedSkills,
      }))
      return
    }

    const score = calculateAbilityScore(skillResponses)
    const goal = next.goal ?? 'explore'
    const detail = next.detail ?? 'device_basics'
    const recommendation = getRecommendation(goal, detail, score,
      { fontScale: flow.initialFontScale, theme: flow.initialTheme }, next.tool ?? 'none_yet', next.support ?? 'coached_practice', next.impact ?? 'none_other')
    next.score = score
    next.recommendation = recommendation
    next.submitted = true
    setFlow(next)
    setIsSubmitting(true)

    const completedTelemetry = next.metrics
    save('assessmentTelemetry', completedTelemetry)
    const session = ensureSession()
    const projectedSkills = projectSkills({
      ...flow,
      startedAt: session.skills?.startedAt ?? new Date().toISOString(),
      submitted: true,
      completedAt: new Date().toISOString(),
      score,
      recommendation,
      skillResponses: skillResponses,
      metrics: completedTelemetry,
      limitation: next.limitation,
      impact: next.impact,
      goal,
      detail,
      tool: next.tool ?? null,
      support: next.support ?? null,
      fontScale,
      theme,
    })
    sessionRepository.patch(session.id, (current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      skills: projectedSkills,
    }))
    setIsSubmitting(false)
    navigate('/skills-results')
  }

  return (
    <>
      <McqQuestionCard key={question.id} question={question} step={step} totalSteps={totalSteps} fontScale={fontScale} theme={theme}
        isSubmitting={isSubmitting} onFontScale={changeFontScale} onToggleTheme={toggleTheme} onContinue={continueWith}
        onStaffHelp={() => setStaffOpen(true)} />
      {staffOpen && (
        <div className="modal-overlay open" role="dialog" aria-modal="true" aria-labelledby="skills-help-title">
          <div className="modal-dialog">
            <h2 id="skills-help-title">Ask for staff help</h2>
            <p>Please let a Lions Services assessor know you would like assistance with this assessment.</p>
            <button type="button" className="btn-modal-dismiss" onClick={() => setStaffOpen(false)}>Return to assessment</button>
          </div>
        </div>
      )}
    </>
  )
}
