import React from 'react';
import { cn } from './cn';

// Simple controlled tabs. tabs: [{ value, label, count? }]
export default function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cn('flex gap-1 border-b border-neutral-200', className)} role="tablist">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              active ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-800'
            )}
          >
            {t.label}
            {t.count != null && (
              <span className={cn('ml-2 rounded-full px-1.5 py-0.5 text-xs', active ? 'bg-primary-50 text-primary' : 'bg-neutral-100 text-neutral-500')}>
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
