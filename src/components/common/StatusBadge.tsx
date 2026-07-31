import React from 'react';
import { ComplaintStatus } from '../../types';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (status) {
    case 'In Progress':
    case 'Under Review':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200/80';
      break;
    case 'Resolved':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      break;
    case 'Rejected':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200/80';
      break;
    case 'Submitted':
      colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs font-medium'
      : size === 'lg'
      ? 'px-3.5 py-1 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center rounded-md border ${colorClasses} ${sizeClasses} whitespace-nowrap shadow-xs`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {status}
    </span>
  );
};
