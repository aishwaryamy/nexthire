import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import './InterviewPrep.css'

const SCORE_COLOR = (s) =>
  s >= 8 ? 'var(--green)' : s >= 6 ? 'var(--amber)' : 'var(--red)'

const SCORE_LABEL = (s) =>
  s >= 9 ? 'Exceptional' : s >= 7 ? 'Good' : s >= 5 ? 'Average' : 'Needs work'

export default function InterviewPrep({ jobId, resume }) {
  const [questions, setQuestions]     = useState(null)
  const [currentCat, setCat]          = useState(null)
  const [currentQ, setCurrentQ]       = useState(0)
  const [answers, setAnswers]         = useState({})   // keyed by question id
  const [evaluations, setEvals]       = useState({})   // keyed by question id
  const [activeEval, setActiveEval]   = useState(null) // currently shown eval
  const [summary, setSummary]         = useState(null)
  const [loading, setLoading]         = useState({})
  const [phase, setPhase]             = useState('start')

  const setL = (k, v) => setLoading(l => ({ ...l, [k]: v }))

  // ── Start session ──
  const startSession = async () => {
    setL('start', true)
    try {
      const { data } = await axios.post(`/api/interview/questions/${jobId}`,
        { resume: resume || '' })
      setQuestions(data)
      setCat(Object.keys(data)[0])
      setCurrentQ(0)
      setPhase('session')
      toast.success('Questions ready!')
    } catch { toast.error('Failed to generate questions') }
    setL('start', false)
  }

  // ── Switch category ──
  const switchCat = (cat) => {
    setCat(cat)
    setCurrentQ(0)
    setActiveEval(null)
  }

  // ── Switch question within category ──
  const switchQ = (idx) => {
    setCurrentQ(idx)
    const q = questions[currentCat].questions[idx]
    setActiveEval(evaluations[q.id] || null)
  }

  // ── Submit answer ──
  const submitAnswer = async () => {
    const q = questions[currentCat].questions[currentQ]
    const ans = answers[q.id] || ''
    if (!ans.trim()) { toast.error('Write an answer first'); return }
    setL(q.id, true)
    try {
      const { data } = await axios.post(`/api/interview/evaluate/${jobId}`, {
        question: q.question,
        answer: ans,
        question_type: q.type
      })
      const entry = { ...data, question: q.question, type: q.type, answer: ans, id: q.id }
      setEvals(prev => ({ ...prev, [q.id]: entry }))
      setActiveEval(entry)
      toast.success(`Score: ${data.score}/10`)
    } catch { toast.error('Evaluation failed') }
    setL(q.id, false)
  }

  // ── Generate summary ──
  const generateSummary = async () => {
    const allEvals = Object.values(evaluations)
    if (allEvals.length === 0) { toast.error('Answer at least one question first'); return }
    setL('summary', true)
    try {
      const { data } = await axios.post(`/api/interview/summary/${jobId}`,
        { evaluations: allEvals })
      setSummary(data)
      setPhase('summary')
    } catch { toast.error('Failed to generate summary') }
    setL('summary', false)
  }

  const reset = () => {
    setQuestions(null); setCat(null); setCurrentQ(0)
    setAnswers({}); setEvals({}); setActiveEval(null)
    setSummary(null); setPhase('start')
  }

  // ── Derived ──
  const allQs = questions ? Object.values(questions).flatMap(c => c.questions) : []
  const answeredCount = Object.keys(evaluations).length
  const progress = allQs.length > 0 ? Math.round(answeredCount / allQs.length * 100) : 0

  // ─────────────────────────────────────────────
  // START SCREEN
  // ─────────────────────────────────────────────
  if (phase === 'start') return (
    <div className="ip-start">
      <div className="ip-start-icon">🎯</div>
      <h2>Interview Prep</h2>
      <p>
        Practice with AI-generated questions tailored to this exact role and company.
        Answer in any order, get scored feedback on each answer, and get a full
        session report whenever you're ready.
      </p>
      <div className="ip-features">
        <div className="ip-feature">📋 8 tailored questions</div>
        <div className="ip-feature">⭐ STAR format check</div>
        <div className="ip-feature">🔢 Score out of 10</div>
        <div className="ip-feature">📊 Session summary</div>
      </div>
      <button className="btn btn-primary" onClick={startSession}
        disabled={loading.start} style={{marginTop:8}}>
        {loading.start ? 'Generating questions...' : '🚀 Start practice session'}
      </button>
      {!resume && (
        <p className="ip-hint">💡 Paste your resume in the sidebar for more targeted questions</p>
      )}
    </div>
  )

  // ─────────────────────────────────────────────
  // SUMMARY SCREEN
  // ─────────────────────────────────────────────
  if (phase === 'summary' && summary) return (
    <div className="ip-summary">
      <div className="ip-summary-header">
        <div className="ip-summary-score" style={{borderColor: SCORE_COLOR(summary.overall_score)}}>
          <div className="ip-summary-score-val">{summary.overall_score}</div>
          <div className="ip-summary-score-label">/ 10</div>
        </div>
        <div>
          <h2>{summary.overall_label}</h2>
          <p style={{color: summary.ready_to_interview ? 'var(--green)' : 'var(--amber)'}}>
            {summary.ready_to_interview ? '✅ Ready to interview' : '⚠️ More practice recommended'}
          </p>
        </div>
      </div>

      <div className="ip-summary-grid">
        <div className="ip-card">
          <div className="ip-card-label" style={{color:'var(--green)'}}>💪 Strongest area</div>
          <p>{summary.strongest_area}</p>
        </div>
        <div className="ip-card">
          <div className="ip-card-label" style={{color:'var(--amber)'}}>⚠️ Weakest area</div>
          <p>{summary.weakest_area}</p>
        </div>
      </div>

      <div className="ip-card">
        <div className="ip-card-label">Top 3 things to improve</div>
        {summary.top_3_improvements?.map((imp, i) => (
          <div key={i} className="ip-improvement">
            <span className="ip-imp-num">{i + 1}</span>
            <p>{imp}</p>
          </div>
        ))}
      </div>

      <div className="ip-card">
        <div className="ip-card-label">🎯 Practice this before the interview</div>
        <p style={{color:'var(--text)', lineHeight:1.7}}>{summary.what_to_practice_next}</p>
      </div>

      <div className="ip-card" style={{borderColor:'var(--purple)'}}>
        <p style={{color:'var(--purple-light)', fontStyle:'italic', lineHeight:1.7}}>
          "{summary.encouragement}"
        </p>
      </div>

      <div className="ip-card">
        <div className="ip-card-label">All answers reviewed</div>
        {Object.values(evaluations).map((e, i) => (
          <div key={i} className="ip-reviewed-item">
            <div className="ip-reviewed-q">{e.question}</div>
            <div className="ip-reviewed-score" style={{color: SCORE_COLOR(e.score)}}>
              {e.score}/10 — {SCORE_LABEL(e.score)}
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-ghost" onClick={reset} style={{marginTop:8}}>
        Start new session
      </button>
    </div>
  )

  // ─────────────────────────────────────────────
  // MAIN SESSION SCREEN
  // ─────────────────────────────────────────────
  const cats = questions ? Object.keys(questions) : []
  const currentCatData = questions?.[currentCat]
  const currentQuestion = currentCatData?.questions[currentQ]
  const currentAnswer = answers[currentQuestion?.id] || ''
  const currentEvalData = currentQuestion ? evaluations[currentQuestion.id] : null

  return (
    <div className="ip-session">

      {/* Progress bar */}
      <div className="ip-progress-row">
        <div className="ip-progress-bar">
          <div className="ip-progress-fill" style={{width:`${progress}%`}} />
        </div>
        <span className="ip-progress-label">{answeredCount}/{allQs.length} answered</span>
        {answeredCount > 0 && (
          <button className="btn btn-primary btn-sm" onClick={generateSummary}
            disabled={loading.summary}>
            {loading.summary ? 'Generating...' : '📊 Get summary'}
          </button>
        )}
      </div>

      {/* Category tabs — CLICKABLE */}
      <div className="ip-cat-tabs">
        {cats.map(cat => {
          const catQs = questions[cat].questions
          const catAnswered = catQs.filter(q => evaluations[q.id]).length
          const allDone = catAnswered === catQs.length
          return (
            <button key={cat}
              className={`ip-cat-tab ${cat === currentCat ? 'active' : ''} ${allDone ? 'done' : ''}`}
              onClick={() => switchCat(cat)}>
              {allDone ? '✅ ' : ''}{questions[cat].label}
              <span className="ip-cat-count">{catAnswered}/{catQs.length}</span>
            </button>
          )
        })}
      </div>

      {/* Question pills within current category */}
      {currentCatData && (
        <div className="ip-q-pills">
          {currentCatData.questions.map((q, idx) => (
            <button key={q.id}
              className={`ip-q-pill ${idx === currentQ ? 'active' : ''} ${evaluations[q.id] ? 'done' : ''}`}
              onClick={() => switchQ(idx)}>
              Q{idx + 1}
              {evaluations[q.id] && (
                <span style={{color: SCORE_COLOR(evaluations[q.id].score), fontSize:10, marginLeft:3}}>
                  {evaluations[q.id].score}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Current question */}
      {currentQuestion && (
        <div className="ip-question-block">
          <div className="ip-q-meta">
            <span className="ip-q-type">{currentQuestion.type}</span>
            {currentEvalData && (
              <span style={{fontSize:12, fontWeight:700, color: SCORE_COLOR(currentEvalData.score)}}>
                Last score: {currentEvalData.score}/10
              </span>
            )}
          </div>
          <h3 className="ip-question">{currentQuestion.question}</h3>
          <div className="ip-tip">💡 {currentQuestion.tip}</div>

          <textarea
            className="ip-answer-input"
            placeholder="Type your answer here... Aim for 2-4 minutes speaking time (roughly 300-500 words)"
            value={currentAnswer}
            onChange={e => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
            rows={7}
          />

          <div className="ip-actions">
            <span className="ip-word-count">
              {currentAnswer.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            <button className="btn btn-primary" onClick={submitAnswer}
              disabled={loading[currentQuestion.id] || !currentAnswer.trim()}>
              {loading[currentQuestion.id] ? 'Evaluating...' :
               currentEvalData ? 'Re-evaluate →' : 'Submit answer →'}
            </button>
          </div>
        </div>
      )}

      {/* Evaluation result */}
      {currentEvalData && (
        <div className="ip-eval-block">
          <div className="ip-eval-score-row">
            <div className="ip-eval-score" style={{
              borderColor: SCORE_COLOR(currentEvalData.score),
              color: SCORE_COLOR(currentEvalData.score)
            }}>
              {currentEvalData.score}/10
            </div>
            <div>
              <div className="ip-eval-label">{SCORE_LABEL(currentEvalData.score)}</div>
              <div className="ip-eval-feedback">{currentEvalData.overall_feedback}</div>
            </div>
          </div>

          <div className="ip-eval-grid">
            <div className="ip-card">
              <div className="ip-card-label" style={{color:'var(--green)'}}>✅ Strengths</div>
              {currentEvalData.strengths?.map((s, i) => (
                <div key={i} className="ip-eval-point">{s}</div>
              ))}
            </div>
            <div className="ip-card">
              <div className="ip-card-label" style={{color:'var(--amber)'}}>💡 Improvements</div>
              {currentEvalData.improvements?.map((s, i) => (
                <div key={i} className="ip-eval-point">{s}</div>
              ))}
            </div>
          </div>

          {currentEvalData.star_check && currentEvalData.type === 'behavioral' && (
            <div className="ip-card">
              <div className="ip-card-label">STAR format check</div>
              <div className="ip-star-grid">
                {['situation','task','action','result'].map(k => (
                  <div key={k} className="ip-star-item">
                    <span>{currentEvalData.star_check[k] ? '✅' : '❌'}</span>
                    <span style={{textTransform:'capitalize'}}>{k}</span>
                  </div>
                ))}
              </div>
              {currentEvalData.star_check.note && (
                <p className="ip-star-note">{currentEvalData.star_check.note}</p>
              )}
            </div>
          )}

          {currentEvalData.example_stronger_answer && (
            <div className="ip-card" style={{borderColor:'var(--purple)'}}>
              <div className="ip-card-label" style={{color:'var(--purple-light)'}}>✨ Stronger version</div>
              <p style={{color:'var(--text2)', lineHeight:1.7, fontSize:13}}>
                {currentEvalData.example_stronger_answer}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
