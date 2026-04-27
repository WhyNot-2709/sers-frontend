import React from 'react';
import ThemeToggle from './ThemeToggle'; // <-- Added import here

export default function Topbar({ title, breadcrumb, stats }) {
  return (
    <header style={{
      background: 'var(--sidebar-bg)', borderBottom: '1px solid var(--border)',
      padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40,
      flexShrink: 0
    }}>
      <div>
        <h1 style={{ fontFamily: 'Syne', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</h1>
        {breadcrumb && <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'JetBrains Mono' }}>{breadcrumb}</span>}
      </div>
      <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
        
        <ThemeToggle /> {/* <-- Added ThemeToggle here */}

        {stats && stats.map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '0.45rem',
            padding: '0.35rem 0.9rem', borderRadius: 100, fontSize: '0.76rem',
            fontWeight: 500, border: '1px solid var(--border-med)',
            background: 'rgba(255,255,255,0.03)', color: 'var(--text-2)'
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', background: s.color,
              boxShadow: `0 0 6px ${s.color}`
            }}/>
            {s.label}
          </div>
        ))}
      </div>
    </header>
  );
}