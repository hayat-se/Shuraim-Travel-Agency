import React from 'react';
import { cn } from './cn';

export default function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-sm bg-neutral-200', className)} />;
}

export function Spinner({ className }) {
  return (
    <span
      className={cn('inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent', className)}
      aria-label="Loading"
    />
  );
}
