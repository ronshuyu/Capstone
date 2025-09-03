import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import DashboardPage from './Pages/DashboardPage';
import Login from './components/Login/Login';
import { useAuth } from './components/Login/Auth'; // adjust path

export default function App() {
  const { currentUser, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* Global Login Modal */}
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
              : <LandingPage onShowLogin={() => setShowLogin(true)} />
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
        <Route path="*" 
        element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
