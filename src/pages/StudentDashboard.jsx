import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Timetable from '../components/Timetable';
import ElectiveCard from '../components/ElectiveCard';
import CourseModal from '../components/CourseModal';
import Toast from '../components/Toast';
import { getStudent, getTimetable, getAvailableElectives, handleSelection } from '../api/api';
import ConfirmModal from '../components/ConfirmModal';

export default function StudentDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('timetable');
  const [studentData, setStudentData] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [electives, setElectives] = useState([]);
  const [electiveTab, setElectiveTab] = useState('CORE');
  const [modalCourse, setModalCourse] = useState(null);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmingCourse, setConfirmingCourse] = useState(null);

  // 1. Create the refs here
  const timetableRef = useRef(null);
  const electivesRef = useRef(null);

  const showToast = (msg) => { setToast(msg); };

  const fetchAll = useCallback(async () => {
    try {
      const [sd, tt, el] = await Promise.all([
        getStudent(user.userId),
        getTimetable(user.userId),
        getAvailableElectives(user.userId)
      ]);
      setStudentData(sd.data);
      setTimetable(tt.data);
      setElectives(el.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [user.userId]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchAll]);

  // 2. Add the smooth scrolling effect
  useEffect(() => {
    if (activeTab === 'timetable' && timetableRef.current) {
      timetableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (activeTab === 'electives' && electivesRef.current) {
      electivesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);

  const fixedCourses = timetable.filter(c => c.status === 'FIXED');
  const confirmedCourses = timetable.filter(c => c.status === 'CONFIRMED');
  const previewCourses = timetable.filter(c => c.status === 'PREVIEW');

  const allTimetableCourses = [...fixedCourses, ...confirmedCourses];

  const confirmedIds = new Set(confirmedCourses.map(c => c.id));
  const previewIds = new Set(previewCourses.map(c => c.id));

  const confirmedCore = confirmedCourses.filter(c => c.type === 'CORE').length;
  const confirmedHum = confirmedCourses.filter(c => c.type === 'HUMANITIES').length;

  const doSelection = async (course, action) => {
    // Optimistically update UI immediately
    if (action === 'PREVIEW') {
      setTimetable(prev => [...prev, { ...course, status: 'PREVIEW' }]);
      setElectives(prev => prev.filter(e => e.id !== course.id));
    } else if (action === 'REMOVE') {
      setTimetable(prev => prev.filter(c => c.id !== course.id));
      setElectives(prev => [...prev, { ...course, status: null }]);
    }

    try {
      const res = await handleSelection(user.userId, course.id, action);
      if (res.data.success) {
        showToast(action === 'PREVIEW' ? `👁 Previewing ${course.name}` :
                  action === 'CONFIRM' ? `✓ ${course.name} confirmed!` :
                  `✕ ${course.name} removed`);
        await fetchAll(); // Sync with server after
      } else {
        showToast(`⚠ ${res.data.message}`);
        await fetchAll(); // Revert if server rejected
      }
    } catch (e) {
      showToast('Error connecting to server');
      await fetchAll(); // Revert on error
    }
  };

  const filteredElectives = electives.filter(e => e.type === electiveTab);
  const allDisplayElectives = [
    ...timetable.filter(c => c.status === 'PREVIEW' && c.type === electiveTab),
    ...timetable.filter(c => c.status === 'CONFIRMED' && c.type === electiveTab),
    ...filteredElectives.filter(e => !previewIds.has(e.id) && !confirmedIds.has(e.id))
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-page)', color: 'var(--text-2)' }}>
      Loading...
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-page)' }}>
      <Sidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar
          title={activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'timetable' ? 'My Timetable' : activeTab === 'electives' ? 'Electives' : 'Profile'}
          breadcrumb={`Semester ${studentData?.semester} · ${studentData?.stream} · Batch ${studentData?.rollNumber?.slice(2,4)}`}
          stats={[
            { label: `${confirmedCore + confirmedHum} Confirmed`, color: 'var(--c-elec)' },
            { label: `${studentData?.maxCoreElectives || 0} Core + 1 Hum limit`, color: 'var(--c-lab)' }
          ]}
        />

        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* TIMETABLE PANEL */}
          {/* 3. Attached the timetable ref here */}
          <section ref={timetableRef} style={{
            background: 'var(--bg-panel)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '1.75rem 2rem'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--c-core)', marginBottom: 4 }}>Weekly Schedule</div>
              <h2 style={{ fontFamily: 'Syne', fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Class Timetable</h2>
            </div>
            
            {/* Legend */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Fixed', color: 'var(--c-fixed)' },
                { label: 'Elective', color: 'var(--c-elec)' },
                { label: 'Preview', color: 'rgba(46,214,163,0.5)' },
                { label: 'Clash', color: '#ff6b6b' },
                { label: 'Lunch', color: 'var(--c-lunch)' }
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: 'var(--text-2)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }}/>
                  {l.label}
                </div>
              ))}
            </div>

            {/* CONFIRMED SUMMARY */}
            {confirmedCourses.length > 0 && (
              <div style={{
                background: 'var(--bg-panel2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--c-elec)', marginBottom: '0.75rem' }}>
                  Confirmed Electives
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {confirmedCourses.map(c => (
                    <div key={c.id} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      background: 'var(--bg-panel)', border: '1px solid var(--border-med)',
                      borderRadius: 8, padding: '0.4rem 0.75rem'
                    }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: c.type === 'HUMANITIES' ? 'var(--c-hum)' : 'var(--c-core)' }}>{c.code}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-1)' }}>{c.name}</span>
                      <button
                        onClick={() => doSelection(c, 'REMOVE')}
                        style={{
                          background: 'none', border: 'none', color: '#ff6b6b',
                          cursor: 'pointer', fontSize: '0.75rem', padding: '0 2px'
                        }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Timetable courses={allTimetableCourses} previews={previewCourses} />
          </section>

          {/* ELECTIVES PANEL */}
          {/* 4. Attached the electives ref here */}
          <section ref={electivesRef} style={{
            background: 'var(--bg-panel)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '1.75rem 2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--c-elec)', marginBottom: 4 }}>Course Selection</div>
                <h2 style={{ fontFamily: 'Syne', fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Choose Your Electives</h2>
              </div>
              <div style={{ background: 'rgba(46,214,163,0.1)', border: '1px solid rgba(46,214,163,0.25)', color: 'var(--c-elec)', padding: '0.38rem 0.9rem', borderRadius: 100, fontSize: '0.75rem', fontWeight: 500 }}>
                {studentData?.maxCoreElectives} Core + 1 Humanities
              </div>
            </div>

            {/* Tab bar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: '1.75rem', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 5, width: 'fit-content' }}>
              {['CORE', 'HUMANITIES'].map(t => (
                <button key={t} onClick={() => setElectiveTab(t)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.55rem',
                  padding: '0.55rem 1.2rem', borderRadius: 10, border: 'none',
                  background: electiveTab === t ? 'var(--bg-panel2)' : 'transparent',
                  color: electiveTab === t ? 'var(--text-1)' : 'var(--text-2)',
                  fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
                  boxShadow: electiveTab === t ? '0 2px 12px rgba(0,0,0,0.3)' : 'none',
                  transition: 'all 0.2s'
                }}>
                  {t === 'CORE' ? '⏱' : '👥'} {t.charAt(0) + t.slice(1).toLowerCase()} Electives
                  <span style={{
                    background: electiveTab === t ? 'var(--c-core)' : 'rgba(255,255,255,0.1)',
                    color: electiveTab === t ? '#fff' : 'var(--text-2)',
                    fontFamily: 'JetBrains Mono', fontSize: '0.65rem',
                    padding: '0.1rem 0.45rem', borderRadius: 100, minWidth: 22, textAlign: 'center'
                  }}>
                    {electives.filter(e => e.type === t).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Cards grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.1rem' }}>
              {allDisplayElectives.map(course => (
                <ElectiveCard
                  key={course.id}
                  course={course}
                  isPreview={previewIds.has(course.id)}
                  isConfirmed={confirmedIds.has(course.id)}
                  onInfo={setModalCourse}
                  onPreview={(c) => doSelection(c, 'PREVIEW')}
                  onConfirm={(c) => setConfirmingCourse(c)}
                  onRemove={(c) => doSelection(c, 'REMOVE')}
                />
              ))}
              {allDisplayElectives.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
                  No available {electiveTab.toLowerCase()} electives — all slots filled or no more seats.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <CourseModal course={modalCourse} onClose={() => setModalCourse(null)} />
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      <ConfirmModal
        course={confirmingCourse}
        studentData={studentData}
        confirmedCourses={confirmedCourses}
        onConfirm={() => { doSelection(confirmingCourse, 'CONFIRM'); setConfirmingCourse(null); }}
        onCancel={() => setConfirmingCourse(null)}
        />
    </div>
  );
}