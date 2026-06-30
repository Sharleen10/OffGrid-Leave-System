import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home' },
  { id: 'users', label: 'Users', icon: 'users' },
  { id: 'requests', label: 'Leave Requests', icon: 'inbox' },
  { id: 'reports', label: 'Reports', icon: 'chart' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
  { id: 'profile', label: 'Profile', icon: 'profile' },
];

const ICONS = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M3 11.5L12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 10v9a1 1 0 001 1h11a1 1 0 001-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.5 14.2c2.6.3 4.5 2.6 4.5 5.3" strokeLinecap="round" />
    </svg>
  ),
  inbox: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M4 13l2-7h12l2 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 13h5a1 1 0 011 1 2 2 0 002 2h0a2 2 0 002-2 1 1 0 011-1h5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 13v6a1 1 0 001 1h14a1 1 0 001-1v-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M5 19V10M12 19V5M19 19v-6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 19h18" strokeLinecap="round" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
      <path d="M4 9.5h16" strokeLinecap="round" />
      <path d="M8 3.5v3M16 3.5v3" strokeLinecap="round" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M6 9a6 6 0 1112 0c0 3.2 1 5 1.5 5.8H4.5C5 14 6 12.2 6 9z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 18.5a2 2 0 004 0" strokeLinecap="round" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2.3M12 18.2v2.3M5.3 6.3l1.6 1.6M17.1 16.1l1.6 1.6M3.5 12h2.3M18.2 12h2.3M5.3 17.7l1.6-1.6M17.1 7.9l1.6-1.6" strokeLinecap="round" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20c0-3.5 3-6.3 7-6.3s7 2.8 7 6.3" strokeLinecap="round" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M9 21H6a2 2 0 01-2-2V5a2 2 0 012-2h3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  ),
};

const AdminShell = ({ activeTab, onTabChange, children, pendingCount = 0 }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = (profile?.full_name || '?')
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const NavLinks = ({ onNavigate }) => (
    <>
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              onTabChange(item.id);
              if (onNavigate) onNavigate();
            }}
            className={`relative w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors
              ${isActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
          >
            {isActive && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-indigo-600" />
            )}
            <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>{ICONS[item.icon]}</span>
            <span>{item.label}</span>
            {item.id === 'requests' && pendingCount > 0 && (
              <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                {pendingCount}
              </span>
            )}
          </button>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 px-3 py-6 shrink-0">
        <div className="px-3 mb-8">
          <h1 className="text-lg font-semibold text-white tracking-tight">OffGrid</h1>
          <p className="text-xs text-slate-400 mt-0.5">Admin workspace</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="border-t border-slate-800 pt-4 mt-4 px-1">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-white truncate">{profile?.full_name}</p>
              <p className="text-xs text-slate-400 truncate">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            {ICONS.logout}
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 bg-slate-900 px-4 h-14 flex items-center justify-between">
        <h1 className="text-base font-semibold text-white">OffGrid</h1>
        <button onClick={() => setMobileOpen(true)} className="text-slate-200 p-1">
          {ICONS.menu}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 left-0 h-full w-72 bg-slate-900 px-3 py-5 flex flex-col">
            <div className="flex items-center justify-between px-3 mb-6">
              <div>
                <h1 className="text-base font-semibold text-white">OffGrid</h1>
                <p className="text-xs text-slate-400">Admin workspace</p>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-slate-300 p-1">
                {ICONS.close}
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </nav>
            <div className="border-t border-slate-800 pt-4 mt-4 px-1">
              <div className="flex items-center gap-3 px-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{profile?.full_name}</p>
                  <p className="text-xs text-slate-400 truncate">{profile?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                {ICONS.logout}
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminShell;