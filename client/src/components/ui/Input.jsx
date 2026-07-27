import React from 'react';
import { cn } from './cn';

// Wraps a control with a label + optional error/hint. Use with Input/Select/Textarea below.
export function FormField({ label, htmlFor, error, hint, required, className, children }) {
  return (
    <div className={cn('group space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-xs font-semibold uppercase tracking-wide text-neutral-600 transition-colors duration-200 group-focus-within:text-primary-700"
        >
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="animate-fade-in text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
}

const ERROR_STATE =
  'border-danger bg-danger-50/40 hover:border-danger focus:border-danger focus:ring-danger/25';

export const Input = React.forwardRef(function Input({ className, error, ...props }, ref) {
  return <input ref={ref} aria-invalid={error ? true : undefined} className={cn('field', error && ERROR_STATE, className)} {...props} />;
});

export const Select = React.forwardRef(function Select({ className, error, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      aria-invalid={error ? true : undefined}
      className={cn('field cursor-pointer pr-8', error && ERROR_STATE, className)}
      {...props}
    >
      {children}
    </select>
  );
});

export const Textarea = React.forwardRef(function Textarea({ className, error, rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={error ? true : undefined}
      className={cn('field resize-y leading-relaxed', error && ERROR_STATE, className)}
      {...props}
    />
  );
});

export default Input;
