import React from 'react';
import { cn } from './cn';

// Wraps a control with a label + optional error/hint. Use with Input/Select/Textarea below.
export function FormField({ label, htmlFor, error, hint, required, className, children }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-neutral-700">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = React.forwardRef(function Input({ className, error, ...props }, ref) {
  return <input ref={ref} className={cn('field', error && 'border-danger focus:border-danger focus:ring-danger/30', className)} {...props} />;
});

export const Select = React.forwardRef(function Select({ className, error, children, ...props }, ref) {
  return (
    <select ref={ref} className={cn('field pr-8', error && 'border-danger', className)} {...props}>
      {children}
    </select>
  );
});

export const Textarea = React.forwardRef(function Textarea({ className, error, rows = 4, ...props }, ref) {
  return <textarea ref={ref} rows={rows} className={cn('field', error && 'border-danger', className)} {...props} />;
});

export default Input;
