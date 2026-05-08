import { useEffect, useState } from 'react';
import { getSummaryStats, getProjects, getTasks, getDailyReports } from '../api/gasApi';
import { Badge, moodEmoji } from '../components/Badge';

export default function Dashboard({ onNavigate, onOpenModal, toast }) {
  const [stats,    setStats]    = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks,    setTasks]    = useState([]);
  const [reports,  setReports]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  })();

  async function load() {
    setLoading(true);
    try {
      const [s, p, t, r] = await Promise.all([
        getSummaryStats(), getProjects(), getTasks(), getDailyReports(),
      ]);
      setStats(s);
      setProjects((p.data || []).filter(x => x.status === 'Active').slice(0, 5));
      setTasks((t.data || []).filter(x => x.status !== 'Completed' && x.status !== 'Cancelled').slice(0, 6));
      setReports((r.data || []).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8));
    } catch (e) {
      toast('Failed to load dashboard: ' + e.message, 'error');
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  const kpis = stats ? [
    { label: 'Total Projects', value: stats.projects.total,                               sub: stats.projects.active + ' active',       c: '#1a6e3c', icon: '📁' },
    { label: 'Open Tasks',     value: stats.tasks.pending + stats.tasks.inProgress,       sub: stats.tasks.dueToday + ' due today',     c: '#1a4e8c', icon: '📋' },
    { label: 'Due Today',      value: stats.tasks.dueToday,                               sub: stats.tasks.blocked + ' blocked',        c: '#c17f00', icon: '⚠️' },
    { label: 'Team Members',   value: stats.team.total,                                   sub: stats.reports.today + ' reports today',  c: '#6e1a6e', icon: '👥' },
  ] : [];

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div className="page-header">
        <div>
          <h1>{greeting} 👋</h1>
          <p>Here's what's happening with your NGO today.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load}>🔄 Refresh</button>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        {loading ? [1,2,3,4].map(i => (
          <div key={i} className="kpi-card" style={{ '--c': '#1a6e3c' }}>
            <div className="skeleton" style={{ width: '50px', height: '36px' }} />
            <div className="skeleton" style={{ width: '100px', height: '14px', marginTop: '8px' }} />
          </div>
        )) : kpis.map((k, i) => (
          <div key={k.label} className="kpi-card" style={{ '--c': k.c, '--icon': `'${k.icon}'`, animationDelay: `${i * .07}s` }}>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Grid: Active Projects + Pending Tasks */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>📁 Active Projects</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('projects')}>View all</button>
          </div>
          <div className="card-body">
            {loading ? [1,2,3].map(i => <div key={i} className="skeleton" />) :
             !projects.length ? <EmptyState icon="📁" msg="No active projects" /> :
             projects.map(p => (
              <div key={p.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-m)' }}>{p.manager || 'No manager'} · {p.endDate || 'No deadline'}</div>
                  <div className="progress-bar" style={{ marginTop: 5 }}>
                    <div className="progress-fill" style={{ width: `${p.progress || 0}%` }} />
                  </div>
                </div>
                <Badge text={p.status} type={p.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>📋 Pending Tasks</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('tasks')}>View all</button>
          </div>
          <div className="card-body">
            {loading ? [1,2,3].map(i => <div key={i} className="skeleton" />) :
             !tasks.length ? <EmptyState icon="📋" msg="No open tasks" /> :
             tasks.map(t => (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight:600, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.title}</div>
                  <div style={{ fontSize:11, color:'var(--text-m)' }}>👤 {t.assignedTo || 'Unassigned'} · 📅 {t.dueDate || 'No due date'}</div>
                </div>
                <Badge text={t.priority} type={t.priority} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="card section-mt">
        <div className="card-header">
          <h3>📝 Recent Daily Reports</h3>
          <button className="btn btn-primary btn-sm" onClick={() => onOpenModal('report')}>+ Submit Report</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Staff</th><th>Date</th><th>Project</th><th>Hours</th><th>Mood</th><th>Blockers</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign:'center', padding:'24px', color:'var(--text-l)' }}>Loading...</td></tr>
              ) : !reports.length ? (
                <tr><td colSpan="6"><div className="empty-state"><span className="empty-icon">📝</span><h3>No reports yet</h3></div></td></tr>
              ) : reports.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.staffName}</strong></td>
                  <td>{r.date}</td>
                  <td>{r.project || '—'}</td>
                  <td>{r.hours}h</td>
                  <td>{moodEmoji(r.mood)} {r.mood}</td>
                  <td style={{ maxWidth: 200, color: r.blockers && r.blockers !== 'None' ? 'var(--red)' : 'var(--text-m)', fontSize: 12 }}>
                    {r.blockers || 'None'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, msg }) {
  return <div className="empty-state"><span className="empty-icon">{icon}</span><h3>{msg}</h3></div>;
}