import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import CourseModal from '../components/CourseModal';
import Toast from '../components/Toast';
import { getAdminDashboard, getAllCourses, updateCourse, deleteCourse, createCourse, getStudentsForCourse, overrideAllocation, getAllStudents, removeStudentFromCourse } from '../api/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [toast, setToast] = useState('');
  const [modalCourse, setModalCourse] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ code:'', name:'', type:'CORE', credits:3, days:'', startTime:'', endTime:'', classroom:'', maxSeats:20, description:'' });

  const showToast = (msg) => setToast(msg);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAll = async () => {
    try {
      const [d, c, s] = await Promise.all([getAdminDashboard(), getAllCourses(), getAllStudents()]);
      setStats(d.data);
      setCourses(c.data);
      setStudents(s.data);
    } catch(e) { console.error(e); }
  };

  const handleCourseClick = async (course) => {
    setSelectedCourse(course);
    try {
      const res = await getStudentsForCourse(course.id);
      setCourseStudents(res.data);
    } catch(e) {}
  };

  const saveEdit = async () => {
    try {
      await updateCourse(editingCourse.id, editingCourse);
      showToast('✓ Course updated');
      setEditingCourse(null);
      loadAll();
    } catch(e) { showToast('Error updating course'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await deleteCourse(id);
      showToast('Course deleted');
      loadAll();
    } catch(e) { showToast('Error deleting'); }
  };

  const handleAdd = async () => {
    try {
      await createCourse(newCourse);
      showToast('✓ Course created');
      setShowAddForm(false);
      setNewCourse({ code:'', name:'', type:'CORE', credits:3, days:'', startTime:'', endTime:'', classroom:'', maxSeats:20, description:'' });
      loadAll();
    } catch(e) { showToast('Error creating course'); }
  };

  // NEW FUNCTION: Handle removing a student from a course
  const handleRemoveStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to remove ${studentName} from this course?`)) return;
    
    try {
      await removeStudentFromCourse(studentId, selectedCourse.id);
      showToast(`✓ Removed ${studentName}`);
      // Refresh the list of students for this course immediately
      const res = await getStudentsForCourse(selectedCourse.id);
      setCourseStudents(res.data);
      loadAll(); // Also update overall stats
    } catch (e) {
      showToast('Error removing student');
    }
  };

  const chartData = stats?.courseStats?.map(c => ({
    name: c.courseCode,
    fill: c.fillPercentage,
    max: c.maxSeats,
    current: c.currentSeats
  })) || [];

  const inputStyle = {
    padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-page)', border: '1px solid var(--border-med)',
    color: 'var(--text-1)', fontSize: '0.82rem', fontFamily: 'Outfit', outline: 'none', width: '100%'
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-page)' }}>
      <Sidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title="Admin Panel" breadcrumb="SERS Administration"
          stats={[
            { label: `${stats?.totalStudents || 0} Students`, color: 'var(--c-elec)' },
            { label: `${stats?.totalConfirmed || 0} Confirmed`, color: 'var(--c-lab)' }
          ]}
        />

        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {activeTab === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {[
                  { label: 'Total Students', value: stats?.totalStudents || 0, color: 'var(--c-core)' },
                  { label: 'Total Courses', value: stats?.totalCourses || 0, color: 'var(--c-elec)' },
                  { label: 'Confirmed Selections', value: stats?.totalConfirmed || 0, color: 'var(--c-lab)' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
                    <div style={{ fontFamily: 'Syne', fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem 2rem' }}>
                <div style={{ fontFamily: 'Syne', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Seat Fill Rate by Course</div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} unit="%" />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-panel2)', border: '1px solid var(--border-med)', borderRadius: 8 }}
                      formatter={(val, name) => [`${val.toFixed(1)}%`, 'Fill Rate']}
                    />
                    <Bar dataKey="fill" radius={[4,4,0,0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill > 80 ? '#ff6b6b' : entry.fill > 50 ? 'var(--c-lab)' : 'var(--c-core)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {activeTab === 'courses' && (
            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem 2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'Syne', fontSize: '1.35rem', fontWeight: 700 }}>All Courses</h2>
                <button onClick={() => setShowAddForm(!showAddForm)} style={{
                  padding: '0.55rem 1.2rem', borderRadius: 'var(--radius-sm)',
                  background: 'var(--c-core)', border: 'none', color: '#fff',
                  fontWeight: 600, fontSize: '0.85rem'
                }}>+ Add Course</button>
              </div>

              {showAddForm && (
                <div style={{ background: 'var(--bg-panel2)', border: '1px solid var(--border-med)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'Syne', marginBottom: '1rem' }}>New Course</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    {[
                      { key: 'code', label: 'Code' },
                      { key: 'name', label: 'Name' },
                      { key: 'classroom', label: 'Classroom' },
                      { key: 'days', label: 'Days (MON,WED,FRI)' },
                      { key: 'startTime', label: 'Start Time (HH:MM)' },
                      { key: 'endTime', label: 'End Time (HH:MM)' },
                      { key: 'credits', label: 'Credits', type: 'number' },
                      { key: 'maxSeats', label: 'Max Seats', type: 'number' },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ fontSize: '0.72rem', color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>{f.label}</label>
                        <input type={f.type || 'text'} value={newCourse[f.key]}
                          onChange={e => setNewCourse(p => ({...p, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value}))}
                          style={inputStyle}
                        />
                      </div>
                    ))}
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Type</label>
                      <select value={newCourse.type} onChange={e => setNewCourse(p => ({...p, type: e.target.value}))} style={inputStyle}>
                        <option>CORE</option>
                        <option>HUMANITIES</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.75rem' }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Description</label>
                    <textarea value={newCourse.description} onChange={e => setNewCourse(p => ({...p, description: e.target.value}))}
                      style={{...inputStyle, height: 70, resize: 'vertical'}}/>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: '1rem' }}>
                    <button onClick={handleAdd} style={{ padding: '0.55rem 1.2rem', background: 'var(--c-elec)', border: 'none', borderRadius: 8, color: '#0f1117', fontWeight: 600, fontSize: '0.85rem' }}>Create</button>
                    <button onClick={() => setShowAddForm(false)} style={{ padding: '0.55rem 1.2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-2)', fontSize: '0.85rem' }}>Cancel</button>
                  </div>
                </div>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Code', 'Name', 'Type', 'Days', 'Time', 'Faculty', 'Seats', 'Active', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-3)', fontWeight: 500, fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        {editingCourse?.id === course.id ? (
                          <>
                            <td style={{ padding: '0.5rem 1rem' }}><input value={editingCourse.code} onChange={e => setEditingCourse(p => ({...p, code: e.target.value}))} style={{...inputStyle, width: 70}}/></td>
                            <td style={{ padding: '0.5rem 1rem' }}><input value={editingCourse.name} onChange={e => setEditingCourse(p => ({...p, name: e.target.value}))} style={inputStyle}/></td>
                            <td style={{ padding: '0.5rem 1rem' }}>
                              <select value={editingCourse.type} onChange={e => setEditingCourse(p => ({...p, type: e.target.value}))} style={{...inputStyle, width: 120}}>
                                <option>CORE</option><option>HUMANITIES</option><option>FIXED</option>
                              </select>
                            </td>
                            <td style={{ padding: '0.5rem 1rem' }}><input value={editingCourse.days} onChange={e => setEditingCourse(p => ({...p, days: e.target.value}))} style={{...inputStyle, width: 130}}/></td>
                            <td style={{ padding: '0.5rem 1rem' }}>
                              <input value={editingCourse.startTime} onChange={e => setEditingCourse(p => ({...p, startTime: e.target.value}))} style={{...inputStyle, width: 70}} placeholder="HH:MM"/>
                              <span style={{ color: 'var(--text-3)', margin: '0 4px' }}>–</span>
                              <input value={editingCourse.endTime} onChange={e => setEditingCourse(p => ({...p, endTime: e.target.value}))} style={{...inputStyle, width: 70}} placeholder="HH:MM"/>
                            </td>
                            <td style={{ padding: '0.5rem 1rem', color: 'var(--text-2)' }}>{course.facultyName || '—'}</td>
                            <td style={{ padding: '0.5rem 1rem' }}><input type="number" value={editingCourse.maxSeats} onChange={e => setEditingCourse(p => ({...p, maxSeats: Number(e.target.value)}))} style={{...inputStyle, width: 70}}/></td>
                            <td style={{ padding: '0.5rem 1rem' }}>
                              <select value={editingCourse.isActive} onChange={e => setEditingCourse(p => ({...p, isActive: e.target.value === 'true'}))} style={{...inputStyle, width: 80}}>
                                <option value="true">Yes</option><option value="false">No</option>
                              </select>
                            </td>
                            <td style={{ padding: '0.5rem 1rem' }}>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={saveEdit} style={{ padding: '0.3rem 0.7rem', background: 'var(--c-elec)', border: 'none', borderRadius: 6, color: '#0f1117', fontSize: '0.75rem', fontWeight: 600 }}>Save</button>
                                <button onClick={() => setEditingCourse(null)} style={{ padding: '0.3rem 0.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-2)', fontSize: '0.75rem' }}>Cancel</button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td style={{ padding: '0.75rem 1rem', fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: course.type === 'CORE' ? 'var(--c-core)' : course.type === 'HUMANITIES' ? 'var(--c-hum)' : 'var(--c-lab)' }}>{course.code}</td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{course.name}</td>
                            <td style={{ padding: '0.75rem 1rem', color: 'var(--text-3)', fontSize: '0.75rem' }}>{course.type}</td>
                            <td style={{ padding: '0.75rem 1rem', fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: 'var(--text-2)' }}>{course.days?.replace(/,/g, '·')}</td>
                            <td style={{ padding: '0.75rem 1rem', fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: 'var(--text-2)' }}>{course.startTime?.slice(0,5)}–{course.endTime?.slice(0,5)}</td>
                            <td style={{ padding: '0.75rem 1rem', color: 'var(--text-2)' }}>{course.facultyName || '—'}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{ color: course.currentSeats >= course.maxSeats ? '#ff6b6b' : 'var(--text-2)', fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }}>
                                {course.currentSeats}/{course.maxSeats}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: 100, background: course.isActive ? 'rgba(46,214,163,0.15)' : 'rgba(255,107,107,0.15)', color: course.isActive ? 'var(--c-elec)' : '#ff6b6b' }}>
                                {course.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => setEditingCourse({...course, startTime: course.startTime?.slice(0,5), endTime: course.endTime?.slice(0,5)})} style={{ padding: '0.3rem 0.7rem', background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 6, color: 'var(--c-core)', fontSize: '0.75rem' }}>Edit</button>
                                <button onClick={() => setModalCourse(course)} style={{ padding: '0.3rem 0.7rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-2)', fontSize: '0.75rem' }}>ℹ</button>
                                <button onClick={() => handleDelete(course.id)} style={{ padding: '0.3rem 0.7rem', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, color: '#ff6b6b', fontSize: '0.75rem' }}>Del</button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem 2rem' }}>
              <h2 style={{ fontFamily: 'Syne', fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.5rem' }}>All Students</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Roll No', 'Name', 'Stream', 'Year', 'Sem', 'CGPA', 'Core Limit', 'Hum Limit'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-3)', fontWeight: 500, fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: 'var(--c-core)' }}>{s.rollNumber}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{s.name}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-2)' }}>{s.stream}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-2)' }}>{s.year}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-2)' }}>{s.semester}</td>
                        <td style={{ padding: '0.75rem 1rem', fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: s.cgpa >= 8 ? 'var(--c-elec)' : s.cgpa >= 6.5 ? 'var(--c-lab)' : '#ff6b6b' }}>{s.cgpa}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-2)' }}>{s.maxCoreElectives}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-2)' }}>{s.maxHumElectives}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'allocations' && (
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
              <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', overflowY: 'auto', maxHeight: '70vh' }}>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>Select Course</h3>
                {courses.filter(c => !c.isFixed).map(course => (
                  <div key={course.id} onClick={() => handleCourseClick(course)} style={{
                    padding: '0.75rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', marginBottom: 6,
                    background: selectedCourse?.id === course.id ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${selectedCourse?.id === course.id ? 'rgba(108,99,255,0.4)' : 'var(--border)'}`,
                    transition: 'all 0.15s'
                  }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: 'var(--c-core)' }}>{course.code}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 500, marginTop: 2 }}>{course.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 2 }}>{course.currentSeats}/{course.maxSeats} enrolled</div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                {selectedCourse ? (
                  <>
                    <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: '1rem' }}>Students in {selectedCourse.name}</h3>
                    {courseStudents.length === 0 ? (
                      <p style={{ color: 'var(--text-3)' }}>No students enrolled yet.</p>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            {['Roll No', 'Name', 'Stream', 'Year', 'CGPA', 'Action'].map(h => (
                              <th key={h} style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-3)', fontWeight: 500, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {courseStudents.map(s => (
                            <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '0.75rem', fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: 'var(--c-core)' }}>{s.rollNumber}</td>
                              <td style={{ padding: '0.75rem', fontWeight: 500 }}>{s.name}</td>
                              <td style={{ padding: '0.75rem', color: 'var(--text-2)' }}>{s.stream}</td>
                              <td style={{ padding: '0.75rem', color: 'var(--text-2)' }}>{s.year}</td>
                              <td style={{ padding: '0.75rem', fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: 'var(--c-elec)' }}>{s.cgpa}</td>
                              
                              {/* NEW ACTION COLUMN */}
                              <td style={{ padding: '0.75rem' }}>
                                <button 
                                  onClick={() => handleRemoveStudent(s.id, s.name)} 
                                  style={{ padding: '0.3rem 0.6rem', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, color: '#ff6b6b', fontSize: '0.7rem', cursor: 'pointer' }}
                                >
                                  Remove
                                </button>
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-panel2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <h4 style={{ fontFamily: 'Syne', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Manual Override</h4>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <select id="override-student" style={{...inputStyle, flex: 1}}>
                          {students.map(s => <option key={s.id} value={s.id}>{s.rollNumber} — {s.name}</option>)}
                        </select>
                        <button onClick={async () => {
                          const sid = document.getElementById('override-student').value;
                          const res = await overrideAllocation(sid, selectedCourse.id);
                          showToast(res.data.message);
                          handleCourseClick(selectedCourse);
                        }} style={{ padding: '0.5rem 1rem', background: 'var(--c-lab)', border: 'none', borderRadius: 8, color: '#0f1117', fontWeight: 600, fontSize: '0.82rem' }}>
                          Override
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)' }}>
                    Select a course to view enrolled students
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <CourseModal course={modalCourse} onClose={() => setModalCourse(null)} />
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}