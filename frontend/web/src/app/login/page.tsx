'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser, setCurrentUser, type UserRole } from '@/lib/localAuth';

type Mode = 'login' | 'register';

const S = {
  page: { minHeight: '100vh', backgroundColor: '#F3F4F6', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: 24 },
  card: { backgroundColor: '#fff', border: '2px solid #000', boxShadow: '6px 6px 0 #000', width: '100%', maxWidth: 420, padding: 32 },
  logo: { fontWeight: 900, fontSize: 24, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 4 },
  sub: { fontSize: 12, color: '#6B7280', marginBottom: 28, letterSpacing: '0.04em' },
  tabRow: { display: 'flex', borderBottom: '2px solid #000', marginBottom: 24 },
  tab: (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, textAlign: 'center' as const, cursor: 'pointer', border: 'none', outline: 'none',
    backgroundColor: active ? '#000' : '#fff',
    color: active ? '#fff' : '#000',
    borderBottom: active ? '2px solid #000' : '2px solid transparent',
  }),
  roleRow: { display: 'flex', gap: 10, marginBottom: 18 },
  roleBtn: (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, cursor: 'pointer', border: '2px solid #000', outline: 'none',
    backgroundColor: active ? '#000' : '#fff',
    color: active ? '#fff' : '#000',
  }),
  label: { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 5 },
  input: { width: '100%', border: '2px solid #000', borderRadius: 0, padding: '10px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, marginBottom: 14, fontFamily: 'monospace' },
  btn: { width: '100%', backgroundColor: '#000', color: '#fff', border: '2px solid #000', borderRadius: 0, padding: '12px 0', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer', marginTop: 6 },
  err: { backgroundColor: '#FEF2F2', border: '1.5px solid #EF4444', color: '#B91C1C', fontSize: 12, padding: '8px 12px', marginBottom: 14, fontWeight: 600 },
  ok: { backgroundColor: '#F0FDF4', border: '1.5px solid #22C55E', color: '#166534', fontSize: 12, padding: '8px 12px', marginBottom: 14, fontWeight: 600 },
  switch: { textAlign: 'center' as const, marginTop: 20, fontSize: 12, color: '#6B7280' },
  switchLink: { fontWeight: 700, color: '#000', cursor: 'pointer', textDecoration: 'underline' },
  demoBox: { marginTop: 24, borderTop: '1px solid #E5E7EB', paddingTop: 16 },
  demoTitle: { fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#9CA3AF', textTransform: 'uppercase' as const, marginBottom: 8 },
  demoItem: { fontSize: 11, color: '#6B7280', marginBottom: 3 },
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<UserRole>('DOCTOR');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');
    const result = loginUser(email.trim(), password);
    if (!result.ok) { setError(result.message); return; }
    setCurrentUser(result.user);
    if (result.user.role === 'DOCTOR') router.push('/dashboard');
    else router.push('/patient-portal');
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    const result = registerUser(email.trim(), password, role, name.trim());
    if (!result.ok) { setError(result.message); return; }
    setSuccess('Account created! You can now log in.');
    setMode('login');
    setPassword('');
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Logo */}
        <div style={S.logo}>PREVENTIA</div>
        <div style={S.sub}>INTEGRATED HEALTH PLATFORM</div>

        {/* Login / Register tabs */}
        <div style={S.tabRow}>
          <button style={S.tab(mode === 'login')} onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>Log In</button>
          <button style={S.tab(mode === 'register')} onClick={() => { setMode('register'); setError(''); setSuccess(''); }}>Register</button>
        </div>

        {/* Role selector */}
        <div style={S.roleRow}>
          <button style={S.roleBtn(role === 'DOCTOR')} onClick={() => setRole('DOCTOR')}>Doctor / Sahayak</button>
          <button style={S.roleBtn(role === 'PATIENT')} onClick={() => setRole('PATIENT')}>Patient / Sponsor</button>
        </div>

        {error && <div style={S.err}>{error}</div>}
        {success && <div style={S.ok}>{success}</div>}

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          {mode === 'register' && (
            <div>
              <label style={S.label}>Full Name</label>
              <input
                style={S.input}
                placeholder="Dr. Sarah Vane"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}
          <label style={S.label}>Email Address</label>
          <input
            style={S.input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <label style={S.label}>Password</label>
          <input
            style={S.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button style={S.btn} type="submit">
            {mode === 'login' ? 'Log In →' : 'Create Account →'}
          </button>
        </form>

        <div style={S.switch}>
          {mode === 'login' ? (
            <>Don&apos;t have an account?{' '}<span style={S.switchLink} onClick={() => { setMode('register'); setError(''); }}>Register Now</span></>
          ) : (
            <>Already have an account?{' '}<span style={S.switchLink} onClick={() => { setMode('login'); setError(''); }}>Log In</span></>
          )}
        </div>

        {/* Security note */}
        <div style={S.demoBox}>
          <div style={S.demoTitle}>Security</div>
          <div style={S.demoItem}>No default credentials are stored in source code.</div>
          <div style={S.demoItem}>Create an account via Register to access dashboards.</div>
        </div>
      </div>
    </div>
  );
}
