import { MODULES } from '../prefs.js'
import { getStruggleReason } from '../telemetry/useQuestionTelemetry.ts'
import type { AssessmentSession, TrialRecord, VisionModuleRecord } from './types'

const moduleKeys = ['magnification', 'contrast', 'speech', 'cursor'] as const

function normalizeTrial(trial: unknown): TrialRecord | null {
  if (!Array.isArray(trial)) return null
  const optionIndex = Number(trial[0])
  const yes = !!trial[1]
  const telemetry = trial[2] && typeof trial[2] === 'object' ? trial[2] : {
    timeSpentMs: 0,
    hoverSwitches: 0,
    answerChanges: 0,
    misclicks: 0,
    uiTweaksMidQuestion: 0,
    struggleReason: 'none',
  }

  const label = MODULES[Number.isFinite(optionIndex) ? optionIndex : 0]?.options?.[optionIndex]?.[0] ?? 'Unknown'
  const reason = getStruggleReason({
    timeSpentMs: Number(telemetry.timeSpentMs ?? 0),
    hoverSwitches: Number(telemetry.hoverSwitches ?? 0),
    answerChanges: Number(telemetry.answerChanges ?? 0),
    misclicks: Number(telemetry.misclicks ?? 0),
    uiTweaksMidQuestion: Number(telemetry.uiTweaksMidQuestion ?? 0),
  })

  return {
    optionIndex: Number.isInteger(optionIndex) ? optionIndex : 0,
    optionLabel: label,
    yes,
    telemetry: {
      timeSpentMs: Number(telemetry.timeSpentMs ?? 0),
      hoverSwitches: Number(telemetry.hoverSwitches ?? 0),
      answerChanges: Number(telemetry.answerChanges ?? 0),
      misclicks: Number(telemetry.misclicks ?? 0),
      uiTweaksMidQuestion: Number(telemetry.uiTweaksMidQuestion ?? 0),
      struggleReason: reason,
    },
  }
}

export function projectVision(visionAssessmentState: any, visualFlow: any, prefs: { palette?: string; baseFontSizePx?: number; zoom?: number } = {}) {
  const recs = Array.isArray(visionAssessmentState?.recs) ? visionAssessmentState.recs : []
  const modules: VisionModuleRecord[] = moduleKeys.map((moduleKey, index) => {
    const rec = recs[index] ?? { tested: [], choice: null, draftChoice: null, skipped: false }
    const choiceIndex = rec.choice ?? rec.draftChoice ?? null
    const trials = (rec.tested ?? []).map(normalizeTrial).filter(Boolean) as TrialRecord[]
    return {
      moduleKey,
      name: MODULES[index]?.name ?? moduleKey,
      trials,
      choiceIndex,
      choiceLabel: choiceIndex !== null && Array.isArray(MODULES[index]?.options?.[choiceIndex]) ? MODULES[index].options[choiceIndex][0] : null,
      skipped: !!rec.skipped,
      skipReason: rec.skipReason ?? null,
    }
  })

  const now = new Date().toISOString()
  return {
    acuityAtLeast2070: visionAssessmentState?.acuityAtLeast2070 ?? visualFlow?.acuityAtLeast2070 ?? null,
    colorVisionDifference: visualFlow?.colorblind ?? null,
    skippedReason: null,
    palette: prefs.palette ?? 'standard',
    baseFontSizePx: Number(prefs.baseFontSizePx ?? 20),
    zoom: Number(prefs.zoom ?? 1),
    startedAt: visionAssessmentState?.startedAt ?? visualFlow?.startedAt ?? now,
    completedAt: visionAssessmentState?.completedAt ?? visualFlow?.completedAt ?? null,
    modules,
  } satisfies AssessmentSession['vision']
}

export function projectSkills(flowState: any): AssessmentSession['skills'] {
  if (!flowState) return null
  const responses = Array.isArray(flowState.skillResponses) ? flowState.skillResponses : []
  const questions = Array.isArray(flowState.metrics) ? flowState.metrics : []
  const score = typeof flowState.score === 'number' ? flowState.score : calculateScore(responses)
  const band = score >= 80 ? 'Independent practice' : score >= 50 ? 'Practice with occasional support' : 'Start with guided practice'
  return {
    startedAt: flowState.startedAt ?? new Date().toISOString(),
    completedAt: flowState.submitted ? (flowState.completedAt ?? new Date().toISOString()) : null,
    limitation: flowState.limitation ?? null,
    impact: flowState.impact ?? null,
    goal: flowState.goal ?? null,
    detail: flowState.detail ?? null,
    tool: flowState.tool ?? null,
    support: flowState.support ?? null,
    responses,
    questions,
    score,
    scoreBand: band,
    recommendation: flowState.recommendation ?? null,
    display: {
      fontScale: Number(flowState.fontScale ?? 20),
      theme: flowState.theme ?? 'white-on-black',
    },
  }
}

function calculateScore(responses: Array<{ score?: number; weight?: number }>) {
  const scored = responses.filter((response) => Number.isFinite(response.score) && Number(response.weight) > 0)
  if (!scored.length) return 0
  const totalWeight = scored.reduce((sum, response) => sum + Number(response.weight || 0), 0)
  const weightedPoints = scored.reduce((sum, response) => sum + Number(response.score || 0) * Number(response.weight || 0), 0)
  return Math.round(weightedPoints / totalWeight)
}
