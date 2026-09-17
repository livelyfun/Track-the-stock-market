import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { watchlistService, marketService, categoryService, alertService } from '../services/watchlist';
import { useStockWebSocket } from '../hooks/useStockWebSocket';
import { WatchlistTable } from '../components/WatchlistTable';
import { StockChart } from '../components/StockChart';
import { StockStatsCards } from '../components/StockStatsCards';
import { CategoryManagerModal } from '../components/CategoryManagerModal';
import { AlertManagerModal } from '../components/AlertManagerModal';
import { AlertNotificationToast } from '../components/AlertNotificationToast';
import { ErrorAlert } from '../components/LoadingStates';
import { Watchlist, Market, CandleData, Category, StockCategoryAssignment, StockAlert } from '../types';
import { RefreshCw, Sparkles, X, Tag, Bell, TrendingUp } from 'lucide-react';

export const WatchlistPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [watchlist, setWatchlist] = useState<Watchlist | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assignments, setAssignments] = useState<StockCategoryAssignment[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(true);

  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState<string>('1mo');
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  const {
    quotes,
    isConnected,
    lastUpdated,
    activeAlertNotification,
    dismissAlertNotification,
    reconnect,
  } = useStockWebSocket();

  const loadData = async () => {
    try {
      setIsLoadingWatchlist(true);
      setFetchError(null);
      const [wlData, marketsData, categoriesData, assignmentsData, alertsData] = await Promise.all([
        watchlistService.getWatchlist(),
        marketService.getMarkets(),
        categoryService.getCategories(),
        categoryService.getAssignments(),
        alertService.getAlerts(),
      ]);
      setWatchlist(wlData);
      setMarkets(marketsData);
      setCategories(categoriesData);
      setAssignments(assignmentsData);
      setAlerts(alertsData);
      if (!selectedSymbol && wlData.items.length > 0) {
        setSelectedSymbol(wlData.items[0].symbol);
      }
    } catch (err: any) {
      console.error('Failed to load watchlist data:', err);
      setFetchError(err.message || 'Failed to load watchlist data from server.');
    } finally {
      setIsLoadingWatchlist(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedSymbol) return;

    let isMounted = true;
    setIsLoadingChart(true);
    marketService
      .getHistory(selectedSymbol, chartPeriod, '1d')
      .then((res) => {
        if (isMounted) {
          setChartData(res.data || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load chart:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingChart(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSymbol, chartPeriod]);

  const handleAddSymbol = async (symbol: string) => {
    await watchlistService.addSymbol(symbol);
    const updated = await watchlistService.getWatchlist();
    setWatchlist(updated);
    setSelectedSymbol(symbol);
    reconnect();
  };

  const handleRemoveSymbol = async (symbol: string) => {
    await watchlistService.removeSymbol(symbol);
    const updated = await watchlistService.getWatchlist();
    setWatchlist(updated);
    if (selectedSymbol === symbol) {
      setSelectedSymbol(updated.items.length > 0 ? updated.items[0].symbol : null);
    }
    reconnect();
  };

  // Category handlers
  const handleCreateCategory = async (data: { name: string; color: string }) => {
    await categoryService.createCategory(data);
    const updated = await categoryService.getCategories();
    setCategories(updated);
  };

  const handleDeleteCategory = async (id: number) => {
    await categoryService.deleteCategory(id);
    const [updatedCats, updatedAssigns] = await Promise.all([
      categoryService.getCategories(),
      categoryService.getAssignments(),
    ]);
    setCategories(updatedCats);
    setAssignments(updatedAssigns);
  };

  const handleAssignCategory = async (categoryId: number, symbol: string) => {
    await categoryService.assignCategory({ category_id: categoryId, symbol });
    const updated = await categoryService.getAssignments();
    setAssignments(updated);
  };

  const handleRemoveCategory = async (categoryId: number, symbol: string) => {
    await categoryService.removeCategory(categoryId, symbol);
    const updated = await categoryService.getAssignments();
    setAssignments(updated);
  };

  // Alert handlers
  const handleCreateAlert = async (data: { symbol: string; target_price: number; condition: 'ABOVE' | 'BELOW' }) => {
    await alertService.createAlert(data);
    const updatedAlerts = await alertService.getAlerts();
    setAlerts(updatedAlerts);
  };

  const handleToggleAlert = async (id: number, isActive: boolean) => {
    await alertService.updateAlert(id, { is_active: isActive });
    const updatedAlerts = await alertService.getAlerts();
    setAlerts(updatedAlerts);
  };

  const handleDeleteAlert = async (id: number) => {
    await alertService.deleteAlert(id);
    const updatedAlerts = await alertService.getAlerts();
    setAlerts(updatedAlerts);
  };

  const currentMarket = markets.find((m) => m.code === user?.preferred_market) || markets[0];
  const selectedQuote = quotes.find((q) => q.symbol === selectedSymbol);

  return (
    <div className="space-y-6">
      {/* Top Header & Market Quick Picks */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl bg-white border border-slate-200 p-6 shadow-sm dark:border-slate-800 dark:bg-gradient-to-r dark:from-blue-900/40 dark:via-slate-900 dark:to-slate-900 dark:shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{t('watchlist.title')}</h1>
            <span className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
              {currentMarket?.name || 'US Market'}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('watchlist.desc')}
          </p>
        </div>

        {/* Action Controls & WebSocket Status */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
          >
            <Bell className="h-3.5 w-3.5 text-amber-500" />
            Alerts ({alerts.filter((a) => a.is_active && !a.is_triggered).length})
          </button>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition shadow-sm dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <Tag className="h-3.5 w-3.5 text-blue-500" />
            Categories ({categories.length})
          </button>

          <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs text-slate-700 border border-slate-200 dark:bg-slate-850 dark:border-slate-700/60 dark:text-slate-300 shadow-inner">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="font-medium">
              {isConnected ? t('dashboard.socket_connected') : t('dashboard.connecting_stream')}
            </span>
            {lastUpdated && (
              <span className="text-slate-400 text-[10px]">({lastUpdated})</span>
            )}
          </div>

          <button
            onClick={() => {
              loadData();
              reconnect();
            }}
            title="Refresh connection & watchlist"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t('dashboard.sync')}
          </button>
        </div>
      </div>

      {fetchError && (
        <ErrorAlert
          title="Watchlist Service Error"
          message={fetchError}
          onRetry={loadData}
        />
      )}

      {/* Selected Stock Chart & Statistics Area */}
      {selectedSymbol && selectedQuote && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40 dark:backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('dashboard.interactive_charts')}: <span className="text-blue-600 dark:text-blue-400">{selectedSymbol}</span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAlertModalOpen(true)}
                className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-700 hover:bg-amber-100 dark:border-slate-800 dark:bg-slate-850 dark:text-amber-400 dark:hover:bg-slate-800"
              >
                <Bell className="h-3 w-3" />
                Set Alert
              </button>
              <button
                onClick={() => setSelectedSymbol(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition dark:hover:bg-slate-800 dark:hover:text-slate-300"
                title={t('watchlist.close_chart')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Key Metric Stats Cards */}
          <StockStatsCards quote={selectedQuote} />

          {/* Interactive Chart */}
          <StockChart
            symbol={selectedSymbol}
            data={chartData}
            currency={selectedQuote.currency}
            period={chartPeriod}
            onPeriodChange={setChartPeriod}
            isLoading={isLoadingChart}
          />
        </div>
      )}

      {/* Popular Suggestions Bar for Selected Market */}
      {currentMarket && currentMarket.popular_symbols && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40">
          <span className="flex items-center gap-1 text-slate-500 font-semibold dark:text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            {t('watchlist.popular_in', { market: currentMarket.name })}:
          </span>
          {currentMarket.popular_symbols.map((sym) => {
            const alreadyInWatchlist = watchlist?.items.some((i) => i.symbol === sym);
            return (
              <button
                key={sym}
                disabled={alreadyInWatchlist}
                onClick={() => handleAddSymbol(sym)}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  alreadyInWatchlist
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 dark:bg-slate-800/40 dark:text-slate-600 dark:border-slate-800'
                    : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20 dark:hover:bg-blue-600 dark:hover:text-white'
                }`}
              >
                + {sym}
              </button>
            );
          })}
        </div>
      )}

      {/* Watchlist Real-Time Table */}
      <WatchlistTable
        quotes={quotes}
        isLoading={isLoadingWatchlist}
        onAddSymbol={handleAddSymbol}
        onRemoveSymbol={handleRemoveSymbol}
        onSelectSymbol={(sym) => setSelectedSymbol(sym)}
        selectedSymbol={selectedSymbol}
        marketSuffix={currentMarket?.suffix}
        categories={categories}
        assignments={assignments}
        onAssignCategory={handleAssignCategory}
        onRemoveCategory={handleRemoveCategory}
      />

      {/* Modals & Live Toasts */}
      <CategoryManagerModal
        categories={categories}
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCreateCategory={handleCreateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <AlertManagerModal
        alerts={alerts}
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        defaultSymbol={selectedSymbol || ''}
        onCreateAlert={handleCreateAlert}
        onToggleAlert={handleToggleAlert}
        onDeleteAlert={handleDeleteAlert}
      />

      <AlertNotificationToast
        notification={activeAlertNotification}
        onDismiss={dismissAlertNotification}
      />
    </div>
  );
};
