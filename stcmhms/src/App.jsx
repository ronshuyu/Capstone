import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import DashboardPage from './Pages/DashboardPage';
import Login from './components/Login/Login';
import { useAuth } from './components/Login/Auth';
import Admindash from './components/Admindash/Admindash';

export default function App() {
  const { currentUser, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  // ✅ initialize directly from localStorage
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem("isAdmin") === "true";
  });

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("isAdmin"); // clear admin session
    setIsAdmin(false);
    navigate('/');
  };

  const handleAdminAccess = () => {
    setIsAdmin(true);
    localStorage.setItem("isAdmin", "true"); // persist admin state
    navigate('/admindash');
  };

  return (
    <>
      {showLogin && (
        <Login
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            currentUser
              ? <Navigate to="/dashboard" replace />
              : <LandingPage 
                  onShowLogin={() => setShowLogin(true)} 
                  onAdminAccess={handleAdminAccess}
                />
          }
        />
        <Route
          path="/dashboard"
          element={
            currentUser
              ? <DashboardPage user={currentUser} onLogout={handleLogout} />
              : <Navigate to="/" replace />
          }
        />
        <Route
          path="/admindash"
          element={
            isAdmin
              ? <Admindash />
              : <Navigate to="/" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
