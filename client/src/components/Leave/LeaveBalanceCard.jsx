import React from 'react';

const LeaveBalanceCard = ({ balance }) => {
  if (!balance) return null;

  const leaveTypes = [
    { key: 'annual', label: 'Annual Leave', color: 'blue' },
    { key: 'sick', label: 'Sick Leave', color: 'green' },
    { key: 'study', label: 'Study Leave', color: 'purple' },
    { key: 'family', label: 'Family Responsibility', color: 'orange' },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Leave Balance Breakdown</h2>
      
      <div className="space-y-6">
        {leaveTypes.map((type) => (
          <div key={type.key} className="border-b border-gray-200 pb-4 last:border-0">
            <div className="flex justify-between items-center mb-2">
              <h3 className={`text-lg font-medium text-${type.color}-600`}>
                {type.label}
              </h3>
              <span className="text-2xl font-bold text-gray-900">
                {balance[type.key]?.current?.toFixed(2) || '0.00'} days
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mt-2">
              <div>
                <span className="font-medium">System Accrued:</span>
                <div>{balance[type.key]?.accrued?.toFixed(2) || '0.00'}</div>
              </div>
              <div>
                <span className="font-medium">Adjustments:</span>
                <div>{balance[type.key]?.adjustments?.toFixed(2) || '0.00'}</div>
              </div>
              <div>
                <span className="font-medium">Taken:</span>
                <div>{balance[type.key]?.taken?.toFixed(2) || '0.00'}</div>
              </div>
            </div>
            
            {balance[type.key]?.adjustmentNotes && (
              <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                Note: {balance[type.key].adjustmentNotes}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          * Annual leave accrues at 2.08 days per month from your start date
        </p>
        <p className="text-xs text-gray-500">
          * Adjustments include manual changes made by supervisors with valid reasons
        </p>
      </div>
    </div>
  );
};

export default LeaveBalanceCard;