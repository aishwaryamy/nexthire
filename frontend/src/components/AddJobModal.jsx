import { useState } from 'react'
import { createJob } from '../api/client'
import toast from 'react-hot-toast'
import './Modal.css'

const DEFAULT = {
  company: '', role: '', job_url: '', job_description: '',
  location: '', remote: false, salary_range: '',
  sponsorship: false, notes: '', priority: 2
}

export default function AddJobModal({ onClose, onCreated }) {
  const [form, setForm] = useState(DEFAULT)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.company || !form.role) {
      toast.error('Company and role are required')
      return
    }
    setLoading(true)
    try {
      const job = await createJob(form)
      toast.success('Job added!')
      onCreated(job)
      onClose()
    } catch {
      toast.error('Failed to add job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Add new job</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Company *</label>
              <input value={form.company} onChange={e => set('company', e.target.value)}
                placeholder="e.g. Anthropic" autoFocus />
            </div>
            <div className="form-group">
              <label>Role *</label>
              <input value={form.role} onChange={e => set('role', e.target.value)}
                placeholder="e.g. Machine Learning Engineer" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Job URL</label>
              <input value={form.job_url} onChange={e => set('job_url', e.target.value)}
                placeholder="https://..." />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input value={form.location} onChange={e => set('location', e.target.value)}
                placeholder="New York, NY" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Salary range</label>
              <input value={form.salary_range} onChange={e => set('salary_range', e.target.value)}
                placeholder="$120k – $160k" />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={e => set('priority', +e.target.value)}>
                <option value={1}>🔴 High</option>
                <option value={2}>🟡 Medium</option>
                <option value={3}>⚪ Low</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <label className="checkbox-label">
              <input type="checkbox" checked={form.remote}
                onChange={e => set('remote', e.target.checked)} />
              Remote
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.sponsorship}
                onChange={e => set('sponsorship', e.target.checked)} />
              Visa sponsorship
            </label>
          </div>

          <div className="form-group">
            <label>Job description <span style={{color:'var(--text3)'}}>– paste for AI tools</span></label>
            <textarea value={form.job_description}
              onChange={e => set('job_description', e.target.value)}
              rows={6} placeholder="Paste the full job description here for AI-powered cover letters and resume tailoring..." />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              rows={2} placeholder="Any personal notes about this role..." />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : '+ Add job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
