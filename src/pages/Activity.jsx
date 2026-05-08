import { useEffect, useState } from 'react';
import { getActivities } from '../api/gasApi';
import { Badge } from '../components/Badge';

const today = () => new Date().toISOString().split('T')[0];

export default function Activity({ toast, onOpenModal }) {
  const [activities, setActivities] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [staffFilter, setStaffFilter] = useState('');
  const [search,     setSearch]     = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await getActivities();
      setActivities((res.data || []).sort((a, b) =>
        b.date.localeCompare(a.date) || b.submittedAt.localeCompare(a.submittedAt)
      ));
    } catch (e) {
      toast('Failed to load activities: ' + e.message, 'error');
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Unique staff names for filter dropdown
  const staffList = [...new Set(activities.map(a => a.staffName).filter(Boolean))].sort();

  const filtered = activities.filter(a => {
    if (dateFilter  && a.date      !== dateFilter)                              return false;
    if (staffFilter && a.staffName !== staffFilter)                             return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !a.staffName?.toLowerCase().includes(q) &&
        !a.whatDone?.toLowerCase().includes(q)  &&
        !a.nextAction?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  // Today count
  const todayCount = activities.filter(a => a.date === today()).length;

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div className="page-header">
        <div>
          <h1>🗂️ Activity Log</h1>
          <p>Track what staff have done and their next planned actions.</p>
        </div>
        <div className="page-header-actions">
          <span style={{ fontSize: 12, color: 'var(--text-m)', background: 'var(--bg)', padding: '5px 12px', borderRadius: 6, fontWeight: 600 }}>
            📅 {todayCount} submitted today
          </span>
          <button className="btn btn-primary btn-sm" onClick={() => onOpenModal('activity')}>
            ✏️ Log Activity
          </button>
          <button className="btn btn-ghost btn-sm" onClick={load}>🔄 Refresh</button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          className="form-input"
          style={{ maxWidth: 220 }}
          placeholder="🔍 Search activities..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <input
          type="date"
          className="form-input"
          style={{ maxWidth: 170 }}
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
        />
        <select
          className="form-select"
          style={{ maxWidth: 200 }}
          value={staffFilter}
          onChange={e => setStaffFilter(e.target.value)}
        >
          <option value="">All Staff</option>
          {staffList.map(s => <option key={s}>{s}</option>)}
        </select>
        {(dateFilter || staffFilter || search) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setDateFilter(''); setStaffFilter(''); setSearch(''); }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="card">
        <div className="card-header">
          <h3>🗂️ Activities ({filtered.length})</h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Staff</th>
                <th>Date</th>
                <th>What Was Done</th>
                <th>Next Action</th>
                <th>Status</th>
                <th>Blockers</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 32, color: 'var(--text-l)' }}>Loading…</td></tr>
              ) : !filtered.length ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <span className="empty-icon">🗂️</span>
                      <h3>No activities found</h3>
                      <p style={{ color: 'var(--text-m)', fontSize: 13 }}>
                        {search || dateFilter || staffFilter ? 'Try adjusting your filters.' : 'Log your first activity using the button above.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(a => (
                <tr key={a.id}>
                  <td>
                    <strong>{a.staffName}</strong>
                    {a.staffEmail && <div style={{ fontSize: 11, color: 'var(--text-l)' }}>{a.staffEmail}</div>}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{a.date}</td>
                  <td style={{ maxWidth: 260 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{a.whatDone}</div>
                  </td>
                  <td style={{ maxWidth: 220 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-m)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{a.nextAction || '—'}</div>
                  </td>
                  <td>
                    <Badge text={a.status} type={a.status} />
                  </td>
                  <td style={{ maxWidth: 180, fontSize: 12, color: a.blockers && a.blockers !== 'None' ? 'var(--red)' : 'var(--text-m)' }}>
                    {a.blockers || 'None'}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{a.hours ? a.hours + 'h' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}