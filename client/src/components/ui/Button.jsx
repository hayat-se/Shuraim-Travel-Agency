import React from 'react';
import { cn } from './cn';

// Single source of truth for buttons. Soft rounded corners, consistent sizing.
const VARIANTS = {
  primary:
    'bg-gradient-brand text-white border border-primary-700/40 shadow-card hover:bg-gradient-brand-hover hover:shadow-glow active:shadow-card',
  secondary:
    'bg-gradient-forest text-white border border-white/10 shadow-card hover:shadow-pop active:shadow-card',
  mint:
    'bg-gradient-mint text-forest border border-mint-600/30 shadow-card hover:shadow-glow-mint active:shadow-card',
  gold:
    'bg-gradient-gold text-forest-900 border border-gold-600/30 shadow-card hover:shadow-glow-gold active:shadow-card',
  outline:
    'bg-white/80 text-primary-700 border border-primary-200 backdrop-blur-sm hover:border-primary-300 hover:bg-primary-50 hover:shadow-card',
  danger:
    'bg-danger text-white border border-danger-600/40 shadow-card hover:bg-danger-600 hover:shadow-card-hover active:shadow-card',
  success:
    'bg-success text-white border border-success-600/40 shadow-card hover:bg-success-600 hover:shadow-card-hover active:shadow-card',
  ghost:
    'bg-transparent text-neutral-600 border border-transparent hover:bg-primary-50 hover:text-primary-700',
};

// Variants with a solid fill get the light sweep on hover; flat ones don't.
const SHEEN_VARIANTS = ['primary', 'secondary', 'mint', 'gold', 'danger', 'success'];

const SIZES = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-3.5 text-[13px]',
  lg: 'h-11 px-5 text-sm',
};

const GAPS = {
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-2',
};

const Button = React.forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, icon = null, className, children, disabled, ...props },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={cn(
        'group relative isolate inline-flex items-center justify-center overflow-hidden rounded-lg font-medium',
        'transition-all duration-200 ease-premium will-change-transform',
        'hover:-translate-y-px active:translate-y-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 select-none',
        SHEEN_VARIANTS.includes(variant) &&
          !isDisabled &&
          "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:-translate-x-full before:bg-gradient-sheen before:transition-transform before:duration-700 before:ease-premium before:content-[''] hover:before:translate-x-full",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      <span className={cn('relative z-10 inline-flex items-center justify-center', GAPS[size])}>
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
        ) : (
          icon
        )}
        {children}
      </span>
    </button>
  );
});

export default Button;
