import { useEffect, useState } from 'react';
import { getTasks, updateTaskStatus } from '../api/gasApi';
import { Badge } from '../components/Badge';

export default function Tasks({ onOpenModal, toast }) {
  const [all,      setAll]      = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tab,      setTab]      = useState('all');
  const [loading,  setLoading]  = useState(true);
  const today = new Date().toISOString().split('T')[0];

  async function load() {
    setLoading(true);
    try {
      const res = await getTasks();
      const data = res.data || [];
      setAll(data);
      applyFilter(tab, data);
    } catch (e) { toast('Error loading tasks: ' + e.message, 'error'); }
    setLoading(false);
  }

  function applyFilter(status, data = all) {
    setTab(status);
    setFiltered(status === 'all' ? data : data.filter(t => t.status === status));
  }

  async function changeStatus(id, newStatus) {
    try {
      await updateTaskStatus(id, newStatus);
      toast('Task status updated', 'success');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  const STATUSES = ['all', 'Pending', 'In Progress', 'Blocked', 'Completed'];

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div className="page-header">
        <div><h1>📋 Tasks</h1><p>Assign and track tasks across all projects.</p></div>
        <button className="btn btn-secondary" onClick={() => onOpenModal('task')}>📋 Assign Task</button>
      </div>

      <div className="tabs">
        {STATUSES.map(s => (
          <button key={s} className={`tab-btn ${tab === s ? 'active' : ''}`} onClick={() => applyFilter(s)}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Task</th><th>Project</th><th>Assigned To</th><th>Priority</th><th>Status</th><th>Due Date</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign:'center', padding:'32px', color:'var(--text-l)' }}>Loading tasks...</td></tr>
              ) : !filtered.length ? (
                <tr><td colSpan="6"><div className="empty-state"><span className="empty-icon">📋</span><h3>No tasks found</h3></div></td></tr>
              ) : filtered.map(t => {
                const overdue = t.dueDate && t.dueDate < today && t.status !== 'Completed';
                return (
                  <tr key={t.id} className={overdue ? 'overdue-row' : ''}>
                    <td>
                      <strong>{t.title}</strong>
                      {overdue && <span style={{ fontSize:10, color:'var(--red)', display:'block' }}>⚠️ Overdue</span>}
                    </td>
                    <td>{t.projectName || '—'}</td>
                    <td>{t.assignedTo || '—'}</td>
                    <td><Badge text={t.priority} type={t.priority} /></td>
                    <td>
                      <select className="status-select" value={t.status} onChange={e => changeStatus(t.id, e.target.value)}>
                        {['Pending','In Progress','Completed','Blocked','Cancelled'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ color: overdue ? 'var(--red)' : 'inherit' }}>{t.dueDate || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
