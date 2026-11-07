import { CLIENTS, MODULES } from '../staff/data.js'
import { getSkillQuestions, getQuestionPath, getRecommendation, calculateAbilityScore } from '../telemetry/assessmentTree'
import { getStruggleReason } from '../telemetry/useQuestionTelemetry.ts'
import type { AssessmentSession, VisionModuleRecord } from './types'

function moduleToVision(module: any, index: number): VisionModuleRecord {
  const trials = (module.trials ?? []).map((trial: any) => {
    const optionIndex = Number(trial.opt ?? 0)
    const optionLabel = MODULES[index]?.options?.[optionIndex]?.[0] ?? `Option ${optionIndex}`
    const reason = getStruggleReason({
      timeSpentMs: Number(trial.sec ?? 0) * 1000,
      hoverSwitches: Number(trial.hovers ?? 0),
      answerChanges: Number(trial.changes ?? 0),
      misclicks: Number(trial.misclicks ?? 0),
      uiTweaksMidQuestion: Number(trial.tweaks ?? 0),
    })
    return {
      optionIndex,
      optionLabel,
      yes: !!trial.yes,
      telemetry: {
        timeSpentMs: Number(trial.sec ?? 0) * 1000,
        hoverSwitches: Number(trial.hovers ?? 0),
        answerChanges: Number(trial.changes ?? 0),
        misclicks: Number(trial.misclicks ?? 0),
        uiTweaksMidQuestion: Number(trial.tweaks ?? 0),
        struggleReason: reason,
      },
    }
  })
  const choiceIndex = module.choice ?? null
  return {
    moduleKey: ['magnification', 'contrast', 'speech'][index] ?? 'magnification',
    name: MODULES[index]?.name ?? `Module ${index + 1}`,
    trials,
    choiceIndex,
    choiceLabel: choiceIndex !== null && MODULES[index]?.options?.[choiceIndex]?.[0] ? MODULES[index].options[choiceIndex][0] : null,
    skipped: module.skip !== null && module.skip !== undefined,
    skipReason: module.skip ?? null,
  }
}

function buildSkills(client: any, index: number) {
  const goals = ['documents', 'communication', 'work_tasks', 'files', 'explore']
  const details = ['digital', 'scanned', 'web', 'email_read', 'online_form', 'locate', 'device_basics']
  const tools = ['magnification', 'speech', 'ocr', 'keyboard_braille', 'voice', 'staff_help', 'none_yet']
  const supports = ['self_paced', 'coached_practice', 'step_by_step', 'explore_tools']
  const goal = goals[index % goals.length]
  const detail = details[index % details.length]
  const tool = tools[index % tools.length]
  const support = supports[index % supports.length]
  const path = getQuestionPath({ limitation: 'not_sure', goal, detail, tool })
  const metrics = path.map((question, questionIndex) => ({
    questionId: question.id,
    selectedOption: question.options[(index + questionIndex) % question.options.length]?.id ?? null,
    timeSpentMs: 5000 + ((index + questionIndex) * 1100),
    hoverSwitches: questionIndex % 3,
    answerChanges: questionIndex % 2,
    misclicks: questionIndex % 2 === 0 ? 1 : 0,
    uiTweaksMidQuestion: 0,
    isStruggling: questionIndex % 3 === 0,
    struggleReason: questionIndex % 3 === 0 ? 'visual_motor' : 'none',
  }))
  const skillResponses = getSkillQuestions(goal, detail, tool).map((question, questionIndex) => {
    const option = question.options[(index + questionIndex) % question.options.length]
    return {
      questionId: question.id,
      prompt: question.title,
      answerId: option.id,
      answerLabel: option.label,
      score: option.score ?? 50,
      weight: question.weight ?? 1,
    }
  })
  const score = calculateAbilityScore(skillResponses)
  const recommendation = getRecommendation(goal, detail, score, { fontScale: 20, theme: 'white-on-black' }, tool, support, 'small_detail')
  const startedAt = new Date(`${client.date}T09:00:00Z`).toISOString()
  const completedAt = new Date(new Date(startedAt).getTime() + client.online * 60000 + 300000).toISOString()
  return {
    startedAt,
    completedAt,
    limitation: 'not_sure',
    impact: 'small_detail',
    goal,
    detail,
    tool,
    support,
    responses: skillResponses,
    questions: metrics,
    score,
    scoreBand: score >= 80 ? 'Independent practice' : score >= 50 ? 'Practice with occasional support' : 'Start with guided practice',
    recommendation,
    display: { fontScale: 20, theme: 'white-on-black' },
  }
}

export function buildDemoSessions(): AssessmentSession[] {
  return CLIENTS.map((client: any, index: number) => {
    const startedAt = new Date(`${client.date}T09:00:00Z`).toISOString()
    const visionCompletedAt = new Date(new Date(startedAt).getTime() + Number(client.online || 0) * 60000).toISOString()
    const modules = client.modules.slice(0, MODULES.length).map((module: any, moduleIndex: number) => moduleToVision(module, moduleIndex))
    const skills = client.status === 'In progress' ? null : buildSkills(client, index)
    const completedAt = skills ? new Date(Math.max(new Date(visionCompletedAt).getTime(), new Date(skills.completedAt ?? visionCompletedAt).getTime())).toISOString() : null
    return {
      schemaVersion: 1,
      id: `demo-c${String(index + 1).padStart(2, '0')}`,
      code: `D-${String(index + 1).padStart(2, '0')}`,
      displayName: client.name,
      source: 'demo',
      createdAt: startedAt,
      updatedAt: completedAt ?? visionCompletedAt,
      startedAt,
      completedAt,
      vision: {
        acuityAtLeast2070: null,
        colorVisionDifference: null,
        skippedReason: null,
        palette: 'standard',
        baseFontSizePx: 20,
        zoom: 1,
        startedAt,
        completedAt: visionCompletedAt,
        modules,
      },
      skills,
      staff: {
        inPersonMinutes: Number(client.inPerson ?? 0),
        notes: '',
        reviewedAt: null,
      },
    }
  })
}
