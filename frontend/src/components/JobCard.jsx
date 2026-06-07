import { useNavigate } from 'react-router-dom'
import { updateStatus } from '../api/client'
import toast from 'react-hot-toast'
import './JobCard.css'

const PRIORITY_COLORS = { 1: '#ef4444', 2: '#f59e0b', 3: '#6b7280' }
const PRIORITY_LABELS = { 1: 'High', 2: 'Med', 3: 'Low' }

export default function JobCard({ job, onUpdate }) {
  const nav = useNavigate()

  const handleDragStart = (e) => {
    e.dataTransfer.setData('jobId', job.id)
  }

  return (
    <div
      className="job-card"
      draggable
      onDragStart={handleDragStart}
      onClick={() => nav(`/jobs/${job.id}`)}
    >
      <div className="job-card-header">
        <div className="job-card-priority"
          style={{ background: PRIORITY_COLORS[job.priority] + '22',
                   color: PRIORITY_COLORS[job.priority] }}>
          {PRIORITY_LABELS[job.priority]}
        </div>
        {job.remote && <span className="tag">Remote</span>}
        {job.sponsorship && <span className="tag" style={{color:'var(--teal)'}}>Visa ✓</span>}
      </div>

      <div className="job-card-company">{job.company}</div>
      <div className="job-card-role">{job.role}</div>

      {job.location && (
        <div className="job-card-location">📍 {job.location}</div>
      )}
      {job.salary_range && (
        <div className="job-card-salary">💰 {job.salary_range}</div>
      )}

      <div className="job-card-footer">
        <div className="job-card-indicators">
          {job.cover_letter && <span title="Cover letter ready">📄</span>}
          {job.tailored_resume && <span title="Resume tailored">✏️</span>}
          {job.outreach_email_draft && <span title="Email drafted">✉️</span>}
          {job.contact_email && <span title="Contact found">👤</span>}
        </div>
        <div className="job-card-date">
          {job.created_at
            ? new Date(job.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric' })
            : ''}
        </div>
      </div>
    </div>
  )
}
