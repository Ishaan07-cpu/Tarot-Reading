import React from 'react';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  switch (normalized) {
    case 'PENDING':
    case 'HELD':
      colorClasses = 'bg-amber-950/60 text-amber-300 border-amber-500/40 animate-pulse-slow';
      break;
    case 'APPROVED':
    case 'BOOKED':
      colorClasses = 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-sm';
      break;
    case 'AVAILABLE':
      colorClasses = 'bg-purple-950/60 text-purple-300 border-purple-500/40';
      break;
    case 'COMPLETED':
      colorClasses = 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40';
      break;
    case 'REJECTED':
      colorClasses = 'bg-red-950/60 text-red-300 border-red-500/40';
      break;
    case 'CANCELLED':
    case 'DISABLED':
      colorClasses = 'bg-zinc-900 text-zinc-400 border-zinc-700';
      break;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs tracking-wider';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${colorClasses} ${sizeClasses}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          normalized === 'APPROVED' || normalized === 'BOOKED'
            ? 'bg-emerald-400'
            : normalized === 'PENDING' || normalized === 'HELD'
            ? 'bg-amber-400'
            : normalized === 'REJECTED'
            ? 'bg-red-400'
            : normalized === 'AVAILABLE'
            ? 'bg-purple-400'
            : 'bg-zinc-400'
        }`}
      />
      {normalized}
    </span>
  );
};
