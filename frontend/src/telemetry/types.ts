export type StruggleReason = 'none' | 'visual_motor' | 'cognitive_indecision' | 'slow_reading'

export interface QuestionTelemetry {
  questionId: string
  selectedOption: string | null
  timeSpentMs: number
  hoverSwitches: number
  answerChanges: number
  misclicks: number
  uiTweaksMidQuestion: number
  isStruggling: boolean
  struggleReason: StruggleReason
}

export interface McqOption {
  id: string
  label: string
  description?: string
  score?: number
}

export interface McqQuestion {
  id: string
  title: string
  instruction?: string
  options: McqOption[]
  weight?: number
}
