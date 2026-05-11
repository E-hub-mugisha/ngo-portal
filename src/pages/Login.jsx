import { useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api/gasApi';

const BRAND = {
  green:     '#1a6e3c',
  greenDark: '#145730',
  greenLight:'#e8f5ee',
  blue:      '#1a4e8c',
  accent:    '#f0a500',
  text:      '#1a1a2e',
  textMed:   '#5a6474',
  textLight: '#9aa3af',
  white:     '#ffffff',
  bg:        '#f4f7f5',
  red:       '#d63031',
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 14px',
  borderRadius: 10,
  border: '1.5px solid #dde3e9',
  fontSize: 14,
  color: BRAND.text,
  background: BRAND.white,
  outline: 'none',
  transition: 'border .2s',
  margin: 0,
};

// ✅ Moved outside Login so it's not recreated on every render
const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 13, fontWeight: 600, color: BRAND.text }}>{label}</label>
    {children}
  </div>
);

export default function Login({ onLogin }) {
  const [mode,    setMode]    = useState('login');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [form,    setForm]    = useState({ name: '', email: '', password: '', role: 'Staff' });
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    return () => {
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, []);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function submit() {
    setError(''); setSuccess('');
    if (!form.email || !form.password) { setError('Email and password are required.'); return; }
    if (mode === 'register' && !form.name) { setError('Full name is required.'); return; }

    setLoading(true);
    try {
      const res = mode === 'login'
        ? await loginUser({ email: form.email, password: form.password })
        : await registerUser(form);

      if (!res.success) { setError(res.error || 'Something went wrong.'); setLoading(false); return; }

      if (mode === 'register') {
        setSuccess('✅ Account created! Please sign in.');
        setMode('login');
        setForm(f => ({ ...f, password: '' }));
        setLoading(false);
        return;
      }

      localStorage.setItem('ngo_user', JSON.stringify(res.user));
      localStorage.setItem('ngo_token', res.token);
      onLogin(res.user);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: BRAND.bg,
    }}>

      {/* Top accent bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${BRAND.green}, ${BRAND.blue}, ${BRAND.accent})` }} />

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 16px 48px',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Logo + heading */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <img
              src="https://happyfamilyrwanda.org/storage/organizations/t0S92JbT8x8XOkamu8xBMdVD9JYlStj1PUJeFyxT.png"
              alt="Happy Family Rwanda"
              style={{ height: 64, objectFit: 'contain', marginBottom: 16 }}
            />
            <h1 style={{ fontSize: 26, fontWeight: 900, color: BRAND.text, margin: '0 0 8px' }}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p style={{ color: BRAND.textMed, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
              {mode === 'login'
                ? 'Sign in to access the system'
                : 'Register to join the Happy Family team portal'}
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: BRAND.white,
            borderRadius: 20,
            padding: '32px 28px',
            boxShadow: '0 4px 24px rgba(26,110,60,0.08), 0 1px 4px rgba(0,0,0,0.06)',
            border: '1px solid #e8f0ea',
            boxSizing: 'border-box',
          }}>

            {/* Toggle */}
            <div style={{
              display: 'flex',
              background: BRAND.bg,
              borderRadius: 12,
              padding: 4,
              marginBottom: 24,
              gap: 4,
            }}>
              {[
                { id: 'login',    label: '🔑 Sign In'  },
                { id: 'register', label: '✏️ Register' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => { setMode(id); setError(''); setSuccess(''); }}
                  style={{
                    flex: 1,
                    padding: '9px 8px',
                    borderRadius: 9,
                    border: 'none',
                    background: mode === id
                      ? `linear-gradient(135deg, ${BRAND.green}, ${BRAND.blue})`
                      : 'transparent',
                    color: mode === id ? BRAND.white : BRAND.textMed,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all .2s',
                    boxShadow: mode === id ? '0 2px 8px rgba(26,110,60,0.25)' : 'none',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Success */}
            {success && (
              <div style={{
                background: '#e8f5ee', color: BRAND.green,
                padding: '10px 14px', borderRadius: 10,
                fontSize: 13, marginBottom: 16, fontWeight: 600,
                border: `1px solid ${BRAND.green}33`,
              }}>
                {success}
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                background: '#fff0f0', color: BRAND.red,
                padding: '10px 14px', borderRadius: 10,
                fontSize: 13, marginBottom: 16,
                border: '1px solid #ffd0d0',
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {mode === 'register' && (
                <Field label="Full Name *">
                  <input
                    placeholder="e.g. Jean Pierre Mugisha"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    style={inputStyle}
                  />
                </Field>
              )}

              <Field label="Email Address *">
                <input
                  type="email"
                  placeholder="you@happyfamilyrwanda.org"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  style={inputStyle}
                />
              </Field>

              <Field label="Password *">
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    style={{ ...inputStyle, paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(s => !s)}
                    style={{
                      position: 'absolute', right: 12, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: 16,
                      color: BRAND.textMed, padding: 0, lineHeight: 1,
                    }}
                  >
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
              </Field>

              {mode === 'register' && (
                <Field label="Role">
                  <select
                    value={form.role}
                    onChange={e => set('role', e.target.value)}
                    style={inputStyle}
                  >
                    <option>Staff</option>
                    <option>Manager</option>
                    <option>Admin</option>
                  </select>
                </Field>
              )}

              <button
                onClick={submit}
                disabled={loading}
                style={{
                  marginTop: 4,
                  padding: '13px 0',
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: 12,
                  border: 'none',
                  background: loading
                    ? '#aaa'
                    : `linear-gradient(135deg, ${BRAND.green}, ${BRAND.blue})`,
                  color: BRAND.white,
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(26,110,60,0.3)',
                  transition: 'all .2s',
                  letterSpacing: .3,
                }}
              >
                {loading
                  ? '⏳ Please wait…'
                  : mode === 'login' ? '🔑 Sign In' : '✅ Create Account'}
              </button>
            </div>

            {/* Switch mode */}
            <p style={{ textAlign: 'center', fontSize: 13, color: BRAND.textMed, margin: '20px 0 0' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <span
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
                style={{ color: BRAND.green, cursor: 'pointer', fontWeight: 700 }}
              >
                {mode === 'login' ? 'Register here →' : '← Sign in'}
              </span>
            </p>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 32,
            marginTop: 28,
            flexWrap: 'wrap',
          }}>
            {[
              { n: '500+', label: 'Families Impacted' },
              { n: '100+', label: 'Projects' },
              { n: '416+', label: 'Volunteers' },
            ].map(({ n, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: BRAND.green }}>{n}</div>
                <div style={{ fontSize: 11, color: BRAND.textMed }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: BRAND.white,
        borderTop: '1px solid #e8edf2',
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: 12,
        color: BRAND.textLight,
      }}>
        © {new Date().getFullYear()} Happy Family Rwanda Organization ·{' '}
        <a
          href="https://happyfamilyrwanda.org"
          target="_blank"
          rel="noreferrer"
          style={{ color: BRAND.green, textDecoration: 'none', fontWeight: 600 }}
        >
          happyfamilyrwanda.org
        </a>
      </div>
    </div>
  );
}