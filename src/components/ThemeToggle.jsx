import React, { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('sers_theme') !== 'light';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('sers_theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('sers_theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(p => !p)}
      title="Toggle theme"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid var(--border-med)',
        borderRadius: 20, padding: '0.35rem 0.75rem',
        color: 'var(--text-2)', cursor: 'pointer',
        fontSize: '0.85rem', display: 'flex',
        alignItems: 'center', gap: '0.4rem'
      }}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}