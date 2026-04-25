import React, { useState } from 'react';
import { login } from '../api/api';

export default function Login({ onLogin }) {
  const [role, setRole] = useState('STUDENT');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  try {
    const processedUsername = role === 'STUDENT' 
      ? username.trim().toUpperCase() 
      : username.trim();
    const res = await login(processedUsername, password, role);
    if (res.data.success) {
      onLogin(res.data);
    } else {
      setError(res.data.message);
    }
  } catch (err) {
    setError('Connection error. Is the backend running?');
  }
  setLoading(false);
};

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-page)'
    }}>
      <div style={{
        background: 'var(--bg-panel)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '2.5rem', width: '400px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, var(--c-core), var(--c-elec))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', fontFamily: 'Syne', fontWeight: 800, color: '#fff'
          }}>S</div>
          <h1 style={{ fontFamily: 'Syne', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>SERS</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', marginTop: 4 }}>Student Elective Registration System</p>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: 5, borderRadius: 10 }}>
          {['STUDENT', 'ADMIN', 'PROFESSOR'].map(r => (
            <button key={r} onClick={() => setRole(r)} style={{
              flex: 1, padding: '0.5rem', borderRadius: 8, border: 'none',
              background: role === r ? 'var(--bg-panel2)' : 'transparent',
              color: role === r ? 'var(--text-1)' : 'var(--text-3)',
              fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em',
              transition: 'all 0.2s', textTransform: 'capitalize',
              boxShadow: role === r ? '0 2px 8px rgba(0,0,0,0.3)' : 'none'
            }}>{r.charAt(0) + r.slice(1).toLowerCase()}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-2)', marginBottom: 6, fontWeight: 500 }}>
              {role === 'STUDENT' ? 'Roll Number' : 'Email'}
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder={role === 'STUDENT' ? 'SE23UARI048' : role === 'ADMIN' ? 'admin@sers.com' : 'prof@sers.com'}
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-page)', border: '1px solid var(--border-med)',
                color: 'var(--text-1)', fontSize: '0.88rem', outline: 'none',
                fontFamily: role === 'STUDENT' ? 'JetBrains Mono' : 'Outfit'
              }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-2)', marginBottom: 6, fontWeight: 500 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-page)', border: '1px solid var(--border-med)',
                color: 'var(--text-1)', fontSize: '0.88rem', outline: 'none', fontFamily: 'Outfit'
              }}
            />
          </div>
          {error && <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, var(--c-core), #5a52e0)',
            border: 'none', color: '#fff', fontSize: '0.9rem', fontWeight: 600,
            letterSpacing: '0.02em', transition: 'opacity 0.2s',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}