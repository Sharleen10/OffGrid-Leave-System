import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { leaveAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_COLORS = { Approved: '#16a34a', Rejected: '#dc2626', Pending: '#ca8a04' };
const TYPE_COLORS = ['#4f46e5', '#0891b2', '#9333ea', '#ea580c'];

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIntern, setSelectedIntern] = useState('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await leaveAPI.getReports();
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
    filteredRaw.forEach(r => {
      map[r.leave_type] = (map[r.leave_type] || 0) + 1;
    });
    return Object.entries(map).map(([type, count]) => ({ type, count }));
  }, [filteredRaw]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Reports</h2>
        <div>
          <label className="text-sm text-gray-600 mr-2">Filter by intern:</label>
          <select
            value={selectedIntern}
            onChange={(e) => setSelectedIntern(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
          >
            <option value="all">All Interns</option>
            {data?.interns.map((intern) => (
              <option key={intern.id} value={intern.id}>{intern.full_name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave requests by month */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Leave Requests by Month</h3>
          {byMonth.length === 0 ? (
            <p className="text-sm text-gray-400">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Approved vs Rejected */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Approved vs Rejected vs Pending</h3>
          {byStatus.length === 0 ? (
            <p className="text-sm text-gray-400">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={byStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
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

        {/* Most common leave types */}
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Most Common Leave Types</h3>
          {byType.length === 0 ? (
            <p className="text-sm text-gray-400">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
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

export default Reports;