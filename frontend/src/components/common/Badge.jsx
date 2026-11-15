import React from 'react';

export const Badge = ({ variant = 'default', children, className = '' }) => {
  const variantStyles = {
    LOST: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
    FOUND: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    OPEN: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
    PENDING_CLAIM: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    UNDER_REVIEW: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    CLAIMED: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    REJECTED: 'bg-red-50 text-red-700 border-red-200 ring-red-500/20',
    ADDITIONAL_INFORMATION_REQUIRED: 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/20',
    CANCELLED: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/20',
    default: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/20',
  };

  const currentStyle = variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;

