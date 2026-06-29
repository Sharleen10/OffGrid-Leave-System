import React, { useState, useEffect } from 'react';
import { leaveAPI, userAPI } from '../../services/api';
import DashboardShell from '../Dashboard/DashboardShell';
import SummaryCards from './SummaryCards';
import RecentActivity from './RecentActivity';
import LeaveCalendar from './LeaveCalendar';
import InternOverviewTable from './InternOverviewTable';
import Reports from './Reports';
import RequestDetailModal from '../Leave/RequestDetailModal';
import ChangePassword from '../Common/ChangePassword';
import LeaveRequestsList from '../Leave/LeaveRequestsList';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const SupervisorDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState(null);
  const [teamRequests, setTeamRequests] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [adjustment, setAdjustment] = useState({
    leave_type: 'annual',
    value: 0,
    reason: '',
  });
  const { profile } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, requestsRes, usersRes] = await Promise.all([
        leaveAPI.getDashboardSummary(),
        leaveAPI.getTeamRequests(),
        userAPI.getAllUsers(),
      ]);
      setSummary(summaryRes.data);
      setTeamRequests(requestsRes.data);
      const interns = usersRes.data.filter(u => u.role === 'intern');
      setTeamMembers(interns);
    } catch (error) {
      toast.error('Failed to fetch team data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = async (requestId) => {
    try {
      const response = await leaveAPI.getRequestDetail(requestId);
      setSelectedRequest(response.data);
    } catch (error) {
      toast.error('Failed to load request details');
    }
  };

  const handleApprove = async (requestId, comments) => {
    try {
      await leaveAPI.updateRequestStatus(requestId, 'approved', comments);
      toast.success('Leave request approved');
      setSelectedRequest(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (requestId, comments) => {
    try {
      await leaveAPI.updateRequestStatus(requestId, 'rejected', comments);
      toast.success('Leave request rejected');
      setSelectedRequest(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    if (!adjustment.reason || adjustment.reason.trim().length === 0) {
      toast.error('Please provide a reason for the balance adjustment');
      return;
    }
    try {
      await leaveAPI.adjustBalance({
        intern_id: selectedIntern.id,
        leave_type: adjustment.leave_type,
        value: parseFloat(adjustment.value),
        reason: adjustment.reason,
      });
      toast.success('Balance adjusted successfully');
      setShowAdjustModal(false);
      setAdjustment({ leave_type: 'annual', value: 0, reason: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to adjust balance');
    }
  };

  const handleExportToExcel = async () => {
    try {
      const response = await leaveAPI.getTeamSummary();
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'team-leave-summary.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export completed');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const pendingRequests = teamRequests.filter(r => r.status === 'pending');

  const pageTitles = {
    dashboard: 'Dashboard',
    requests: 'Leave Requests',
    interns: 'Interns',
    calendar: 'Calendar',
    reports: 'Reports',
    profile: 'Profile',
  };

  return (
    <DashboardShell activeTab={activeTab} onTabChange={setActiveTab} pendingCount={pendingRequests.length}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{pageTitles[activeTab]}</h1>
        {activeTab === 'dashboard' && (
          <p className="text-sm text-slate-500 mt-1">Welcome back, {profile?.full_name?.split(' ')[0]}</p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-teal-600" />
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <SummaryCards summary={summary} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentActivity />
                <LeaveCalendar />
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Pending approval</h2>
                <button
                  onClick={handleExportToExcel}
                  className="inline-flex items-center px-3.5 py-2 rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                >
                  Export to Excel
                </button>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Intern</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Type</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Start</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">End</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Days</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingRequests.length === 0 ? (
                        <tr><td colSpan={7} className="px-5 py-6 text-center text-sm text-slate-400">No pending requests</td></tr>
                      ) : (
                        pendingRequests.map((request) => (
                          <tr key={request.id} className="hover:bg-slate-50">
                            <td className="px-5 py-3.5 text-sm text-slate-900">{request.intern?.full_name}</td>
                            <td className="px-5 py-3.5 text-sm text-slate-600 capitalize">{request.leave_type}</td>
                            <td className="px-5 py-3.5 text-sm text-slate-600">{new Date(request.start_date).toLocaleDateString()}</td>
                            <td className="px-5 py-3.5 text-sm text-slate-600">{new Date(request.end_date).toLocaleDateString()}</td>
                            <td className="px-5 py-3.5 text-sm text-slate-600">{request.days_requested}</td>
                            <td className="px-5 py-3.5 text-sm">
                              <span className="px-2 py-0.5 inline-flex text-xs font-medium rounded-full bg-amber-50 text-amber-700">
                                Pending
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-sm font-medium">
                              <button onClick={() => handleViewRequest(request.id)} className="text-teal-600 hover:text-teal-800">
                                Review
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-900 mb-3">All requests</h2>
                <LeaveRequestsList requests={teamRequests} isSupervisor={false} />
              </div>
            </div>
          )}

          {activeTab === 'interns' && (
            <div className="space-y-6">
              <InternOverviewTable />
              <div className="bg-white rounded-lg border border-slate-200 p-5">
                <p className="text-sm text-slate-500 mb-3">Adjust a balance manually</p>
                <div className="flex flex-wrap gap-2">
                  {teamMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => { setSelectedIntern(member); setShowAdjustModal(true); }}
                      className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
                    >
                      {member.full_name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && <LeaveCalendar />}

          {activeTab === 'reports' && <Reports />}

          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-md">
              <div className="bg-white rounded-lg border border-slate-200 p-5">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs text-slate-400 uppercase tracking-wide">Name</dt>
                    <dd className="text-sm text-slate-900 mt-0.5">{profile?.full_name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400 uppercase tracking-wide">Email</dt>
                    <dd className="text-sm text-slate-900 mt-0.5">{profile?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400 uppercase tracking-wide">Department</dt>
                    <dd className="text-sm text-slate-900 mt-0.5">{profile?.department || '—'}</dd>
                  </div>
                </dl>
              </div>
              <ChangePassword />
            </div>
          )}
        </>
      )}

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {showAdjustModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/50" onClick={() => setShowAdjustModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg px-5 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <h3 className="text-base font-semibold text-slate-900">
                Adjust balance — {selectedIntern?.full_name}
              </h3>
              <form onSubmit={handleAdjustBalance} className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Leave type</label>
                  <select
                    value={adjustment.leave_type}
                    onChange={(e) => setAdjustment({ ...adjustment, leave_type: e.target.value })}
                    className="block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="annual">Annual leave</option>
                    <option value="sick">Sick leave</option>
                    <option value="study">Study leave</option>
                    <option value="family">Family responsibility leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adjustment (days)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={adjustment.value}
                    onChange={(e) => setAdjustment({ ...adjustment, value: e.target.value })}
                    className="block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Positive to add, negative to deduct"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                  <textarea
                    required
                    rows="3"
                    value={adjustment.reason}
                    onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
                    className="block w-full border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button type="submit" className="w-full rounded-md px-4 py-2 bg-teal-600 text-sm font-medium text-white hover:bg-teal-700 transition-colors">
                    Apply
                  </button>
                  <button type="button" onClick={() => setShowAdjustModal(false)} className="w-full rounded-md px-4 py-2 border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default SupervisorDashboard;