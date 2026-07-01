import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [form, setForm] = useState({
    annual_leave_allocation: '25',
    sick_leave_allocation: '30',
    study_leave_allocation: '12',
    family_leave_allocation: '5',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [settingsRes, deptRes] = await Promise.all([
        userAPI.getSystemSettings(),
        userAPI.getDepartments(),
      ]);
      
      const s = settingsRes.data;
      setForm({
        annual_leave_allocation: s.annual_leave_allocation || '25',
        sick_leave_allocation: s.sick_leave_allocation || '30',
        study_leave_allocation: s.study_leave_allocation || '12',
        family_leave_allocation: s.family_leave_allocation || '5',
      });
      setDepartments(deptRes.data || []);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key) => {
    setSaving(key);
    try {
      await userAPI.updateSystemSetting(key, form[key]);
      toast.success('Setting saved — new leave balances will reflect this change');
    } catch (error) {
      toast.error('Failed to save setting');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <p className="text-sm text-slate-400">Loading settings...</p>;

  return (
    <div className="space-y-6">

      {/* Leave Allocations */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">Leave Type Allocations</h2>
        <p className="text-xs text-slate-400 mb-5">
          Set how many days per year each leave type provides. Annual leave accrues monthly
          (e.g. 25 days ÷ 12 = 2.08 days/month). Other types are allocated in full each year.
          Changes apply immediately to all balance calculations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Annual Leave
              <span className="text-xs text-slate-400 font-normal ml-2">
                (accrues monthly — {(parseFloat(form.annual_leave_allocation) / 12).toFixed(2)} days/month)
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={form.annual_leave_allocation}
                onChange={(e) => setForm({ ...form, annual_leave_allocation: e.target.value })}
                className="flex-1 border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="flex items-center text-xs text-slate-400 pr-1">days/year</span>
              <button
                onClick={() => handleSave('annual_leave_allocation')}
                disabled={saving === 'annual_leave_allocation'}
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving === 'annual_leave_allocation' ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Sick Leave
              <span className="text-xs text-slate-400 font-normal ml-2">(allocated per year)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.sick_leave_allocation}
                onChange={(e) => setForm({ ...form, sick_leave_allocation: e.target.value })}
                className="flex-1 border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. 30 or Unlimited"
              />
              <span className="flex items-center text-xs text-slate-400 pr-1">days/year</span>
              <button
                onClick={() => handleSave('sick_leave_allocation')}
                disabled={saving === 'sick_leave_allocation'}
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving === 'sick_leave_allocation' ? 'Saving...' : 'Save'}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Enter a number or type "Unlimited"</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Study Leave
              <span className="text-xs text-slate-400 font-normal ml-2">(allocated per year)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={form.study_leave_allocation}
                onChange={(e) => setForm({ ...form, study_leave_allocation: e.target.value })}
                className="flex-1 border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="flex items-center text-xs text-slate-400 pr-1">days/year</span>
              <button
                onClick={() => handleSave('study_leave_allocation')}
                disabled={saving === 'study_leave_allocation'}
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving === 'study_leave_allocation' ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Family Responsibility Leave
              <span className="text-xs text-slate-400 font-normal ml-2">(allocated per year)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={form.family_leave_allocation}
                onChange={(e) => setForm({ ...form, family_leave_allocation: e.target.value })}
                className="flex-1 border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="flex items-center text-xs text-slate-400 pr-1">days/year</span>
              <button
                onClick={() => handleSave('family_leave_allocation')}
                disabled={saving === 'family_leave_allocation'}
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving === 'family_leave_allocation' ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Departments */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">Departments in Use</h2>
        <p className="text-xs text-slate-400 mb-4">
          These are all department names currently assigned to users. To add or change departments,
          edit a user in the Users tab and update their department field.
        </p>
        {departments.length === 0 ? (
          <p className="text-sm text-slate-400">
            No departments assigned yet — edit users in the Users tab to add department names.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
              <span key={dept} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">
                {dept}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Role Reference */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">User Roles</h2>
        <p className="text-xs text-slate-400 mb-4">
          Roles are assigned when creating users. To change a role, delete and recreate the user,
          or contact your system administrator.
        </p>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-purple-50 text-purple-700 rounded-md p-3 text-center">
            <div className="font-semibold">Admin</div>
            <div className="text-xs mt-1">Full system access, manage all users and settings</div>
          </div>
          <div className="bg-blue-50 text-blue-700 rounded-md p-3 text-center">
            <div className="font-semibold">Supervisor</div>
            <div className="text-xs mt-1">Approve/reject leave, manage assigned interns</div>
          </div>
          <div className="bg-teal-50 text-teal-700 rounded-md p-3 text-center">
            <div className="font-semibold">Intern</div>
            <div className="text-xs mt-1">Submit leave requests, view own balances</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminSettings;