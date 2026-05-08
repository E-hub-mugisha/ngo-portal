import { useState, useEffect } from 'react';
import { getProjectList, exportProject, exportProjectDocx } from '../api/gasApi';
import { Modal, Alert } from '../components/Modal';

export default function ExportModal({ open, onClose, presetId, toast }) {
  const [projects, setProjects] = useState([]);
  const [projId,   setProjId]   = useState('');
  const [fmt,      setFmt]      = useState('sheet');
  const [loading,  setLoading]  = useState(false);
  const [alert,    setAlert]    = useState({ msg:'', type:'', show:false });
  const [result,   setResult]   = useState(null);

  useEffect(() => {
    if (!open) return;
    setResult(null);
    setAlert({ show: false });
    getProjectList().then(r => {
      setProjects(r.data || []);
      if (presetId) setProjId(presetId);
    }).catch(() => {});
  }, [open, presetId]);

  async function doExport() {
    if (!projId) { setAlert({ msg:'⚠️ Please select a project first.', type:'error', show:true }); return; }
    setLoading(true);
    setResult(null);
    setAlert({ msg:'⏳ Exporting, please wait…', type:'success', show:true });
    try {
      const res = fmt === 'docx' ? await exportProjectDocx(projId) : await exportProject(projId, fmt);
      setAlert({ show: false });
      if (res.status === 'error') { setAlert({ msg:'❌ ' + res.message, type:'error', show:true }); }
      else { setResult(res); toast('✅ Export complete!', 'success'); }
    } catch (e) { setAlert({ msg:'❌ ' + e.message, type:'error', show:true }); }
    setLoading(false);
  }

  const FORMATS = [
    { id:'sheet', icon:'📊', label:'Google Sheet', sub:'New spreadsheet in Drive' },
    { id:'csv',   icon:'📄', label:'CSV Files',    sub:'Download to your device'  },
    { id:'docx',  icon:'📝', label:'Google Doc',   sub:'Formatted report in Drive' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="📤 Export Project" subtitle="Export project data with tasks and daily reports"
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Close</button>
        <button className="btn btn-teal" onClick={doExport} disabled={loading}>{loading ? '⏳ Exporting…' : '📤 Export'}</button>
      </>}>
      <Alert {...alert} />

      <div className="form-group">
        <label className="form-label">Select Project <span className="req">*</span></label>
        <select className="form-select" value={projId} onChange={e => { setProjId(e.target.value); setResult(null); }}>
          <option value="">— Select a project —</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name} [{p.status}]</option>)}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Export Format</label>
        <div className="export-fmt-grid">
          {FORMATS.map(f => (
            <div key={f.id} className={`export-fmt-btn ${fmt === f.id ? 'selected' : ''}`} onClick={() => { setFmt(f.id); setResult(null); }}>
              <span className="efmt-icon">{f.icon}</span>
              <span className="efmt-label">{f.label}</span>
              <span className="efmt-sub">{f.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div>
          {(result.format === 'sheet' || result.format === 'docx') && (
            <div className="alert show alert-success">
              ✅ Export complete!{' '}
              <a href={result.url} target="_blank" rel="noreferrer" style={{ color:'var(--primary)', fontWeight:700 }}>
                Open "{result.name}" →
              </a>
            </div>
          )}
          {result.format === 'csv' && (
            <div>
              <div className="alert show alert-success">✅ Ready to download:</div>
              <div className="csv-chips">
                {[{label:'📁 Project',data:result.project},{label:'📋 Tasks',data:result.tasks},{label:'📝 Reports',data:result.reports}]
                  .filter(f => f.data?.csv)
                  .map(f => {
                    const blob = new Blob([f.data.csv], { type:'text/csv;charset=utf-8;' });
                    const url  = URL.createObjectURL(blob);
                    return <a key={f.label} className="csv-chip" href={url} download={f.data.name}>{f.label}</a>;
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
