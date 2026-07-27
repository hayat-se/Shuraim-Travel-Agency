import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { cn } from './cn';

const WIDTHS = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl', '2xl': 'max-w-4xl' };

export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade-in bg-forest/55 backdrop-blur-md" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full animate-scale-in overflow-hidden rounded-xl border border-white/70 bg-white/95 shadow-premium backdrop-blur-xl',
          WIDTHS[size] || WIDTHS.md
        )}
      >
        <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-mint" aria-hidden />

        {title && (
          <div className="flex items-start justify-between gap-4 border-b border-neutral-200/80 bg-gradient-header px-5 py-3.5">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-ink">{title}</h3>
              {subtitle && <p className="mt-0.5 truncate text-xs text-neutral-500">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="-mr-1 shrink-0 rounded-lg p-1.5 text-neutral-400 transition-all duration-200 hover:rotate-90 hover:bg-neutral-100 hover:text-primary-700"
              aria-label="Close"
            >
              <FiX size={18} />
            </button>
          </div>
        )}

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex justify-end gap-2 border-t border-neutral-200/80 bg-neutral-50/60 px-5 py-3.5">{footer}</div>
        )}
      </div>
    </div>
  );
}
