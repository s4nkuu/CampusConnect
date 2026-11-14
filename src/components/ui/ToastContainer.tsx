import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useCampus();
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100%-2rem)]"
    >
      {toasts.map((toast) => {
        const icon =
          toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          );

        const borderTone =
          toast.type === 'success'
            ? 'border-emerald-200 dark:border-emerald-800/80'
            : toast.type === 'error'
              ? 'border-rose-200 dark:border-rose-800/80'
              : 'border-blue-200 dark:border-blue-800/80';

        return (
          <div
            key={toast.id}
            role="status"
            className={`flex items-start gap-3 bg-white dark:bg-slate-900 border ${borderTone} rounded-xl p-3.5 shadow-lg shadow-slate-900/10 dark:shadow-black/40 transition-all`}
          >
            {icon}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {toast.title}
              </p>
              {toast.message && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label={`Dismiss notification: ${toast.title}`}
              className="p-1 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 rounded-md focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
