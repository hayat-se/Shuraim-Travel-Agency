import React from 'react';
import { cn } from './cn';

// Single source of truth for buttons. Square (2px) corners, consistent sizing.
const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-600 active:bg-primary-700 border border-transparent',
  secondary: 'bg-ink text-white hover:bg-primary-900 border border-transparent',
  outline: 'bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50',
  danger: 'bg-danger text-white hover:bg-red-700 border border-transparent',
  success: 'bg-success text-white hover:bg-green-700 border border-transparent',
  ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 border border-transparent',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

const Button = React.forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, icon = null, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed select-none',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      ) : (
        icon
      )}
      {children}
    </button>
  );
});

export default Button;
