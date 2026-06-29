import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';

import logo from '../../assets/logo.png'; 

const Navbar = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getDashboardLink = () => {
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
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Increased navbar container height from h-16 to h-20 */}
        <div className="flex justify-between h-20">
          
          <div className="flex items-center">
            <Link to={getDashboardLink()} className="flex items-center">
              {/* 2. Increased logo size to h-16 */}
              <img 
                src={logo} 
                alt="OffGrid Logo" 
                className="h-16 w-auto object-contain" 
              />
            </Link>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {profile?.full_name} <span className="text-gray-400">({profile?.role})</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;