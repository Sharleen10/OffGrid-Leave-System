import React, { useState, useEffect, useMemo } from 'react';
import { leaveAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminCalendar = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    fetchCalendar();
  }, []);

  const fetchCalendar = async () => {
    try {
      const response = await leaveAPI.getCompanyCalendar();
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  const departments = useMemo(() => {
    const set = new Set(requests.map(r => r.intern?.department).filter(Boolean));
    return Array.from(set);
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (departmentFilter === 'all') return requests;
    return requests.filter(r => r.intern?.department === departmentFilter);
  }, [requests, departmentFilter]);

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
    return filteredRequests.filter(r => {
      const start = new Date(r.start_date);
      const end = new Date(r.end_date);
      return day >= new Date(start.toDateString()) && day <= new Date(end.toDateString());
    });
  };

  const changeMonth = (delta) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Company-wide leave overview — useful for spotting staffing gaps.</p>
        {departments.length > 0 && (
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}
      </div>

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
                  <div key={idx} className={`min-h-[70px] rounded p-1 text-xs ${day ? 'bg-slate-50' : ''}`}>
                    {day && (
                      <>
                        <div className="text-slate-600 font-medium">{day.getDate()}</div>
                        {leaves.slice(0, 3).map((leave) => (
                          <div
                            key={leave.id}
                            title={`${leave.intern?.full_name} (${leave.intern?.department || 'No dept'}) - ${leave.leave_type}`}
                            className="truncate mt-0.5 flex items-center gap-1"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${leave.status === 'approved' ? 'bg-teal-500' : 'bg-amber-500'}`} />
                            <span className="truncate text-slate-600">{leave.intern?.full_name?.split(' ')[0]}</span>
                          </div>
                        ))}
                        {leaves.length > 3 && (
                          <div className="text-slate-400">+{leaves.length - 3} more</div>
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
    </div>
  );
};

export default AdminCalendar;