import React from 'react';
import { cn } from './cn';

export function Card({ className, children, ...props }) {
  return (
    <div className={cn('rounded-sm border border-neutral-200 bg-white shadow-card', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn('border-b border-neutral-200 px-5 py-4', className)}>{children}</div>;
}

export function CardBody({ className, children }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>;
}

export default Card;
