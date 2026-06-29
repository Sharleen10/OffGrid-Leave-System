import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { leaveAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = { Approved: '#0d9488', Rejected: '#e11d48', Pending: '#d97706' };
const TYPE_COLORS = ['#4f46e5', '#0891b2', '#9333ea', '#ea580c'];

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIntern, setSelectedIntern] = useState('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await leaveAPI.getAdminReports();
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const filteredRaw = useMemo(() => {
    if (!data) return [];
    if (selectedIntern === 'all') return data.raw;
    return data.raw.filter(r => r.intern_id === selectedIntern);
  }, [data, selectedIntern]);

  const byMonth = useMemo(() => {
    const map = {};
    filteredRaw.forEach(r => {
      const month = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      map[month] = (map[month] || 0) + 1;
    });
    return Object.entries(map).map(([month, count]) => ({ month, count }));
  }, [filteredRaw]);

  const byStatus = useMemo(() => {
    const approved = filteredRaw.filter(r => r.status === 'approved').length;
    const rejected = filteredRaw.filter(r => r.status === 'rejected').length;
    const pending = filteredRaw.filter(r => r.status === 'pending').length;
    return [
      { name: 'Approved', value: approved },
      { name: 'Rejected', value: rejected },
      { name: 'Pending', value: pending },
    ].filter(d => d.value > 0);
  }, [filteredRaw]);

  const byType = useMemo(() => {
    const map = {};
    filteredRaw.forEach(r => { map[r.leave_type] = (map[r.leave_type] || 0) + 1; });
    return Object.entries(map).map(([type, count]) => ({ type, count }));
  }, [filteredRaw]);

  if (loading) return <p className="text-sm text-slate-400">Loading reports...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <label className="text-sm text-slate-600 mr-2">Filter by intern:</label>
        <select
          value={selectedIntern}
          onChange={(e) => setSelectedIntern(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Interns</option>
          {data?.interns.map((intern) => (
            <option key={intern.id} value={intern.id}>{intern.full_name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Leave Requests by Month</h3>
          {byMonth.length === 0 ? (
            <p className="text-sm text-slate-400">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Leave Status Breakdown</h3>
          {byStatus.length === 0 ? (
            <p className="text-sm text-slate-400">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {byStatus.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 lg:col-span-2">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Most Common Leave Types</h3>
          {byType.length === 0 ? (
            <p className="text-sm text-slate-400">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} fontSize={12} />
                <YAxis dataKey="type" type="category" fontSize={12} width={80} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {byType.map((entry, index) => (
                    <Cell key={entry.type} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;