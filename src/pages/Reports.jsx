import { useEffect, useState } from 'react';
import { getDailyReports } from '../api/gasApi';
import { moodEmoji } from '../components/Badge';

export default function Reports({ onOpenModal, toast }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await getDailyReports();
      setReports((res.data || []).sort((a, b) => b.date.localeCompare(a.date)));
    } catch (e) { toast('Error loading reports: ' + e.message, 'error'); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div className="page-header">
        <div><h1>📝 Daily Reports</h1><p>Staff progress reports and activity logs.</p></div>
        <button className="btn btn-gold" onClick={() => onOpenModal('report')}>📝 Submit Report</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Staff</th><th>Project</th><th>Hours</th><th>Mood</th><th>Tasks Done</th><th>Blockers</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign:'center', padding:'32px', color:'var(--text-l)' }}>Loading reports...</td></tr>
              ) : !reports.length ? (
                <tr><td colSpan="7"><div className="empty-state"><span className="empty-icon">📝</span><h3>No reports submitted yet</h3></div></td></tr>
              ) : reports.map(r => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td><strong>{r.staffName}</strong></td>
                  <td>{r.project || '—'}</td>
                  <td>{r.hours}h</td>
                  <td>{moodEmoji(r.mood)} {r.mood}</td>
                  <td style={{ maxWidth: 220, fontSize: 12 }}>
                    {(r.tasksDone || '').substring(0, 80)}{(r.tasksDone || '').length > 80 ? '...' : ''}
                  </td>
                  <td style={{ color: r.blockers && r.blockers !== 'None' ? 'var(--red)' : 'var(--text-l)', fontSize: 12 }}>
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
