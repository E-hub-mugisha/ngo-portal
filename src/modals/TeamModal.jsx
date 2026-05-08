import { useState } from 'react';
import { addTeamMember } from '../api/gasApi';
import { Modal, Alert } from '../components/Modal';

const ROLES = ['Project Manager','Field Officer','Program Coordinator','M&E Officer','Finance Officer','Communications Officer','Volunteer','Data Analyst','Community Liaison','Admin Assistant','Executive Director','Other'];
const DEPTS = ['Programs','Finance & Admin','M&E','Communications','Operations','Leadership'];
const INIT  = { name:'', email:'', role:'', department:'', phone:'' };

export default function TeamModal({ open, onClose, onSaved, toast }) {
  const [form,    setForm]    = useState(INIT);
  const [loading, setLoading] = useState(false);
  const [alert,   setAlert]   = useState({ msg:'', type:'', show:false });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function submit() {
    if (!form.name.trim())  { setAlert({ msg:'⚠️ Full name is required.', type:'error', show:true }); return; }
    if (!form.email.trim()) { setAlert({ msg:'⚠️ Email is required.', type:'error', show:true }); return; }
    setLoading(true);
    try {
      await addTeamMember(form);
      toast(`✅ ${form.name} added to the team!`, 'success');
      onSaved();
      onClose();
      setForm(INIT);
    } catch (e) { setAlert({ msg:'❌ ' + e.message, type:'error', show:true }); }
    setLoading(false);
  }

  return (
    <Modal open={open} onClose={onClose} title="➕ Add Team Member" subtitle="Add a new staff member or volunteer"
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-purple" onClick={submit} disabled={loading}>{loading ? '⏳ Adding...' : '✅ Add Member'}</button>
      </>}>
      <Alert {...alert} />
      <div className="form-row">
        <div className="form-group"><label className="form-label">Full Name <span className="req">*</span></label><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jean Pierre Habimana" /></div>
        <div className="form-group"><label className="form-label">Email <span className="req">*</span></label><input type="email" className="form-input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jp@ngo.org" /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Role</label>
          <select className="form-select" value={form.role} onChange={e => set('role', e.target.value)}>
            <option value="">-- Select --</option>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Department</label>
          <select className="form-select" value={form.department} onChange={e => set('department', e.target.value)}>
            <option value="">-- Select --</option>
            {DEPTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+250 7XX XXX XXX" /></div>
    </Modal>
  );
}
