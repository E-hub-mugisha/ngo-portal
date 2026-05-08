import { useState } from 'react';
import { submitActivity } from '../api/gasApi';
import { Modal, Alert } from '../components/Modal';

const today = () => new Date().toISOString().split('T')[0];

const STATUSES = [
  { value: 'Done',        icon: '✅', desc: 'Completed today'   },
  { value: 'In Progress', icon: '🔄', desc: 'Still ongoing'     },
  { value: 'Blocked',     icon: '🚫', desc: 'Needs help'        },
];

const INIT = {
  staffName: '', staffEmail: '', date: today(),
  whatDone: '', nextAction: '', blockers: '', hours: '8', status: 'Done',
};

export default function ActivityModal({ open, onClose, onSaved, toast }) {
  const [form,    setForm]    = useState(INIT);
  const [loading, setLoading] = useState(false);
  const [alert,   setAlert]   = useState({ msg: '', type: '', show: false });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function submit() {
    if (!form.staffName.trim()) {
      setAlert({ msg: '⚠️ Your name is required.', type: 'error', show: true }); return;
    }
    if (!form.whatDone.trim()) {
      setAlert({ msg: '⚠️ Please describe what you did.', type: 'error', show: true }); return;
    }
    setLoading(true);
    try {
      await submitActivity(form);
      toast('✅ Activity logged successfully!', 'success');
      onSaved();
      onClose();
      setForm(INIT);
      setAlert({ show: false });
    } catch (e) {
      setAlert({ msg: '❌ ' + e.message, type: 'error', show: true });
    }
    setLoading(false);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="✏️ Log Activity"
      subtitle="Record what you did today and your next planned action"
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit} disabled={loading}>
          {loading ? '⏳ Saving…' : '✅ Log Activity'}
        </button>
      </>}
    >
      <Alert {...alert} />

      {/* Name + Email */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Your Name <span className="req">*</span></label>
          <input className="form-input" value={form.staffName} onChange={e => set('staffName', e.target.value)} placeholder="Full name" />
        </div>
        <div className="form-group">
          <label className="form-label">Your Email</label>
          <input type="email" className="form-input" value={form.staffEmail} onChange={e => set('staffEmail', e.target.value)} placeholder="email@ngo.org" />
        </div>
      </div>

      {/* Date + Hours */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Date</label>
          <input type="date" className="form-input" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Hours Worked</label>
          <input type="number" className="form-input" value={form.hours} onChange={e => set('hours', e.target.value)} min="0" max="24" step="0.5" />
        </div>
      </div>

      {/* What was done */}
      <div className="form-group">
        <label className="form-label">What Did You Do Today? <span className="req">*</span></label>
        <textarea
          className="form-textarea"
          value={form.whatDone}
          onChange={e => set('whatDone', e.target.value)}
          placeholder={'• Attended coordination meeting with partners\n• Reviewed 12 beneficiary files\n• Updated data entry for Sector A'}
          style={{ minHeight: 100 }}
        />
      </div>

      {/* Next action */}
      <div className="form-group">
        <label className="form-label">Next Action / Plan for Tomorrow</label>
        <textarea
          className="form-textarea"
          value={form.nextAction}
          onChange={e => set('nextAction', e.target.value)}
          placeholder={'• Follow up with 5 households\n• Submit weekly summary to manager'}
          style={{ minHeight: 80 }}
        />
      </div>

      {/* Status */}
      <div className="form-group">
        <label className="form-label">Status</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {STATUSES.map(s => (
            <div
              key={s.value}
              onClick={() => set('status', s.value)}
              style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: 8,
                border: `2px solid ${form.status === s.value ? 'var(--primary)' : 'var(--border)'}`,
                background: form.status === s.value ? 'var(--primary-l)' : 'var(--card)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all .15s',
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: form.status === s.value ? 'var(--primary)' : 'var(--text)' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-m)' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Blockers */}
      <div className="form-group">
        <label className="form-label">Blockers / Challenges</label>
        <input
          className="form-input"
          value={form.blockers}
          onChange={e => set('blockers', e.target.value)}
          placeholder="Any obstacles? (or leave blank)"
        />
      </div>
    </Modal>
  );
}