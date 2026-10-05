import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0819] disabled:opacity-50 disabled:cursor-not-allowed select-none';

  let variantClasses = '';
  switch (variant) {
    case 'gold':
      variantClasses =
        'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-semibold shadow-glow hover:brightness-110 active:scale-[0.98] focus:ring-amber-400';
      break;
    case 'primary':
      variantClasses =
        'bg-purple-700 hover:bg-purple-600 text-white shadow-glow-purple active:scale-[0.98] focus:ring-purple-500 border border-purple-500/30';
      break;
    case 'secondary':
      variantClasses =
        'bg-purple-950/80 hover:bg-purple-900/90 text-purple-200 border border-purple-700/50 focus:ring-purple-600';
      break;
    case 'danger':
      variantClasses =
        'bg-red-950/80 hover:bg-red-900/90 text-red-200 border border-red-700/50 focus:ring-red-600';
      break;
    case 'outline':
      variantClasses =
        'bg-transparent hover:bg-purple-950/40 text-purple-200 border border-purple-500/40 focus:ring-purple-500';
      break;
    case 'ghost':
      variantClasses =
        'bg-transparent hover:bg-purple-900/30 text-purple-300 hover:text-purple-100 focus:ring-purple-500';
      break;
  }

  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'px-3 py-1.5 text-xs';
      break;
    case 'md':
      sizeClasses = 'px-4 py-2 text-sm';
      break;
    case 'lg':
      sizeClasses = 'px-6 py-3 text-base';
      break;
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
