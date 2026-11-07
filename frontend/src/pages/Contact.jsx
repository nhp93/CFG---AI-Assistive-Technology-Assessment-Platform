import { useEffect, useRef, useState } from 'react'
import { navigate } from '../prefs.js'
import { getCurrentSession, sessionRepository } from '../sessions/store'

export default function Contact() {
  const session = getCurrentSession()
  const headingRef = useRef(null)

  const [fullName, setFullName] = useState(() => session?.displayName || '')
  const [contactMethod, setContactMethod] = useState('phone')
  const [contactValue, setContactValue] = useState('')
  const [appointmentType, setAppointmentType] = useState('in_person')
  const [preferredTime, setPreferredTime] = useState('morning')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (!contactValue.trim()) {
      setError('Please provide a phone number or email address so we can reach you.')
      return
    }

    setError('')
    const requestPayload = {
      fullName: fullName || session?.displayName || 'Candidate',
      code: session?.code || 'P-GUEST',
      contactMethod,
      contactValue,
      appointmentType,
      preferredTime,
      notes,
      submittedAt: new Date().toISOString(),
    }

    if (session) {
      sessionRepository.patch(session.id, (curr) => ({
        ...curr,
        updatedAt: new Date().toISOString(),
        staff: {
          ...curr.staff,
          notes: JSON.stringify({
            ...JSON.parse(curr.staff.notes || '{}'),
            contactRequest: requestPayload,
          }),
        },
      }))
    }

    setSubmitted(true)
  }

  return (
    <main id="main-content" role="main" className="page-shell">
      <article className="tactile-card contact-card" aria-labelledby="contact-heading">
        <div className="mcq-top-row">
          <span className="step-badge">Staff Consultation</span>
          <span className="branch-badge">Lions Services Inc.</span>
        </div>

        <h1 id="contact-heading" ref={headingRef} tabIndex={-1} className="contact-title">
          Contact Lions Services Inc. & Request Staff Review
        </h1>

        <p className="intro readable">
          Skip the 3-hour clinical evaluation! Because you have already completed this accessible self-evaluation, our assistive technology evaluators can prepare your recommended tools in advance.
        </p>

        {submitted ? (
          <div className="confirmation-banner" role="status" aria-live="polite">
            <h2 className="confirm-heading">✅ In-Person Review Request Received!</h2>
            <p>
              Thank you, <strong>{fullName || 'Candidate'}</strong>. Your evaluation summary and recommendations have been transmitted to our intake team with reference code:
            </p>
            <div className="code-badge">{session?.code || 'P-EVAL'}</div>
            <p className="confirm-details">
              An Assistive Technology Specialist will contact you at <strong>{contactValue}</strong> within 1 business day to confirm your appointment time and workstation setup.
            </p>
            <div className="actions">
              <button type="button" className="tactile-btn primary-btn" onClick={() => navigate('/')}>
                Return to Home Screen
              </button>
              <button type="button" className="tactile-btn secondary-btn" onClick={() => navigate('/skills-results')}>
                Review Recommendations
              </button>
            </div>
          </div>
        ) : (
          <div className="contact-grid">
            {/* Left Column: Official Contact Info */}
            <section className="contact-info-panel" aria-labelledby="info-heading">
              <h2 id="info-heading" className="panel-subheading">Lions Services Assistive Tech Center</h2>
              <dl className="contact-dl">
                <div>
                  <dt>📍 Address</dt>
                  <dd>
                    Lions Services, Inc.<br />
                    4600 N. Tryon Street<br />
                    Charlotte, NC 28213
                  </dd>
                </div>
                <div>
                  <dt>📞 Direct Phone</dt>
                  <dd>
                    <a href="tel:7043324161" className="accessible-link">(704) 332-4161</a>
                  </dd>
                </div>
                <div>
                  <dt>☎ Toll-Free Intake</dt>
                  <dd>
                    <a href="tel:18005466728" className="accessible-link">1-800-LIONS-AT</a>
                  </dd>
                </div>
                <div>
                  <dt>✉ Email</dt>
                  <dd>
                    <a href="mailto:assistivetech@lionsservices.org" className="accessible-link">
                      assistivetech@lionsservices.org
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>🕒 Center Hours</dt>
                  <dd>Monday – Friday: 8:00 AM – 4:30 PM EST</dd>
                </div>
              </dl>

              <div className="direct-call-cta">
                <a href="tel:7043324161" className="tactile-btn call-now-btn">
                  📞 Call Assessor Directly
                </a>
              </div>
            </section>

            {/* Right Column: Appointment & Review Request Form */}
            <form className="contact-form-panel" onSubmit={handleSubmit} noValidate>
              <h2 className="panel-subheading">Schedule an In-Person Review</h2>

              <label className="form-field-label" htmlFor="client-name">
                Full Name:
                <input
                  id="client-name"
                  type="text"
                  className="tactile-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                />
              </label>

              <fieldset className="form-fieldset">
                <legend className="fieldset-legend">Preferred Contact Method:</legend>
                <div className="radio-row">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="phone"
                      checked={contactMethod === 'phone'}
                      onChange={() => setContactMethod('phone')}
                    />
                    <span>Phone Call / SMS</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="email"
                      checked={contactMethod === 'email'}
                      onChange={() => setContactMethod('email')}
                    />
                    <span>Email</span>
                  </label>
                </div>
              </fieldset>

              <label className="form-field-label" htmlFor="contact-detail">
                {contactMethod === 'phone' ? 'Phone Number:' : 'Email Address:'}
                <input
                  id="contact-detail"
                  type={contactMethod === 'phone' ? 'tel' : 'email'}
                  className="tactile-input"
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder={contactMethod === 'phone' ? '(704) 555-0199' : 'name@example.com'}
                  required
                />
              </label>

              <label className="form-field-label" htmlFor="appt-type">
                Requested Consultation Format:
                <select
                  id="appt-type"
                  className="tactile-select"
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                >
                  <option value="in_person">In-Person at Lions Services Tech Center (Charlotte, NC)</option>
                  <option value="workplace">Workstation Ergonomic & Job Site Evaluation</option>
                  <option value="remote">Accessible Video / Phone Consultation</option>
                </select>
              </label>

              <label className="form-field-label" htmlFor="preferred-time">
                Preferred Time of Day:
                <select
                  id="preferred-time"
                  className="tactile-select"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                >
                  <option value="morning">Morning (9:00 AM – 12:00 PM)</option>
                  <option value="afternoon">Afternoon (1:00 PM – 4:00 PM)</option>
                </select>
              </label>

              <label className="form-field-label" htmlFor="client-notes">
                Specific Equipment or Questions for Assessor:
                <textarea
                  id="client-notes"
                  className="tactile-textarea"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., I would like to try the yellow-on-black large print keyboard and test screen magnification software."
                />
              </label>

              {error && (
                <div className="message message-error" role="alert">
                  {error}
                </div>
              )}

              <div className="form-actions-row">
                <button type="submit" className="tactile-btn primary-btn submit-request-btn">
                  Submit Evaluation & Request Review →
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="contact-bottom-nav">
          <button type="button" className="tactile-btn secondary-btn" onClick={() => navigate('/skills-results')}>
            ← Back to Recommendations
          </button>
          <button type="button" className="tactile-btn secondary-btn" onClick={() => navigate('/')}>
            Home
          </button>
        </div>
      </article>
    </main>
  )
}
