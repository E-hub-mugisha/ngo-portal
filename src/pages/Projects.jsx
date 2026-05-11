import { useEffect, useState } from 'react';
import { getProjects, updateProjStatus, deleteProject, updateProject } from '../api/gasApi';
import { Badge } from '../components/Badge';

// ── tiny helpers ──────────────────────────────────────────────
const BRAND = {
  green:     '#1a6e3c',
  blue:      '#1a4e8c',
  accent:    '#f0a500',
  red:       '#d63031',
  text:      '#1a1a2e',
  textMed:   '#5a6474',
  textLight: '#9aa3af',
  white:     '#ffffff',
  bg:        '#f4f7f5',
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 12px',
  borderRadius: 8,
  border: '1.5px solid #dde3e9',
  fontSize: 13,
  color: BRAND.text,
  background: BRAND.white,
  outline: 'none',
};

// ── Overlay wrapper ───────────────────────────────────────────
function Modal({ title, onClose, children, maxWidth = 560 }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: BRAND.white,
          borderRadius: 18,
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
          animation: 'fadeUp .2s ease',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid #eef0f2',
        }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: BRAND.text }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: '#f4f7f5', border: 'none', borderRadius: 8,
              width: 32, height: 32, cursor: 'pointer',
              fontSize: 18, color: BRAND.textMed, lineHeight: 1,
            }}
          >×</button>
        </div>
        <div style={{ padding: '20px 24px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

// ── Detail row ────────────────────────────────────────────────
function DetailRow({ label, value }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '140px 1fr',
      gap: 8, padding: '8px 0', borderBottom: '1px solid #f0f2f4',
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: BRAND.textMed, textTransform: 'uppercase', letterSpacing: .4 }}>{label}</span>
      <span style={{ fontSize: 13, color: BRAND.text }}>{value || '—'}</span>
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 12, fontWeight: 700, color: BRAND.textMed, textTransform: 'uppercase', letterSpacing: .4 }}>{label}</label>
    {children}
  </div>
);

// ═════════════════════════════════════════════════════════════
export default function Projects({ onOpenModal, onOpenExport, toast }) {
  const [all,       setAll]       = useState([]);
  const [filtered,  setFiltered]  = useState([]);
  const [tab,       setTab]       = useState('all');
  const [loading,   setLoading]   = useState(true);

  // modals
  const [viewProj,    setViewProj]    = useState(null);   // project object
  const [editProj,    setEditProj]    = useState(null);   // project object (for edit)
  const [deleteProj,  setDeleteProj]  = useState(null);   // project object (for confirm)
  const [saving,      setSaving]      = useState(false);
  const [deleting,    setDeleting]    = useState(false);

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

  async function handleSaveEdit() {
    setSaving(true);
    try {
      await updateProject(editProj);
      toast('Project updated', 'success');
      setEditProj(null);
      load();
    } catch (e) { toast(e.message, 'error'); }
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteProject(deleteProj.id);
      toast('Project deleted', 'success');
      setDeleteProj(null);
      load();
    } catch (e) { toast(e.message, 'error'); }
    setDeleting(false);
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
              <tr>
                <th>Project</th><th>Manager</th><th>Category</th>
                <th>Priority</th><th>Status</th><th>Progress</th>
                <th>Budget (RWF)</th><th>End Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-l)' }}>Loading projects...</td></tr>
              ) : !filtered.length ? (
                <tr><td colSpan="9"><div className="empty-state"><span className="empty-icon">📁</span><h3>No projects found</h3></div></td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    {p.description && (
                      <div style={{ fontSize: 11, color: 'var(--text-l)', marginTop: 2 }}>
                        {p.description.substring(0, 50)}{p.description.length > 50 ? '…' : ''}
                      </div>
                    )}
                  </td>
                  <td>{p.manager || '—'}</td>
                  <td>{p.category || '—'}</td>
                  <td><Badge text={p.priority || '—'} type={p.priority} /></td>
                  <td>
                    <select className="status-select" value={p.status} onChange={e => changeStatus(p.id, e.target.value)}>
                      {['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <div className="progress-bar" style={{ width: 80 }}>
                      <div className="progress-fill" style={{ width: `${p.progress || 0}%` }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-l)', marginTop: 2 }}>{p.progress || 0}%</div>
                  </td>
                  <td>{Number(p.budget || 0).toLocaleString()} RWF</td>
                  <td>{p.endDate || '—'}</td>

                  {/* ── Action buttons ── */}
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {/* View */}
                      <button
                        className="btn btn-sm"
                        title="View details"
                        onClick={() => setViewProj(p)}
                        style={{
                          background: `${BRAND.blue}15`,
                          color: BRAND.blue,
                          border: `1px solid ${BRAND.blue}30`,
                          borderRadius: 7,
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        👁 View
                      </button>

                      {/* Export */}
                      <button
                        className="btn btn-sm"
                        title="Export"
                        onClick={() => onOpenExport(p.id)}
                        style={{
                          background: `${BRAND.green}15`,
                          color: BRAND.green,
                          border: `1px solid ${BRAND.green}30`,
                          borderRadius: 7,
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        📤 Export
                      </button>

                      {/* Edit */}
                      <button
                        className="btn btn-sm"
                        title="Edit project"
                        onClick={() => setEditProj({ ...p })}
                        style={{
                          background: `${BRAND.accent}20`,
                          color: '#b07800',
                          border: `1px solid ${BRAND.accent}50`,
                          borderRadius: 7,
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ✏️ Edit
                      </button>

                      {/* Delete */}
                      <button
                        className="btn btn-sm"
                        title="Delete project"
                        onClick={() => setDeleteProj(p)}
                        style={{
                          background: `${BRAND.red}12`,
                          color: BRAND.red,
                          border: `1px solid ${BRAND.red}30`,
                          borderRadius: 7,
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ VIEW DETAILS MODAL ══════════════════════════════ */}
      {viewProj && (
        <Modal title={`📁 ${viewProj.name}`} onClose={() => setViewProj(null)} maxWidth={600}>
          {/* Progress banner */}
          <div style={{
            background: `linear-gradient(135deg, ${BRAND.green}18, ${BRAND.blue}12)`,
            borderRadius: 12, padding: '14px 18px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: BRAND.textMed, marginBottom: 6, textTransform: 'uppercase', letterSpacing: .4 }}>Overall Progress</div>
              <div style={{ background: '#dde8e2', borderRadius: 999, height: 10, overflow: 'hidden' }}>
                <div style={{ width: `${viewProj.progress || 0}%`, height: '100%', background: `linear-gradient(90deg, ${BRAND.green}, ${BRAND.blue})`, borderRadius: 999, transition: 'width .6s ease' }} />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: BRAND.green }}>{viewProj.progress || 0}%</div>
          </div>

          <DetailRow label="Description"   value={viewProj.description} />
          <DetailRow label="Category"      value={viewProj.category} />
          <DetailRow label="Manager"       value={viewProj.manager} />
          <DetailRow label="Status"        value={viewProj.status} />
          <DetailRow label="Priority"      value={viewProj.priority} />
          <DetailRow label="Start Date"    value={viewProj.startDate} />
          <DetailRow label="End Date"      value={viewProj.endDate} />
          <DetailRow label="Budget (RWF)"  value={Number(viewProj.budget || 0).toLocaleString() + ' RWF'} />
          <DetailRow label="Spent (RWF)"   value={Number(viewProj.spent || 0).toLocaleString() + ' RWF'} />
          <DetailRow label="Notes"         value={viewProj.notes} />

          <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setViewProj(null); setEditProj({ ...viewProj }); }}
              style={{
                padding: '9px 20px', borderRadius: 9, border: `1.5px solid ${BRAND.accent}`,
                background: `${BRAND.accent}15`, color: '#b07800',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >✏️ Edit</button>
            <button
              onClick={() => setViewProj(null)}
              style={{
                padding: '9px 20px', borderRadius: 9, border: 'none',
                background: `linear-gradient(135deg, ${BRAND.green}, ${BRAND.blue})`,
                color: BRAND.white, fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >Close</button>
          </div>
        </Modal>
      )}

      {/* ══ EDIT MODAL ═══════════════════════════════════════ */}
      {editProj && (
        <Modal title="✏️ Edit Project" onClose={() => setEditProj(null)} maxWidth={580}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Project Name *">
              <input style={inputStyle} value={editProj.name || ''} onChange={e => setEditProj(p => ({ ...p, name: e.target.value }))} />
            </Field>
            <Field label="Description">
              <textarea
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                value={editProj.description || ''}
                onChange={e => setEditProj(p => ({ ...p, description: e.target.value }))}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Category">
                <input style={inputStyle} value={editProj.category || ''} onChange={e => setEditProj(p => ({ ...p, category: e.target.value }))} />
              </Field>
              <Field label="Manager">
                <input style={inputStyle} value={editProj.manager || ''} onChange={e => setEditProj(p => ({ ...p, manager: e.target.value }))} />
              </Field>
              <Field label="Status">
                <select style={inputStyle} value={editProj.status || 'Planning'} onChange={e => setEditProj(p => ({ ...p, status: e.target.value }))}>
                  {['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Priority">
                <select style={inputStyle} value={editProj.priority || 'Medium'} onChange={e => setEditProj(p => ({ ...p, priority: e.target.value }))}>
                  {['Low', 'Medium', 'High', 'Critical'].map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Start Date">
                <input type="date" style={inputStyle} value={editProj.startDate || ''} onChange={e => setEditProj(p => ({ ...p, startDate: e.target.value }))} />
              </Field>
              <Field label="End Date">
                <input type="date" style={inputStyle} value={editProj.endDate || ''} onChange={e => setEditProj(p => ({ ...p, endDate: e.target.value }))} />
              </Field>
              <Field label="Budget (RWF)">
                <input type="number" style={inputStyle} value={editProj.budget || 0} onChange={e => setEditProj(p => ({ ...p, budget: e.target.value }))} />
              </Field>
              <Field label="Progress (%)">
                <input type="number" min={0} max={100} style={inputStyle} value={editProj.progress || 0} onChange={e => setEditProj(p => ({ ...p, progress: e.target.value }))} />
              </Field>
            </div>

            <Field label="Notes">
              <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }} value={editProj.notes || ''} onChange={e => setEditProj(p => ({ ...p, notes: e.target.value }))} />
            </Field>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setEditProj(null)}
              style={{
                padding: '9px 20px', borderRadius: 9,
                border: '1.5px solid #dde3e9', background: BRAND.white,
                color: BRAND.textMed, fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >Cancel</button>
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              style={{
                padding: '9px 24px', borderRadius: 9, border: 'none',
                background: saving ? '#aaa' : `linear-gradient(135deg, ${BRAND.green}, ${BRAND.blue})`,
                color: BRAND.white, fontWeight: 700, fontSize: 13,
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 4px 14px rgba(26,110,60,0.28)',
              }}
            >{saving ? '⏳ Saving…' : '💾 Save Changes'}</button>
          </div>
        </Modal>
      )}

      {/* ══ DELETE CONFIRM MODAL ══════════════════════════════ */}
      {deleteProj && (
        <Modal title="🗑 Delete Project" onClose={() => setDeleteProj(null)} maxWidth={420}>
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <p style={{ fontSize: 15, color: BRAND.text, margin: '0 0 8px', fontWeight: 700 }}>
              Are you sure you want to delete this project?
            </p>
            <p style={{ fontSize: 13, color: BRAND.textMed, margin: '0 0 4px' }}>
              <strong>"{deleteProj.name}"</strong>
            </p>
            <p style={{ fontSize: 12, color: BRAND.red, margin: 0 }}>
              This action cannot be undone. All associated data may be affected.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => setDeleteProj(null)}
              style={{
                padding: '10px 24px', borderRadius: 9,
                border: '1.5px solid #dde3e9', background: BRAND.white,
                color: BRAND.textMed, fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >Cancel</button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                padding: '10px 24px', borderRadius: 9, border: 'none',
                background: deleting ? '#aaa' : BRAND.red,
                color: BRAND.white, fontWeight: 700, fontSize: 13,
                cursor: deleting ? 'not-allowed' : 'pointer',
                boxShadow: deleting ? 'none' : '0 4px 14px rgba(214,48,49,0.30)',
              }}
            >{deleting ? '⏳ Deleting…' : '🗑 Yes, Delete'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}