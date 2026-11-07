import type { ScoredSkillResponse } from '../telemetry/assessmentTree'
import type { QuestionTelemetry } from '../telemetry/types'

export const SESSION_SCHEMA_VERSION = 1

export type StruggleReason = 'none' | 'visual_motor' | 'cognitive_indecision' | 'slow_reading'

export interface TrialTelemetry {
  timeSpentMs: number
  hoverSwitches: number
  answerChanges: number
  misclicks: number
  uiTweaksMidQuestion: number
  struggleReason: StruggleReason
}

export interface TrialRecord {
  optionIndex: number
  optionLabel: string
  yes: boolean
  telemetry: TrialTelemetry
}

export interface VisionModuleRecord {
  moduleKey: 'magnification' | 'contrast' | 'speech' | 'cursor'
  name: string
  trials: TrialRecord[]
  choiceIndex: number | null
  choiceLabel: string | null
  skipped: boolean
  skipReason: string | null
}

export interface SkillAssessmentAnswer {
  questionId: string
  prompt: string
  answerId: string
  answerLabel: string
}

export interface AssessmentSession {
  schemaVersion: 1
  id: string
  code: string
  displayName: string | null
  source: 'live' | 'demo'
  createdAt: string
  updatedAt: string
  startedAt: string
  completedAt: string | null
  vision: {
    acuityAtLeast2070: 'yes' | 'no' | null
    colorVisionDifference: 'yes' | 'no' | null
    skippedReason: string | null
    palette: string
    baseFontSizePx: number
    zoom: number
    largeText?: boolean
    colorTheme?: string
    startedAt: string | null
    completedAt: string | null
    modules: VisionModuleRecord[]
  }
  skills: null | {
    startedAt: string
    completedAt: string | null
    limitation: string | null
    impact: string | null
    goal: string | null
    detail: string | null
    tool: string | null
    support: string | null
    answers?: SkillAssessmentAnswer[]
    responses: ScoredSkillResponse[]
    questions: QuestionTelemetry[]
    score: number | null
    scoreBand: string | null
    recommendation: {
      title: string
      tool: string
      accessTip: string
      nextStep: string
    } | null
    display: { fontScale: number; theme: string }
  }
  staff: {
    inPersonMinutes: number | null
    notes: string
    reviewedAt: string | null
  }
}

export const emptyVisionModules: VisionModuleRecord[] = [
  { moduleKey: 'magnification', name: 'Magnification', trials: [], choiceIndex: null, choiceLabel: null, skipped: false, skipReason: null },
  { moduleKey: 'contrast', name: 'Contrast', trials: [], choiceIndex: null, choiceLabel: null, skipped: false, skipReason: null },
  { moduleKey: 'speech', name: 'Speech', trials: [], choiceIndex: null, choiceLabel: null, skipped: false, skipReason: null },
  { moduleKey: 'cursor', name: 'Cursor', trials: [], choiceIndex: null, choiceLabel: null, skipped: false, skipReason: null },
]

export function createSession(displayName?: string | null): AssessmentSession {
  const now = new Date().toISOString()
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `live-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const code = `P-${Math.random().toString(36).slice(2, 6).toUpperCase().replace(/[^A-Z0-9]/g, 'X')}`
  return {
    schemaVersion: SESSION_SCHEMA_VERSION,
    id,
    code: code.length >= 6 ? code : `P-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    displayName: displayName ?? null,
    source: 'live',
    createdAt: now,
    updatedAt: now,
    startedAt: now,
    completedAt: null,
    vision: {
      acuityAtLeast2070: null,
      colorVisionDifference: null,
      skippedReason: null,
      palette: 'standard',
      baseFontSizePx: 20,
      zoom: 1,
      startedAt: now,
      completedAt: null,
      modules: structuredClone(emptyVisionModules),
    },
    skills: null,
    staff: {
      inPersonMinutes: null,
      notes: '',
      reviewedAt: null,
    },
  }
}
