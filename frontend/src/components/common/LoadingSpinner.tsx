import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  message = 'Consulting the celestial realm...',
  size = 'md',
}) => {
  const spinnerSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="relative">
        <div
          className={`${spinnerSize} rounded-full border-2 border-purple-800/40 border-t-amber-400 animate-spin`}
        />
        <div className="absolute inset-0 flex items-center justify-center text-amber-400 text-xs">
          ✦
        </div>
      </div>
      {message && <p className="text-sm font-serif text-purple-300 tracking-wide">{message}</p>}
    </div>
  );
};
