import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await leaveAPI.getAdminNotifications();
      setNotifications(response.data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'overdue': return 'border-l-rose-400';
      case 'leave_request': return 'border-l-amber-400';
      case 'user_created': return 'border-l-indigo-400';
      default: return 'border-l-slate-300';
    }
  };

  const filtered = typeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === typeFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All notifications</option>
          <option value="leave_request">Leave requests</option>
          <option value="overdue">Overdue approvals</option>
          <option value="user_created">Account changes</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-2">
        {loading ? (
          <p className="text-sm text-slate-400 p-4">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-400 p-4">No notifications</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((n) => (
              <li key={n.id} className={`flex items-start gap-3 px-4 py-3 border-l-2 ${getBorderColor(n.type)}`}>
                <span className="text-lg">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;