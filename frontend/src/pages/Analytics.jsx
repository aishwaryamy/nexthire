import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts'
import './Analytics.css'

const STATUS_COLORS = {
  saved: '#94a3b8', applied: '#60a5fa', phone_screen: '#14b8a6',
  interview: '#c4b5fd', offer: '#10b981', rejected: '#f87171'
}

const CHART_COLORS = ['#8b5cf6','#14b8a6','#f59e0b','#60a5fa','#10b981','#f87171','#c4b5fd','#fb923c']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#18181f', border: '1px solid #2e2e3e',
      borderRadius: 8, padding: '10px 14px', fontSize: 12
    }}>
      <p style={{color:'#e8e8f0', fontWeight:600, marginBottom:4}}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{color: p.color, margin:'2px 0'}}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [metrics, setMetrics]   = useState(null)
  const [funnel, setFunnel]     = useState([])
  const [timeline, setTimeline] = useState([])
  const [domains, setDomains]   = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [m, f, t, d] = await Promise.all([
          axios.get('/api/analytics/top-metrics').then(r => r.data),
          axios.get('/api/analytics/funnel').then(r => r.data),
          axios.get('/api/analytics/timeline').then(r => r.data),
          axios.get('/api/analytics/by-domain').then(r => r.data),
        ])
        setMetrics(m); setFunnel(f); setTimeline(t); setDomains(d)
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="analytics-loading">
      <div className="analytics-spinner" />
      <p>Loading your analytics...</p>
    </div>
  )

  if (!metrics || metrics.total === 0) return (
    <div className="analytics-empty">
      <div className="analytics-empty-icon">📊</div>
      <h2>No data yet</h2>
      <p>Add some jobs to the board to start seeing analytics. The more you track, the more insight you get.</p>
    </div>
  )

  const funnelData = funnel.funnel || []
  const pieData = funnelData.map(f => ({ name: f.label, value: f.count }))
    .filter(d => d.value > 0)

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1 className="analytics-title">Analytics</h1>
        <p className="analytics-sub">A full picture of your job search performance.</p>
      </div>

      {/* Top metrics */}
      <div className="metrics-grid">
        <MetricCard label="Total applications" value={metrics.total} color="var(--text)" />
        <MetricCard label="Applied" value={metrics.applied} color="var(--blue)" />
        <MetricCard label="Responses" value={metrics.responses} color="var(--teal)" />
        <MetricCard label="Offers" value={metrics.offers} color="var(--green)" />
        <MetricCard label="Response rate" value={`${metrics.response_rate}%`} color="var(--purple-light)" />
        <MetricCard label="Offer rate" value={`${metrics.offer_rate}%`} color="var(--amber)" />
        <MetricCard label="Remote roles" value={metrics.remote_count} color="var(--text2)" />
        <MetricCard label="Visa sponsorship" value={metrics.sponsorship_count} color="var(--text2)" />
      </div>

      <div className="charts-grid">
        {/* Application funnel */}
        <div className="chart-card wide">
          <div className="chart-label">Application funnel</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={funnelData} margin={{top:8, right:8, bottom:0, left:-20}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3e" vertical={false} />
              <XAxis dataKey="label" tick={{fill:'#9090a8', fontSize:12}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'#9090a8', fontSize:11}} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{fill:'#222230'}} />
              <Bar dataKey="count" radius={[6,6,0,0]}>
                {funnelData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status] || '#8b5cf6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status breakdown pie */}
        <div className="chart-card">
          <div className="chart-label">Status breakdown</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                   dataKey="value" paddingAngle={3}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:12, color:'#9090a8'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Applications over time */}
        {timeline.length > 0 && (
          <div className="chart-card wide">
            <div className="chart-label">Applications over time</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={timeline} margin={{top:8, right:8, bottom:0, left:-20}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3e" />
                <XAxis dataKey="week" tick={{fill:'#9090a8', fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'#9090a8', fontSize:11}} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="applied" stroke="#8b5cf6"
                      strokeWidth={2} dot={{fill:'#8b5cf6', r:4}} name="Applied" />
                <Line type="monotone" dataKey="responses" stroke="#14b8a6"
                      strokeWidth={2} dot={{fill:'#14b8a6', r:4}} name="Responses" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Response rate by domain */}
        {domains.length > 0 && (
          <div className="chart-card wide">
            <div className="chart-label">Response rate by domain</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={domains} layout="vertical" margin={{top:8, right:40, bottom:0, left:60}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3e" horizontal={false} />
                <XAxis type="number" domain={[0,100]} tick={{fill:'#9090a8', fontSize:11}}
                       axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="domain" tick={{fill:'#9090a8', fontSize:11}}
                       axisLine={false} tickLine={false} width={60} />
                <Tooltip content={<CustomTooltip />} cursor={{fill:'#222230'}} />
                <Bar dataKey="rate" radius={[0,6,6,0]} name="Response rate %">
                  {domains.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="insights-card">
        <div className="chart-label">Quick insights</div>
        <div className="insights-grid">
          {metrics.response_rate >= 30 && (
            <div className="insight good">
              🔥 Your {metrics.response_rate}% response rate is above average. Keep going.
            </div>
          )}
          {metrics.response_rate > 0 && metrics.response_rate < 15 && (
            <div className="insight warn">
              ⚠️ Response rate is low. Try tailoring your resume to each JD before applying.
            </div>
          )}
          {metrics.remote_count > metrics.applied / 2 && (
            <div className="insight info">
              💡 Over half your applications are remote roles — good for geographic flexibility.
            </div>
          )}
          {metrics.offers > 0 && (
            <div className="insight good">
              🎉 You have {metrics.offers} offer{metrics.offers > 1 ? 's' : ''}! Compare them carefully.
            </div>
          )}
          {metrics.applied < 5 && (
            <div className="insight info">
              📋 Log more applications to unlock deeper pattern analysis.
            </div>
          )}
          {domains.length > 0 && domains[0].rate > 0 && (
            <div className="insight good">
              🎯 Best domain: <strong>{domains[0].domain}</strong> with {domains[0].rate}% response rate.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, color }) {
  return (
    <div className="metric-card">
      <div className="metric-val" style={{color}}>{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  )
}
