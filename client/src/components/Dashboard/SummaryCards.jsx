import React from 'react';

const SummaryCards = ({ summary }) => {
  const cards = [
    {
      label: 'Pending Requests',
      value: summary?.pending ?? 0,
      accent: 'text-amber-600',
      dot: 'bg-amber-500',
    },
    {
      label: 'Approved This Month',
      value: summary?.approvedThisMonth ?? 0,
      accent: 'text-teal-600',
      dot: 'bg-teal-500',
    },
    {
      label: 'Rejected This Month',
      value: summary?.rejectedThisMonth ?? 0,
      accent: 'text-rose-600',
      dot: 'bg-rose-500',
    },
    {
      label: 'Assigned Interns',
      value: summary?.assignedInterns ?? 0,
      accent: 'text-slate-700',
      dot: 'bg-slate-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-1.5 h-1.5 rounded-full ${card.dot}`} />
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">{card.label}</dt>
          </div>
          <dd className={`text-2xl font-semibold ${card.accent}`}>{card.value}</dd>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;