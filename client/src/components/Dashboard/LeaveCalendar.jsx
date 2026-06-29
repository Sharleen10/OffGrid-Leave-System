import React, { useState, useEffect, useMemo } from 'react';
import { leaveAPI } from '../../services/api';

const LeaveCalendar = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await leaveAPI.getTeamRequests();
      setRequests(response.data.filter(r => r.status === 'approved' || r.status === 'pending'));
    } catch (error) {
      console.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }, [currentMonth]);

  const getLeaveForDay = (day) => {
    if (!day) return [];
    return requests.filter(r => {
      const start = new Date(r.start_date);
      const end = new Date(r.end_date);
      return day >= new Date(start.toDateString()) && day <= new Date(end.toDateString());
    });
  };

  const changeMonth = (delta) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} className="text-slate-400 hover:text-slate-700 px-2 py-1 rounded">‹</button>
        <h2 className="text-sm font-semibold text-slate-900">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={() => changeMonth(1)} className="text-slate-400 hover:text-slate-700 px-2 py-1 rounded">›</button>
      </div>

      <div className="flex gap-4 mb-3 text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500 inline-block" /> Approved</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Pending</span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400 mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day, idx) => {
              const leaves = getLeaveForDay(day);
              return (
                <div
                  key={idx}
                  className={`min-h-[56px] rounded p-1 text-xs ${day ? 'bg-slate-50' : ''}`}
                >
                  {day && (
                    <>
                      <div className="text-slate-600 font-medium">{day.getDate()}</div>
                      {leaves.slice(0, 2).map((leave) => (
                        <div
                          key={leave.id}
                          title={`${leave.intern?.full_name} - ${leave.leave_type}`}
                          className="truncate mt-0.5 flex items-center gap-1"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${leave.status === 'approved' ? 'bg-teal-500' : 'bg-amber-500'}`} />
                          <span className="truncate text-slate-600">{leave.intern?.full_name?.split(' ')[0]}</span>
                        </div>
                      ))}
                      {leaves.length > 2 && (
                        <div className="text-slate-400">+{leaves.length - 2} more</div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default LeaveCalendar;