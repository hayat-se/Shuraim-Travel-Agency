import React from 'react';
import { cn } from './cn';

// Dashboard KPI tile. `tone` colors the icon chip and the hover accent bar.
const TONES = {
  primary: { chip: 'bg-gradient-chip text-primary-700 border-primary-200', bar: 'bg-gradient-brand' },
  mint: { chip: 'bg-mint-50 text-primary-700 border-mint-200', bar: 'bg-gradient-mint' },
  gold: { chip: 'bg-gold-50 text-gold-700 border-gold-200', bar: 'bg-gradient-gold' },
  success: { chip: 'bg-green-50 text-success border-green-200', bar: 'bg-success' },
  warning: { chip: 'bg-amber-50 text-warning border-amber-200', bar: 'bg-warning' },
  danger: { chip: 'bg-red-50 text-danger border-red-200', bar: 'bg-danger' },
  neutral: { chip: 'bg-neutral-100 text-neutral-600 border-neutral-200', bar: 'bg-neutral-400' },
};

export default function StatCard({ label, value, icon, tone = 'primary', hint, trend, className }) {
  const t = TONES[tone] || TONES.primary;
  const trendUp = typeof trend === 'number' ? trend >= 0 : null;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-5 shadow-card',
        'transition-all duration-300 ease-premium hover:-translate-y-1 hover:border-primary-200 hover:shadow-premium',
        className
      )}
    >
      {/* Accent bar wipes in on hover */}
      <span
        className={cn(
          'absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 ease-premium group-hover:scale-x-100',
          t.bar
        )}
        aria-hidden
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tightish text-ink">{value}</p>

          {trendUp !== null && (
            <p className={cn('mt-1 text-xs font-medium tabular-nums', trendUp ? 'text-success' : 'text-danger')}>
              {trendUp ? '▲' : '▼'} {Math.abs(trend)}%
            </p>
          )}

          {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
        </div>

        {icon && (
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border shadow-inner-soft',
              'transition-transform duration-300 ease-premium group-hover:scale-105',
              t.chip
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
