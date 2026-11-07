import { applyFontSize, load, navigate, save } from '../prefs.js'
import { getCurrentSession } from '../sessions/store'
import { FOLLOW_UPS, getFocusLabel, getVisionImpactQuestion, GOALS, LIMITATIONS } from '../telemetry/assessmentTree'
import './skillsResults.css'

export default function SkillsResults() {
  const session = getCurrentSession()
  const flow = session?.skills ? {
    ...session.skills,
    metrics: session.skills.questions,
    skillResponses: session.skills.responses,
    initialFontScale: 20,
    initialTheme: 'white-on-black',
    theme: session.skills.display?.theme ?? 'white-on-black',
    fontScale: session.skills.display?.fontScale ?? 20,
  } : load('skillsAssessment', null)
  const goal = flow?.goal ?? 'explore'
  const detail = flow?.detail ?? 'device_basics'
  const focus = getFocusLabel(goal, detail)
  const skillResponses = flow?.skillResponses ?? []
  const score = flow?.score ?? 0
  const scoreBand = score >= 80 ? 'Independent practice' : score >= 50 ? 'Practice with occasional support' : 'Start with guided practice'
  const recommendation = flow?.recommendation
  const goalOption = GOALS.options.find((option) => option.id === goal)
  const detailOption = FOLLOW_UPS[goal]?.options.find((option) => option.id === detail)
  const limitationOption = LIMITATIONS.options.find((option) => option.id === flow?.limitation)
  const impactQuestion = getVisionImpactQuestion(flow?.limitation ?? 'not_sure')
  const impactOption = impactQuestion.options.find((option) => option.id === flow?.impact)

  function restart() {
    const fontScale = flow?.initialFontScale ?? load('fontSize', 20)
    const theme = flow?.initialTheme ?? 'white-on-black'
    applyFontSize(fontScale)
    save('fontSize', fontScale)
    save('skillsAssessment', {
      schemaVersion: 2, currentQuestion: 'limitation', limitation: null, impact: null, goal: null, detail: null,
      tool: null, support: null, answers: {}, metrics: [], skillResponses: [], score: null,
      submitted: false, recommendation: null, initialFontScale: fontScale, initialTheme: theme,
      fontScale, theme,
    })
    navigate('/telemetry-assessment')
  }

  return (
    <main className="skills-result">
      <h1 tabIndex={-1}>Skills Assessment Results</h1>
      <p className="intro">A summary of the task you chose, your reported independence, and the next practice steps that fit your vision settings.</p>

      <section className="skills-result-card" aria-labelledby="ability-score-heading">
        <h2 id="ability-score-heading">Digital skill ability score</h2>
        <div className="skills-score">
          <strong aria-label={`${score} out of 100`}>{score}<span aria-hidden="true">/100</span></strong>
          <div><b>{scoreBand}</b><p>Based on your answers to {skillResponses.length} skill questions about “{focus}”.</p></div>
        </div>
        <p>Your selected goal: <strong>{goalOption?.label ?? 'Explore digital skills'}</strong></p>
        {detailOption && <p>Focus area: <strong>{detailOption.label}</strong></p>}
        {limitationOption && <p>Vision limitation reported: <strong>{limitationOption.label}</strong></p>}
        {impactOption && <p>Screen task affected: <strong>{impactOption.label}</strong></p>}
        <p>Decision path: <strong>10 questions</strong></p>
        <h3>Your skill answers</h3>
        <ul>{skillResponses.map((response) => <li key={response.questionId}>{response.prompt} <strong>{response.answerLabel}</strong></li>)}</ul>
      </section>

      {recommendation && (
        <section className="skills-result-card" aria-labelledby="recommendation-heading">
          <h2 id="recommendation-heading">{recommendation.title}</h2>
          <p>{recommendation.tool}</p>
          <p><strong>Use your vision settings:</strong> {recommendation.accessTip}</p>
          <p><strong>Suggested staff next step:</strong> {recommendation.nextStep}</p>
        </section>
      )}

      <div className="actions">
        <button type="button" className="button button-secondary" onClick={restart}>Restart Assessment</button>
        <button type="button" className="button button-primary" onClick={() => navigate('/')}>Return to Home</button>
      </div>
    </main>
  )
}
