import React, { createContext, useCallback, useContext, useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import { cn } from './cn';

// Toast system — replaces alert(). Wrap the app in <ToastProvider>, then useToast().
const ToastContext = createContext(null);

const TONES = {
  success: { icon: FiCheckCircle, cls: 'border-l-success text-success' },
  error: { icon: FiAlertCircle, cls: 'border-l-danger text-danger' },
  info: { icon: FiInfo, cls: 'border-l-primary text-primary' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, type }]);
      if (duration) setTimeout(() => remove(id), duration);
    },
    [remove]
  );

  const api = {
    success: (m, d) => push(m, 'success', d),
    error: (m, d) => push(m, 'error', d),
    info: (m, d) => push(m, 'info', d),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex w-full max-w-xs flex-col gap-2">
        {toasts.map((t) => {
          const { icon: Icon, cls } = TONES[t.type] || TONES.info;
          return (
            <div
              key={t.id}
              role="alert"
              className={cn('flex items-start gap-2 rounded-sm border border-neutral-200 border-l-4 bg-white p-3 shadow-pop', cls)}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-sm text-neutral-800">{t.message}</p>
              <button onClick={() => remove(t.id)} className="text-neutral-400 hover:text-neutral-700" aria-label="Dismiss">
                <FiX size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
