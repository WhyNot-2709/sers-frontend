import React from 'react';

export default function ConfirmModal({ course, studentData, confirmedCourses, onConfirm, onCancel }) {
  if (!course) return null;

  const isHum = course.type === 'HUMANITIES';
  const usedSlots = confirmedCourses.filter(c => c.type === course.type).length;
  const totalSlots = isHum ? studentData?.maxHumElectives : studentData?.maxCoreElectives;
  const remaining = totalSlots - usedSlots;
  const accentColor = isHum ? 'var(--c-hum)' : 'var(--c-core)';

  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 600, backdropFilter: 'blur(4px)'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-panel)', border: '1px solid var(--border-med)',
        borderRadius: 'var(--radius-lg)', padding: '2rem', width: '420px',
        maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
          <h2 style={{ fontFamily: 'Syne', fontSize: '1.1rem', fontWeight: 700 }}>Confirm Elective</h2>
        </div>

        <div style={{ background: 'var(--bg-panel2)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem', border: `1px solid ${accentColor}44` }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: accentColor, marginBottom: 4 }}>{course.code}</div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{course.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-2)', marginTop: 4 }}>{course.days?.replace(/,/g, ' · ')} · {course.startTime?.slice(0,5)}–{course.endTime?.slice(0,5)}</div>
        </div>

        <div style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: 'var(--text-2)' }}>
          ⚠ This will use <strong style={{ color: 'var(--text-1)' }}>1 of your {remaining} remaining</strong> {course.type.toLowerCase()} elective slot{remaining !== 1 ? 's' : ''}.
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)',
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
            color: 'var(--text-2)', fontSize: '0.88rem', cursor: 'pointer'
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)',
            background: accentColor, border: 'none',
            color: isHum ? '#3a2000' : '#fff', fontSize: '0.88rem',
            fontWeight: 600, cursor: 'pointer'
          }}>Yes, Confirm</button>
        </div>
      </div>
    </div>
  );
}