import { useState, useEffect } from 'react';
import { createTask, getProjects, getTeamMembers } from '../api/gasApi';
import { Modal, Alert } from '../components/Modal';

const nextWeek = () => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0]; };
const today = () => new Date().toISOString().split('T')[0];
const INIT = { title:'', description:'', projectId:'', projectName:'', assignedTo:'', assignedEmail:'', priority:'Medium', dueDate:nextWeek(), notes:'', notify:true };

export default function TaskModal({ open, onClose, onSaved, toast }) {
  const [form,     setForm]     = useState(INIT);
  const [projects, setProjects] = useState([]);
  const [members,  setMembers]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [alert,    setAlert]    = useState({ msg:'', type:'', show:false });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  useEffect(() => {
    if (!open) return;
    getProjects().then(r => setProjects(r.data || [])).catch(() => {});
    getTeamMembers().then(r => setMembers(r.data || [])).catch(() => {});
  }, [open]);

  async function submit() {
    if (!form.title.trim())        { setAlert({ msg:'⚠️ Task title is required.', type:'error', show:true }); return; }
    if (!form.assignedEmail)       { setAlert({ msg:'⚠️ Please select a team member.', type:'error', show:true }); return; }
    setLoading(true);
    try {
      await createTask({ ...form, startDate: today() });
      toast('✅ Task assigned to ' + form.assignedTo, 'success');
      onSaved();
      onClose();
      setForm(INIT);
    } catch (e) { setAlert({ msg:'❌ ' + e.message, type:'error', show:true }); }
    setLoading(false);
  }

  return (
    <Modal open={open} onClose={onClose} title="📋 Assign Task" subtitle="Assign a task to a team member"
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-secondary" onClick={submit} disabled={loading}>{loading ? '⏳ Assigning...' : '📋 Assign Task'}</button>
      </>}>
      <Alert {...alert} />
      <div className="form-group"><label className="form-label">Task Title <span className="req">*</span></label><input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Conduct community baseline survey" /></div>
      <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="What needs to be done..." /></div>
      <div className="form-group">
        <label className="form-label">Project</label>
        <select className="form-select" value={form.projectId}
          onChange={e => { const p = projects.find(x => x.id === e.target.value); set('projectId', e.target.value); set('projectName', p?.name || ''); }}>
          <option value="">-- No project --</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Assign To <span className="req">*</span></label>
        <select className="form-select" value={form.assignedEmail}
          onChange={e => { const m = members.find(x => x.email === e.target.value); set('assignedEmail', e.target.value); set('assignedTo', m?.name || ''); }}>
          <option value="">-- Select member --</option>
          {members.map(m => <option key={m.email} value={m.email}>{m.name} ({m.role || m.department || 'Team'})</option>)}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Priority</label>
          <select className="form-select" value={form.priority} onChange={e => set('priority', e.target.value)}>
            {['Low','Medium','High','Critical'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Due Date</label><input type="date" className="form-input" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} /></div>
      </div>
      <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" style={{ minHeight:56 }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Instructions, resources..." /></div>
      <div className="form-group">
        <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'var(--text-m)', textTransform:'none', letterSpacing:0, fontWeight:500 }}>
          <input type="checkbox" checked={form.notify} onChange={e => set('notify', e.target.checked)} style={{ width:'auto' }} />
          Send email notification to assignee
        </label>
      </div>
    </Modal>
  );
}
