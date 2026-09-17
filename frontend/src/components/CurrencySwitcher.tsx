import React, { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { DollarSign, Check, ChevronDown } from 'lucide-react';

export const CurrencySwitcher: React.FC = () => {
  const { targetCurrency, setTargetCurrency, availableCurrencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const current = availableCurrencies.find((c) => c.code === targetCurrency) || {
    code: targetCurrency,
    symbol: '$',
    name: targetCurrency,
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <span className="font-bold text-emerald-600 dark:text-emerald-400">{current.symbol}</span>
        <span>{current.code}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-52 origin-top-right rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-900 slide-in-from-top-2">
            <div className="space-y-0.5">
              {availableCurrencies.map((c) => {
                const isSelected = targetCurrency === c.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => {
                      setTargetCurrency(c.code);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-600/20 dark:text-emerald-400'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-bold w-4 text-center">{c.symbol}</span>
                      <span>{c.code}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{c.name}</span>
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
