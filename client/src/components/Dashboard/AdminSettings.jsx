import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState({});
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [form, setForm] = useState({
    annual_leave_allocation: '',
    sick_leave_allocation: '',
    study_leave_allocation: '',
    family_leave_allocation: '',
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
      setSettings(settingsRes.data);
      setForm({
        annual_leave_allocation: settingsRes.data.annual_leave_allocation || '15',
        sick_leave_allocation: settingsRes.data.sick_leave_allocation || 'Unlimited',
        study_leave_allocation: settingsRes.data.study_leave_allocation || '12',
        family_leave_allocation: settingsRes.data.family_leave_allocation || '5',
      });
      setDepartments(deptRes.data);
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
      toast.success('Setting updated');
      fetchAll();
    } catch (error) {
      toast.error('Failed to update setting');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <p className="text-sm text-slate-400">Loading settings...</p>;

  const allocationFields = [
    { key: 'annual_leave_allocation', label: 'Annual Leave Allocation', suffix: 'days/year', type: 'number' },
    { key: 'sick_leave_allocation', label: 'Sick Leave Allocation', suffix: '', type: 'text', hint: 'Enter a number, or "Unlimited"' },
    { key: 'study_leave_allocation', label: 'Study Leave Allocation', suffix: 'days/year', type: 'number' },
    { key: 'family_leave_allocation', label: 'Family Responsibility Allocation', suffix: 'days/year', type: 'number' },
  ];

  return (
    <div className="space-y-6">
      {/* Leave Type Allocations */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">Leave Type Allocations</h2>
        <p className="text-xs text-slate-400 mb-5">Changes apply company-wide and affect all balance calculations going forward.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {allocationFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
              <div className="flex gap-2">
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="flex-1 border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={() => handleSave(field.key)}
                  disabled={saving === field.key}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
                >
                  {saving === field.key ? 'Saving...' : 'Save'}
                </button>
              </div>
              {field.hint && <p className="text-xs text-slate-400 mt-1">{field.hint}</p>}
              {field.suffix && !field.hint && <p className="text-xs text-slate-400 mt-1">{field.suffix}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Departments */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">Departments</h2>
        <p className="text-xs text-slate-400 mb-4">
          Departments are assigned per-user in the Users tab. This is a read-only summary of departments currently in use.
        </p>
        {departments.length === 0 ? (
          <p className="text-sm text-slate-400">No departments assigned yet</p>
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

      {/* Role Management Info */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">User Roles</h2>
        <p className="text-xs text-slate-400 mb-4">
          To change a user's role, department, or supervisor assignment, go to the Users tab and use Edit on that user.
        </p>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-purple-50 text-purple-700 rounded-md p-3 text-center">
            <div className="font-semibold">Admin</div>
            <div className="text-xs mt-1">Full system access</div>
          </div>
          <div className="bg-blue-50 text-blue-700 rounded-md p-3 text-center">
            <div className="font-semibold">Supervisor</div>
            <div className="text-xs mt-1">Manages assigned interns</div>
          </div>
          <div className="bg-teal-50 text-teal-700 rounded-md p-3 text-center">
            <div className="font-semibold">Intern</div>
            <div className="text-xs mt-1">Submits leave requests</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;