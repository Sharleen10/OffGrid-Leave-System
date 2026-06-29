import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { leaveAPI } from '../../services/api';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import LeaveRequestForm from '../Leave/LeaveRequestForm';
import LeaveRequestsList from '../Leave/LeaveRequestsList';
import LoadingSpinner from '../Common/LoadingSpinner';

// Professional High-Performance Inline SVG Navigation Path Icons
const ICONS = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M3 11.5L12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 10v9a1 1 0 001 1h11a1 1 0 001-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  requests: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M4 13l2-7h12l2 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 13h5a1 1 0 011 1 2 2 0 002 2h0a2 2 0 002-2 1 1 0 011-1h5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 13v6a1 1 0 001 1h14a1 1 0 001-1v-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2.3M12 18.2v2.3M5.3 6.3l1.6 1.6M17.1 16.1l1.6 1.6M3.5 12h2.3M18.2 12h2.3M5.3 17.7l1.6-1.6M17.1 7.9l1.6-1.6" strokeLinecap="round" />
    </svg>
  ),
  apply: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
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

const InternDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  // Password mutation state architecture
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdChanging, setPwdChanging] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [balanceRes, requestsRes] = await Promise.all([
        leaveAPI.getMyBalance(),
        leaveAPI.getMyRequests(),
      ]);
      if (balanceRes?.data) setBalance(balanceRes.data);
      if (requestsRes?.data) setRequests(requestsRes.data);
    } catch (error) {
      console.error('API Sync Error:', error);
      toast.error('Failed to load real-time dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (formData) => {
    try {
      await leaveAPI.submitRequest(formData);
      toast.success('Leave request submitted successfully');
      setIsSubmitModalOpen(false);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit request');
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Cancel this leave request?')) return;
    try {
      setCancellingId(requestId);
      await leaveAPI.cancelRequest(requestId);
      toast.success('Leave request cancelled');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel request');
    } finally {
      setCancellingId(null);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    try {
      setPwdChanging(true);
      await leaveAPI.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      toast.success('Password updated successfully');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update your password credentials');
    } finally {
      setPwdChanging(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/login');
  };
  
const getBalanceValue = (type, key = 'current') => {
    if (!balance || !balance[type]) return 0;
    let value;
    if (typeof balance[type] === 'object') {
      value = balance[type][key] || 0;
    } else {
      value = balance[type] || 0;
    }
    return Math.round(value * 100) / 100;
  };

  const totalRemaining = getBalanceValue('annual', 'current') + getBalanceValue('sick', 'current') + getBalanceValue('study', 'current') + getBalanceValue('family', 'current');

  const pendingRequests = requests.filter(r => r.status?.toLowerCase() === 'pending');
  const historicalRequests = requests.filter(r => r.status?.toLowerCase() !== 'pending');

  const approvedCount = requests.filter(r => r.status?.toLowerCase() === 'approved').length;
  const rejectedCount = requests.filter(r => r.status?.toLowerCase() === 'rejected').length;
  const upcomingLeave = requests.find(r => r.status?.toLowerCase() === 'approved' && new Date(r.start_date) > new Date());

  const initials = (profile?.full_name || '?')
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'apply', label: 'Apply Leave', icon: 'apply', isAction: true },
    { id: 'requests', label: 'My Requests', icon: 'requests' },
    { id: 'history', label: 'Leave History', icon: 'history' },
    { id: 'profile', label: 'Profile', icon: 'profile' },
  ];

  const handleNavClick = (item) => {
    if (item.isAction) {
      setIsSubmitModalOpen(true);
    } else {
      setActiveTab(item.id);
    }
    setMobileNavOpen(false);
  };

  const NavLinks = () => (
    <>
      {menuItems.map((item) => {
        const isActive = !item.isAction && activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={`relative w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-teal-50 text-teal-700'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {isActive && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-teal-600" />
            )}
            <span className={isActive ? 'text-teal-600' : 'text-slate-400'}>
              {ICONS[item.icon]}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 px-3 py-6 shrink-0 justify-between">
        <div>
          <div className="px-3 mb-8">
            <h1 className="text-lg font-semibold text-white tracking-tight">OffGrid</h1>
            <p className="text-xs text-slate-400 mt-0.5">Intern workspace</p>
          </div>
          <nav className="space-y-1">
            <NavLinks />
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 px-1">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
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

      {/* MOBILE TOP BAR */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 bg-slate-900 px-4 h-14 flex items-center justify-between">
        <h1 className="text-base font-semibold text-white">OffGrid</h1>
        <button onClick={() => setMobileNavOpen(true)} className="text-slate-200 p-1">
          {ICONS.menu}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute top-0 left-0 h-full w-72 bg-slate-900 px-3 py-5 flex flex-col">
            <div className="flex items-center justify-between px-3 mb-6">
              <div>
                <h1 className="text-base font-semibold text-white">OffGrid</h1>
                <p className="text-xs text-slate-400">Intern workspace</p>
              </div>
              <button onClick={() => setMobileNavOpen(false)} className="text-slate-300 p-1">
                {ICONS.close}
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              <NavLinks />
            </nav>
            <div className="border-t border-slate-800 pt-4 mt-4 px-1">
              <div className="flex items-center gap-3 px-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
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

      {/* WORKSPACE CONTAINER */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 pt-20 lg:pt-10 max-w-6xl mx-auto w-full">

        {/* TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">Welcome back, {profile?.full_name?.split(' ')[0]}</p>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm"
              >
                {ICONS.plus} Apply For Leave
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-lg border border-slate-200 p-5">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Total Remaining</p>
                <p className="text-3xl font-semibold text-slate-900 mt-2">{totalRemaining} <span className="text-xs font-normal text-slate-400">Days</span></p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-5">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Pending Requests</p>
                <p className="text-3xl font-semibold text-amber-600 mt-2">{pendingRequests.length}</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-5">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Total Approved</p>
                <p className="text-3xl font-semibold text-teal-600 mt-2">{approvedCount}</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-5">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Total Rejected</p>
                <p className="text-3xl font-semibold text-red-600 mt-2">{rejectedCount}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Your Leave Balances</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-md">
                  <span className="text-xs font-medium text-slate-500 block">Annual Leave</span>
                  <span className="text-xl font-bold text-slate-900 mt-1 block">{getBalanceValue('annual', 'current')} <span className="text-xs font-normal text-slate-400">available</span></span>
                  <span className="text-[11px] text-slate-400 block mt-1">Used: {getBalanceValue('annual', 'used')}d</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-md">
                  <span className="text-xs font-medium text-slate-500 block">Sick Leave</span>
                  <span className="text-xl font-bold text-slate-900 mt-1 block">{getBalanceValue('sick', 'current')} <span className="text-xs font-normal text-slate-400">available</span></span>
                  <span className="text-[11px] text-slate-400 block mt-1">Used: {getBalanceValue('sick', 'used')}d</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-md">
                  <span className="text-xs font-medium text-slate-500 block">Study Leave</span>
                  <span className="text-xl font-bold text-slate-900 mt-1 block">{getBalanceValue('study', 'current')} <span className="text-xs font-normal text-slate-400">available</span></span>
                  <span className="text-[11px] text-slate-400 block mt-1">Used: {getBalanceValue('study', 'used')}d</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-md">
                  <span className="text-xs font-medium text-slate-500 block">Family Responsibility</span>
                  <span className="text-xl font-bold text-slate-900 mt-1 block">{getBalanceValue('family', 'current')} <span className="text-xs font-normal text-slate-400">available</span></span>
                  <span className="text-[11px] text-slate-400 block mt-1">Used: {getBalanceValue('family', 'used')}d</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500 font-medium uppercase tracking-wide">
                      <tr>
                        <th className="px-5 py-3 text-left">Type</th>
                        <th className="px-5 py-3 text-left">Start Date</th>
                        <th className="px-5 py-3 text-left">End Date</th>
                        <th className="px-5 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {requests.slice(0, 5).map((req, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-5 py-3.5 font-medium text-slate-900 capitalize">{req.leave_type}</td>
                          <td className="px-5 py-3.5">{new Date(req.start_date).toLocaleDateString()}</td>
                          <td className="px-5 py-3.5">{new Date(req.end_date).toLocaleDateString()}</td>
                          <td className="px-5 py-3.5 text-right">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              req.status?.toLowerCase() === 'approved' ? 'bg-green-50 text-green-700' :
                              req.status?.toLowerCase() === 'pending' ? 'bg-amber-50 text-amber-700' :
                              req.status?.toLowerCase() === 'cancelled' ? 'bg-slate-100 text-slate-500' :
                              'bg-red-50 text-red-700'
                            }`}>{req.status}</span>
                          </td>
                        </tr>
                      ))}
                      {requests.length === 0 && (
                        <tr><td colSpan="4" className="px-5 py-6 text-center text-slate-400">No leave history yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Upcoming Approved Leave</h3>
                {upcomingLeave ? (
                  <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-md">
                    <span className="text-xs font-semibold text-emerald-800 capitalize block">{upcomingLeave.leave_type} Leave</span>
                    <span className="text-xs text-slate-500 mt-1 block">
                      {new Date(upcomingLeave.start_date).toLocaleDateString()} - {new Date(upcomingLeave.end_date).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 py-2">No upcoming leave scheduled</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: MY REQUESTS (pending, cancellable) */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">My Requests</h1>
                <p className="text-sm text-slate-500 mt-1">Requests awaiting supervisor review.</p>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm"
              >
                {ICONS.plus} Apply For Leave
              </button>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden p-1">
              <LeaveRequestsList
                requests={pendingRequests}
                isSupervisor={false}
                showCancel={true}
                onCancel={handleCancelRequest}
                cancellingId={cancellingId}
              />
            </div>
          </div>
        )}

        {/* TAB: LEAVE HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Leave History</h1>
              <p className="text-sm text-slate-500 mt-1">Past and processed leave requests.</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden p-1">
              <LeaveRequestsList requests={historicalRequests} isSupervisor={false} />
            </div>
          </div>
        )}

        {/* TAB: PROFILE */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Identity Information</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-slate-400 uppercase tracking-wide">Name</dt>
                  <dd className="text-sm text-slate-900 mt-0.5 font-medium">{profile?.full_name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400 uppercase tracking-wide">Email</dt>
                  <dd className="text-sm text-slate-900 mt-0.5 font-mono">{profile?.email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400 uppercase tracking-wide">Department</dt>
                  <dd className="text-sm text-slate-900 mt-0.5">{profile?.department || '—'}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-1">Update Password</h2>
              <p className="text-xs text-slate-400 mb-4">Change your account password</p>

              <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={pwdForm.currentPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                    className="block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={pwdForm.newPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                    className="block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={pwdForm.confirmPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                    className="block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={pwdChanging}
                  className="w-full rounded-md px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm disabled:bg-slate-300"
                >
                  {pwdChanging ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* APPLY FOR LEAVE MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsSubmitModalOpen(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg px-5 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-base font-semibold text-slate-900">Apply for Leave</h3>
                <button onClick={() => setIsSubmitModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
              </div>
              <LeaveRequestForm onSubmit={handleSubmitRequest} balance={balance} onClose={() => setIsSubmitModalOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternDashboard;