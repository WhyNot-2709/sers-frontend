import React from 'react';

export default function ElectiveCard({ course, onPreview, onConfirm, onRemove, onInfo, isPreview, isConfirmed }) {
  const isHum = course.type === 'HUMANITIES';
  const accentColor = isHum ? 'var(--c-hum)' : 'var(--c-core)';
  const seatsLow = course.currentSeats >= course.maxSeats * 0.8;

  return (
    <div style={{
      background: 'var(--bg-panel2)', border: `2px solid ${isConfirmed ? accentColor : isPreview ? 'var(--c-elec)' : 'var(--border-med)'}`,
      borderRadius: 'var(--radius-md)', padding: '1.3rem', display: 'flex',
      flexDirection: 'column', gap: '0.75rem', position: 'relative', overflow: 'hidden',
      transition: 'all 0.22s ease',
      boxShadow: isConfirmed ? `0 6px 24px ${accentColor}33` : isPreview ? '0 6px 24px rgba(46,214,163,0.2)' : 'none'
    }}>
      {/* Glow */}
      {(isConfirmed || isPreview) && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit',
          background: `radial-gradient(ellipse at top left, ${isConfirmed ? accentColor : 'var(--c-elec)'}15, transparent 65%)`
        }}/>
      )}

      {/* Head */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontFamily: 'JetBrains Mono', fontSize: '0.7rem', letterSpacing: '0.08em',
          padding: '0.2rem 0.65rem', borderRadius: 6,
          background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}44`
        }}>{course.code}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {/* Info button */}
          <button onClick={() => onInfo(course)} style={{
            width: 26, height: 26, borderRadius: 8, border: '1px solid var(--border-med)',
            background: 'rgba(255,255,255,0.04)', color: 'var(--text-2)',
            fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>ℹ</button>
          {/* Check */}
          <div style={{
            width: 24, height: 24, borderRadius: 7, border: `2px solid ${isConfirmed ? accentColor : isPreview ? 'var(--c-elec)' : 'var(--border-med)'}`,
            background: isConfirmed ? accentColor : isPreview ? 'var(--c-elec)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isConfirmed || isPreview ? (isHum ? '#3a2000' : '#fff') : 'transparent',
            fontSize: '0.7rem', transition: 'all 0.2s',
            boxShadow: isConfirmed ? `0 0 12px ${accentColor}66` : isPreview ? '0 0 12px rgba(46,214,163,0.4)' : 'none'
          }}>✓</div>
        </div>
      </div>

      {/* Title */}
      <h3 style={{ fontFamily: 'Syne', fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{course.name}</h3>

      {/* Tags */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '0.68rem', fontWeight: 600, padding: '0.2rem 0.7rem', borderRadius: 100,
          background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}33`
        }}>{course.credits} Credits</span>
        <span style={{
          fontSize: '0.63rem', fontFamily: 'JetBrains Mono', padding: '0.2rem 0.7rem', borderRadius: 100,
          background: 'rgba(255,255,255,0.05)', color: 'var(--text-2)', border: '1px solid var(--border-med)'
        }}>{course.days?.replace(/,/g, ' · ')}</span>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: `${accentColor}25`, color: accentColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.63rem', fontWeight: 700
          }}>
            {course.facultyName?.split(' ').map(w => w[0]).join('').slice(0,2) || 'TA'}
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-2)', fontWeight: 500 }}>{course.facultyName || 'TBA'}</span>
        </div>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: seatsLow ? '#ff6b6b' : 'var(--text-3)' }}>
          👥 {course.maxSeats - course.currentSeats} left
        </span>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        {!isPreview && !isConfirmed && (
          <button onClick={() => onPreview(course)} style={{
            flex: 1, padding: '0.55rem', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-med)', background: 'rgba(255,255,255,0.04)',
            color: 'var(--text-2)', fontSize: '0.78rem', fontWeight: 500, transition: 'all 0.2s'
          }}>👁 Preview</button>
        )}
        {isPreview && !isConfirmed && (
          <>
            <button onClick={() => onConfirm(course)} style={{
              flex: 1, padding: '0.55rem', borderRadius: 'var(--radius-sm)',
              border: 'none', background: accentColor, color: isHum ? '#3a2000' : '#fff',
              fontSize: '0.78rem', fontWeight: 600
            }}>✓ Confirm</button>
            <button onClick={() => onRemove(course)} style={{
              padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-med)', background: 'rgba(255,107,107,0.1)',
              color: '#ff6b6b', fontSize: '0.78rem'
            }}>✕</button>
          </>
        )}
        {isConfirmed && (
          <button onClick={() => onRemove(course)} style={{
            flex: 1, padding: '0.55rem', borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.1)',
            color: '#ff6b6b', fontSize: '0.78rem', fontWeight: 500
          }}>Remove</button>
        )}
      </div>
    </div>
  );
}