// Staff login (demo only) and staff dashboard. All data shown is fictional demonstration data.
import { useEffect, useMemo, useRef, useState } from 'react'
import { navigate } from '../prefs.js'
import { buildDemoSessions } from '../sessions/demo'
import { computeStats, deriveClient } from '../sessions/derive'
import { useSessions } from '../sessions/store'
import { getStaffNotesData } from '../sessions/notes.js'
import { BASELINE_MIN, REASONS, fmtMin, initials } from '../staff/data.js'
import { FOLLOW_UPS, GOALS, LIMITATIONS, SUPPORT_QUESTION, TOOL_QUESTION, getVisionImpactQuestion } from '../telemetry/assessmentTree'
import { Bars, LineChart, Swatch } from '../staff/charts.jsx'
import '../staff/staff.css'

// PROTOTYPE ONLY: hardcoded demo credentials and a per-tab session flag. This is not secure authentication.
const DEMO = { username: 'staff', password: 'Team26Demo!' }
const SESSION = 'staffDemoSession'
const isSignedIn = () => { try { return sessionStorage.getItem(SESSION) === '1' } catch { return false } }
const setSignedIn = (on) => { try { on ? sessionStorage.setItem(SESSION, '1') : sessionStorage.removeItem(SESSION) } catch { /* storage unavailable */ } }

const SERIES = [
  { key: 'online', label: 'Online assessment', color: '#3987e5', shape: 'circle' },
  { key: 'inPerson', label: 'In-person assessment', color: '#d95926', shape: 'square', dash: '7 5' },
]
const TABS = [['time', 'Time'], ['struggle', 'Struggle Score'], ['settings', 'Recommended Settings']]
const getClientRows = (sessions = []) => {
  const live = sessions.map((session) => deriveClient(session))
  const demo = buildDemoSessions().map((session) => deriveClient(session))
  return [...live, ...demo]
}
const pct = (n, total) => `${Math.round((n / total) * 100)}%`
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
const scoreText = (c) => `${c.struggle} of ${c.questions} questions`
const settingText = (m) => m.choiceLabel ?? (m.state === 'skipped' ? `Skipped: ${m.skipReason ?? 'not captured'}` : m.state === 'not-started' ? 'Not started' : 'No setting confirmed')
const answerLabel = (question, answer) => question?.options?.find((option) => option.id === answer)?.label ?? answer
export function StaffLogin() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const errorRef = useRef(null)

  function submit(e) {
    e.preventDefault()
    if (form.username.trim() === DEMO.username && form.password === DEMO.password) {
      setSignedIn(true)
      return navigate('/staff')
    }
    setError('Incorrect username or password. Use the demo credentials shown above.')
    setTimeout(() => errorRef.current?.focus())
  }

  const field = (name, label, type, auto) => (
    <div className="s-field">
      <label htmlFor={`staff-${name}`}>{label}</label>
      <input id={`staff-${name}`} type={type} autoComplete={auto} value={form[name]} required
        aria-invalid={!!error} aria-describedby={error ? 'staff-login-error' : undefined}
        onChange={(e) => { setForm({ ...form, [name]: e.target.value }); setError('') }} />
    </div>
  )

  return (
    <main className="staff staff-login">
      <form className="s-card login-card" onSubmit={submit} noValidate>
        <h1 tabIndex={-1}>Staff Login</h1>
        <p className="s-muted">For Lions Services staff reviewing assessment results.</p>
        <aside className="demo-hint" aria-label="Demo credentials">
          <strong>Demo credentials (prototype)</strong>
          <span>Username: <code>{DEMO.username}</code></span>
          <span>Password: <code>{DEMO.password}</code></span>
          <small>This demo sign-in is not secure authentication. Do not enter real client information.</small>
        </aside>
        {field('username', 'Username', 'text', 'username')}
        {field('password', 'Password', 'password', 'current-password')}
        {error && <p id="staff-login-error" ref={errorRef} className="s-error" role="alert" tabIndex={-1}>{error}</p>}
        <div className="s-actions">
          <button type="button" className="s-btn" onClick={() => navigate('/')}>Back to home</button>
          <button type="submit" className="s-btn s-btn-primary">Sign in</button>
        </div>
      </form>
    </main>
  )
}

export default function StaffDashboard({ path }) {
  const [tab, setTab] = useState('time')
  const signedIn = isSignedIn()
  const [, , id, view] = path.split('/')
  const sessions = useSessions()
  const clients = useMemo(() => getClientRows(sessions), [sessions])
  const client = useMemo(() => clients.find((item) => item.id === id), [clients, id])
  const advanced = client && view === 'advanced'
  const stats = computeStats(clients)

  useEffect(() => { if (!signedIn) navigate('/staff-login') }, [signedIn])
  if (!signedIn) return null

  function logout() {
    setSignedIn(false)
    navigate('/')
  }

  const crumbs = ['All clients', client?.name, advanced && 'Advanced view'].filter(Boolean)
  return (
    <main className="staff">
      <div className="staff-top">
        <div>
          <h1 tabIndex={-1}>Staff Dashboard</h1>
          <p className="s-muted" aria-label={`Current view: ${crumbs.join(', ')}`}>{crumbs.join(' › ')}</p>
        </div>
        <div className="staff-top-actions">
          <span className="demo-badge"><span aria-hidden="true">●</span> Demonstration data</span>
          <button type="button" className="s-btn" onClick={logout}>Log out</button>
        </div>
      </div>

      <div className="staff-body">
        <nav className="staff-side" aria-label="Clients">
          <h2 className="side-title">Clients <span className="s-muted">({clients.length})</span></h2>
          <ul>
            <li>
              <a href="#/staff" className="side-link" aria-current={!client ? 'page' : undefined}>
                <span className="avatar all" aria-hidden="true">All</span>
                <span><b>All clients</b><small>Overview and analytics</small></span>
              </a>
            </li>
            {clients.map((c) => {
              const req = getStaffNotesData(c.staff).contactRequest
              return (
                <li key={c.id}>
                  <a href={`#/staff/${c.id}`} className="side-link" aria-current={client?.id === c.id ? 'page' : undefined}>
                    <span className="avatar" aria-hidden="true">{initials(c.name)}</span>
                    <span>
                      <b>{c.name} {req ? '📞' : ''}</b>
                      <small><StatusDot status={c.status} />{c.status}{req ? ' · Review Requested' : ''}</small>
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <section className="staff-content" aria-labelledby="view-title">
          {advanced ? <Advanced c={client} /> : client ? <Summary c={client} /> : <Overview tab={tab} setTab={setTab} clients={clients} stats={stats} />}
        </section>
      </div>
    </main>
  )
}

function StatusDot({ status }) {
  return <span className={`status-dot ${status === 'Complete' ? 'ok' : status === 'In progress' ? 'busy' : 'warn'}`} aria-hidden="true" />
}

function Kpi({ label, value, note }) {
  return (
    <div className="kpi">
      <span className="kpi-label">{label}</span>
      <strong className="kpi-value">{value}</strong>
      {note && <span className="kpi-note">{note}</span>}
    </div>
  )
}

function Overview({ tab, setTab, clients, stats }) {
  const { timeStats, struggleStats, settingStats } = stats
  const tabRefs = useRef([])
  function onKey(e, i) {
    const n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: TABS.length - 1 }[e.key]
    if (n === undefined) return
    e.preventDefault()
    const next = (n + TABS.length) % TABS.length
    setTab(TABS[next][0])
    tabRefs.current[next].focus()
  }
  return (
    <>
      <div className="view-head">
        <h2 id="view-title" tabIndex={-1} data-route-focus>All clients</h2>
        <p className="s-muted">{clients.length} clients · live and demo session records</p>
      </div>
      <div className="s-tabs" role="tablist" aria-label="Analytics category">
        {TABS.map(([key, label], i) => (
          <button key={key} ref={(el) => { tabRefs.current[i] = el }} type="button" role="tab" id={`tab-${key}`}
            aria-selected={tab === key} aria-controls="tab-panel" tabIndex={tab === key ? 0 : -1}
            className="s-tab" onClick={() => setTab(key)} onKeyDown={(e) => onKey(e, i)}>{label}</button>
        ))}
      </div>
      <div id="tab-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={0} className="tab-panel">
        {tab === 'time' ? <TimeTab clients={clients} timeStats={timeStats} /> : tab === 'struggle' ? <StruggleTab clients={clients} struggleStats={struggleStats} /> : <SettingsTab clients={clients} settingStats={settingStats} />}
      </div>
    </>
  )
}

function TimeTab({ clients, timeStats }) {
  const rows = clients.map((c) => ({
    ...c,
    inPerson: c.inPerson ?? 0,
    note: c.inPerson === null ? 'in-person time not recorded' : c.status === 'In progress' ? 'online assessment in progress' : '',
  }))
  return (
    <>
      <div className="kpi-row">
        <Kpi label="Avg. online assessment" value={fmtMin(timeStats.online)} note={`Self-guided · ${timeStats.n} finished clients`} />
        <Kpi label="Avg. in-person assessment" value={timeStats.inPersonN ? fmtMin(timeStats.inPerson) : 'Not recorded'} note={`Staff time · ${timeStats.inPersonN} clients with recorded minutes`} />
        <Kpi label="Est. staff time saved / client" value={timeStats.inPersonN ? fmtMin(timeStats.savedAvg) : 'Not recorded'} note={`vs. traditional ${BASELINE_MIN}-min (3-hr) baseline`} />
        <Kpi label="Est. staff time saved, total" value={timeStats.inPersonN ? fmtMin(timeStats.savedTotal) : 'Not recorded'} note={`${timeStats.inPersonN} clients · 3-hr baseline estimate`} />
      </div>
      <article className="s-card">
        <h3>Assessment time by client</h3>
        <p className="s-muted">Minutes per client for the self-guided online assessment and the staff-led in-person session.
          Averages above: online {fmtMin(timeStats.online)}, in-person {timeStats.inPersonN ? fmtMin(timeStats.inPerson) : 'not recorded'}.
          Missing in-person times appear at zero in the chart and are labeled as not recorded.</p>
        <ul className="legend" aria-label="Legend">
          {SERIES.map((s) => <li key={s.key}><Swatch color={s.color} shape={s.shape} dash={s.dash} /> {s.label}</li>)}
        </ul>
        <div className="chart-scroll">
          <LineChart rows={rows} series={SERIES} label="Line chart: online and in-person assessment minutes for each client" />
        </div>
        <details className="s-details">
          <summary>Show data table</summary>
          <table className="s-table">
            <caption className="sr-only">Assessment minutes by client</caption>
            <thead><tr><th scope="col">Client</th><th scope="col">Online</th><th scope="col">In-person</th><th scope="col">Status</th></tr></thead>
            <tbody>{clients.map((c) => (
              <tr key={c.id}><th scope="row">{c.name}</th><td>{fmtMin(c.online)}</td><td>{fmtMin(c.inPerson)}</td><td>{c.status}</td></tr>
            ))}</tbody>
          </table>
        </details>
        <p className="s-footnote">Estimated time saved = assumed traditional {BASELINE_MIN}-minute (3-hour) clinical evaluation minus each
          client's actual in-person time. The gap between online and in-person time is not counted as saved time. Averages exclude
          clients whose online assessment is still in progress.</p>
      </article>
    </>
  )
}

function StruggleTab({ clients, struggleStats }) {
  const ranked = [...clients].sort((a, b) => b.struggle - a.struggle || a.name.localeCompare(b.name))
  const modules = [...struggleStats.byModule].sort((a, b) => b.clients - a.clients || b.flagged - a.flagged)
  return (
    <>
      <article className="s-card s-explainer">
        <h3>About the struggle score</h3>
        <p>The struggle score is the existing telemetry measure: the <strong>number of assessment questions flagged as struggling</strong>.
          A question is flagged for 2+ misclicks or a display change mid-question, 5+ option switches or 2+ answer changes, or over 60 seconds on it.
          Scale: 0 up to the number of questions the client answered (shown as “x of y”). Higher means more questions showed signs of difficulty.
          It is <strong>not</strong> a diagnosis or a measure of vision or of how severe an impairment is.</p>
      </article>
      <div className="kpi-row">
        <Kpi label="Average struggle score" value={struggleStats.avg.toFixed(1)} note={`flagged questions per client · ${clients.length} clients`} />
        <Kpi label="Highest score" value={struggleStats.max} note={ranked[0].name} />
        <Kpi label="Clients with any flag" value={`${clients.filter((c) => c.struggle).length} of ${clients.length}`} />
        <Kpi label="Most common weak area" value={modules[0].name} note={`${plural(modules[0].clients, 'client')} flagged`} />
      </div>
      <div className="s-grid">
        <article className="s-card">
          <h3>Struggle score by client</h3>
          <Bars caption="Flagged questions per client, highest first" head={['Client', 'Struggle score']}
            rows={ranked.map((c) => ({ label: c.name, value: c.struggle, display: scoreText(c) }))} />
        </article>
        <article className="s-card">
          <h3>Difficulty by category</h3>
          <Bars caption="Clients with at least one flagged question in each category, most common first" head={['Category', 'Clients flagged']} max={clients.length}
            rows={modules.map((m) => ({ label: m.name, value: m.clients, display: `${m.clients} of ${clients.length} clients · ${plural(m.flagged, 'flagged question')}` }))} />
          <h3 className="s-subhead">Most common weak points</h3>
          <ol className="rank">
            {struggleStats.byReason.map((r) => (
              <li key={r.key}><span>{r.label}</span><b>{plural(r.count, 'question')}</b></li>
            ))}
          </ol>
          <p className="s-footnote">“No” answers by category (setting was not comfortable, a normal part of the adaptive check):{' '}
            {struggleStats.byModule.map((m) => `${m.name} ${m.no} of ${m.asked}`).join(' · ')}.</p>
        </article>
      </div>
    </>
  )
}

function SettingsTab({ clients, settingStats }) {
  return (
    <>
      <div className="kpi-row">
        {settingStats.map((s) => (
          <Kpi key={s.name} label={`Top ${s.name.toLowerCase()} setting`} value={s.top.join(' / ')}
            note={`${s.topCount} of ${clients.length} clients (${pct(s.topCount)}) confirmed`} />
        ))}
      </div>
      <div className="s-grid">
        {settingStats.map((s) => (
          <article key={s.name} className="s-card">
            <h3>{s.name}</h3>
            <Bars caption={`Confirmed ${s.name.toLowerCase()} preferences (share of all ${clients.length} clients)`} head={['Setting', 'Clients']} max={clients.length}
              rows={s.counts.map((c) => ({ label: c.label, value: c.count, display: `${c.count} (${pct(c.count)})` }))} />
            <p className="s-footnote">{s.confirmed} confirmed · {s.skipped} skipped · {s.open} not yet confirmed</p>
          </article>
        ))}
      </div>
      <p className="s-footnote">Only settings a client confirmed are counted as recommendations. Skipped and unconfirmed modules are listed separately.</p>
    </>
  )
}

function Summary({ c }) {
  const notesData = getStaffNotesData(c.staff)
  const contactReq = notesData.contactRequest
  const feedbackData = notesData.feedback

  return (
    <>
      <div className="view-head with-actions">
        <div>
          <h2 id="view-title" tabIndex={-1} data-route-focus>{c.name}</h2>
          <p className="s-muted"><StatusDot status={c.status} />{c.status} · assessed {c.date}</p>
        </div>
        <div className="s-actions">
          <a className="s-btn" href="#/staff">← All clients</a>
          <a className="s-btn s-btn-primary" href={`#/staff/${c.id}/advanced`}>Advanced view</a>
        </div>
      </div>
      <div className="kpi-row">
        <Kpi label="Online assessment" value={fmtMin(c.online)} note={c.status === 'In progress' ? 'In progress' : 'Self-guided'} />
        <Kpi label="In-person assessment" value={fmtMin(c.inPerson)} note="Staff time" />
        <Kpi label="Struggle score" value={c.struggle} note={`${scoreText(c)} flagged`} />
        <Kpi label="Settings confirmed" value={`${c.modules.filter((m) => m.state === 'confirmed').length} of 4`} />
      </div>

      {contactReq && (
        <article className="s-card" style={{ borderLeft: '4px solid #FFD700', backgroundColor: 'rgba(255, 215, 0, 0.05)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>👤</span> In-Person Staff Review Requested
          </h3>
          <dl className="s-dl cols">
            <div><dt>Full Name</dt><dd><strong>{contactReq.fullName || c.name}</strong></dd></div>
            <div><dt>Contact Method</dt><dd>{contactReq.contactMethod === 'email' ? 'Email' : 'Phone'}: <strong>{contactReq.contactValue}</strong></dd></div>
            <div><dt>Appointment Type</dt><dd>{contactReq.appointmentType === 'in_person' ? 'In-Person at Lions Services' : 'Virtual Video Consultation'}</dd></div>
            <div><dt>Preferred Time</dt><dd>{contactReq.preferredTime === 'morning' ? 'Morning (8:00 AM – 12:00 PM)' : 'Afternoon (12:00 PM – 4:30 PM)'}</dd></div>
            {contactReq.notes && <div><dt>Candidate Notes</dt><dd>{contactReq.notes}</dd></div>}
          </dl>
        </article>
      )}

      {feedbackData && Object.keys(feedbackData).length > 0 && (
        <article className="s-card">
          <h3>Candidate Recommendation Reactions</h3>
          <ul className="s-list">
            {Object.entries(feedbackData).map(([recId, fb]) => {
              if (!fb || !fb.reaction) return null
              return (
                <li key={recId}>
                  <b>{fb.reaction === 'like' ? '👍 Liked' : '👎 Disliked'}</b>: {recId}
                  {fb.tags?.length > 0 && <span> · Tags: {fb.tags.join(', ')}</span>}
                  {fb.comment && <i> — “{fb.comment}”</i>}
                </li>
              )
            })}
          </ul>
        </article>
      )}

      <div className="s-grid">
        <article className="s-card">
          <h3>Main weak points</h3>
          {c.weakPoints.length ? (
            <ul className="s-list">
              {c.modules.filter((m) => c.weakPoints.includes(m.name)).map((m) => (
                <li key={m.name}><b>{m.name}</b>: {m.flagged ? plural(m.flagged, 'flagged question') : 'no comfortable setting found'}</li>
              ))}
              {c.reasons.map((r) => <li key={r} className="s-muted">{REASONS[r]}</li>)}
            </ul>
          ) : <p>No struggle flags in this assessment.</p>}
        </article>
        <article className="s-card">
          <h3>Recommended settings</h3>
          <dl className="s-dl">
            {c.modules.map((m) => <div key={m.name}><dt>{m.name}</dt><dd>{settingText(m)}</dd></div>)}
          </dl>
        </article>
      </div>
      {c.followUp.length > 0 && (
        <article className="s-card s-attention">
          <h3>Needs staff follow-up</h3>
          <ul className="s-list">{c.followUp.map((f) => <li key={f}>{f}</li>)}</ul>
        </article>
      )}
    </>
  )
}

function Advanced({ c }) {
  const notesData = getStaffNotesData(c.staff)
  const contactReq = notesData.contactRequest
  const history = c.modules.flatMap((m) => m.trials.map((t) => ({ ...t, module: m.name, question: m.question })))
  const skipped = c.modules.filter((m) => m.state === 'skipped' || m.state === 'not-started')
  return (
    <>
      <div className="view-head with-actions">
        <div>
          <h2 id="view-title" tabIndex={-1} data-route-focus>{c.name}: full results</h2>
          <p className="s-muted">Advanced view · every question, answer, and telemetry flag</p>
        </div>
        <div className="s-actions">
          <a className="s-btn" href={`#/staff/${c.id}`}>← Back to summary</a>
        </div>
      </div>

      {contactReq && (
        <article className="s-card" style={{ borderLeft: '4px solid #FFD700', backgroundColor: 'rgba(255, 215, 0, 0.05)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>👤</span> In-Person Staff Review Requested
          </h3>
          <dl className="s-dl cols">
            <div><dt>Full Name</dt><dd><strong>{contactReq.fullName || c.name}</strong></dd></div>
            <div><dt>Contact Method</dt><dd>{contactReq.contactMethod === 'email' ? 'Email' : 'Phone'}: <strong>{contactReq.contactValue}</strong></dd></div>
            <div><dt>Appointment Type</dt><dd>{contactReq.appointmentType === 'in_person' ? 'In-Person at Lions Services' : 'Virtual Video Consultation'}</dd></div>
            <div><dt>Preferred Time</dt><dd>{contactReq.preferredTime === 'morning' ? 'Morning (8:00 AM – 12:00 PM)' : 'Afternoon (12:00 PM – 4:30 PM)'}</dd></div>
            {contactReq.notes && <div><dt>Candidate Notes</dt><dd>{contactReq.notes}</dd></div>}
          </dl>
        </article>
      )}

      <article className="s-card">
        <h3>General assessment</h3>
        <dl className="s-dl cols">
          <div><dt>Client</dt><dd>{c.name}</dd></div>
          <div><dt>Status</dt><dd><StatusDot status={c.status} />{c.status}</dd></div>
          <div><dt>Assessment date</dt><dd>{c.date}</dd></div>
          <div><dt>Online duration</dt><dd>{fmtMin(c.online)}</dd></div>
          <div><dt>In-person duration</dt><dd>{fmtMin(c.inPerson)}</dd></div>
          <div><dt>Struggle score</dt><dd>{c.struggle} ({scoreText(c)} flagged)</dd></div>
          <div><dt>Visual acuity response</dt><dd>{c.vision.acuityAtLeast2070 ?? 'Not answered'}</dd></div>
          <div><dt>Color vision response</dt><dd>{c.vision.colorVisionDifference ?? 'Not answered'}</dd></div>
        </dl>
      </article>

      {c.skills && (
        <article className="s-card">
          <h3>Skills assessment answers</h3>
          <dl className="s-dl cols">
            {c.skills.answers?.length ? c.skills.answers.map((answer) => (
              <div key={answer.questionId}><dt>{answer.prompt}</dt><dd>{answer.answerLabel}</dd></div>
            )) : [
              [LIMITATIONS, c.skills.limitation],
              [getVisionImpactQuestion(c.skills.limitation ?? 'not_sure'), c.skills.impact],
              [GOALS, c.skills.goal],
              [FOLLOW_UPS[c.skills.goal ?? ''], c.skills.detail],
              [TOOL_QUESTION, c.skills.tool],
              [SUPPORT_QUESTION, c.skills.support],
            ].filter(([question, answer]) => question && answer).map(([question, answer]) => (
              <div key={question.id}><dt>{question.title}</dt><dd>{answerLabel(question, answer)}</dd></div>
            ))}
          </dl>
          <h4>Skill questions and responses</h4>
          {c.skills.responses.length ? (
            <table className="s-table">
              <caption className="sr-only">Skill assessment answers</caption>
              <thead><tr><th scope="col">Question</th><th scope="col">Answer</th><th scope="col">Score</th></tr></thead>
              <tbody>{c.skills.responses.map((response) => (
                <tr key={response.questionId}>
                  <th scope="row">{response.prompt}</th>
                  <td>{response.answerLabel}</td>
                  <td>{response.score}</td>
                </tr>
              ))}</tbody>
            </table>
          ) : <p>No skill questions have been answered yet.</p>}
          <p className="s-footnote">Assessment status: {c.skills.completedAt ? 'Completed' : 'In progress'} · Score: {c.skills.score ?? 'Not available'} · {c.skills.scoreBand ?? 'No recommendation band yet'}</p>
        </article>
      )}

      {c.modules.map((m) => {
        const failed = [...new Set(m.trials.filter((t) => !t.yes).map((t) => t.label))]
        return (
          <details key={m.name} className="s-card s-panel" open>
            <summary><h3>{m.name}</h3><span className="s-muted">{settingText(m)}</span></summary>
            {m.trials.length ? (
              <table className="s-table">
                <caption className="sr-only">{m.name} tests in the order shown</caption>
                <thead><tr><th scope="col">#</th><th scope="col">Setting tested</th><th scope="col">Answer</th><th scope="col">Time</th><th scope="col">Telemetry flag</th></tr></thead>
                <tbody>{m.trials.map((t, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td><th scope="row">{t.label}</th>
                    <td><span className={`answer ${t.yes ? 'yes' : 'no'}`}>{t.yes ? '✓ Yes' : '✕ No'}</span></td>
                    <td>{t.sec ?? Number(((t.telemetry?.timeSpentMs ?? 0) / 1000).toFixed(1))}s</td>
                    <td>{t.struggling ? REASONS[t.reason] : '—'}</td>
                  </tr>
                ))}</tbody>
              </table>
            ) : <p>No questions answered{m.state === 'skipped' ? '' : ' yet'}.</p>}
            <dl className="s-dl cols">
              <div><dt>Final preference</dt><dd>{settingText(m)}</dd></div>
              <div><dt>Not comfortable</dt><dd>{failed.join(', ') || 'None'}</dd></div>
              {m.name === 'Speech' && <div><dt>Audio</dt><dd>{m.skipReason ?? m.skip ? `Skipped: ${m.skipReason ?? m.skip}` : m.trials.length ? 'Played' : 'Not reached'}</dd></div>}
              <div><dt>Unresolved difficulties</dt><dd>{m.state === 'unresolved' ? 'No comfortable setting confirmed' : m.flagged ? plural(m.flagged, 'flagged question') : 'None'}</dd></div>
            </dl>
          </details>
        )
      })}

      <details className="s-card s-panel" open>
        <summary><h3>Additional details</h3><span className="s-muted">{plural(history.length, 'question')}</span></summary>
        <h4>Full question-and-answer history</h4>
        <ol className="s-history">
          {history.map((t, i) => (
            <li key={i}><span className="s-muted">{t.module}</span> {t.question} <b>({t.label})</b> → {t.yes ? 'Yes' : 'No'}
              {t.struggling && <span className="flag"> · flagged</span>}</li>
          ))}
        </ol>
        <dl className="s-dl cols">
          <div><dt>Skipped or not started</dt><dd>{skipped.map((m) => `${m.name} (${settingText(m)})`).join('; ') || 'None'}</dd></div>
          <div><dt>Adjustments attempted</dt><dd>{c.adjustments} (settings shown after each module's first)</dd></div>
          <div><dt>Weak points</dt><dd>{c.weakPoints.join(', ') || 'None identified'}</dd></div>
          <div><dt>Recommended settings</dt><dd>{c.modules.map((m) => `${m.name}: ${settingText(m)}`).join(' · ')}</dd></div>
          <div><dt>Staff follow-up</dt><dd>{c.followUp.join('; ') || 'None'}</dd></div>
        </dl>
      </details>
    </>
  )
}
