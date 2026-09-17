import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useStockWebSocket } from '../hooks/useStockWebSocket';
import { WatchlistTable } from '../components/WatchlistTable';
import { OnboardingTour } from '../components/OnboardingTour';
import { watchlistService } from '../services/watchlist';
import { TrendingUp, RefreshCw, Radio, Sparkles, Activity, Globe, DollarSign } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { quotes, isConnected, lastUpdated, reconnect } = useStockWebSocket();

  // Show onboarding tour automatically if user has not completed it
  const [showOnboarding, setShowOnboarding] = useState(
    user ? !user.has_completed_onboarding : false
  );

  const handleAddSymbol = async (symbol: string) => {
    await watchlistService.addSymbol(symbol);
    reconnect();
  };

  const handleRemoveSymbol = async (symbol: string) => {
    await watchlistService.removeSymbol(symbol);
    reconnect();
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white border border-slate-200 p-6 shadow-sm dark:border-slate-800 dark:bg-gradient-to-r dark:from-blue-900/40 dark:via-slate-900 dark:to-slate-900 dark:shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t('dashboard.welcome')}, {user?.email.split('@')[0]} 👋
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('dashboard.connected_to', { market: user?.preferred_market || 'US' })}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs text-slate-700 border border-slate-200 dark:bg-slate-850 dark:border-slate-700/60 dark:text-slate-300 shadow-inner">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="font-semibold">{isConnected ? t('dashboard.socket_connected') : t('dashboard.connecting_stream')}</span>
          </div>
          <button
            onClick={reconnect}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t('dashboard.sync')}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('dashboard.tracked_tickers')}</p>
            <Activity className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{quotes.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Live WebSocket feed</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('dashboard.market_region')}</p>
            <Globe className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{user?.preferred_market || 'US'}</p>
          <p className="text-[11px] text-slate-400 mt-1">Primary exchange</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('dashboard.base_currency')}</p>
            <DollarSign className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{user?.preferred_currency || 'USD'}</p>
          <p className="text-[11px] text-slate-400 mt-1">Live converted portfolio</p>
        </div>
      </div>

      {/* Live Quotes Table */}
      <WatchlistTable
        quotes={quotes}
        isLoading={!isConnected && quotes.length === 0}
        onAddSymbol={handleAddSymbol}
        onRemoveSymbol={handleRemoveSymbol}
      />

      {/* Automated First-Time Onboarding Tour Modal */}
      <OnboardingTour
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={async () => {
          setShowOnboarding(false);
          reconnect();
        }}
      />
    </div>
  );
};
