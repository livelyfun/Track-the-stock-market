import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../context/CurrencyContext';
import { StockQuote, Category, StockCategoryAssignment } from '../types';
import { TableSkeleton } from './LoadingStates';
import {
  TrendingUp,
  TrendingDown,
  Trash2,
  Plus,
  ArrowUpDown,
  Search,
  AlertCircle,
  BarChart2,
  Tag,
  FolderOpen
} from 'lucide-react';

interface WatchlistTableProps {
  quotes: StockQuote[];
  isLoading: boolean;
  onAddSymbol: (symbol: string) => Promise<void>;
  onRemoveSymbol: (symbol: string) => Promise<void>;
  onSelectSymbol?: (symbol: string) => void;
  selectedSymbol?: string | null;
  marketSuffix?: string;
  categories?: Category[];
  assignments?: StockCategoryAssignment[];
  onAssignCategory?: (categoryId: number, symbol: string) => Promise<void>;
  onRemoveCategory?: (categoryId: number, symbol: string) => Promise<void>;
}

export const WatchlistTable: React.FC<WatchlistTableProps> = ({
  quotes,
  isLoading,
  onAddSymbol,
  onRemoveSymbol,
  onSelectSymbol,
  selectedSymbol,
  marketSuffix = '',
  categories = [],
  assignments = [],
  onAssignCategory,
  onRemoveCategory,
}) => {
  const { t } = useTranslation();
  const { convertPrice } = useCurrency();
  const [newSymbol, setNewSymbol] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<keyof StockQuote>('symbol');
  const [sortAsc, setSortAsc] = useState(true);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSym = newSymbol.trim().toUpperCase();
    if (!cleanSym) return;

    setIsAdding(true);
    setErrorMessage(null);
    try {
      await onAddSymbol(cleanSym);
      setNewSymbol('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add symbol');
    } finally {
      setIsAdding(false);
    }
  };

  // Get categories for a specific symbol
  const getSymbolCategories = (symbol: string): Category[] => {
    const symbolAssignments = assignments.filter((a) => a.symbol === symbol);
    return symbolAssignments
      .map((a) => categories.find((c) => c.id === a.category_id))
      .filter((c): c is Category => !!c);
  };

  const filteredQuotes = quotes
    .filter((q) => {
      // 1. Search text filter
      const matchSearch =
        q.symbol.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (q.name && q.name.toLowerCase().includes(searchFilter.toLowerCase()));
      if (!matchSearch) return false;

      // 2. Category filter
      if (selectedCategoryFilter !== 'ALL') {
        const symbolCatIds = assignments
          .filter((a) => a.symbol === q.symbol)
          .map((a) => a.category_id);
        if (!symbolCatIds.includes(selectedCategoryFilter)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const valA = a[sortField] ?? 0;
      const valB = b[sortField] ?? 0;
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  const toggleSort = (field: keyof StockQuote) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Pills Filter Bar */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
            <Tag className="h-3.5 w-3.5 text-blue-500" />
            Category:
          </span>
          <button
            onClick={() => setSelectedCategoryFilter('ALL')}
            className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
              selectedCategoryFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-750 dark:hover:text-white'
            }`}
          >
            All Stocks ({quotes.length})
          </button>
          {categories.map((cat) => {
            const count = quotes.filter((q) =>
              assignments.some((a) => a.symbol === q.symbol && a.category_id === cat.id)
            ).length;
            const isSelected = selectedCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-semibold transition ${
                  isSelected
                    ? 'text-white shadow-md ring-2 ring-white/40'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-750 dark:hover:text-white'
                }`}
                style={{
                  backgroundColor: isSelected ? cat.color : undefined,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: isSelected ? '#ffffff' : cat.color }}
                />
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Controls & Add Stock Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        {/* Search Filter */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={t('watchlist.filter_placeholder')}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        {/* Add Symbol Form */}
        <form onSubmit={handleAddSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            placeholder={`${t('watchlist.symbol_placeholder')}${marketSuffix ? ` (e.g. RELIANCE${marketSuffix})` : ''}`}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 uppercase dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={isAdding || !newSymbol.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50 shrink-0"
          >
            <Plus className="h-4 w-4" />
            {isAdding ? t('watchlist.adding') : t('watchlist.add_stock')}
          </button>
        </form>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quotes Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800/80 dark:bg-slate-950/60 dark:text-slate-400">
              <tr>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3.5 hover:text-slate-900 dark:hover:text-white transition"
                  onClick={() => toggleSort('symbol')}
                >
                  <div className="flex items-center gap-1.5">
                    {t('watchlist.ticker_asset')}
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3.5 text-right hover:text-slate-900 dark:hover:text-white transition"
                  onClick={() => toggleSort('current_price')}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    {t('watchlist.live_price')}
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3.5 text-right hover:text-slate-900 dark:hover:text-white transition"
                  onClick={() => toggleSort('change_percent')}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    {t('watchlist.day_change')}
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3.5 text-right hidden md:table-cell">
                  {t('watchlist.day_range')}
                </th>
                <th scope="col" className="px-6 py-3.5 text-right hidden lg:table-cell">
                  {t('watchlist.year_range')}
                </th>
                <th scope="col" className="px-6 py-3.5 text-center">
                  Tags & Category
                </th>
                <th scope="col" className="px-6 py-3.5 text-center">
                  {t('watchlist.action')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading && quotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <TableSkeleton rows={5} columns={7} />
                  </td>
                </tr>
              ) : filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FolderOpen className="h-8 w-8 text-slate-400" />
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{t('watchlist.no_symbols')}</p>
                      <p className="text-xs text-slate-400">
                        {t('watchlist.add_hint')}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => {
                  const isPos = q.change >= 0;
                  const isSelected = selectedSymbol === q.symbol;

                  const liveConverted = convertPrice(q.current_price, q.currency);
                  const prevConverted = convertPrice(q.previous_close, q.currency);
                  const dayHighConv = convertPrice(q.day_high || 0, q.currency);
                  const dayLowConv = convertPrice(q.day_low || 0, q.currency);

                  const symbolCategories = getSymbolCategories(q.symbol);

                  return (
                    <tr
                      key={q.symbol}
                      onClick={() => onSelectSymbol && onSelectSymbol(q.symbol)}
                      className={`cursor-pointer transition group ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-blue-600'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Ticker & Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 font-extrabold text-xs text-blue-600 border border-slate-200 shadow-sm dark:border-slate-700/60 dark:bg-slate-800 dark:text-blue-400">
                            {q.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover:text-blue-600 transition dark:text-white dark:group-hover:text-blue-400">
                              {q.symbol}
                              {isSelected && (
                                <BarChart2 className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[180px] truncate">
                              {q.name || q.symbol}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Live Price with Currency Conversion */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 font-bold text-slate-900 dark:text-white text-sm">
                          <span>{liveConverted.symbol} {liveConverted.price > 0 ? liveConverted.price.toFixed(2) : '—'}</span>
                          {liveConverted.isConverted && (
                            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" title={`Native price: ${q.currency} ${q.current_price?.toFixed(2)}`}>
                              Conv
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {t('stats.prev_close')}: {prevConverted.symbol} {prevConverted.price?.toFixed(2)}
                        </div>
                      </td>

                      {/* 24h Change */}
                      <td className="px-6 py-4 text-right">
                        <div
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${
                            isPos
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                          }`}
                        >
                          {isPos ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5" />
                          )}
                          <span>
                            {isPos ? '+' : ''}
                            {q.change_percent?.toFixed(2)}%
                          </span>
                        </div>
                      </td>

                      {/* Day Range */}
                      <td className="px-6 py-4 text-right hidden md:table-cell text-xs">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                          H: {dayHighConv.price ? `${dayHighConv.symbol} ${dayHighConv.price.toFixed(2)}` : '—'}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          L: {dayLowConv.price ? `${dayLowConv.symbol} ${dayLowConv.price.toFixed(2)}` : '—'}
                        </div>
                      </td>

                      {/* 52W Range */}
                      <td className="px-6 py-4 text-right hidden lg:table-cell text-xs">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                          H: {q.fifty_two_week_high ? `${q.currency} ${q.fifty_two_week_high.toFixed(2)}` : '—'}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          L: {q.fifty_two_week_low ? `${q.currency} ${q.fifty_two_week_low.toFixed(2)}` : '—'}
                        </div>
                      </td>

                      {/* Category Badges & Quick Assignment */}
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {symbolCategories.map((c) => (
                            <span
                              key={c.id}
                              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm"
                              style={{ backgroundColor: c.color }}
                            >
                              {c.name}
                              {onRemoveCategory && (
                                <button
                                  onClick={() => onRemoveCategory(c.id, q.symbol)}
                                  className="hover:opacity-75 font-normal ml-0.5"
                                  title={`Remove from ${c.name}`}
                                >
                                  ×
                                </button>
                              )}
                            </span>
                          ))}

                          {/* Category Dropdown Picker */}
                          {categories.length > 0 && onAssignCategory && (
                            <select
                              defaultValue=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  onAssignCategory(parseInt(e.target.value), q.symbol);
                                  e.target.value = "";
                                }
                              }}
                              className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-600 hover:text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white"
                            >
                              <option value="" disabled>
                                + Tag
                              </option>
                              {categories
                                .filter((c) => !symbolCategories.some((sc) => sc.id === c.id))
                                .map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                            </select>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onRemoveSymbol(q.symbol)}
                          title="Remove from watchlist"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition dark:hover:bg-red-500/10 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
