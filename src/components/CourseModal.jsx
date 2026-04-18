import React from 'react';

export default function CourseModal({ course, onClose }) {
  if (!course) return null;

  const typeColor = course.type === 'CORE' ? 'var(--c-core)' :
                    course.type === 'HUMANITIES' ? 'var(--c-hum)' : 'var(--c-lab)';

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 500, backdropFilter: 'blur(4px)'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-panel)', border: '1px solid var(--border-med)',
        borderRadius: 'var(--radius-lg)', padding: '2rem', width: '480px',
        maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <span style={{
              fontFamily: 'JetBrains Mono', fontSize: '0.7rem', letterSpacing: '0.08em',
              padding: '0.2rem 0.65rem', borderRadius: 6,
              background: `${typeColor}22`, color: typeColor,
              border: `1px solid ${typeColor}44`
            }}>{course.code}</span>
            <h2 style={{ fontFamily: 'Syne', fontSize: '1.2rem', fontWeight: 700, marginTop: '0.5rem', letterSpacing: '-0.01em' }}>{course.name}</h2>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
            color: 'var(--text-2)', borderRadius: 8, padding: '0.35rem 0.7rem',
            fontSize: '0.85rem', cursor: 'pointer'
          }}>✕</button>
        </div>

        <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {course.description || 'No description available.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[
            { label: 'Faculty', value: course.facultyName || 'TBA' },
            { label: 'Classroom', value: course.classroom || 'TBA' },
            { label: 'Days', value: course.days?.replace(/,/g, ' · ') },
            { label: 'Time', value: `${course.startTime} – ${course.endTime}` },
            { label: 'Credits', value: `${course.credits} Credits` },
            { label: 'Seats', value: `${course.currentSeats} / ${course.maxSeats} filled` },
          ].map(item => (
            <div key={item.label} style={{
              background: 'var(--bg-panel2)', borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem', border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-1)', fontFamily: item.label === 'Days' || item.label === 'Time' ? 'JetBrains Mono' : 'Outfit' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}