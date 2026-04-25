import React from 'react';

export default function Sidebar({ user, activeTab, setActiveTab, onLogout }) {
  const studentTabs = [
  { id: 'timetable', label: 'My Timetable', icon: '📅' },
  { id: 'electives', label: 'Electives', icon: '📚' },
  ];

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'courses', label: 'Courses', icon: '📚' },
    { id: 'students', label: 'Students', icon: '👥' },
    { id: 'allocations', label: 'Allocations', icon: '🎯' },
  ];

  const profTabs = [
    { id: 'courses', label: 'My Courses', icon: '📚' },
  ];

  const tabs = user.role === 'STUDENT' ? studentTabs :
               user.role === 'ADMIN' ? adminTabs : profTabs;

  return (
    <aside style={{
      width: 230, minWidth: 230, background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--border)', display: 'flex',
      flexDirection: 'column', height: '100vh', position: 'sticky', top: 0
    }}>
      {/* Logo */}
      <div style={{
        padding: '1.4rem 1.5rem', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '0.75rem'
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: 'linear-gradient(135deg, var(--c-core), var(--c-elec))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'Syne'
        }}>S</div>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>SERS</span>
      </div>

      {/* Role Badge */}
      <div style={{ padding: '0.8rem 1.2rem' }}>
        <span style={{
          background: user.role === 'ADMIN' ? 'rgba(245,166,35,0.15)' :
                      user.role === 'PROFESSOR' ? 'rgba(46,214,163,0.15)' : 'rgba(108,99,255,0.15)',
          color: user.role === 'ADMIN' ? 'var(--c-lab)' :
                 user.role === 'PROFESSOR' ? 'var(--c-elec)' : 'var(--c-core)',
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
          padding: '0.25rem 0.7rem', borderRadius: 100,
          border: `1px solid ${user.role === 'ADMIN' ? 'rgba(245,166,35,0.3)' :
                                user.role === 'PROFESSOR' ? 'rgba(46,214,163,0.3)' : 'rgba(108,99,255,0.3)'}`
        }}>{user.role}</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.5rem 0.8rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-sm)',
            border: 'none', background: activeTab === tab.id ?
              'linear-gradient(90deg, rgba(108,99,255,0.25), rgba(108,99,255,0.06))' : 'transparent',
            color: activeTab === tab.id ? '#fff' : 'var(--text-2)',
            fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer',
            borderLeft: activeTab === tab.id ? '2.5px solid var(--c-core)' : '2.5px solid transparent',
            paddingLeft: activeTab === tab.id ? 'calc(0.9rem - 2.5px)' : '0.9rem',
            transition: 'all 0.18s', textAlign: 'left'
          }}>
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* User */}
      <div style={{
        padding: '1.2rem', borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '0.8rem'
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--c-core), var(--c-elec))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0
        }}>
          {user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: 'JetBrains Mono' }}>
            {user.role === 'STUDENT' ? `ID: ${user.userId}` : user.role}
          </div>
        </div>
        <button onClick={onLogout} title="Logout" style={{
          background: 'none', border: 'none', color: 'var(--text-3)',
          fontSize: '1rem', cursor: 'pointer', padding: 4,
          borderRadius: 6, transition: 'color 0.2s'
        }}>⏏</button>
      </div>
    </aside>
  );
}