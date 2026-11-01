import React, { useEffect } from 'react';
import { ToastMessage, ThemeMode } from '../types';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
  theme: ThemeMode;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss, theme }) => {
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      <div
        className={`p-4 rounded-xl border shadow-xl flex items-start gap-3 ${
          isDark
            ? 'bg-neutral-900 border-neutral-700 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {toast.type === 'warning' ? (
            <AlertCircle className="w-4 h-4 text-amber-500" />
          ) : toast.type === 'info' ? (
            <Info className="w-4 h-4 text-blue-500" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          )}
        </div>

        <div className="flex-1">
          <h4 className="text-xs font-bold leading-tight">{toast.title}</h4>
          {toast.description && (
            <p className="text-[11px] opacity-75 mt-0.5 leading-snug">
              {toast.description}
            </p>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="p-1 rounded opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Dismiss toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
