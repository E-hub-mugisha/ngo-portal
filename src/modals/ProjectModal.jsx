import { useState } from 'react';
import { createProject } from '../api/gasApi';
import { Modal, Alert } from '../components/Modal';

const CATEGORIES = ['Health & Sanitation','Education','Agriculture','Infrastructure','Environment','Community Development','Emergency Relief','Gender & Inclusion','Livelihoods','Research','Other'];
const today = () => new Date().toISOString().split('T')[0];

const INIT = { name:'', description:'', category:'', priority:'Medium', manager:'', startDate:today(), endDate:'', status:'Planning', budget:'', notes:'' };

export default function ProjectModal({ open, onClose, onSaved, toast }) {
  const [form,    setForm]    = useState(INIT);
  const [loading, setLoading] = useState(false);
  const [alert,   setAlert]   = useState({ msg:'', type:'', show:false });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function submit() {
    if (!form.name.trim()) { setAlert({ msg:'⚠️ Project name is required.', type:'error', show:true }); return; }
    setLoading(true);
    try {
      const res = await createProject(form);
      toast('✅ Project created: ' + form.name, 'success');
      onSaved();
      onClose();
      setForm(INIT);
    } catch (e) { setAlert({ msg:'❌ ' + e.message, type:'error', show:true }); }
    setLoading(false);
  }

  return (
    <Modal open={open} onClose={onClose} title="➕ New Project" subtitle="Create a new project in the system"
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? '⏳ Creating...' : '✅ Create Project'}</button>
      </>}>
      <Alert {...alert} />
      <div className="form-group"><label className="form-label">Project Name <span className="req">*</span></label><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Clean Water Initiative 2025" /></div>
      <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Goals and scope..." /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Category</label>
          <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
            <option value="">-- Select --</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Priority</label>
          <select className="form-select" value={form.priority} onChange={e => set('priority', e.target.value)}>
            {['Low','Medium','High','Critical'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group"><label className="form-label">Project Manager</label><input className="form-input" value={form.manager} onChange={e => set('manager', e.target.value)} placeholder="Full name" /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Start Date</label><input type="date" className="form-input" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">End Date</label><input type="date" className="form-input" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
            {['Planning','Active','On Hold'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Budget (RWF)</label><input type="number" className="form-input" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="0" min="0" /></div>
      </div>
      <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" style={{ minHeight: 56 }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Donor info, references..." /></div>
    </Modal>
  );
}
