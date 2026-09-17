import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../services/api';
import { Globe, Clock, ChevronDown, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface MarketStatus {
  code: string;
  name: string;
  exchange: string;
  is_open: boolean;
  status: string;
  detail: string;
  local_time: string;
  timezone: string;
  open_time: string;
  close_time: string;
}

export const MarketStatusBadge: React.FC<{ showAllDropdown?: boolean }> = ({ showAllDropdown = true }) => {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<MarketStatus[]>([]);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStatuses = async () => {
    try {
      const data = await apiGet<MarketStatus[]>('/api/markets/status');
      setStatuses(data);
    } catch (err) {
      console.error('Failed to fetch market statuses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
    const interval = setInterval(fetchStatuses, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const activeMarketCode = user?.preferred_market || 'US';
  const currentMarketStatus = statuses.find((s) => s.code === activeMarketCode) || statuses[0] || {
    code: activeMarketCode,
    name: activeMarketCode,
    exchange: activeMarketCode,
    is_open: false,
    status: 'Market',
    detail: '',
    local_time: '',
    timezone: '',
    open_time: '',
    close_time: '',
  };

  const getStatusColor = (status: string, isOpen: boolean) => {
    if (isOpen) {
      return {
        bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-500',
        pulse: 'animate-ping bg-emerald-400',
      };
    }
    if (status === 'Pre-Market') {
      return {
        bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        dot: 'bg-amber-500',
        pulse: 'animate-pulse bg-amber-400',
      };
    }
    return {
      bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-400/20',
      dot: 'bg-slate-400 dark:bg-slate-500',
      pulse: '',
    };
  };

  const colors = getStatusColor(currentMarketStatus.status, currentMarketStatus.is_open);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => showAllDropdown && setIsOpenMenu(!isOpenMenu)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition shadow-sm ${colors.bg} hover:opacity-90`}
        title={currentMarketStatus.detail}
      >
        <span className="relative flex h-2 w-2">
          {currentMarketStatus.is_open && (
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${colors.pulse}`} />
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${colors.dot}`} />
        </span>

        <span className="font-semibold">{currentMarketStatus.code}</span>
        <span className="hidden sm:inline font-normal">({currentMarketStatus.exchange})</span>
        <span className="font-medium">{currentMarketStatus.status}</span>

        {showAllDropdown && <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />}
      </button>

      {/* Dropdown displaying all global markets */}
      {showAllDropdown && isOpenMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpenMenu(false)} />
          <div className="absolute right-0 mt-2 z-50 w-72 origin-top-right rounded-xl border border-slate-200 bg-white p-3 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-blue-500" /> Global Market Status
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Live
              </span>
            </div>

            <div className="mt-2 space-y-1 max-h-64 overflow-y-auto pr-1">
              {statuses.map((m) => {
                const isSelected = m.code === activeMarketCode;
                const mColors = getStatusColor(m.status, m.is_open);
                return (
                  <div
                    key={m.code}
                    className={`flex items-center justify-between rounded-lg p-2 text-xs transition ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">{m.code}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">· {m.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{m.detail}</p>
                    </div>

                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${mColors.bg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${mColors.dot}`} />
                      {m.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
