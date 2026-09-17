import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { marketService, watchlistService } from '../services/watchlist';
import { Market } from '../types';
import {
  TrendingUp,
  Globe,
  Languages,
  DollarSign,
  Plus,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  X
} from 'lucide-react';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => Promise<void>;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { user, updateUserPreferences } = useAuth();
  const { setTargetCurrency, availableCurrencies } = useCurrency();
  const { i18n, t } = useTranslation();

  const [step, setStep] = useState(1);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState(user?.preferred_market || 'US');
  const [selectedLanguage, setSelectedLanguage] = useState(user?.preferred_language || 'en');
  const [selectedCurrency, setSelectedCurrency] = useState(user?.preferred_currency || 'USD');
  const [addedSymbols, setAddedSymbols] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    marketService.getMarkets().then(setMarkets).catch(console.error);
  }, []);

  if (!isOpen) return null;

  const currentMarketData = markets.find((m) => m.code === selectedMarket) || markets[0];

  const handleNext = async () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Finalize and save
      setIsSaving(true);
      try {
        await updateUserPreferences({
          preferred_market: selectedMarket,
          preferred_language: selectedLanguage,
          preferred_currency: selectedCurrency,
          has_completed_onboarding: true,
        });
        await onComplete();
      } catch (err) {
        console.error('Failed to complete onboarding:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleCurrencyChange = (curr: string) => {
    setSelectedCurrency(curr);
    setTargetCurrency(curr);
  };

  const handleMarketChange = (m: Market) => {
    setSelectedMarket(m.code);
    setSelectedCurrency(m.currency);
    setTargetCurrency(m.currency);
  };

  const handleToggleStock = async (symbol: string) => {
    if (addedSymbols.includes(symbol)) {
      setAddedSymbols(addedSymbols.filter((s) => s !== symbol));
      await watchlistService.removeSymbol(symbol);
    } else {
      setAddedSymbols([...addedSymbols, symbol]);
      await watchlistService.addSymbol(symbol);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        {/* Close / Skip button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-white transition"
          title="Skip Tour"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Step {step} of 5</span>
            <span>
              {step === 1 && 'Welcome'}
              {step === 2 && 'Market Selection'}
              {step === 3 && 'Language & Locale'}
              {step === 4 && 'Base Currency'}
              {step === 5 && 'Starter Watchlist'}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Welcome */}
        {step === 1 && (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome to StockMatrix AI</h2>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Your real-time multi-market stock tracking workspace with live streaming quotes, interactive charts, and intelligent categorization.
            </p>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-left text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Live low-latency tick streaming with WebSockets</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Real-time multi-currency conversions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Interactive OHLC candle and area charting</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Preferred Market */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Globe className="h-5 w-5 text-blue-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Select Your Primary Market</h3>
                <p className="text-xs text-slate-400">Choose your default trading exchange region</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {markets.map((m) => {
                const isSelected = selectedMarket === m.code;
                return (
                  <button
                    key={m.code}
                    type="button"
                    onClick={() => handleMarketChange(m)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500/60'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{m.name}</p>
                      <p className="text-[10px] text-slate-500">{m.exchange} ({m.currency})</p>
                    </div>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Language */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Languages className="h-5 w-5 text-blue-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Select Language</h3>
                <p className="text-xs text-slate-400">Choose your preferred display language</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { code: 'en', name: 'English', flag: '🇺🇸' },
                { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
              ].map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500/60'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{lang.flag}</span>
                      <span className="text-sm font-semibold text-white">{lang.name}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="h-5 w-5 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Base Currency */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Select Base Portfolio Currency</h3>
                <p className="text-xs text-slate-400">All prices and valuations will convert to this currency</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {availableCurrencies.map((c) => {
                const isSelected = selectedCurrency === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCurrencyChange(c.code)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/60'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 font-bold text-xs text-emerald-400">
                        {c.symbol}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white">{c.code}</p>
                        <p className="text-[10px] text-slate-500">{c.name}</p>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Add Popular Stocks */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Add Popular Starter Tickers</h3>
                <p className="text-xs text-slate-400">Select top constituent stocks for your watchlist</p>
              </div>
            </div>

            {currentMarketData && currentMarketData.popular_symbols && (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {currentMarketData.popular_symbols.map((sym) => {
                  const isAdded = addedSymbols.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => handleToggleStock(sym)}
                      className={`flex w-full items-center justify-between rounded-xl border p-3 transition ${
                        isAdded
                          ? 'border-blue-500 bg-blue-950/40 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-blue-400">
                          {sym.slice(0, 3)}
                        </div>
                        <span className="font-semibold text-sm">{sym}</span>
                      </div>
                      <span
                        className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${
                          isAdded
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {isAdded ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        {isAdded ? 'Added' : 'Add'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-5">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={handleNext}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50"
          >
            {isSaving ? 'Finishing...' : step === 5 ? 'Get Started 🎉' : 'Next Step'}
            {!isSaving && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
