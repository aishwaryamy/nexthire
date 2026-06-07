import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getJob, updateJob, updateStatus, deleteJob,
         parseJD, genCoverLetter, tailorResume, draftEmail, findContacts } from '../api/client'
import toast from 'react-hot-toast'
import './JobDetail.css'

const STATUSES = ['saved','applied','phone_screen','interview','offer','rejected']

export default function JobDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [job, setJob] = useState(null)
  const [resume, setResume] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState({})
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})

  const load = async () => {
    const data = await getJob(id)
    setJob(data)
    setForm(data)
  }
  useEffect(() => { load() }, [id])

  const setL = (k, v) => setLoading(l => ({ ...l, [k]: v }))

  const save = async () => {
    try {
      const updated = await updateJob(id, form)
      setJob(updated)
      setEditing(false)
      toast.success('Saved')
    } catch { toast.error('Save failed') }
  }

  const runAI = async (action) => {
    setL(action, true)
    try {
      switch (action) {
        case 'parse':    { const r = await parseJD(id); toast.success('JD parsed!'); await load(); break }
        case 'cover':    { if (!resume) { toast.error('Paste your resume first'); break }
                           const r = await genCoverLetter(id, resume); toast.success('Cover letter ready!'); await load(); break }
        case 'tailor':   { if (!resume) { toast.error('Paste your resume first'); break }
                           const r = await tailorResume(id, resume); toast.success('Resume tailored!'); await load(); break }
        case 'email':    { const r = await draftEmail(id, resume); toast.success('Email drafted!'); await load(); break }
        case 'contacts': { const r = await findContacts(id); toast.success(`Found ${r.contacts?.length ?? 0} contacts`); await load(); break }
      }
    } catch (e) { toast.error(`Failed: ${e?.response?.data?.detail ?? e.message}`) }
    finally { setL(action, false) }
  }

  const handleStatus = async (s) => {
    await updateStatus(id, s)
    setJob(j => ({ ...j, status: s }))
    toast.success(`Status updated`)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this job?')) return
    await deleteJob(id)
    nav('/')
    toast.success('Deleted')
  }

  if (!job) return <div className="detail-loading">Loading...</div>

  const contacts = job.contacts_json ? JSON.parse(job.contacts_json) : []
  const tailored  = job.tailored_resume ? JSON.parse(job.tailored_resume) : null

  return (
    <div className="detail-page">
      {/* Header */}
      <div className="detail-header">
        <button className="btn btn-ghost btn-sm" onClick={() => nav('/')}>← Back</button>
        <div className="detail-title">
          <div className="detail-company">{job.company}</div>
          <div className="detail-role">{job.role}</div>
        </div>
        <div className="detail-actions">
          <select className="status-select" value={job.status}
            onChange={e => handleStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
          {editing
            ? <><button className="btn btn-primary btn-sm" onClick={save}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setForm(job) }}>Cancel</button></>
            : <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
          }
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
          {job.job_url && <a href={job.job_url} target="_blank" className="btn btn-ghost btn-sm">Open JD ↗</a>}
        </div>
      </div>

      <div className="detail-body">
        {/* Left: resume paste + AI toolbar */}
        <div className="detail-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">Your resume <span className="sidebar-hint">(for AI tools)</span></div>
            <textarea
              className="resume-input"
              rows={10}
              placeholder="Paste your resume text here to enable cover letter, resume tailoring, and email drafts..."
              value={resume}
              onChange={e => setResume(e.target.value)}
            />
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">AI tools</div>
            <div className="ai-tools-grid">
              <button className="ai-tool-btn" onClick={() => runAI('parse')}
                disabled={loading.parse || !job.job_description}>
                {loading.parse ? '⏳' : '🔍'} Parse JD
              </button>
              <button className="ai-tool-btn" onClick={() => runAI('cover')}
                disabled={loading.cover || !job.job_description}>
                {loading.cover ? '⏳' : '📄'} Cover letter
              </button>
              <button className="ai-tool-btn" onClick={() => runAI('tailor')}
                disabled={loading.tailor || !job.job_description}>
                {loading.tailor ? '⏳' : '✏️'} Tailor resume
              </button>
              <button className="ai-tool-btn" onClick={() => runAI('email')}
                disabled={loading.email}>
                {loading.email ? '⏳' : '✉️'} Draft email
              </button>
              <button className="ai-tool-btn" onClick={() => runAI('contacts')}
                disabled={loading.contacts}>
                {loading.contacts ? '⏳' : '👥'} Find contacts
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Meta</div>
            <div className="meta-grid">
              <div className="meta-item"><span>Location</span><span>{job.location || '—'}</span></div>
              <div className="meta-item"><span>Remote</span><span>{job.remote ? 'Yes' : 'No'}</span></div>
              <div className="meta-item"><span>Salary</span><span>{job.salary_range || '—'}</span></div>
              <div className="meta-item"><span>Sponsorship</span>
                <span style={{color: job.sponsorship ? 'var(--green)' : 'var(--text3)'}}>
                  {job.sponsorship ? 'Yes ✓' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: tabs */}
        <div className="detail-content">
          <div className="detail-tabs">
            {['overview','cover-letter','tailor','email','contacts'].map(t => (
              <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`}
                onClick={() => setActiveTab(t)}>
                {t === 'overview' && '📋 Overview'}
                {t === 'cover-letter' && '📄 Cover letter'}
                {t === 'tailor' && '✏️ Tailored resume'}
                {t === 'email' && '✉️ Outreach'}
                {t === 'contacts' && `👥 Contacts ${contacts.length ? `(${contacts.length})` : ''}`}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                {editing ? (
                  <div className="edit-fields">
                    <div className="form-group">
                      <label>Job description</label>
                      <textarea rows={14} value={form.job_description || ''}
                        onChange={e => setForm(f => ({ ...f, job_description: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Notes</label>
                      <textarea rows={4} value={form.notes || ''}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                    </div>
                  </div>
                ) : (
                  <>
                    {job.parsed_keywords && (
                      <ParsedKeywords data={JSON.parse(job.parsed_keywords)} />
                    )}
                    {job.job_description && (
                      <div className="content-block">
                        <div className="content-label">Job description</div>
                        <pre className="jd-text">{job.job_description}</pre>
                      </div>
                    )}
                    {job.notes && (
                      <div className="content-block">
                        <div className="content-label">Notes</div>
                        <p>{job.notes}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'cover-letter' && (
              <div>
                {job.cover_letter
                  ? <CopyBlock label="Cover letter" text={job.cover_letter} />
                  : <EmptyState msg="Run 'Cover letter' after pasting your resume." />
                }
              </div>
            )}

            {activeTab === 'tailor' && (
              <div>
                {tailored
                  ? <TailoredView data={tailored} />
                  : <EmptyState msg="Run 'Tailor resume' after pasting your resume." />
                }
              </div>
            )}

            {activeTab === 'email' && (
              <div>
                {job.outreach_email_draft
                  ? <CopyBlock label="Cold email" text={job.outreach_email_draft} />
                  : <EmptyState msg="Run 'Draft email' to generate a cold outreach email." />
                }
              </div>
            )}

            {activeTab === 'contacts' && (
              <div>
                {contacts.length > 0
                  ? <ContactsList contacts={contacts} />
                  : <EmptyState msg="Run 'Find contacts' to discover who to reach out to at this company." />
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ParsedKeywords({ data }) {
  return (
    <div className="content-block">
      <div className="content-label">JD analysis</div>
      <div className="parsed-grid">
        <div>
          <div className="parsed-sublabel">Required skills</div>
          <div className="tag-list">
            {data.required_skills?.map(s => <span key={s} className="tag" style={{color:'var(--purple-light)'}}>{s}</span>)}
          </div>
        </div>
        <div>
          <div className="parsed-sublabel">Tech stack</div>
          <div className="tag-list">
            {data.tech_stack?.map(s => <span key={s} className="tag">{s}</span>)}
          </div>
        </div>
        <div>
          <div className="parsed-sublabel">Keywords</div>
          <div className="tag-list">
            {data.keywords?.map(s => <span key={s} className="tag">{s}</span>)}
          </div>
        </div>
      </div>
      {data.sponsorship_text && (
        <div className="sponsorship-notice" style={{color: data.sponsorship_mentioned ? 'var(--green)' : 'var(--red)'}}>
          💼 {data.sponsorship_text}
        </div>
      )}
    </div>
  )
}

function TailoredView({ data }) {
  return (
    <div>
      <div className="content-block">
        <div className="match-score-bar">
          <span>Match score</span>
          <div className="score-bar">
            <div className="score-fill" style={{width: `${data.analysis?.match_score ?? 0}%`}} />
          </div>
          <span style={{color:'var(--purple-light)',fontWeight:700}}>{data.analysis?.match_score ?? 0}%</span>
        </div>
        <div className="parsed-grid" style={{marginTop:12}}>
          <div>
            <div className="parsed-sublabel">✅ Matching skills</div>
            <div className="tag-list">
              {data.analysis?.matching_skills?.map(s => <span key={s} className="tag" style={{color:'var(--green)'}}>{s}</span>)}
            </div>
          </div>
          <div>
            <div className="parsed-sublabel">⚠️ Missing keywords</div>
            <div className="tag-list">
              {data.analysis?.missing_keywords?.map(s => <span key={s} className="tag" style={{color:'var(--amber)'}}>{s}</span>)}
            </div>
          </div>
        </div>
      </div>

      {data.summary_suggestion && (
        <CopyBlock label="Suggested summary" text={data.summary_suggestion} />
      )}

      <div className="content-block">
        <div className="content-label">Bullet rewrites</div>
        {data.tailored_bullets?.map((b, i) => (
          <div key={i} className="bullet-rewrite">
            <div className="bullet-before">
              <span className="bullet-label">Before</span>
              <p>{b.original}</p>
            </div>
            <div className="bullet-after">
              <span className="bullet-label">After</span>
              <p>{b.tailored}</p>
            </div>
            <div className="bullet-reason">{b.reason}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContactsList({ contacts }) {
  return (
    <div className="content-block">
      <div className="content-label">Found contacts — ranked by relevance</div>
      {contacts.map((c, i) => (
        <div key={i} className="contact-card">
          <div className="contact-rank">#{i+1}</div>
          <div className="contact-info">
            <div className="contact-name">{c.name || 'Unknown'}</div>
            <div className="contact-title">{c.title || '—'}</div>
            {c.email && <div className="contact-email">✉️ {c.email}</div>}
            {c.linkedin && <a href={c.linkedin} target="_blank" className="contact-linkedin">🔗 LinkedIn</a>}
          </div>
          <div className="contact-score">{c.confidence}% confidence</div>
        </div>
      ))}
    </div>
  )
}

function CopyBlock({ label, text }) {
  const copy = () => { navigator.clipboard.writeText(text); toast.success('Copied!') }
  return (
    <div className="content-block">
      <div className="content-label-row">
        <div className="content-label">{label}</div>
        <button className="btn btn-ghost btn-sm" onClick={copy}>Copy</button>
      </div>
      <pre className="copy-text">{text}</pre>
    </div>
  )
}

function EmptyState({ msg }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">✨</div>
      <p>{msg}</p>
    </div>
  )
}
