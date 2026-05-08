import { useEffect, useState } from 'react';
import { getProjects, updateProjStatus } from '../api/gasApi';
import { Badge } from '../components/Badge';

export default function Projects({ onOpenModal, onOpenExport, toast }) {
  const [all,      setAll]      = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tab,      setTab]      = useState('all');
  const [loading,  setLoading]  = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await getProjects();
      const data = res.data || [];
      setAll(data);
      applyFilter(tab, data);
    } catch (e) { toast('Error loading projects: ' + e.message, 'error'); }
    setLoading(false);
  }

  function applyFilter(status, data = all) {
    setTab(status);
    setFiltered(status === 'all' ? data : data.filter(p => p.status === status));
  }

  async function changeStatus(id, newStatus) {
    try {
      await updateProjStatus(id, newStatus);
      toast('Project status updated', 'success');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  const STATUSES = ['all', 'Active', 'Planning', 'On Hold', 'Completed'];

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div className="page-header">
        <div><h1>📁 Projects</h1><p>Manage all NGO projects and track their progress.</p></div>
        <div className="page-header-actions">
          <button className="btn btn-teal" onClick={onOpenExport}>📤 Export Project</button>
          <button className="btn btn-primary" onClick={() => onOpenModal('project')}>➕ New Project</button>
        </div>
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
              <tr><th>Project</th><th>Manager</th><th>Category</th><th>Priority</th><th>Status</th><th>Progress</th><th>Budget (RWF)</th><th>End Date</th><th></th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ textAlign:'center', padding:'32px', color:'var(--text-l)' }}>Loading projects...</td></tr>
              ) : !filtered.length ? (
                <tr><td colSpan="9"><div className="empty-state"><span className="empty-icon">📁</span><h3>No projects found</h3></div></td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    {p.description && <div style={{ fontSize:11, color:'var(--text-l)', marginTop:2 }}>{p.description.substring(0,50)}{p.description.length>50?'...':''}</div>}
                  </td>
                  <td>{p.manager || '—'}</td>
                  <td>{p.category || '—'}</td>
                  <td><Badge text={p.priority || '—'} type={p.priority} /></td>
                  <td>
                    <select className="status-select" value={p.status} onChange={e => changeStatus(p.id, e.target.value)}>
                      {['Planning','Active','On Hold','Completed','Cancelled'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <div className="progress-bar" style={{ width: 80 }}>
                      <div className="progress-fill" style={{ width: `${p.progress || 0}%` }} />
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-l)', marginTop:2 }}>{p.progress || 0}%</div>
                  </td>
                  <td>{Number(p.budget || 0).toLocaleString()} RWF</td>
                  <td>{p.endDate || '—'}</td>
                  <td>
                    <button className="btn btn-teal btn-sm" onClick={() => onOpenExport(p.id)}>📤 Export</button>
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
