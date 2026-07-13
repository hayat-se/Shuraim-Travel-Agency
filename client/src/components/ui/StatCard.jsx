import React from 'react';
import { cn } from './cn';

// Dashboard KPI tile. `tone` colors the icon chip.
const TONES = {
  primary: 'bg-primary-50 text-primary',
  success: 'bg-green-50 text-success',
  warning: 'bg-amber-50 text-warning',
  danger: 'bg-red-50 text-danger',
  neutral: 'bg-neutral-100 text-neutral-600',
};

export default function StatCard({ label, value, icon, tone = 'primary', hint, className }) {
  return (
    <div className={cn('rounded-sm border border-neutral-200 bg-white p-5 shadow-card', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
          {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
        </div>
        {icon && <div className={cn('flex h-10 w-10 items-center justify-center rounded-sm', TONES[tone])}>{icon}</div>}
      </div>
    </div>
  );
}
