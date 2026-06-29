import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../Common/LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'supervisor':
        return '/supervisor';
      default:
        return '/dashboard';
    }
  };

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to={getDashboardPath(profile?.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;