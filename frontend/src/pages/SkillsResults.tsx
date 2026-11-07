import { useState } from 'react'
import { navigate, useStored } from '../prefs.js'
import { getCurrentSession, sessionRepository } from '../sessions/store'
import {
  getAdaptiveRecommendations,
  type RecommendationItem,
} from '../telemetry/assessmentTree'
import './skillsResults.css'

interface CardFeedback {
  reaction: 'like' | 'dislike' | null
  tags: string[]
  comment: string
}

const LIKE_TAGS = ['Looks helpful', 'Excited to try', 'Already use this', 'Want staff training']
const DISLIKE_TAGS = ['Too hard to use', 'Not my interest', 'Too complex', 'Need different option']

export default function SkillsResults() {
  const session = getCurrentSession()
  const flow = session?.skills ? {
    answers: (session.skills as any).answers ?? {},
    score: session.skills.score ?? 80,
  } : JSON.parse(localStorage.getItem('skillsAssessment') || '{}')

  const answers = flow.answers ?? {}
  const recommendations: RecommendationItem[] = getAdaptiveRecommendations(answers)
  const [feedback, setFeedback] = useStored<Record<string, CardFeedback>>('recommendationFeedback', {})

  function toggleReaction(recId: string, reaction: 'like' | 'dislike') {
    const current = feedback[recId] || { reaction: null, tags: [], comment: '' }
    const nextReaction = current.reaction === reaction ? null : reaction
    const next = {
      ...feedback,
      [recId]: { ...current, reaction: nextReaction, tags: [] },
    }
    setFeedback(next)
    saveFeedbackToSession(next)
  }

  function toggleTag(recId: string, tag: string) {
    const current = feedback[recId] || { reaction: null, tags: [], comment: '' }
    const tags = current.tags.includes(tag)
      ? current.tags.filter((t) => t !== tag)
      : [...current.tags, tag]
    const next = {
      ...feedback,
      [recId]: { ...current, tags },
    }
    setFeedback(next)
    saveFeedbackToSession(next)
  }

  function updateComment(recId: string, comment: string) {
    const current = feedback[recId] || { reaction: null, tags: [], comment: '' }
    const next = {
      ...feedback,
      [recId]: { ...current, comment },
    }
    setFeedback(next)
    saveFeedbackToSession(next)
  }

  function saveFeedbackToSession(updatedFeedback: Record<string, CardFeedback>) {
    if (!session) return
    sessionRepository.patch(session.id, (curr) => ({
      ...curr,
      updatedAt: new Date().toISOString(),
      staff: {
        ...curr.staff,
        notes: JSON.stringify({ feedback: updatedFeedback }),
      },
    }))
  }

  function restart() {
    localStorage.removeItem('skillsAssessment')
    localStorage.removeItem('recommendationFeedback')
    navigate('/acuity')
  }

  const focusLabel = answers.primary_focus === 'career' ? 'Career & Employment' : 'Personal Independence & Home'

  return (
    <main id="main-content" role="main" className="page-shell">
      <div className="tactile-card results-header-card">
        <span className="step-badge">Evaluation Complete</span>
        <h1 tabIndex={-1} className="results-title">
          Your Adaptive Assistive Technology Recommendations
        </h1>
        <p className="intro readable">
          Based on your self-guided choices in <strong>{focusLabel}</strong>, here are personalized assistive technology tools, accommodations, and training tracks recommended for you.
        </p>

        <div className="results-cta-banner">
          <div>
            <strong>Ready to discuss your evaluation?</strong>
            <p>Lions Services assistive technology specialists can review your results, demonstrate equipment, and set up your workspace.</p>
          </div>
          <button
            type="button"
            className="tactile-btn primary-btn"
            onClick={() => navigate('/contact')}
          >
            👤 Request In-Person Staff Review & Contact →
          </button>
        </div>
      </div>

      <section className="recommendations-container" aria-label="Personalized Recommendations">
        <h2 className="recommendations-heading">Recommended Assistive Technology & Programs</h2>

        <div className="recommendations-grid">
          {recommendations.map((rec) => {
            const cardFb = feedback[rec.id] || { reaction: null, tags: [], comment: '' }
            const isLiked = cardFb.reaction === 'like'
            const isDisliked = cardFb.reaction === 'dislike'

            return (
              <article key={rec.id} className="tactile-card rec-card">
                <div className="rec-badge-row">
                  <span className="rec-category-badge">{rec.category}</span>
                  <span className="rec-impact-badge">{rec.badge}</span>
                </div>

                <h3 className="rec-title">{rec.title}</h3>
                <p className="rec-desc">{rec.description}</p>

                <div className="rec-benefits">
                  <strong>Key Benefits:</strong>
                  <ul>
                    {rec.keyBenefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>

                <div className="rec-access-tip">
                  <strong>Accessibility Match:</strong> {rec.accessTip}
                </div>

                {/* Reaction Feedback Controls */}
                <div className="rec-feedback-section" aria-label={`Feedback on ${rec.title}`}>
                  <p className="feedback-label">Does this recommendation fit your needs?</p>
                  <div className="reaction-buttons">
                    <button
                      type="button"
                      className={`tactile-btn reaction-btn ${isLiked ? 'active-like' : ''}`}
                      aria-pressed={isLiked}
                      onClick={() => toggleReaction(rec.id, 'like')}
                    >
                      <span aria-hidden="true">👍</span> Like
                    </button>
                    <button
                      type="button"
                      className={`tactile-btn reaction-btn ${isDisliked ? 'active-dislike' : ''}`}
                      aria-pressed={isDisliked}
                      onClick={() => toggleReaction(rec.id, 'dislike')}
                    >
                      <span aria-hidden="true">👎</span> Dislike
                    </button>
                  </div>

                  {/* Expandable Quick-Select Tags */}
                  {cardFb.reaction && (
                    <div className="feedback-drawer" role="region" aria-label="Feedback options">
                      <p className="tag-instruction">Select quick tags:</p>
                      <div className="tags-row">
                        {(isLiked ? LIKE_TAGS : DISLIKE_TAGS).map((tag) => {
                          const tagActive = cardFb.tags.includes(tag)
                          return (
                            <button
                              key={tag}
                              type="button"
                              className={`tag-pill ${tagActive ? 'tag-active' : ''}`}
                              aria-pressed={tagActive}
                              onClick={() => toggleTag(rec.id, tag)}
                            >
                              {tagActive ? '✓ ' : '+ '}{tag}
                            </button>
                          )
                        })}
                      </div>

                      <label className="comment-input-label" htmlFor={`comment-${rec.id}`}>
                        Optional note for your assessor:
                        <input
                          id={`comment-${rec.id}`}
                          type="text"
                          className="comment-text-input"
                          placeholder="e.g., I want to try this with large print"
                          value={cardFb.comment}
                          onChange={(e) => updateComment(rec.id, e.target.value)}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <div className="results-bottom-actions">
        <button type="button" className="tactile-btn secondary-btn" onClick={restart}>
          ↺ Retake Assessment
        </button>
        <button
          type="button"
          className="tactile-btn primary-btn btn-large-contact"
          onClick={() => navigate('/contact')}
        >
          👤 Request In-Person Staff Review & Contact Lions Services →
        </button>
      </div>
    </main>
  )
}
