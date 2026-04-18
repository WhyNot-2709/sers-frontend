import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sers_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    localStorage.setItem('sers_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('sers_user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
        }/>
        <Route path="/dashboard" element={
          !user ? <Navigate to="/login" /> :
          user.role === 'STUDENT' ? <StudentDashboard user={user} onLogout={handleLogout} /> :
          user.role === 'ADMIN' ? <AdminDashboard user={user} onLogout={handleLogout} /> :
          <ProfessorDashboard user={user} onLogout={handleLogout} />
        }/>
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />}/>
      </Routes>
    </BrowserRouter>
  );
}