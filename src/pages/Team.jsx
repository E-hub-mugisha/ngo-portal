import { useEffect, useState } from 'react';
import { getTeamMembers, removeTeamMember } from '../api/gasApi';

const ROLE_COLORS = {
  'Project Manager': '#1a6e3c', 'M&E Officer': '#1a4e8c',
  'Finance Officer': '#c17f00', 'Field Officer': '#6e1a6e', 'Volunteer': '#888',
};

export default function Team({ onOpenModal, toast }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await getTeamMembers();
      setMembers(res.data || []);
    } catch (e) { toast('Error loading team: ' + e.message, 'error'); }
    setLoading(false);
  }

  async function handleRemove(id, name) {
    if (!window.confirm(`Remove ${name} from the team?`)) return;
    try {
      await removeTeamMember(id);
      toast(name + ' removed', 'success');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div className="page-header">
        <div><h1>👥 Team Members</h1><p>Manage staff and volunteers.</p></div>
        <button className="btn btn-purple" onClick={() => onOpenModal('team')}>➕ Add Member</button>
      </div>

      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:16 }}>
          {[1,2,3].map(i => <div key={i} className="card" style={{ padding:24 }}><div className="skeleton" /><div className="skeleton" /></div>)}
        </div>
      ) : !members.length ? (
        <div className="empty-state"><span className="empty-icon">👥</span><h3>No team members yet</h3></div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:16 }}>
          {members.map(m => {
            const color = ROLE_COLORS[m.role] || 'var(--primary)';
            return (
              <div key={m.id} className="card" style={{ padding: 20 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:`${color}22`, color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, fontFamily:'Outfit' }}>
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{m.name}</div>
                    <div style={{ fontSize:11, color:'var(--text-m)' }}>{m.role || 'No role'}{m.department ? ` · ${m.department}` : ''}</div>
                  </div>
                </div>
                <div style={{ fontSize:12, color:'var(--text-m)', display:'flex', flexDirection:'column', gap:3 }}>
                  <span>📧 {m.email}</span>
                  {m.phone && <span>📱 {m.phone}</span>}
                </div>
                <div style={{ marginTop:12, textAlign:'right' }}>
                  <button className="btn btn-danger btn-sm" onClick={() => handleRemove(m.id, m.name)}>✕ Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
