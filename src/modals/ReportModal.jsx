import { useState, useEffect } from 'react';
import { submitDailyReport, getProjects } from '../api/gasApi';
import { Modal, Alert } from '../components/Modal';

const today = () => new Date().toISOString().split('T')[0];
const MOODS = [
  { value:'Excellent', icon:'🚀' }, { value:'Good', icon:'😊' }, { value:'Okay', icon:'😐' },
  { value:'Struggling', icon:'😔' }, { value:'Burned Out', icon:'😩' },
];
const INIT = { staffName:'', staffEmail:'', date:today(), project:'', tasksDone:'', tasksPlanned:'', blockers:'', hours:'8', mood:'Good', notes:'' };

export default function ReportModal({ open, onClose, onSaved, toast }) {
  const [form,     setForm]     = useState(INIT);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [alert,    setAlert]    = useState({ msg:'', type:'', show:false });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  useEffect(() => {
    if (!open) return;
    getProjects().then(r => setProjects(r.data || [])).catch(() => {});
  }, [open]);

  async function submit() {
    if (!form.staffName.trim()) { setAlert({ msg:'⚠️ Your name is required.', type:'error', show:true }); return; }
    if (!form.tasksDone.trim()) { setAlert({ msg:'⚠️ Please describe tasks completed.', type:'error', show:true }); return; }
    setLoading(true);
    try {
      await submitDailyReport({ ...form, notifyManager: false });
      toast('✅ Daily report submitted!', 'success');
      onSaved();
      onClose();
      setForm(INIT);
    } catch (e) { setAlert({ msg:'❌ ' + e.message, type:'error', show:true }); }
    setLoading(false);
  }

  const dateLabel = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });

  return (
    <Modal open={open} onClose={onClose} title="📝 Daily Report" subtitle={`Submitting for ${dateLabel}`}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-gold" onClick={submit} disabled={loading}>{loading ? '⏳ Submitting...' : '📝 Submit Report'}</button>
      </>}>
      <Alert {...alert} />
      <div className="form-row">
        <div className="form-group"><label className="form-label">Your Name <span className="req">*</span></label><input className="form-input" value={form.staffName} onChange={e => set('staffName', e.target.value)} placeholder="Full name" /></div>
        <div className="form-group"><label className="form-label">Your Email</label><input type="email" className="form-input" value={form.staffEmail} onChange={e => set('staffEmail', e.target.value)} placeholder="email@ngo.org" /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Report Date</label><input type="date" className="form-input" value={form.date} onChange={e => set('date', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Project / Program</label>
          <select className="form-select" value={form.project} onChange={e => set('project', e.target.value)}>
            <option value="">-- No project --</option>
            {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Tasks Completed Today <span className="req">*</span></label>
        <textarea className="form-textarea" value={form.tasksDone} onChange={e => set('tasksDone', e.target.value)} placeholder={'• Conducted 3 household surveys\n• Completed data entry for 25 forms'} />
      </div>
      <div className="form-group">
        <label className="form-label">Tasks Planned for Tomorrow</label>
        <textarea className="form-textarea" value={form.tasksPlanned} onChange={e => set('tasksPlanned', e.target.value)} placeholder={'• Field visit to Rwamagana\n• Follow-up with 5 beneficiaries'} />
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Blockers / Challenges</label><input className="form-input" value={form.blockers} onChange={e => set('blockers', e.target.value)} placeholder="Any obstacles? (or 'None')" /></div>
        <div className="form-group"><label className="form-label">Hours Worked</label><input type="number" className="form-input" value={form.hours} onChange={e => set('hours', e.target.value)} min="0" max="24" step="0.5" /></div>
      </div>
      <div className="form-group">
        <label className="form-label">How are you feeling today?</label>
        <div className="mood-row">
          {MOODS.map(m => (
            <div key={m.value} className={`mood-opt ${form.mood === m.value ? 'active' : ''}`} onClick={() => set('mood', m.value)}>
              <span className="m-icon">{m.icon}</span>
              <span className="m-label">{m.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
