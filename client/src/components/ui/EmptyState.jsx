import React from 'react';
import { FiInbox } from 'react-icons/fi';
import { cn } from './cn';

export default function EmptyState({ title = 'Nothing here yet', message, icon, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-10 text-center', className)}>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        {icon || <FiInbox size={22} />}
      </div>
      <p className="text-sm font-medium text-neutral-700">{title}</p>
      {message && <p className="mt-1 max-w-sm text-sm text-neutral-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
