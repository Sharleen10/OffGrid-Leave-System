import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const response = await leaveAPI.getRecentActivity();
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to load recent activity');
    } finally {
      setLoading(false);
    }
  };

  const getDot = (actionType) => {
    switch (actionType) {
      case 'leave_approved': return 'bg-teal-500';
      case 'leave_rejected': return 'bg-rose-500';
      case 'leave_cancelled': return 'bg-slate-400';
      case 'balance_adjusted': return 'bg-indigo-500';
      default: return 'bg-amber-500';
    }
  };

  const getLabel = (actionType) => {
    switch (actionType) {
      case 'leave_approved': return 'Approved';
      case 'leave_rejected': return 'Rejected';
      case 'leave_cancelled': return 'Cancelled';
      case 'leave_submitted': return 'Submitted';
      case 'balance_adjusted': return 'Adjustment';
      default: return 'Activity';
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

  const filtered = activities.filter(a =>
    filter === 'all' || a.action_type === filter
  );

  const displayed = showAll ? filtered : filtered.slice(0, 5);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-900">Recent activity</h2>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setShowAll(false); }}
          className="text-xs border border-slate-200 rounded-md px-2 py-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          <option value="all">All</option>
          <option value="leave_submitted">Submitted</option>
          <option value="leave_approved">Approved</option>
          <option value="leave_rejected">Rejected</option>
          <option value="leave_cancelled">Cancelled</option>
          <option value="balance_adjusted">Adjustments</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400">No activity found</p>
      ) : (
        <>
          <ul className="space-y-3">
            {displayed.map((activity) => (
              <li key={activity.id} className="flex items-start gap-3">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${getDot(activity.action_type)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      activity.action_type === 'leave_approved' ? 'bg-teal-50 text-teal-700' :
                      activity.action_type === 'leave_rejected' ? 'bg-rose-50 text-rose-700' :
                      activity.action_type === 'leave_cancelled' ? 'bg-slate-100 text-slate-500' :
                      activity.action_type === 'balance_adjusted' ? 'bg-indigo-50 text-indigo-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {getLabel(activity.action_type)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mt-0.5">{activity.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{timeAgo(activity.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>

          {filtered.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-4 w-full text-xs text-slate-500 hover:text-slate-700 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
            >
              {showAll ? 'Show less' : `Show ${filtered.length - 5} more`}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default RecentActivity;