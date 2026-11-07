import { MODULES } from '../prefs.js'
import { BASELINE_MIN, REASONS } from '../staff/data.js'
import type { AssessmentSession } from './types'

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)
const average = (values: number[]) => (values.length ? sum(values) / values.length : 0)
const safeMax = (values: number[]) => (values.length ? Math.max(...values) : 0)

function toModuleState(module): string {
  if (module.choiceIndex !== null) return 'confirmed'
  if (module.skipped) return 'skipped'
  if (!module.trials.length) return 'not-started'
  return 'unresolved'
}

export function deriveClient(session: AssessmentSession) {
  const modules = session.vision.modules.map((module, index) => {
    const trialRecords = module.trials.map((trial) => {
      const reason = trial.telemetry?.struggleReason ?? 'none'
      return { ...trial, label: trial.optionLabel, reason, struggling: reason !== 'none' }
    })
    const state = toModuleState(module)
    const flagged = trialRecords.filter((trial) => trial.struggling).length
    return {
      ...module,
      name: module.name || MODULES[index]?.name || `Module ${index + 1}`,
      question: MODULES[index]?.q || 'Question',
      trials: trialRecords,
      state,
      choiceLabel: module.choiceLabel ?? null,
      flagged,
      noCount: trialRecords.filter((trial) => !trial.yes).length,
    }
  })

  const states = modules.map((module) => module.state)
  const isSelfServeComplete = session.vision.acuityAtLeast2070 === 'no' && session.skills !== null && session.skills.completedAt !== null
  const isStandardComplete = !states.includes('not-started') && !states.includes('unresolved')
  const status = (session.completedAt !== null || isSelfServeComplete || isStandardComplete)
    ? 'Complete'
    : states.includes('unresolved')
      ? 'Needs follow-up'
      : 'In progress'

  const followUp = modules.flatMap((module) => [
    module.state === 'not-started' && session.vision.acuityAtLeast2070 !== 'no' && `${module.name}: not started yet`,
    module.state === 'unresolved' && (status === 'In progress' ? `${module.name}: started, no setting confirmed yet` : `${module.name}: no comfortable setting found after ${module.trials.length} tries`),
    module.state === 'skipped' && `${module.name}: skipped (${module.skipReason ?? 'not captured'})`,
    module.flagged >= 2 && `${module.name}: ${module.flagged} questions flagged as struggling`,
  ].filter(Boolean))

  const date = new Date(session.startedAt).toISOString().slice(0, 10)
  const onlineMinutes = calculateDurationMinutes(session.startedAt, session.completedAt ?? session.updatedAt)
  const inPersonMinutes = session.staff.inPersonMinutes ?? null

  const visionFlagged = sum(modules.map((module) => module.flagged))
  const skillsFlagged = (session.skills?.questions ?? []).filter((q: any) => q.isStruggling).length
  const struggle = visionFlagged + skillsFlagged

  const visionQuestions = sum(modules.map((module) => module.trials.length))
  const skillsQuestions = (session.skills?.questions ?? []).length
  const questions = visionQuestions + skillsQuestions

  const visionReasons = modules.flatMap((module) => module.trials.map((trial) => trial.reason)).filter((reason) => reason !== 'none')
  const skillsReasons = (session.skills?.questions ?? []).map((q: any) => q.struggleReason).filter((r: any) => r && r !== 'none')
  const reasons = [...new Set([...visionReasons, ...skillsReasons])]

  return {
    id: session.id,
    name: session.displayName ?? session.code,
    code: session.code,
    source: session.source,
    vision: session.vision,
    date,
    online: onlineMinutes,
    inPerson: inPersonMinutes,
    modules,
    status,
    followUp,
    struggle,
    questions,
    adjustments: sum(modules.map((module) => Math.max(0, module.trials.length - 1))),
    weakPoints: modules.filter((module) => module.flagged || module.state === 'unresolved').map((module) => module.name),
    reasons,
    skills: session.skills,
    scoreBand: session.skills?.scoreBand ?? null,
    staff: session.staff,
  }
}

export function computeStats(clients: any[]) {
  const completed = clients.filter((client) => client.status !== 'In progress')
  const onlineValues = completed.map((client) => Number(client.online) || 0)
  const inPersonValues = completed
    .filter((client) => client.inPerson !== null && client.inPerson !== undefined && Number.isFinite(Number(client.inPerson)))
    .map((client) => Number(client.inPerson))
  const savedValues = inPersonValues.map((minutes) => Math.max(0, BASELINE_MIN - minutes))
  const byModule = MODULES.map((module, index) => ({
    name: module.name,
    flagged: sum(clients.map((client) => client.modules[index]?.flagged ?? 0)),
    clients: clients.filter((client) => (client.modules[index]?.flagged ?? 0) > 0).length,
    no: sum(clients.map((client) => client.modules[index]?.noCount ?? 0)),
    asked: sum(clients.map((client) => client.modules[index]?.trials.length ?? 0)),
  }))

  const byReason = Object.entries(REASONS).map(([key, label]) => ({
    key,
    label,
    count: sum(clients.flatMap((client) => client.modules.flatMap((module) => module.trials).filter((trial) => trial.reason === key)).map(() => 1)),
  })).sort((a, b) => b.count - a.count)

  const settingStats = MODULES.map((module, index) => {
    const counts = module.options.map(([label], optionIndex) => ({
      label,
      count: clients.filter((client) => client.modules[index]?.choiceIndex === optionIndex).length,
    }))
    const top = safeMax(counts.map((item) => item.count))
    return {
      name: module.name,
      counts,
      confirmed: sum(counts.map((item) => item.count)),
      top: counts.filter((item) => item.count === top).map((item) => item.label),
      topCount: top,
      skipped: clients.filter((client) => client.modules[index]?.state === 'skipped').length,
      open: clients.filter((client) => ['unresolved', 'not-started'].includes(client.modules[index]?.state ?? '')).length,
    }
  })

  return {
    timeStats: {
      n: completed.length,
      online: average(onlineValues),
      inPerson: average(inPersonValues),
      inPersonN: inPersonValues.length,
      savedAvg: average(savedValues),
      savedTotal: sum(savedValues),
    },
    struggleStats: {
      avg: average(clients.map((client) => Number(client.struggle) || 0)),
      max: safeMax(clients.map((client) => Number(client.struggle) || 0)),
      byModule,
      byReason,
    },
    settingStats,
  }
}

export function calculateDurationMinutes(start: string, end: string): number {
  const durationMs = new Date(end).getTime() - new Date(start).getTime()
  if (isNaN(durationMs) || durationMs <= 0) return 0.1
  return Number((durationMs / 60000).toFixed(1))
}
