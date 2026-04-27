import React, { useRef } from 'react';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const PERIODS = [
  { label: '8:30–9:25',   start: '08:30', end: '09:25' },
  { label: '9:30–10:25',  start: '09:30', end: '10:25' },
  { label: '10:30–11:25', start: '10:30', end: '11:25' },
  { label: '11:30–12:25', start: '11:30', end: '12:25' },
  { label: 'LUNCH',       start: '12:30', end: '13:30', isLunch: true },
  { label: '1:30–2:25',   start: '13:30', end: '14:25' },
  { label: '2:30–3:25',   start: '14:30', end: '15:25' },
  { label: '3:30–4:25',   start: '15:30', end: '16:25' },
  { label: '4:30–5:25',   start: '16:30', end: '17:25' },
  { label: '5:30–6:25',   start: '17:30', end: '18:25' },
];

function timeToMins(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function overlaps(s1, e1, s2, e2) {
  return timeToMins(s1) < timeToMins(e2) && timeToMins(s2) < timeToMins(e1);
}

export default function Timetable({ courses, previews }) {
  const tableRef = useRef(null);

  const exportImage = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(tableRef.current, {
      backgroundColor: '#0f1117',
      scale: 2
    });
    const link = document.createElement('a');
    link.download = 'my-timetable.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Build a map: day -> list of courses occupying that day with time info
  const getCellContent = (day, period) => {
    if (period.isLunch) return { type: 'lunch' };

    const allCourses = [...(courses || [])];
    const allPreviews = [...(previews || [])];

    // Find fixed/confirmed courses in this cell
    const fixed = allCourses.filter(c =>
      c.days?.split(',').includes(day) &&
      overlaps(period.start, period.end, c.startTime?.slice(0,5), c.endTime?.slice(0,5))
    );

    // Find previews in this cell
    const previewsInCell = allPreviews.filter(c =>
      c.days?.split(',').includes(day) &&
      overlaps(period.start, period.end, c.startTime?.slice(0,5), c.endTime?.slice(0,5))
    );

    // Check if any preview clashes with fixed or other previews
    const clashingPreviews = previewsInCell.filter(p => {
      const clashesFixed = fixed.some(f =>
        overlaps(p.startTime?.slice(0,5), p.endTime?.slice(0,5),
                 f.startTime?.slice(0,5), f.endTime?.slice(0,5))
      );
      const clashesOther = allPreviews.filter(op => op.id !== p.id).some(op =>
        op.days?.split(',').includes(day) &&
        overlaps(p.startTime?.slice(0,5), p.endTime?.slice(0,5),
                 op.startTime?.slice(0,5), op.endTime?.slice(0,5))
      );
      return clashesFixed || clashesOther;
    });

    return { fixed, previews: previewsInCell, clashing: clashingPreviews };
  };

  const typeColor = (course) => {
    if (!course) return 'var(--c-fixed)';
    if (course.status === 'FIXED') return 'var(--c-fixed)';
    if (course.type === 'HUMANITIES') return 'var(--c-hum)';
    return 'var(--c-elec)';
  };

  return (
    <div>
      {/* Export Button Section */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
        <button onClick={exportImage} style={{
          padding: '0.45rem 1rem', borderRadius: 8,
          background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)',
          color: 'var(--c-core)', fontSize: '0.78rem', cursor: 'pointer',
          fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem'
        }}>
          📥 Export Timetable
        </button>
      </div>

      {/* Table Section Wrapped with tableRef */}
      <div ref={tableRef} style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-med)' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 900 }}>
          <thead>
            <tr style={{ background: '#0f1117' }}>
              <th style={{ width: 60, padding: '0.9rem', borderRight: '1px solid var(--border)', color: 'var(--text-3)', fontFamily: 'JetBrains Mono', fontSize: '0.65rem' }}></th>
              {PERIODS.map(p => (
                <th key={p.label} style={{
                  padding: '0.75rem 0.5rem', textAlign: 'center',
                  fontFamily: 'JetBrains Mono', fontSize: '0.62rem', fontWeight: 400,
                  color: p.isLunch ? 'var(--c-lunch)' : 'var(--text-3)',
                  borderRight: '1px solid var(--border)',
                  background: p.isLunch ? 'rgba(255,107,107,0.04)' : 'transparent',
                  whiteSpace: 'nowrap'
                }}>{p.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map(day => (
              <tr key={day} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{
                  padding: '0 0.9rem', borderRight: '1px solid var(--border-med)',
                  background: 'rgba(255,255,255,0.015)', textAlign: 'center'
                }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', fontWeight: 500, color: 'var(--text-2)', letterSpacing: '0.06em' }}>{day}</span>
                </td>
                {PERIODS.map(period => {
                  const cell = getCellContent(day, period);

                  if (cell.type === 'lunch') return (
                    <td key={period.label} style={{
                      padding: 5, background: 'rgba(255,107,107,0.05)',
                      borderRight: '1px solid rgba(255,107,107,0.15)', height: 72, textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.6rem', color: 'rgba(255,107,107,0.6)', fontFamily: 'JetBrains Mono', letterSpacing: '0.06em' }}>🍽<br/>Lunch</div>
                    </td>
                  );

                  const hasCourse = cell.fixed?.length > 0 || cell.previews?.length > 0;
                  const course = cell.fixed?.[0] || cell.previews?.[0];
                  const isPreview = !cell.fixed?.length && cell.previews?.length > 0;
                  const isClashing = cell.clashing?.length > 0;
                  const color = isClashing ? '#ff6b6b' : isPreview ? 'var(--c-elec)' : typeColor(course);

                  return (
                    <td key={period.label} style={{
                      padding: 5, borderRight: '1px solid var(--border)', height: 72, verticalAlign: 'middle'
                    }}>
                      {hasCourse && course && (
                        <div style={{
                          height: '100%', borderRadius: 7,
                          background: isClashing ? 'rgba(255,107,107,0.2)' :
                                      isPreview ? 'rgba(46,214,163,0.15)' : `${color}22`,
                          border: `1px solid ${color}55`,
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          justifyContent: 'center', padding: '4px 6px', gap: 2,
                          opacity: isPreview ? 0.75 : 1,
                          transition: 'all 0.2s'
                        }}>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color, letterSpacing: '0.05em' }}>
                            {course.code}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: isPreview ? 'var(--c-elec)' : 'var(--text-2)', textAlign: 'center', lineHeight: 1.2 }}>
                            {course.name}
                          </span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}