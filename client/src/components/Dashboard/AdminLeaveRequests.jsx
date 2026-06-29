import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminLeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await leaveAPI.getAllLeaveRequestsAdmin(statusFilter);
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status) => {
    if (!selectedRequest) return;
    setSubmitting(true);
    try {
      await leaveAPI.adminOverrideStatus(selectedRequest.id, status, comments);
      toast.success(`Request ${status}`);
      setSelectedRequest(null);
      setComments('');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-teal-50 text-teal-700';
      case 'rejected': return 'bg-rose-50 text-rose-700';
      case 'cancelled': return 'bg-slate-100 text-slate-500';
      default: return 'bg-amber-50 text-amber-700';
    }
  };

  const getLeaveTypeLabel = (type) => {
    const types = { annual: 'Annual', sick: 'Sick', study: 'Study', family: 'Family Resp.' };
    return types[type] || type;
  };

  const filtered = requests.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.intern?.full_name?.toLowerCase().includes(q) ||
      r.intern?.supervisor?.full_name?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search intern or supervisor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Intern</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Supervisor</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Type</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Dates</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-6 text-center text-sm text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-6 text-center text-sm text-slate-400">No requests found</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 text-sm text-slate-900">{r.intern?.full_name}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{r.intern?.supervisor?.full_name || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{getLeaveTypeLabel(r.leave_type)}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {new Date(r.start_date).toLocaleDateString()} - {new Date(r.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-sm">
                      <span className={`px-2 py-0.5 inline-flex text-xs font-medium rounded-full capitalize ${getStatusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium">
                      <button onClick={() => setSelectedRequest(r)} className="text-indigo-600 hover:text-indigo-800">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRequest && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/50" onClick={() => { setSelectedRequest(null); setComments(''); }} />
            <div className="inline-block align-bottom bg-white rounded-lg px-5 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-base font-semibold text-slate-900">Leave Request Details</h3>
                <button onClick={() => { setSelectedRequest(null); setComments(''); }} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-400 text-xs uppercase tracking-wide">Intern</span>
                  <p className="text-slate-900">{selectedRequest.intern?.full_name}</p>
                  <p className="text-xs text-slate-500">{selectedRequest.intern?.email}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs uppercase tracking-wide">Supervisor</span>
                  <p className="text-slate-900">{selectedRequest.intern?.supervisor?.full_name || 'Unassigned'}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs uppercase tracking-wide">Leave Type</span>
                  <p className="text-slate-900 capitalize">{selectedRequest.leave_type}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs uppercase tracking-wide">Dates</span>
                  <p className="text-slate-900">
                    {new Date(selectedRequest.start_date).toLocaleDateString()} - {new Date(selectedRequest.end_date).toLocaleDateString()} ({selectedRequest.days_requested} days)
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs uppercase tracking-wide">Reason</span>
                  <p className="text-slate-900">{selectedRequest.reason}</p>
                </div>
                {selectedRequest.attachment_url && (
                  <div>
                    <span className="text-slate-400 text-xs uppercase tracking-wide">Document</span>
                    <p>
                      <a href={selectedRequest.attachment_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline">
                        {selectedRequest.attachment_name || 'View document'}
                      </a>
                    </p>
                  </div>
                )}

                {selectedRequest.status === 'pending' ? (
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Comments (optional)</label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows="2"
                      className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                ) : (
                  <div>
                    <span className="text-slate-400 text-xs uppercase tracking-wide">Current Status</span>
                    <p className="text-slate-900 capitalize font-medium">{selectedRequest.status}</p>
                    {selectedRequest.comments && <p className="text-xs text-slate-500 mt-1">{selectedRequest.comments}</p>}
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAction('approved')}
                  disabled={submitting}
                  className="w-full rounded-md px-4 py-2 bg-teal-600 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {selectedRequest.status === 'pending' ? 'Approve' : 'Override: Approve'}
                </button>
                <button
                  onClick={() => handleAction('rejected')}
                  disabled={submitting}
                  className="w-full rounded-md px-4 py-2 bg-rose-600 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {selectedRequest.status === 'pending' ? 'Reject' : 'Override: Reject'}
                </button>
              </div>
              {selectedRequest.status !== 'pending' && (
                <p className="text-xs text-slate-400 mt-2 text-center">This will override the supervisor's existing decision.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaveRequests;