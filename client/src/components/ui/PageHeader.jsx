import React from 'react';
import { cn } from './cn';

// Consistent page title row with optional subtitle and right-aligned actions.
export default function PageHeader({ title, subtitle, actions, className }) {
  return (
    <div className={cn('mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div>
        <h1 className="text-lg font-semibold text-ink sm:text-xl">{title}</h1>
        {subtitle && <p className="mt-0.5 text-[13px] text-neutral-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
