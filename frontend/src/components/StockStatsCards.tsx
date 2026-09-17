import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { StockQuote } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart, Layers } from 'lucide-react';

interface StockStatsCardsProps {
  quote: StockQuote;
}

export const StockStatsCards: React.FC<StockStatsCardsProps> = ({ quote }) => {
  const { convertPrice } = useCurrency();
  const isPos = quote.change >= 0;

  const liveConverted = convertPrice(quote.current_price, quote.currency);
  const prevConverted = convertPrice(quote.previous_close, quote.currency);
  const dayHighConv = convertPrice(quote.day_high || 0, quote.currency);
  const dayLowConv = convertPrice(quote.day_low || 0, quote.currency);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {/* Current Price */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>Current Price</span>
          <DollarSign className="h-4 w-4 text-blue-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {liveConverted.symbol} {liveConverted.price > 0 ? liveConverted.price.toFixed(2) : '0.00'}
          </p>
          {liveConverted.isConverted && (
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Conv
            </span>
          )}
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          Prev: {prevConverted.symbol} {prevConverted.price?.toFixed(2) || '—'}
        </p>
      </div>

      {/* 24h Change */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>24h Day Change</span>
          {isPos ? (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </div>
        <p
          className={`mt-2 text-xl sm:text-2xl font-extrabold ${
            isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {isPos ? '+' : ''}
          {quote.change_percent?.toFixed(2)}%
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Net: {quote.currency} {quote.change?.toFixed(2)}
        </p>
      </div>

      {/* Day Range */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>Day Range (High/Low)</span>
          <Activity className="h-4 w-4 text-amber-500" />
        </div>
        <p className="mt-2 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          {dayHighConv.price > 0 ? `${dayHighConv.symbol} ${dayHighConv.price.toFixed(2)}` : '—'}
        </p>
        <p className="text-[11px] text-slate-400">
          Low: {dayLowConv.price > 0 ? `${dayLowConv.symbol} ${dayLowConv.price.toFixed(2)}` : '—'}
        </p>
      </div>

      {/* 52-Week & Market Cap */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>Market Cap & Volume</span>
          <Layers className="h-4 w-4 text-indigo-500" />
        </div>
        <p className="mt-2 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          {quote.market_cap ? `${(quote.market_cap / 1e9).toFixed(2)}B` : '—'}
        </p>
        <p className="text-[11px] text-slate-400">
          Vol: {quote.volume ? quote.volume.toLocaleString() : '—'}
        </p>
      </div>
    </div>
  );
};
