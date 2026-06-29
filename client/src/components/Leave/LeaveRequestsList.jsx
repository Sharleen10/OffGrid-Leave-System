import React from 'react';

const LeaveRequestsList = ({ requests, onStatusUpdate, isSupervisor = false, showCancel = false, onCancel, cancellingId = null }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getLeaveTypeLabel = (type) => {
    const types = {
      annual: 'Annual Leave',
      sick: 'Sick Leave',
      study: 'Study Leave',
      family: 'Family Responsibility',
    };
    return types[type] || type;
  };

  const showActionsColumn = isSupervisor || showCancel;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
              {showActionsColumn && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={showActionsColumn ? 7 : 6} className="px-6 py-4 text-center text-gray-500">
                  No leave requests found
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getLeaveTypeLabel(request.leave_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.days_requested}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {request.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {request.attachment_url ? (
                      <a
                        href={request.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 underline"
                      >
                        {request.attachment_name || 'View document'}
                      </a>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                  {showActionsColumn && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {isSupervisor && request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onStatusUpdate(request.id, 'approved')}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onStatusUpdate(request.id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {showCancel && request.status === 'pending' && (
                        <button
                          onClick={() => onCancel(request.id)}
                          disabled={cancellingId === request.id}
                          className="text-gray-500 hover:text-red-600 disabled:opacity-50"
                        >
                          {cancellingId === request.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveRequestsList;