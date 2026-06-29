import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';

const InternOverviewTable = () => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    try {
      const response = await leaveAPI.getTeamBalances();
      setBalances(response.data);
    } catch (error) {
      console.error('Failed to load intern overview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Intern</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Leave balance</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Used</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Remaining</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-4 text-center text-sm text-slate-400">Loading...</td></tr>
            ) : balances.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-4 text-center text-sm text-slate-400">No interns assigned</td></tr>
            ) : (
              balances.map((intern) => (
                <tr key={intern.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 text-sm text-slate-900">
                    {intern.full_name}
                    <div className="text-xs text-slate-400">{intern.email}</div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{intern.leave_balance}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{intern.used}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-teal-700">{intern.remaining}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InternOverviewTable;