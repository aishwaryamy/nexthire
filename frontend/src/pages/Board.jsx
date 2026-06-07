import { useState, useEffect } from 'react'
import { getJobs, updateStatus } from '../api/client'
import JobCard from '../components/JobCard'
import AddJobModal from '../components/AddJobModal'
import toast from 'react-hot-toast'
import './Board.css'

const COLUMNS = [
  { id: 'saved',        label: 'Saved',        color: '#94a3b8' },
  { id: 'applied',      label: 'Applied',       color: '#60a5fa' },
  { id: 'phone_screen', label: 'Phone screen',  color: '#14b8a6' },
  { id: 'interview',    label: 'Interview',     color: '#c4b5fd' },
  { id: 'offer',        label: 'Offer',         color: '#10b981' },
  { id: 'rejected',     label: 'Rejected',      color: '#f87171' },
]

export default function Board({ onStatsChange }) {
  const [jobs, setJobs] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [draggingOver, setDraggingOver] = useState(null)
  const [filter, setFilter] = useState({ priority: '', remote: '', sponsorship: '' })

  const load = async () => {
    const data = await getJobs()
    setJobs(data)
    onStatsChange?.()
  }

  useEffect(() => { load() }, [])

  const getFiltered = (status) => {
    return jobs
      .filter(j => j.status === status)
      .filter(j => !filter.priority || j.priority === +filter.priority)
      .filter(j => !filter.remote    || j.remote === (filter.remote === 'true'))
      .filter(j => !filter.sponsorship || j.sponsorship === (filter.sponsorship === 'true'))
  }

  const onDrop = async (e, targetStatus) => {
    e.preventDefault()
    const jobId = e.dataTransfer.getData('jobId')
    const job = jobs.find(j => j.id === jobId)
    if (!job || job.status === targetStatus) return
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: targetStatus } : j))
    try {
      await updateStatus(jobId, targetStatus)
      toast.success(`Moved to ${targetStatus.replace('_', ' ')}`)
      onStatsChange?.()
    } catch {
      toast.error('Failed to update status')
      load()
    }
    setDraggingOver(null)
  }

  return (
    <div className="board-page">
      <div className="board-topbar">
        <div className="board-filters">
          <select value={filter.priority}
            onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}>
            <option value="">All priorities</option>
            <option value="1">🔴 High</option>
            <option value="2">🟡 Medium</option>
            <option value="3">⚪ Low</option>
          </select>
          <select value={filter.remote}
            onChange={e => setFilter(f => ({ ...f, remote: e.target.value }))}>
            <option value="">All locations</option>
            <option value="true">Remote only</option>
            <option value="false">On-site</option>
          </select>
          <select value={filter.sponsorship}
            onChange={e => setFilter(f => ({ ...f, sponsorship: e.target.value }))}>
            <option value="">All visa</option>
            <option value="true">Sponsorship ✓</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add job
        </button>
      </div>

      <div className="board-columns">
        {COLUMNS.map(col => {
          const colJobs = getFiltered(col.id)
          return (
            <div
              key={col.id}
              className={`board-column ${draggingOver === col.id ? 'drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDraggingOver(col.id) }}
              onDragLeave={() => setDraggingOver(null)}
              onDrop={e => onDrop(e, col.id)}
            >
              <div className="column-header">
                <span className="column-dot" style={{ background: col.color }} />
                <span className="column-label">{col.label}</span>
                <span className="column-count">{colJobs.length}</span>
              </div>
              <div className="column-cards">
                {colJobs.map(job => (
                  <JobCard key={job.id} job={job} onUpdate={load} />
                ))}
                {colJobs.length === 0 && (
                  <div className="column-empty">Drop here</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showAdd && (
        <AddJobModal
          onClose={() => setShowAdd(false)}
          onCreated={(job) => { setJobs(prev => [job, ...prev]); onStatsChange?.() }}
        />
      )}
    </div>
  )
}
