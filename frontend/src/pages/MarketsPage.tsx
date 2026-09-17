import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { marketService } from '../services/watchlist';
import { Market } from '../types';
import { Globe, Check, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

interface ExtendedMarket extends Market {
  is_open?: boolean;
  status?: string;
  status_detail?: string;
  local_time?: string;
}

export const MarketsPage: React.FC = () => {
  const { user, updateUserPreferences } = useAuth();
  const { t } = useTranslation();
  const [markets, setMarkets] = useState<ExtendedMarket[]>([]);
  const [selectedCode, setSelectedCode] = useState(user?.preferred_market || 'US');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchMarketsData = async () => {
    try {
      const data = await marketService.getMarkets();
      setMarkets(data as ExtendedMarket[]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMarketsData();
    const interval = setInterval(fetchMarketsData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectMarket = async (market: ExtendedMarket) => {
    setSelectedCode(market.code);
    setIsUpdating(true);
    setSuccessMsg(null);
    try {
      await updateUserPreferences({
        preferred_market: market.code,
        preferred_currency: market.currency,
      });
      setSuccessMsg(
        t('markets.switched_success', { name: market.name, currency: market.currency })
      );
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to update preference:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status?: string, isOpen?: boolean) => {
    if (isOpen) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
          Open
        </span>
      );
    }
    if (status === 'Pre-Market') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          Pre-Market
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        Closed
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm dark:border-slate-800 dark:bg-gradient-to-r dark:from-blue-900/40 dark:via-slate-900 dark:to-slate-900 dark:shadow-xl">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{t('markets.title')}</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {t('markets.desc')}
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {markets.map((m) => {
          const isCurrent = user?.preferred_market === m.code;
          return (
            <div
              key={m.code}
              className={`flex flex-col justify-between rounded-2xl border p-5 transition shadow-sm ${
                isCurrent
                  ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/20 dark:shadow-lg dark:shadow-blue-500/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-extrabold text-blue-600 border border-slate-200 dark:bg-slate-800 dark:text-blue-400 dark:border-slate-700">
                      {m.code}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{m.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{m.exchange}</p>
                    </div>
                  </div>
                  {getStatusBadge(m.status, m.is_open)}
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 dark:border-slate-800/60">
                    <span className="text-slate-400">{t('markets.base_currency')}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {m.currency} ({m.currency_symbol})
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 dark:border-slate-800/60">
                    <span className="text-slate-400">{t('markets.symbol_suffix')}</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{m.suffix || 'None (Direct)'}</span>
                  </div>
                  <div className="flex justify-between pb-1.5">
                    <span className="text-slate-400">{t('markets.benchmark')}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{m.default_index}</span>
                  </div>
                </div>

                {m.status_detail && (
                  <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {m.status_detail}
                  </p>
                )}

                {m.popular_symbols && (
                  <div className="mt-3">
                    <p className="text-[11px] text-slate-400 mb-1.5">{t('markets.constituents')}:</p>
                    <div className="flex flex-wrap gap-1">
                      {m.popular_symbols.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-700 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/50"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                disabled={isCurrent || isUpdating}
                onClick={() => handleSelectMarket(m)}
                className={`mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
                  isCurrent
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800/50 dark:text-slate-500'
                    : 'bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-500'
                }`}
              >
                {isCurrent ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    {t('markets.current_region')}
                  </>
                ) : (
                  t('markets.set_as_preferred')
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
