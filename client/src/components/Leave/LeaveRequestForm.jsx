import React, { useState } from 'react';
import { leaveAPI } from '../../services/api';
import toast from 'react-hot-toast';

const LeaveRequestForm = ({ onSubmit, balance, onClose }) => {
  const [formData, setFormData] = useState({
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [fileAttachment, setFileAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave' },
    { value: 'sick', label: 'Sick Leave (Certificate Optional)' },
    { value: 'study', label: 'Study Leave (Proof Optional)' },
    { value: 'family', label: 'Family Responsibility Leave' },
  ];

  const supportsDocuments = formData.leave_type === 'sick' || formData.leave_type === 'study';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileAttachment(e.target.files[0]);
    }
  };

  const calculateDays = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const daysRequested = calculateDays();

    const typeKey = formData.leave_type;
    const currentBalance = balance?.[typeKey]?.current !== undefined
      ? balance[typeKey].current
      : (balance?.[typeKey] || 0);

    if (daysRequested > currentBalance) {
      alert(`Insufficient balance. You have ${Number(currentBalance).toFixed(1)} days available.`);
      return;
    }

    setSubmitting(true);

    let attachment_url = null;
    let attachment_name = null;

    // Upload the file first (if one was selected) to get back a stored URL
    if (fileAttachment) {
      setUploadingFile(true);
      try {
        const fileFormData = new FormData();
        fileFormData.append('file', fileAttachment);
        const uploadRes = await leaveAPI.uploadAttachment(fileFormData);
        attachment_url = uploadRes.data.attachment_url;
        attachment_name = uploadRes.data.attachment_name;
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to upload document');
        setSubmitting(false);
        setUploadingFile(false);
        return;
      }
      setUploadingFile(false);
    }

    const jsonPayload = {
      leave_type: formData.leave_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
      reason: formData.reason,
      days_requested: daysRequested,
      attachment_url,
      attachment_name,
    };

    await onSubmit(jsonPayload);

    setSubmitting(false);
    setFileAttachment(null);
    setFormData({ leave_type: 'annual', start_date: '', end_date: '', reason: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5">Leave Type</label>
        <select
          name="leave_type"
          value={formData.leave_type}
          onChange={handleChange}
          required
          className="w-full bg-[#16171C] border border-white/[0.08] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500/50"
        >
          {leaveTypes.map((type) => (
            <option key={type.value} value={type.value} className="bg-[#111215]">{type.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5">Start Date</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
            className="w-full bg-[#16171C] border border-white/[0.08] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500/50"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5">End Date</label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            required
            min={formData.start_date}
            className="w-full bg-[#16171C] border border-white/[0.08] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500/50"
          />
        </div>
      </div>

      {formData.start_date && formData.end_date && (
        <div className="text-xs font-mono text-green-400 bg-green-500/5 border border-green-500/10 rounded-lg p-2.5">
          Calculated Target Blocks: {calculateDays()} active days
        </div>
      )}

      <div>
        <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5">Reason / Justification</label>
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          required
          rows="3"
          placeholder="Provide context details..."
          className="w-full bg-[#16171C] border border-white/[0.08] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500/50 placeholder-neutral-600"
        />
      </div>

      {supportsDocuments && (
        <div className="border border-dashed border-white/[0.1] rounded-xl p-4 bg-white/[0.01] animate-in fade-in duration-200">
          <label className="block text-xs font-mono text-amber-400/80 uppercase tracking-wider mb-1.5">
            📎 Upload Supporting Document (Optional - PDF, PNG, JPG)
          </label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-mono file:bg-white/[0.05] file:text-white hover:file:bg-white/[0.1] cursor-pointer"
          />
          {fileAttachment && (
            <p className="text-xs text-green-400 mt-2">✓ {fileAttachment.name} ready to upload</p>
          )}
        </div>
      )}

      <div className="flex space-x-3 pt-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 border border-white/[0.08] text-white py-3 rounded-xl hover:bg-white/[0.02] text-xs font-mono uppercase tracking-wider transition-all"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex-grow bg-green-500 hover:bg-green-600 text-black font-semibold py-3 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50"
        >
          {submitting ? (uploadingFile ? 'Uploading document...' : 'Processing...') : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};

export default LeaveRequestForm;