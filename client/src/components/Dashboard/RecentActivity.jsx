import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-4">Recent activity</h2>
      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : activities.length === 0 ? (
        <p className="text-sm text-slate-400">No recent activity</p>
      ) : (
        <ul className="space-y-4">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-start gap-3">
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${getDot(activity.action_type)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">{activity.description}</p>
                <p className="text-xs text-slate-400 mt-0.5">{timeAgo(activity.created_at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivity;