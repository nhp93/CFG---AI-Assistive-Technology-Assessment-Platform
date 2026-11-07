import { useSyncExternalStore } from 'react'
import { createSession, SESSION_SCHEMA_VERSION } from './types'
import type { AssessmentSession } from './types'

const STORAGE_KEY = 'lions.sessions.v1'
const CURRENT_KEY = 'currentSessionId'
const LEGACY_CURRENT_KEY = 'lions.currentSessionId.v1'
const CHANNEL_NAME = 'lions-sessions'
const DATABASE_API = '/api/sessions'

const subscribers = new Set<() => void>()
const databaseStatusSubscribers = new Set<() => void>()
let sessionsSnapshot: AssessmentSession[] | null = null
let databaseStatus = { state: 'loading', error: null as string | null }
let databaseWriteQueue = Promise.resolve()

function getSessionsSnapshot(): AssessmentSession[] {
  if (sessionsSnapshot === null) sessionsSnapshot = readSessions()
  return sessionsSnapshot
}

function updateDatabaseStatus(state: string, error: string | null = null) {
  databaseStatus = { state, error }
  databaseStatusSubscribers.forEach((listener) => listener())
}

function notify() {
  sessionsSnapshot = null
  subscribers.forEach((listener) => listener())
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(CHANNEL_NAME)
    channel.postMessage({ type: 'lions-sessions-change' })
    channel.close()
  }
}

async function databaseRequest(url: string, init?: RequestInit) {
  const response = await fetch(url, init)
  if (!response.ok) {
    let message = `Database request failed (${response.status}).`
    try {
      const body = await response.json()
      if (typeof body.error === 'string') message = body.error
    } catch {
      // Keep the HTTP status message when the server does not return JSON.
    }
    throw new Error(message)
  }
  return response
}

function saveToDatabase(session: AssessmentSession) {
  if (session.source !== 'live') return
  updateDatabaseStatus('saving')
  databaseWriteQueue = databaseWriteQueue
    .then(() => databaseRequest(`${DATABASE_API}/${encodeURIComponent(session.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    }))
    .then(() => updateDatabaseStatus('connected'))
    .catch((error: unknown) => {
      updateDatabaseStatus('offline', error instanceof Error ? error.message : 'Unable to save assessment data.')
    })
}

async function loadFromDatabase() {
  try {
    const response = await databaseRequest(DATABASE_API)
    const stored = await response.json() as AssessmentSession[]
    const databaseSessions = Array.isArray(stored)
      ? stored.filter((session) => session?.schemaVersion === SESSION_SCHEMA_VERSION && session.source === 'live')
      : []
    const merged = new Map(databaseSessions.map((session) => [session.id, session]))
    const localSessions = readSessions()

    for (const local of localSessions.filter((session) => session.source === 'live')) {
      const remote = merged.get(local.id)
      if (!remote || Date.parse(local.updatedAt) > Date.parse(remote.updatedAt)) {
        merged.set(local.id, local)
        saveToDatabase(local)
      }
    }

    const nextSessions = [...merged.values()]
    if (JSON.stringify(localSessions) !== JSON.stringify(nextSessions)) {
      writeSessions(nextSessions)
      notify()
    }
    if (databaseStatus.state !== 'saving') updateDatabaseStatus('connected')
  } catch (error) {
    updateDatabaseStatus('offline', error instanceof Error ? error.message : 'Unable to load assessment data.')
  }
}

function readSessions(): AssessmentSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item) => item && typeof item === 'object' && item.schemaVersion === SESSION_SCHEMA_VERSION)
  } catch {
    return []
  }
}

function writeSessions(sessions: AssessmentSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch {
    // ignore quota and unrelated persistence issues
  }
}

function readCurrentSessionId(): string | null {
  const candidates = [CURRENT_KEY, LEGACY_CURRENT_KEY]
  for (const key of candidates) {
    try {
      const value = localStorage.getItem(key)
      if (value) return value
    } catch {
      // ignore storage issues
    }
  }
  return null
}

function writeCurrentSessionId(id: string | null) {
  const keys = [CURRENT_KEY, LEGACY_CURRENT_KEY]
  for (const key of keys) {
    try {
      if (id === null) localStorage.removeItem(key)
      else localStorage.setItem(key, id)
    } catch {
      // ignore storage issues
    }
  }
}

export interface SessionRepository {
  list(): AssessmentSession[]
  get(id: string): AssessmentSession | null
  upsert(session: AssessmentSession): AssessmentSession
  patch(id: string, fn: (session: AssessmentSession) => AssessmentSession): AssessmentSession | null
  remove(id: string): void
  subscribe(listener: () => void): () => void
}

export const sessionRepository: SessionRepository = {
  list() {
    return getSessionsSnapshot()
  },
  get(id) {
    return readSessions().find((session) => session.id === id) ?? null
  },
  upsert(session) {
    const next = { ...session, schemaVersion: SESSION_SCHEMA_VERSION }
    const items = [...readSessions()]
    const index = items.findIndex((item) => item.id === next.id)
    if (index >= 0) items[index] = next
    else items.push(next)
    writeSessions(items)
    notify()
    saveToDatabase(next)
    return next
  },
  patch(id, fn) {
    const items = [...readSessions()]
    const index = items.findIndex((item) => item.id === id)
    if (index < 0) return null
    const next = fn(items[index])
    items[index] = { ...next, schemaVersion: SESSION_SCHEMA_VERSION }
    writeSessions(items)
    notify()
    saveToDatabase(items[index])
    return next
  },
  remove(id) {
    const items = readSessions().filter((item) => item.id !== id)
    writeSessions(items)
    if (readCurrentSessionId() === id) writeCurrentSessionId(null)
    notify()
    databaseWriteQueue = databaseWriteQueue
      .then(() => databaseRequest(`${DATABASE_API}/${encodeURIComponent(id)}`, { method: 'DELETE' }))
      .then(() => updateDatabaseStatus('connected'))
      .catch((error: unknown) => {
        updateDatabaseStatus('offline', error instanceof Error ? error.message : 'Unable to delete assessment data.')
      })
  },
  subscribe(listener) {
    subscribers.add(listener)
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null
    if (channel) {
      channel.onmessage = () => {
        sessionsSnapshot = null
        listener()
      }
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === CURRENT_KEY || event.key === LEGACY_CURRENT_KEY) {
        if (event.key === STORAGE_KEY) sessionsSnapshot = null
        listener()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      subscribers.delete(listener)
      if (channel) {
        channel.close()
      }
      window.removeEventListener('storage', onStorage)
    }
  },
}

export function getCurrentSessionId(): string | null {
  return readCurrentSessionId()
}

export function setCurrentSessionId(id: string | null) {
  writeCurrentSessionId(id)
}

export function ensureSession(displayName?: string | null): AssessmentSession {
  const currentId = readCurrentSessionId()
  const existing = currentId ? readSessions().find((session) => session.id === currentId) ?? null : null
  if (existing && existing.completedAt === null) {
    const normalizedName = displayName?.trim()
    if (normalizedName && existing.displayName && normalizedName !== existing.displayName) {
      const next = createSession(normalizedName)
      writeCurrentSessionId(next.id)
      sessionRepository.upsert(next)
      return next
    }
    if (normalizedName && !existing.displayName) {
      const saved = { ...existing, displayName: normalizedName, updatedAt: new Date().toISOString() }
      sessionRepository.upsert(saved)
      return saved
    }
    return existing
  }
  const next = createSession(displayName ?? null)
  writeCurrentSessionId(next.id)
  sessionRepository.upsert(next)
  return next
}

export function getCurrentSession(): AssessmentSession | null {
  const id = readCurrentSessionId()
  return id ? sessionRepository.get(id) : null
}

export function patchCurrentVision(vision: Partial<AssessmentSession['vision']>) {
  const session = getCurrentSession() ?? ensureSession()
  return sessionRepository.patch(session.id, (current) => ({
    ...current,
    updatedAt: new Date().toISOString(),
    vision: { ...current.vision, ...vision },
  }))
}

export function endCurrentSession() {
  const current = getCurrentSession()
  if (!current) {
    writeCurrentSessionId(null)
    return null
  }
  const ended = {
    ...current,
    completedAt: current.completedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    skills: current.skills ? { ...current.skills, completedAt: current.skills.completedAt ?? new Date().toISOString() } : current.skills,
  }
  sessionRepository.upsert(ended)
  writeCurrentSessionId(null)
  return ended
}

export function useSessions() {
  return useSyncExternalStore(
    sessionRepository.subscribe,
    () => sessionRepository.list(),
    () => sessionRepository.list(),
  )
}

export function useSessionDatabaseStatus() {
  return useSyncExternalStore(
    (listener) => {
      databaseStatusSubscribers.add(listener)
      return () => databaseStatusSubscribers.delete(listener)
    },
    () => databaseStatus,
    () => databaseStatus,
  )
}

if (typeof window !== 'undefined') {
  void loadFromDatabase()
  window.addEventListener('focus', () => { void loadFromDatabase() })
  window.addEventListener('online', () => { void loadFromDatabase() })
  window.setInterval(() => { void loadFromDatabase() }, 5000)
}
