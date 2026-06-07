import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Board from './pages/Board'
import JobDetail from './pages/JobDetail'
import { getStats } from './api/client'
import './index.css'

export default function App() {
  const [stats, setStats] = useState(null)

  const refreshStats = async () => {
    try { setStats(await getStats()) } catch {}
  }

  useEffect(() => { refreshStats() }, [])

  return (
    <BrowserRouter>
      <Navbar stats={stats} />
      <Routes>
        <Route path="/"          element={<Board onStatsChange={refreshStats} />} />
        <Route path="/jobs/:id"  element={<JobDetail />} />
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#222230',
            color: '#e8e8f0',
            border: '1px solid #2e2e3e',
            fontSize: '13px',
          }
        }}
      />
    </BrowserRouter>
  )
}
