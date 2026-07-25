import React from 'react';
import { cn } from './cn';

const VARIANTS = {
  solid: 'border-neutral-200 bg-white shadow-card',
  subtle: 'border-primary-100 bg-gradient-surface shadow-card',
  sand: 'border-sand-200 bg-gradient-sand shadow-card',
  glass: 'border-white/60 bg-gradient-glass shadow-card backdrop-blur-md',
  'glass-dark': 'glass-dark',
  brand: 'border-primary-700/40 bg-gradient-brand text-white shadow-pop',
  dusk: 'border-white/10 bg-gradient-dusk text-white shadow-pop',
};

export function Card({ variant = 'solid', hoverable = false, accent = false, accentTone = 'mint', className, children, ...props }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border transition-all duration-300 ease-premium',
        VARIANTS[variant] || VARIANTS.solid,
        hoverable && 'hover:-translate-y-1 hover:shadow-premium',
        className
      )}
      {...props}
    >
      {accent && (
        <span
          className={cn('absolute inset-x-0 top-0 h-0.5', accentTone === 'gold' ? 'bg-gradient-gold' : 'bg-gradient-mint')}
          aria-hidden
        />
      )}
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, actions, className, children, ...props }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-b border-neutral-200/80 bg-gradient-header px-5 py-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
      {...props}
    >
      {title ? (
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 truncate text-xs text-neutral-500">{subtitle}</p>}
        </div>
      ) : (
        children
      )}
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardBody({ className, children, ...props }) {
  return (
    <div className={cn('px-5 py-4', className)} {...props}>
      {children}
    </div>
  );
}

export default Card;
