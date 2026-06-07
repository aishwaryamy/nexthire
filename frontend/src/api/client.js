import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Jobs
export const getJobs      = ()          => api.get('/jobs').then(r => r.data)
export const getJob       = (id)        => api.get(`/jobs/${id}`).then(r => r.data)
export const createJob    = (data)      => api.post('/jobs', data).then(r => r.data)
export const updateJob    = (id, data)  => api.patch(`/jobs/${id}`, data).then(r => r.data)
export const updateStatus = (id, status)=> api.patch(`/jobs/${id}/status`, { status }).then(r => r.data)
export const deleteJob    = (id)        => api.delete(`/jobs/${id}`).then(r => r.data)
export const getStats     = ()          => api.get('/jobs/stats/summary').then(r => r.data)

// AI tools
export const parseJD        = (id)          => api.post(`/ai/parse-jd/${id}`).then(r => r.data)
export const genCoverLetter = (id, resume)  => api.post(`/ai/cover-letter/${id}`, { job_id: id, resume }).then(r => r.data)
export const tailorResume   = (id, resume)  => api.post(`/ai/tailor-resume/${id}`, { job_id: id, resume }).then(r => r.data)
export const draftEmail     = (id, resume)  => api.post(`/ai/draft-email/${id}`, { job_id: id, resume }).then(r => r.data)
export const findContacts   = (id)          => api.post(`/ai/find-contacts/${id}`).then(r => r.data)

export default api
