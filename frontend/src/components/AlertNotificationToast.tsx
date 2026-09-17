import React from 'react';
import { AlertTriggerEvent } from '../hooks/useStockWebSocket';
import { BellRing, X } from 'lucide-react';

interface AlertNotificationToastProps {
  notification: AlertTriggerEvent | null;
  onDismiss: () => void;
}

export const AlertNotificationToast: React.FC<AlertNotificationToastProps> = ({
  notification,
  onDismiss,
}) => {
  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-white p-4 text-slate-900 shadow-2xl shadow-amber-200/50 backdrop-blur-xl dark:border-amber-500/50 dark:bg-slate-900/95 dark:text-white dark:shadow-amber-500/10 slide-in-from-bottom-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30">
          <BellRing className="h-5 w-5 animate-bounce" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Price Alert Triggered!
          </h4>
          <p className="mt-0.5 text-xs font-medium text-slate-700 dark:text-slate-200">{notification.message}</p>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
