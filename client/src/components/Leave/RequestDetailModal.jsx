import React, { useState } from 'react';

const RequestDetailModal = ({ request, onClose, onApprove, onReject }) => {
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!request) return null;

  const getLeaveTypeLabel = (type) => {
    const types = {
      annual: 'Annual Leave',
      sick: 'Sick Leave',
      study: 'Study Leave',
      family: 'Family Responsibility Leave',
    };
    return types[type] || type;
  };

  const handleAction = async (action) => {
    setSubmitting(true);
    if (action === 'approved') {
      await onApprove(request.id, comments);
    } else {
      await onReject(request.id, comments);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Leave Request Details
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Intern</span>
                <p className="text-sm text-gray-900">{request.intern?.full_name}</p>
                <p className="text-xs text-gray-500">{request.intern?.email}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Leave Type</span>
                <p className="text-sm text-gray-900">{getLeaveTypeLabel(request.leave_type)}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Dates</span>
                <p className="text-sm text-gray-900">
                  {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                  {' '}({request.days_requested} days)
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Reason</span>
                <p className="text-sm text-gray-900">{request.reason}</p>
              </div>

              {request.attachment_url ? (
                <div>
                  <span className="text-sm font-medium text-gray-500">Supporting Document</span>
                  <p className="text-sm">
                    <a
                      href={request.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 underline"
                    >
                      {request.attachment_name || 'View document'}
                    </a>
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-sm font-medium text-gray-500">Supporting Document</span>
                  <p className="text-sm text-gray-400">None provided</p>
                </div>
              )}

              {request.status === 'pending' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comments (optional)
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add a comment for the intern..."
                  />
                </div>
              )}

              {request.status !== 'pending' && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <p className="text-sm font-semibold capitalize">{request.status}</p>
                  {request.comments && (
                    <p className="text-xs text-gray-500 mt-1">Comment: {request.comments}</p>
                  )}
                </div>
              )}
            </div>

            {request.status === 'pending' && (
              <div className="mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <button
                  onClick={() => handleAction('approved')}
                  disabled={submitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 disabled:opacity-50 sm:text-sm"
                >
                  {submitting ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleAction('rejected')}
                  disabled={submitting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 disabled:opacity-50 sm:mt-0 sm:text-sm"
                >
                  {submitting ? 'Processing...' : 'Reject'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailModal;