import { DatabaseSync } from 'node:sqlite'
import { Buffer } from 'node:buffer'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const SESSION_SCHEMA_VERSION = 1
const MAX_BODY_BYTES = 1024 * 1024

function openDatabase(root) {
  const directory = path.join(root, '.data')
  mkdirSync(directory, { recursive: true })
  const database = new DatabaseSync(path.join(directory, 'sessions.sqlite'))
  database.exec(`
    CREATE TABLE IF NOT EXISTS assessment_sessions (
      id TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
  return database
}

function sendJson(response, status, value) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(value))
}

function createApiMiddleware(database) {
  const listSessions = database.prepare('SELECT payload FROM assessment_sessions ORDER BY created_at')
  const saveSession = database.prepare(`
    INSERT INTO assessment_sessions (id, payload, created_at, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      payload = excluded.payload,
      updated_at = excluded.updated_at
  `)
  const deleteSession = database.prepare('DELETE FROM assessment_sessions WHERE id = ?')

  return async (request, response, next) => {
    const url = new URL(request.url ?? '/', 'http://localhost')
    if (!url.pathname.startsWith('/api/sessions')) return next()

    try {
      if (request.method === 'GET' && url.pathname === '/api/sessions') {
        return sendJson(response, 200, listSessions.all().map((row) => JSON.parse(row.payload)))
      }

      const match = url.pathname.match(/^\/api\/sessions\/([^/]+)$/)
      if (!match) return sendJson(response, 404, { error: 'Session endpoint not found.' })

      const id = decodeURIComponent(match[1])
      if (request.method === 'PUT') {
        const chunks = []
        let length = 0
        let tooLarge = false
        for await (const chunk of request) {
          length += chunk.length
          if (length > MAX_BODY_BYTES) {
            tooLarge = true
            chunks.length = 0
            continue
          }
          if (!tooLarge) chunks.push(chunk)
        }
        if (tooLarge) return sendJson(response, 413, { error: 'Session data exceeds the 1 MB limit.' })

        let session
        try {
          session = JSON.parse(Buffer.concat(chunks).toString('utf8'))
        } catch {
          return sendJson(response, 400, { error: 'Request body must be valid JSON.' })
        }
        if (!session || session.id !== id || session.schemaVersion !== SESSION_SCHEMA_VERSION || session.source !== 'live') {
          return sendJson(response, 400, { error: 'A valid live assessment session is required.' })
        }
        if (typeof session.createdAt !== 'string' || typeof session.updatedAt !== 'string') {
          return sendJson(response, 400, { error: 'Session timestamps are required.' })
        }

        saveSession.run(session.id, JSON.stringify(session), session.createdAt, session.updatedAt)
        return sendJson(response, 200, { ok: true, id: session.id })
      }

      if (request.method === 'DELETE') {
        deleteSession.run(id)
        response.statusCode = 204
        return response.end()
      }

      response.setHeader('Allow', 'GET, PUT, DELETE')
      return sendJson(response, 405, { error: 'Method not allowed.' })
    } catch (error) {
      console.error('Session database request failed:', error)
      if (!response.headersSent) sendJson(response, 500, { error: 'Session database request failed.' })
      else response.end()
    }
  }
}

export function sessionDbPlugin() {
  let database

  function install(server) {
    database ??= openDatabase(server.config.root)
    server.middlewares.use(createApiMiddleware(database))
    server.httpServer?.once('close', () => {
      database?.close()
      database = undefined
    })
  }

  return {
    name: 'assessment-session-database',
    configureServer: install,
    configurePreviewServer: install,
  }
}
