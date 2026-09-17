import React, { useState } from 'react';
import { StockAlert } from '../types';
import { Bell, Plus, Trash2, CheckCircle2, AlertTriangle, X, Power } from 'lucide-react';

interface AlertManagerModalProps {
  alerts: StockAlert[];
  isOpen: boolean;
  onClose: () => void;
  defaultSymbol?: string;
  onCreateAlert: (data: { symbol: string; target_price: number; condition: 'ABOVE' | 'BELOW' }) => Promise<void>;
  onToggleAlert: (id: number, isActive: boolean) => Promise<void>;
  onDeleteAlert: (id: number) => Promise<void>;
}

export const AlertManagerModal: React.FC<AlertManagerModalProps> = ({
  alerts,
  isOpen,
  onClose,
  defaultSymbol = '',
  onCreateAlert,
  onToggleAlert,
  onDeleteAlert,
}) => {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSym = symbol.trim().toUpperCase();
    const price = parseFloat(targetPrice);

    if (!cleanSym || isNaN(price) || price <= 0) {
      setError('Please provide a valid symbol and price > 0.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onCreateAlert({
        symbol: cleanSym,
        target_price: price,
        condition,
      });
      setTargetPrice('');
    } catch (err: any) {
      setError(err.message || 'Failed to create alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Bell className="h-4 w-4" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Price Alerts Manager</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Create Alert Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Ticker Symbol</label>
              <input
                type="text"
                required
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="e.g. AAPL"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 uppercase dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Trigger Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as 'ABOVE' | 'BELOW')}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="ABOVE">Price goes ABOVE (≥)</option>
                <option value="BELOW">Price goes BELOW (≤)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Target Price</label>
              <input
                type="number"
                step="any"
                required
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="0.00"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !symbol.trim() || !targetPrice}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {isSubmitting ? 'Creating Alert...' : 'Set Price Alert'}
          </button>
        </form>

        {/* Existing Alerts List */}
        <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Active & Triggered Alerts ({alerts.length})
          </h4>

          {alerts.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No price alerts configured.</p>
          ) : (
            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className={`flex items-center justify-between rounded-xl border p-3 transition ${
                    a.is_triggered
                      ? 'border-amber-200 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-950/20'
                      : a.is_active
                      ? 'border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/70'
                      : 'border-slate-100 bg-slate-50/30 opacity-60 dark:border-slate-850 dark:bg-slate-950/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg font-extrabold text-xs ${
                        a.is_triggered
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-slate-800 dark:text-blue-400'
                      }`}
                    >
                      {a.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{a.symbol}</span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                            a.condition === 'ABOVE'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400'
                          }`}
                        >
                          {a.condition === 'ABOVE' ? '≥' : '≤'} {a.target_price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {a.is_triggered ? (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">
                            Triggered{' '}
                            {a.triggered_at
                              ? new Date(a.triggered_at).toLocaleTimeString()
                              : ''}
                          </span>
                        ) : a.is_active ? (
                          'Monitoring live feed'
                        ) : (
                          'Paused'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onToggleAlert(a.id, !a.is_active)}
                      className={`rounded-lg p-1.5 transition ${
                        a.is_active
                          ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                          : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={a.is_active ? 'Pause Alert' : 'Enable Alert'}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteAlert(a.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      title="Delete Alert"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
