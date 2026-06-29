import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import AdminShell from '../Common/AdminShell';
import { useAuth } from '../../hooks/useAuth';
import AdminLeaveRequests from './AdminLeaveRequests';
import AdminReports from './AdminReports';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    role: 'intern',
    department: '',
    employment_start_date: '',
    supervisor_id: '',
    password: '',
  });
  const [supervisors, setSupervisors] = useState([]);
  const { profile } = useAuth();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchUsers(), fetchSupervisors(), fetchSummary()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const fetchSupervisors = async () => {
    try {
      const response = await userAPI.getSupervisors();
      setSupervisors(response.data);
    } catch (error) {
      console.error('Failed to fetch supervisors');
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await userAPI.getAdminSummary();
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch admin summary');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await userAPI.createUser(newUser);
      toast.success('User created successfully');
      setShowAddUser(false);
      setNewUser({
        email: '', full_name: '', role: 'intern', department: '',
        employment_start_date: '', supervisor_id: '', password: '',
      });
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      await userAPI.updateUser(editingUser.id, {
        full_name: editingUser.full_name,
        department: editingUser.department,
        employment_start_date: editingUser.employment_start_date,
        supervisor_id: editingUser.supervisor_id,
      });
      toast.success('User updated successfully');
      setShowEditUser(false);
      setEditingUser(null);
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update user');
    }
  };

  const handleToggleActive = async (user) => {
    const action = user.is_active === false ? 'reactivate' : 'deactivate';
    if (!window.confirm(`${action === 'deactivate' ? 'Deactivate' : 'Reactivate'} ${user.full_name}?`)) return;
    try {
      if (action === 'deactivate') {
        await userAPI.deactivateUser(user.id);
      } else {
        await userAPI.reactivateUser(user.id);
      }
      toast.success(`User ${action}d successfully`);
      fetchAll();
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleResetPassword = async (email) => {
    if (window.confirm(`Send password reset email to ${email}?`)) {
      try {
        await userAPI.resetPassword(email);
        toast.success('Password reset email sent');
      } catch (error) {
        toast.error('Failed to send reset email');
      }
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-50 text-purple-700';
      case 'supervisor': return 'bg-blue-50 text-blue-700';
      default: return 'bg-teal-50 text-teal-700';
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch = !searchQuery ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const pageTitles = {
    dashboard: 'Dashboard',
    users: 'Users',
    requests: 'Leave Requests',
    reports: 'Reports',
    calendar: 'Calendar',
    notifications: 'Notifications',
    settings: 'Settings',
    profile: 'Profile',
  };

  const cards = summary ? [
    { label: 'Total Interns', value: summary.totalInterns, accent: 'text-slate-700', dot: 'bg-slate-500' },
    { label: 'Total Supervisors', value: summary.totalSupervisors, accent: 'text-indigo-600', dot: 'bg-indigo-500' },
    { label: 'Pending Requests', value: summary.pending, accent: 'text-amber-600', dot: 'bg-amber-500' },
    { label: 'Approved Requests', value: summary.approved, accent: 'text-teal-600', dot: 'bg-teal-500' },
    { label: 'Rejected Requests', value: summary.rejected, accent: 'text-rose-600', dot: 'bg-rose-500' },
    { label: 'Requests This Month', value: summary.thisMonth, accent: 'text-slate-700', dot: 'bg-slate-500' },
  ] : [];

  return (
    <AdminShell activeTab={activeTab} onTabChange={setActiveTab} pendingCount={summary?.pending || 0}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{pageTitles[activeTab]}</h1>
        {activeTab === 'dashboard' && (
          <p className="text-sm text-slate-500 mt-1">Welcome back, {profile?.full_name?.split(' ')[0]}</p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-indigo-600" />
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <div key={card.label} className="bg-white rounded-lg border border-slate-200 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${card.dot}`} />
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">{card.label}</dt>
                  </div>
                  <dd className={`text-2xl font-semibold ${card.accent}`}>{card.value}</dd>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All roles</option>
                    <option value="intern">Interns</option>
                    <option value="supervisor">Supervisors</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowAddUser(true)}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  + Add User
                </button>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Name</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Role</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Department</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-400">No users found</td></tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50">
                            <td className="px-5 py-3.5 text-sm text-slate-900">
                              {user.full_name}
                              <div className="text-xs text-slate-400">{user.email}</div>
                            </td>
                            <td className="px-5 py-3.5 text-sm">
                              <span className={`px-2 py-0.5 inline-flex text-xs font-medium rounded-full capitalize ${getRoleBadgeColor(user.role)}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-slate-600">{user.department || '—'}</td>
                            <td className="px-5 py-3.5 text-sm">
                              <span className={`px-2 py-0.5 inline-flex text-xs font-medium rounded-full ${
                                user.is_active === false ? 'bg-slate-100 text-slate-500' : 'bg-green-50 text-green-700'
                              }`}>
                                {user.is_active === false ? 'Inactive' : 'Active'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-sm space-x-3 whitespace-nowrap">
                              <button
                                onClick={() => { setEditingUser(user); setShowEditUser(true); }}
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleResetPassword(user.email)}
                                className="text-slate-500 hover:text-slate-700"
                              >
                                Reset PW
                              </button>
                              <button
                                onClick={() => handleToggleActive(user)}
                                className={user.is_active === false ? 'text-teal-600 hover:text-teal-800' : 'text-rose-600 hover:text-rose-800'}
                              >
                                {user.is_active === false ? 'Reactivate' : 'Deactivate'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && <AdminLeaveRequests />} 
           
           {activeTab === 'reports' && <AdminReports />}

          {activeTab === 'calendar' && (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-sm text-slate-400">
              Company-wide Calendar — coming in Stage 2
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-sm text-slate-400">
              Notifications — coming in Stage 2
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-sm text-slate-400">
              System Settings — coming in Stage 2
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-md bg-white rounded-lg border border-slate-200 p-5">
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-slate-400 uppercase tracking-wide">Name</dt>
                  <dd className="text-sm text-slate-900 mt-0.5">{profile?.full_name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400 uppercase tracking-wide">Email</dt>
                  <dd className="text-sm text-slate-900 mt-0.5">{profile?.email}</dd>
                </div>
              </dl>
            </div>
          )}
        </>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/50" onClick={() => setShowAddUser(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg px-5 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <h3 className="text-base font-semibold text-slate-900">Add New User</h3>
              <form onSubmit={handleAddUser} className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text" required
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    className="block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email" required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input
                    type="password" required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="intern">Intern</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                {newUser.role === 'intern' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Employment Start Date</label>
                      <input
                        type="date" required
                        value={newUser.employment_start_date}
                        onChange={(e) => setNewUser({ ...newUser, employment_start_date: e.target.value })}
                        className="block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Supervisor</label>
                      <select
                        value={newUser.supervisor_id}
                        onChange={(e) => setNewUser({ ...newUser, supervisor_id: e.target.value })}
                        className="block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select Supervisor</option>
                        {supervisors.map((sup) => (
                          <option key={sup.id} value={sup.id}>{sup.full_name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button type="submit" className="w-full rounded-md px-4 py-2 bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
                    Create User
                  </button>
                  <button type="button" onClick={() => setShowAddUser(false)} className="w-full rounded-md px-4 py-2 border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && editingUser && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/50" onClick={() => setShowEditUser(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg px-5 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <h3 className="text-base font-semibold text-slate-900">Edit {editingUser.full_name}</h3>
              <form onSubmit={handleEditUser} className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text" required
                    value={editingUser.full_name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                    className="block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editingUser.department || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                {editingUser.role === 'intern' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Employment Start Date</label>
                      <input
                        type="date"
                        value={editingUser.employment_start_date || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, employment_start_date: e.target.value })}
                        className="block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Supervisor</label>
                      <select
                        value={editingUser.supervisor_id || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, supervisor_id: e.target.value })}
                        className="block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select Supervisor</option>
                        {supervisors.map((sup) => (
                          <option key={sup.id} value={sup.id}>{sup.full_name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button type="submit" className="w-full rounded-md px-4 py-2 bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
                    Save Changes
                  </button>
                  <button type="button" onClick={() => { setShowEditUser(false); setEditingUser(null); }} className="w-full rounded-md px-4 py-2 border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
};

export default AdminDashboard;