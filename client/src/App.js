import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import LandingPage from './components/Common/LandingPage';
import Login from './components/Auth/Login';
import ResetPassword from './components/Auth/ResetPassword';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Navbar from './components/Common/Navbar';
import InternDashboard from './components/Dashboard/InternDashboard';
import SupervisorDashboard from './components/Dashboard/SupervisorDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import LoadingSpinner from './components/Common/LoadingSpinner';

function App() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  const getDashboardPath = () => {
    switch (profile?.role) {
      case 'admin':
        return '/admin';
      case 'supervisor':
        return '/supervisor';
      default:
        return '/dashboard';
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* If logged in, "/" skips the landing page. If logged out, it renders landing page */}
          <Route
            path="/"
            element={user ? <Navigate to={getDashboardPath()} replace /> : <LandingPage />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="intern">
              <Navbar />
              <InternDashboard />
            </ProtectedRoute>
          } />

          {/* Supervisor dashboard has its own sidebar shell - no top Navbar here */}
          <Route path="/supervisor/*" element={
            <ProtectedRoute requiredRole="supervisor">
              <SupervisorDashboard />
            </ProtectedRoute>
          } />

          {/* Admin dashboard has its own sidebar shell - no top Navbar here */}
          <Route path="/admin/*" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;