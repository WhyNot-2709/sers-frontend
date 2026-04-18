import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { getProfessorCourses, getStudentsForProfessorCourse } from '../api/api';

export default function ProfessorDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    getProfessorCourses(user.userId).then(r => setCourses(r.data)).catch(console.error);
  }, [user.userId]);

  const selectCourse = async (course) => {
    setSelectedCourse(course);
    try {
      const res = await getStudentsForProfessorCourse(course.id);
      setStudents(res.data);
    } catch(e) { console.error(e); }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-page)' }}>
      <Sidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title="Professor Panel" breadcrumb={`Welcome, ${user.name}`}
          stats={[{ label: `${courses.length} Course${courses.length !== 1 ? 's' : ''}`, color: 'var(--c-elec)' }]}
        />

        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
            {/* Course list */}
            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>My Courses</h3>
              {courses.length === 0 ? (
                <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>No courses assigned.</p>
              ) : courses.map(course => (
                <div key={course.id} onClick={() => selectCourse(course)} style={{
                  padding: '0.9rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', marginBottom: 8,
                  background: selectedCourse?.id === course.id ? 'rgba(46,214,163,0.12)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selectedCourse?.id === course.id ? 'rgba(46,214,163,0.4)' : 'var(--border)'}`,
                  transition: 'all 0.15s'
                }}>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: 'var(--c-elec)' }}>{course.code}</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 500, marginTop: 3 }}>{course.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 3 }}>
                    {course.days?.replace(/,/g, ' · ')} · {course.startTime?.slice(0,5)}–{course.endTime?.slice(0,5)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 2 }}>📍 {course.classroom}</div>
                </div>
              ))}
            </div>

            {/* Students panel */}
            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              {selectedCourse ? (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: 'var(--c-elec)', marginBottom: 4 }}>{selectedCourse.code}</div>
                    <h2 style={{ fontFamily: 'Syne', fontSize: '1.2rem', fontWeight: 700 }}>{selectedCourse.name}</h2>
                    <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', marginTop: 4 }}>{students.length} student{students.length !== 1 ? 's' : ''} enrolled</p>
                  </div>

                  {students.length === 0 ? (
                    <p style={{ color: 'var(--text-3)' }}>No students enrolled yet.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          {['#', 'Roll Number', 'Name', 'Stream', 'Year', 'CGPA'].map(h => (
                            <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-3)', fontWeight: 500, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s, i) => (
                          <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '0.75rem 1rem', color: 'var(--text-3)', fontFamily: 'JetBrains Mono', fontSize: '0.72rem' }}>{i + 1}</td>
                            <td style={{ padding: '0.75rem 1rem', fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: 'var(--c-core)' }}>{s.rollNumber}</td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{s.name}</td>
                            <td style={{ padding: '0.75rem 1rem', color: 'var(--text-2)' }}>{s.stream}</td>
                            <td style={{ padding: '0.75rem 1rem', color: 'var(--text-2)' }}>{s.year}</td>
                            <td style={{ padding: '0.75rem 1rem', fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: s.cgpa >= 8 ? 'var(--c-elec)' : s.cgpa >= 6.5 ? 'var(--c-lab)' : '#ff6b6b' }}>{s.cgpa}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)', fontSize: '0.9rem' }}>
                  ← Select a course to view enrolled students
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}