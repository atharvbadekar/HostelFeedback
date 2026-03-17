import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import WardenDashboard from './pages/WardenDashboard';
import ChiefWarden from './pages/ChiefWarden';
import StudentFeedback from './pages/StudentFeedback';
import Header from './components/Header';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (data) => {
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('token', data.token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login setUser={handleLogin} />} />
        
        <Route path="/warden" element={
          user?.role === 'warden' ? <WardenDashboard hostelId={user.hostelId} onLogout={handleLogout} /> : <Navigate to="/login" />
        } />

        <Route path="/chief" element={
          user?.role === 'chief' ? <ChiefWarden onLogout={handleLogout} /> : <Navigate to="/login" />
        } />

        <Route path="/feedback" element={<StudentFeedback />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;