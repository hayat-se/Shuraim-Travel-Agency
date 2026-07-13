import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { cn } from './cn';

const WIDTHS = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
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
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className={cn('relative w-full rounded-sm border border-neutral-200 bg-white shadow-pop', WIDTHS[size])}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3.5">
            <h3 className="text-base font-semibold text-ink">{title}</h3>
            <button onClick={onClose} className="rounded-sm p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700" aria-label="Close">
              <FiX size={18} />
            </button>
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}
