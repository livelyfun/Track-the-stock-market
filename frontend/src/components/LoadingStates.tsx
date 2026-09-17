import React from 'react';
import { AlertTriangle, RefreshCw, FolderSearch, Plus } from 'lucide-react';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-3',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] text-blue-500 motion-reduce:animate-[spin_1.5s_linear_infinite] ${sizeClasses[size]} ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="w-full animate-pulse space-y-3 p-4">
      {/* Table Header */}
      <div className="flex gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800/40">
          {Array.from({ length: columns }).map((_, c) => (
            <div
              key={c}
              className={`h-4.5 rounded bg-slate-200/80 dark:bg-slate-800/80 ${
                c === 0 ? 'w-24 font-bold' : 'flex-1'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const StatsCardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
        >
          <div className="h-3.5 w-16 rounded bg-slate-200 dark:bg-slate-800 mb-2" />
          <div className="h-6 w-24 rounded bg-slate-200 dark:bg-slate-800 mb-1" />
          <div className="h-3 w-12 rounded bg-slate-100 dark:bg-slate-800/60" />
        </div>
      ))}
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center justify-between mb-6">
        <div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-7 w-12 rounded-lg bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
      <div className="h-64 w-full rounded-lg bg-slate-100 dark:bg-slate-800/40 flex items-end gap-2 p-4">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-slate-200 dark:bg-slate-800"
            style={{ height: `${20 + ((i * 17) % 70)}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export const ErrorAlert: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Something went wrong', message, onRetry }) => {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold">{title}</h4>
          <p className="mt-1 text-xs text-red-700 dark:text-red-400">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-red-900/60 dark:text-red-200 dark:hover:bg-red-900 transition shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}> = ({ title, description, actionText, onAction, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 p-10 text-center dark:border-slate-800 dark:bg-slate-900/40 backdrop-blur-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 mb-4 shadow-inner">
        {icon || <FolderSearch className="h-7 w-7 text-slate-400" />}
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition"
        >
          <Plus className="h-4 w-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};
