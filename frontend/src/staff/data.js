// Every dashboard number is derived from CLIENTS below, so summaries can never contradict the client records.
import { MODULES } from '../prefs.js'
import { getStruggleReason } from '../telemetry/useQuestionTelemetry.ts'

// Assumed length of a traditional, fully in-person evaluation. A labelled demo assumption, not a measurement.
export const BASELINE_MIN = 60

export const REASONS = {
  visual_motor: 'Visual-motor (2+ misclicks or display changes mid-question)',
  cognitive_indecision: 'Indecision (5+ option switches or 2+ answer changes)',
  slow_reading: 'Slow reading (over 60 seconds on one question)',
}

const T = (opt, yes, sec, misclicks = 0, hovers = 0, changes = 0, tweaks = 0) => ({ opt, yes, sec, misclicks, hovers, changes, tweaks })
const M = (trials, choice = null, skip = null) => ({ trials, choice, skip })
const Y = true, N = false

const CLIENTS = [
  { id: 'c01', name: 'Jordan Williams', date: '2026-10-06', online: 34, inPerson: 22, modules: [
    M([T(1, N, 48, 2), T(2, N, 40, 0, 0, 0, 1), T(3, N, 35), T(4, Y, 20)], 4),
    M([T(0, N, 25), T(1, Y, 15), T(2, Y, 12)], 2),
    M([T(2, Y, 18), T(1, Y, 20), T(0, N, 30)], 1),
    M([T(0, N, 30, 3), T(1, N, 25, 2), T(2, Y, 14)], 2)] },
  { id: 'c02', name: 'Taylor Johnson', date: '2026-10-08', online: 18, inPerson: 9, modules: [
    M([T(1, Y, 12), T(0, N, 20)], 1),
    M([T(0, Y, 9), T(1, Y, 8), T(2, N, 10), T(3, N, 9), T(4, Y, 11)], 0),
    M([T(2, Y, 14), T(1, Y, 15), T(0, Y, 16)], 0),
    M([T(0, Y, 8)], 0)] },
  { id: 'c03', name: 'Morgan Davis', date: '2026-10-13', online: 29, inPerson: 19, modules: [
    M([T(1, N, 22), T(2, Y, 15)], 2),
    M([T(0, N, 55, 0, 6), T(1, N, 48, 0, 2, 2), T(2, Y, 30), T(3, Y, 40, 0, 5), T(4, N, 20)], 3),
    M([T(2, Y, 17), T(1, N, 24)], 2),
    M([T(0, N, 18), T(1, Y, 12)], 1)] },
  { id: 'c04', name: 'Alex Rivera', date: '2026-10-15', online: 26, inPerson: 17, modules: [
    M([T(1, N, 72), T(2, N, 65), T(3, Y, 30)], 3),
    M([T(0, N, 20), T(1, Y, 14)], 1),
    M([], null, 'Audio unavailable at this workstation'),
    M([T(0, Y, 10)], 0)] },
  { id: 'c05', name: 'Cameron Brooks', date: '2026-10-20', online: 38, inPerson: 31, modules: [
    M([T(1, Y, 14), T(0, Y, 16)], 1),
    M([T(0, Y, 12), T(1, N, 15), T(2, N, 13)], 0),
    M([T(2, N, 40, 0, 1, 2), T(3, Y, 28)], 3),
    M([T(0, N, 58, 4), T(1, N, 61, 3), T(2, N, 50, 0, 0, 0, 1), T(3, N, 45, 2)])] },
  { id: 'c06', name: 'Riley Thompson', date: '2026-10-22', online: 31, inPerson: 20, modules: [
    M([T(1, N, 25), T(2, Y, 18)], 2),
    M([T(0, N, 16), T(1, Y, 11), T(2, Y, 12), T(3, N, 14), T(4, N, 13)], 1),
    M([T(2, N, 62), T(3, Y, 45)], 3),
    M([T(0, N, 20), T(1, Y, 13)], 1)] },
  { id: 'c07', name: 'Casey Mitchell', date: '2026-10-27', online: 36, inPerson: 24, modules: [
    M([T(1, N, 38, 2), T(2, N, 33, 0, 0, 0, 1), T(3, N, 29), T(4, Y, 19)], 4),
    M([T(0, N, 34, 0, 5), T(1, Y, 16), T(2, Y, 15)], 1),
    M([T(2, Y, 19), T(1, N, 26)], 2),
    M([T(0, N, 22), T(1, N, 19), T(2, Y, 12)], 2)] },
  { id: 'c08', name: 'Jamie Parker', date: '2026-10-29', online: 21, inPerson: 14, modules: [
    M([T(1, Y, 13), T(0, N, 18)], 1),
    M([T(0, Y, 10), T(1, Y, 9)], 0),
    M([], null, 'Client preferred not to use audio'),
    M([T(0, N, 26, 0, 6), T(1, Y, 21, 0, 1, 2)], 1)] },
  { id: 'c09', name: 'Avery Collins', date: '2026-11-03', online: 27, inPerson: 16, modules: [
    M([T(1, N, 24), T(2, N, 21), T(3, Y, 14)], 3),
    M([T(0, N, 18), T(1, N, 66), T(2, Y, 15), T(3, N, 17), T(4, N, 14)], 2),
    M([T(2, Y, 16), T(1, Y, 18), T(0, N, 25)], 1),
    M([T(0, N, 17), T(1, Y, 11)], 1)] },
  { id: 'c10', name: 'Drew Anderson', date: '2026-11-05', online: 15, inPerson: 26, modules: [
    M([T(1, N, 31, 2), T(2, Y, 17)], 2),
    M([T(0, N, 19), T(1, Y, 13)]),
    M([]),
    M([])] },
]

const avg = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0)
const sum = (list) => list.reduce((a, b) => a + b, 0)

// Add derived fields: labelled trials, struggle flags, status, weak points, recommendations, follow-ups.
function derive(client) {
  const modules = client.modules.map((m, i) => {
    const mod = MODULES[i]
    const trials = m.trials.map((t) => {
      const reason = getStruggleReason({ timeSpentMs: t.sec * 1000, hoverSwitches: t.hovers, answerChanges: t.changes, misclicks: t.misclicks, uiTweaksMidQuestion: t.tweaks })
      return { ...t, label: mod.options[t.opt][0], reason, struggling: reason !== 'none' }
    })
    const state = m.choice !== null ? 'confirmed' : m.skip ? 'skipped' : !trials.length ? 'not-started' : 'unresolved'
    return { ...m, name: mod.name, question: mod.q, trials, state, choiceLabel: m.choice === null ? null : mod.options[m.choice][0],
      flagged: trials.filter((t) => t.struggling).length, noCount: trials.filter((t) => !t.yes).length }
  })
  const states = modules.map((m) => m.state)
  const status = states.includes('not-started') ? 'In progress' : states.includes('unresolved') ? 'Needs follow-up' : 'Complete'
  const followUp = modules.flatMap((m) => [
    m.state === 'not-started' && `${m.name}: not started yet`,
    m.state === 'unresolved' && (status === 'In progress' ? `${m.name}: started, no setting confirmed yet` : `${m.name}: no comfortable setting found after ${m.trials.length} tries`),
    m.state === 'skipped' && `${m.name}: skipped (${m.skip})`,
    m.flagged >= 2 && `${m.name}: ${m.flagged} questions flagged as struggling`,
  ].filter(Boolean))
  return {
    ...client, modules, status, followUp,
    struggle: sum(modules.map((m) => m.flagged)),
    questions: sum(modules.map((m) => m.trials.length)),
    adjustments: sum(modules.map((m) => Math.max(0, m.trials.length - 1))),
    weakPoints: modules.filter((m) => m.flagged || m.state === 'unresolved').map((m) => m.name),
    reasons: [...new Set(modules.flatMap((m) => m.trials.map((t) => t.reason)).filter((r) => r !== 'none'))],
  }
}

export const clients = CLIENTS.map(derive)
export const findClient = (id) => clients.find((c) => c.id === id)
export const initials = (name) => name.split(' ').map((w) => w[0]).join('')
export const fmtMin = (n) => `${Number.isInteger(n) ? n : n.toFixed(1)} min`

// Time: averages use clients whose online assessment is finished, so a partial session doesn't skew them.
const finished = clients.filter((c) => c.status !== 'In progress')
export const timeStats = {
  n: finished.length,
  online: avg(finished.map((c) => c.online)),
  inPerson: avg(finished.map((c) => c.inPerson)),
  savedAvg: avg(finished.map((c) => BASELINE_MIN - c.inPerson)),
  savedTotal: sum(finished.map((c) => BASELINE_MIN - c.inPerson)),
}

// Struggle: the existing telemetry score is the count of questions flagged as struggling.
export const struggleStats = {
  avg: avg(clients.map((c) => c.struggle)),
  max: Math.max(...clients.map((c) => c.struggle)),
  byModule: MODULES.map((mod, i) => ({
    name: mod.name,
    flagged: sum(clients.map((c) => c.modules[i].flagged)),
    clients: clients.filter((c) => c.modules[i].flagged).length,
    no: sum(clients.map((c) => c.modules[i].noCount)),
    asked: sum(clients.map((c) => c.modules[i].trials.length)),
  })),
  byReason: Object.entries(REASONS).map(([key, label]) => ({
    key, label, count: sum(clients.map((c) => c.modules.flatMap((m) => m.trials).filter((t) => t.reason === key).length)),
  })).sort((a, b) => b.count - a.count),
}

// Settings: only confirmed choices count as recommendations, skipped and unresolved are reported separately.
export const settingStats = MODULES.map((mod, i) => {
  const counts = mod.options.map(([label], o) => ({ label, count: clients.filter((c) => c.modules[i].choice === o).length }))
  const top = Math.max(...counts.map((c) => c.count))
  return {
    name: mod.name, counts, confirmed: sum(counts.map((c) => c.count)),
    top: counts.filter((c) => c.count === top).map((c) => c.label),
    topCount: top,
    skipped: clients.filter((c) => c.modules[i].state === 'skipped').length,
    open: clients.filter((c) => ['unresolved', 'not-started'].includes(c.modules[i].state)).length,
  }
})
