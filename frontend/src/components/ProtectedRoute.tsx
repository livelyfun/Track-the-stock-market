import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-600/30">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            StockMatrix
          </span>
        </div>

        {/* Spinner */}
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-blue-500 border-t-transparent" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Verifying session...
        </p>
      </div>
    );
  }

  if (!token && !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
