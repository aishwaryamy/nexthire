import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

export default function Navbar({ stats }) {
  const loc = useLocation()
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">⚡</span>
        <span className="navbar-name">JobHunt AI</span>
      </div>
      <div className="navbar-links">
        <Link to="/" className={loc.pathname === '/' ? 'active' : ''}>Board</Link>
        <Link to="/stats" className={loc.pathname === '/stats' ? 'active' : ''}>Analytics</Link>
      </div>
      <div className="navbar-stats">
        <span className="stat-chip">{stats?.total ?? 0} jobs</span>
        <span className="stat-chip green">{stats?.call_rate ?? 0}% call rate</span>
      </div>
    </nav>
  )
}
