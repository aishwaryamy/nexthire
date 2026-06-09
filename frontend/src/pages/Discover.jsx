import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import './Discover.css'

export default function Discover() {
  const [patterns, setPatterns]     = useState(null)
  const [jobs, setJobs]             = useState([])
  const [stats, setStats]           = useState(null)
  const [resume, setResume]         = useState('')
  const [query, setQuery]           = useState('')
  const [loading, setLoading]       = useState({ patterns: false, jobs: false })
  const [tab, setTab]               = useState('patterns')

  useEffect(() => {
    loadStats()
    axios.get('/api/discover/stats').then(r => {
      setEmailConfig(r.data.email_configured)
      setAlertEmail(r.data.alert_email || '')
    }).catch(() => {})
  }, [])

  const loadStats = async () => {
    try {
      const { data } = await axios.get('/api/discover/stats')
      setStats(data)
    } catch {}
  }

  const loadPatterns = async () => {
    setLoading(l => ({ ...l, patterns: true }))
    try {
      const { data } = await axios.get('/api/discover/patterns')
      setPatterns(data)
      if (data.error) toast(data.message || data.error, { icon: '💡' })
      else toast.success('Patterns analyzed!')
    } catch { toast.error('Failed to analyze patterns') }
    setLoading(l => ({ ...l, patterns: false }))
  }

  const loadJobs = async () => {
    setLoading(l => ({ ...l, jobs: true }))
    try {
      const { data } = await axios.post('/api/discover/jobs', {
        resume,
        custom_query: query || undefined,
        send_email: sendEmail,
        alert_email: alertEmail || undefined
      })
      if (data.email_sent) toast.success('Email alert sent!')
      setJobs(data.jobs || [])
      toast.success(`Found ${data.jobs?.length ?? 0} matching roles`)
    } catch { toast.error('Failed to fetch jobs') }
    setLoading(l => ({ ...l, jobs: false }))
  }

  const priorityColor = (p) => ({
    high: 'var(--green)', medium: 'var(--amber)', low: 'var(--text3)'
  }[p] || 'var(--text3)')

  return (
    <div className="discover-page">
      {/* Header */}
      <div className="discover-header">
        <div>
          <h1 className="discover-title">Discover</h1>
          <p className="discover-sub">
            Understand what's working in your job search, then find roles that match your winning pattern.
          </p>
        </div>
        {stats && (
          <div className="discover-stats">
            <div className="dstat">
              <div className="dstat-val">{stats.total}</div>
              <div className="dstat-label">Total apps</div>
            </div>
            <div className="dstat">
              <div className="dstat-val" style={{color:'var(--green)'}}>{stats.successes}</div>
              <div className="dstat-label">Responses</div>
            </div>
            <div className="dstat">
              <div className="dstat-val" style={{color:'var(--red)'}}>{stats.rejections}</div>
              <div className="dstat-label">Rejections</div>
            </div>
            <div className="dstat">
              <div className="dstat-val" style={{color:'var(--purple-light)'}}>{stats.call_rate}%</div>
              <div className="dstat-label">Call rate</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="discover-tabs">
        <button className={`tab ${tab === 'patterns' ? 'active' : ''}`}
          onClick={() => setTab('patterns')}>
          📊 Pattern analyzer
        </button>
        <button className={`tab ${tab === 'jobs' ? 'active' : ''}`}
          onClick={() => setTab('jobs')}>
          🔭 Job discovery {jobs.length > 0 && `(${jobs.length})`}
        </button>
      </div>

      <div className="discover-body">
        {/* ── Pattern Analyzer Tab ── */}
        {tab === 'patterns' && (
          <div className="pattern-tab">
            {!patterns ? (
              <div className="discover-empty">
                <div className="discover-empty-icon">📊</div>
                <h2>Find your winning pattern</h2>
                <p>
                  The pattern analyzer looks at all your applications — which ones
                  got you calls and which got rejected — and surfaces what's working.
                  You need at least 3 outcomes (responses or rejections) to get meaningful insights.
                </p>
                {stats && !stats.has_enough_data && (
                  <div className="data-notice">
                    📋 You have {stats.successes + stats.rejections} outcomes so far.
                    Keep logging applications — you need at least 3.
                  </div>
                )}
                <button className="btn btn-primary" onClick={loadPatterns}
                  disabled={loading.patterns}>
                  {loading.patterns ? 'Analyzing...' : '🔍 Analyze my patterns'}
                </button>
              </div>
            ) : patterns.error ? (
              <div className="discover-empty">
                <div className="discover-empty-icon">💡</div>
                <h2>Not enough data yet</h2>
                <p>{patterns.message}</p>
                <div className="data-notice">
                  {patterns.successes ?? 0} responses · {patterns.rejections ?? 0} rejections · {patterns.pending ?? 0} pending
                </div>
                <button className="btn btn-ghost" onClick={() => setPatterns(null)}>
                  Try again
                </button>
              </div>
            ) : (
              <div className="pattern-results">
                {/* Summary */}
                <div className="pattern-card summary-card">
                  <div className="pattern-card-label">Summary</div>
                  <p className="pattern-summary">{patterns.summary}</p>
                  <div className="outcome-pills">
                    <span className="pill green">{patterns.raw_counts?.successes} responses</span>
                    <span className="pill red">{patterns.raw_counts?.rejections} rejections</span>
                    <span className="pill gray">{patterns.raw_counts?.pending} pending</span>
                    <span className="pill purple">{patterns.success_rate?.rate_percent ?? 0}% call rate</span>
                  </div>
                </div>

                <div className="pattern-grid">
                  {/* Winning patterns */}
                  <div className="pattern-card">
                    <div className="pattern-card-label" style={{color:'var(--green)'}}>✅ What's working</div>
                    {patterns.winning_patterns?.map((p, i) => (
                      <div key={i} className="pattern-item">
                        <div className="pattern-item-title">{p.pattern}</div>
                        <div className="pattern-item-evidence">{p.evidence}</div>
                        <span className="confidence-badge" style={{
                          color: p.confidence === 'high' ? 'var(--green)' :
                                 p.confidence === 'medium' ? 'var(--amber)' : 'var(--text3)'
                        }}>{p.confidence} confidence</span>
                      </div>
                    ))}
                  </div>

                  {/* Losing patterns */}
                  <div className="pattern-card">
                    <div className="pattern-card-label" style={{color:'var(--red)'}}>⚠️ What's not working</div>
                    {patterns.losing_patterns?.map((p, i) => (
                      <div key={i} className="pattern-item">
                        <div className="pattern-item-title">{p.pattern}</div>
                        <div className="pattern-item-evidence">{p.evidence}</div>
                        <span className="confidence-badge" style={{
                          color: p.confidence === 'high' ? 'var(--red)' :
                                 p.confidence === 'medium' ? 'var(--amber)' : 'var(--text3)'
                        }}>{p.confidence} confidence</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Success Profile */}
                {patterns.success_profile && (
                  <div className="pattern-card">
                    <div className="pattern-card-label">🎯 Your success profile</div>
                    <div className="profile-grid">
                      <div className="profile-item">
                        <span className="profile-label">Best domains</span>
                        <div className="tag-row">
                          {patterns.success_profile.ideal_domains?.map(d =>
                            <span key={d} className="tag" style={{color:'var(--purple-light)'}}>{d}</span>
                          )}
                        </div>
                      </div>
                      <div className="profile-item">
                        <span className="profile-label">Winning tech stack</span>
                        <div className="tag-row">
                          {patterns.success_profile.ideal_tech_stack?.map(t =>
                            <span key={t} className="tag">{t}</span>
                          )}
                        </div>
                      </div>
                      <div className="profile-item">
                        <span className="profile-label">Keywords that win</span>
                        <div className="tag-row">
                          {patterns.success_profile.keywords_that_win?.map(k =>
                            <span key={k} className="tag" style={{color:'var(--teal)'}}>{k}</span>
                          )}
                        </div>
                      </div>
                      <div className="profile-item">
                        <span className="profile-label">Level</span>
                        <span className="profile-val">{patterns.success_profile.ideal_level}</span>
                      </div>
                      <div className="profile-item">
                        <span className="profile-label">Remote preference</span>
                        <span className="profile-val">
                          {patterns.success_profile.remote_preference ? '✅ Remote' : '🏢 On-site'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {patterns.top_recommendations && (
                  <div className="pattern-card">
                    <div className="pattern-card-label">💡 Top recommendations</div>
                    {patterns.top_recommendations.map((r, i) => (
                      <div key={i} className="recommendation-item">
                        <span className="rec-num">{i + 1}</span>
                        <p>{r}</p>
                      </div>
                    ))}
                  </div>
                )}

                <button className="btn btn-ghost" onClick={() => setPatterns(null)}
                  style={{marginTop:8}}>
                  Re-analyze
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Job Discovery Tab ── */}
        {tab === 'jobs' && (
          <div className="jobs-tab">
            <div className="jobs-controls">
              <div className="jobs-controls-left">
                <div className="form-group" style={{flex:1}}>
                  <label>Search query <span style={{color:'var(--text3)'}}>— leave blank to auto-generate from your pattern</span></label>
                  <input value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="e.g. ML engineer RAG LangGraph remote 2026" />
                </div>
              </div>
              <button className="btn btn-primary" onClick={loadJobs}
                disabled={loading.jobs}>
                {loading.jobs ? 'Searching...' : '🔭 Find matching roles'}
              </button>
            </div>

            <div className="form-group" style={{marginBottom:16}}>
              <label>Your resume <span style={{color:'var(--text3)'}}>— paste for better scoring</span></label>
              <textarea value={resume} onChange={e => setResume(e.target.value)}
                rows={4} placeholder="Paste your resume for more accurate match scoring..." />
            </div>

            {emailConfig && (
              <div className="email-toggle">
                <label className="checkbox-label">
                  <input type="checkbox" checked={sendEmail}
                    onChange={e => setSendEmail(e.target.checked)} />
                  Email me when high-scoring jobs are found
                </label>
                {sendEmail && (
                  <input value={alertEmail} onChange={e => setAlertEmail(e.target.value)}
                    placeholder="your@email.com" style={{marginTop:8, width:'100%'}} />
                )}
              </div>
            )}

            {jobs.length === 0 && !loading.jobs && (
              <div className="discover-empty">
                <div className="discover-empty-icon">🔭</div>
                <h2>Find roles matched to your pattern</h2>
                <p>
                  Once you've analyzed your patterns, this will search for new job listings
                  and score each one against what's historically gotten you interviews.
                  {!stats?.has_enough_data && " Run the pattern analyzer first for best results."}
                </p>
              </div>
            )}

            {jobs.length > 0 && (
              <div className="jobs-list">
                {jobs.map((job, i) => (
                  <div key={i} className="job-result-card">
                    <div className="job-result-left">
                      <div className="job-result-rank">#{i + 1}</div>
                    </div>
                    <div className="job-result-body">
                      <div className="job-result-header">
                        <div>
                          <div className="job-result-company">{job.company}</div>
                          <div className="job-result-role">{job.role}</div>
                        </div>
                        <div className="job-result-score-block">
                          <div className="score-circle" style={{
                            borderColor: job.score >= 80 ? 'var(--green)' :
                                         job.score >= 60 ? 'var(--amber)' : 'var(--red)'
                          }}>
                            {job.score}
                          </div>
                          <div className="score-label">match</div>
                        </div>
                      </div>

                      <p className="job-result-snippet">{job.snippet}</p>

                      <div className="job-result-footer">
                        <div className="job-result-tags">
                          {job.match_reasons?.slice(0,2).map((r, j) =>
                            <span key={j} className="tag" style={{color:'var(--green)', fontSize:'11px'}}>{r}</span>
                          )}
                          {job.concerns?.slice(0,1).map((c, j) =>
                            <span key={j} className="tag" style={{color:'var(--amber)', fontSize:'11px'}}>⚠ {c}</span>
                          )}
                        </div>
                        <div className="job-result-actions">
                          <span style={{
                            fontSize:'11px', fontWeight:600,
                            color: priorityColor(job.apply_priority)
                          }}>
                            {job.apply_priority?.toUpperCase()} PRIORITY
                          </span>
                          {job.url && job.url !== '#' && (
                            <a href={job.url} target="_blank" className="btn btn-ghost btn-sm">
                              View →
                            </a>
                          )}
                        </div>
                      </div>

                      {job.why && (
                        <div className="job-result-why">{job.why}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
