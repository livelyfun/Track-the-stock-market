import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { OnboardingTour } from '../components/OnboardingTour';
import { apiGet } from '../services/api';
import {
  Settings,
  HelpCircle,
  RotateCcw,
  Globe,
  Languages,
  DollarSign,
  User as UserIcon,
  Shield,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  Check,
  Bell,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface MarketOption {
  code: string;
  name: string;
  currency: string;
  currency_symbol: string;
  exchange: string;
}

interface LanguageOption {
  code: string;
  name: string;
}

interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
}

export const SettingsPage: React.FC = () => {
  const { user, updateUserPreferences, logout } = useAuth();
  const { targetCurrency, setTargetCurrency, availableCurrencies } = useCurrency();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [markets, setMarkets] = useState<MarketOption[]>([]);
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [mkts, langs] = await Promise.all([
          apiGet<MarketOption[]>('/api/markets'),
          apiGet<LanguageOption[]>('/api/markets/languages'),
        ]);
        setMarkets(mkts);
        setLanguages(langs);
      } catch (err) {
        console.error('Failed to load settings metadata', err);
      }
    };
    loadMetadata();
  }, []);

  const handleMarketChange = async (marketCode: string) => {
    setSavingField('market');
    try {
      await updateUserPreferences({ preferred_market: marketCode });
      showSuccessFeedback('Default market updated successfully');
    } catch (err) {
      console.error(err);
    } finally {
      setSavingField(null);
    }
  };

  const handleLanguageChange = async (langCode: string) => {
    setSavingField('language');
    try {
      await i18n.changeLanguage(langCode);
      await updateUserPreferences({ preferred_language: langCode });
      showSuccessFeedback('Language preference updated');
    } catch (err) {
      console.error(err);
    } finally {
      setSavingField(null);
    }
  };

  const handleCurrencyChange = async (currencyCode: string) => {
    setSavingField('currency');
    try {
      setTargetCurrency(currencyCode);
      await updateUserPreferences({ preferred_currency: currencyCode });
      showSuccessFeedback('Portfolio base currency updated');
    } catch (err) {
      console.error(err);
    } finally {
      setSavingField(null);
    }
  };

  const handleRequestNotifications = async () => {
    if (typeof Notification !== 'undefined') {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        new Notification('StockMatrix Price Alerts Active', {
          body: 'You will receive real-time push alerts when your target prices are hit.',
          icon: '/favicon.ico',
        });
        showSuccessFeedback('Browser push notifications enabled!');
      }
    }
  };

  const showSuccessFeedback = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Toast feedback */}
      {saveSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4" />
          {saveSuccessMsg}
        </div>
      )}

      {/* Page Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-900/40 border border-slate-200 p-6 shadow-xl dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-600/30 text-white">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Settings & Preferences</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize your trading environment, display theme, language, and regional preferences.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Account & Profile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <UserIcon className="h-4 w-4 text-blue-500" />
            <span>Account Profile</span>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Shield className="h-3 w-3" /> Active Session
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/40">
            <span className="text-slate-400 font-medium">Email Address</span>
            <p className="text-sm font-semibold text-slate-800 dark:text-white mt-1">{user?.email}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/40">
            <span className="text-slate-400 font-medium">User Identifier</span>
            <p className="text-sm font-semibold text-slate-800 dark:text-white mt-1">ID #{user?.id || '—'}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/40">
            <span className="text-slate-400 font-medium">Member Since</span>
            <p className="text-sm font-semibold text-slate-800 dark:text-white mt-1">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/40">
            <span className="text-slate-400 font-medium">Onboarding Status</span>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
              {user?.has_completed_onboarding ? 'Completed' : 'Pending'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Theme & Appearance */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Appearance & Color Theme</span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select how StockMatrix looks on your screen. Dark mode provides high-contrast data visualization, while light mode delivers crisp clarity.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Light theme option */}
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition ${
              theme === 'light'
                ? 'border-blue-600 bg-blue-50/60 text-blue-900 dark:border-blue-500 dark:bg-blue-950/40 dark:text-white ring-2 ring-blue-500/20'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold">Light Mode</p>
              <p className="text-[11px] text-slate-400">Crisp white canvas</p>
            </div>
            {theme === 'light' && <span className="inline-flex rounded-full bg-blue-600 p-0.5 text-white"><Check className="h-3 w-3" /></span>}
          </button>

          {/* Dark theme option */}
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition ${
              theme === 'dark'
                ? 'border-blue-600 bg-blue-50/60 text-blue-900 dark:border-blue-500 dark:bg-blue-950/40 dark:text-white ring-2 ring-blue-500/20'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold">Dark Mode</p>
              <p className="text-[11px] text-slate-400">Sleek midnight terminal</p>
            </div>
            {theme === 'dark' && <span className="inline-flex rounded-full bg-blue-600 p-0.5 text-white"><Check className="h-3 w-3" /></span>}
          </button>

          {/* System option */}
          <button
            onClick={() => setTheme('system')}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition ${
              theme === 'system'
                ? 'border-blue-600 bg-blue-50/60 text-blue-900 dark:border-blue-500 dark:bg-blue-950/40 dark:text-white ring-2 ring-blue-500/20'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Laptop className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold">System Default</p>
              <p className="text-[11px] text-slate-400">Match OS settings</p>
            </div>
            {theme === 'system' && <span className="inline-flex rounded-full bg-blue-600 p-0.5 text-white"><Check className="h-3 w-3" /></span>}
          </button>
        </div>
      </div>

      {/* 3. Regional Market & Localization */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 space-y-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
          <Globe className="h-4 w-4 text-emerald-500" />
          <span>Regional Market & Localization</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Primary Market */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-500" />
              Default Market
            </label>
            <select
              value={user?.preferred_market || 'US'}
              onChange={(e) => handleMarketChange(e.target.value)}
              disabled={savingField === 'market'}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              {markets.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.code} - {m.name} ({m.exchange})
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Languages className="h-3.5 w-3.5 text-indigo-500" />
              Display Language
            </label>
            <select
              value={i18n.language || user?.preferred_language || 'en'}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={savingField === 'language'}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} ({l.code})
                </option>
              ))}
            </select>
          </div>

          {/* Currency */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
              Display Currency
            </label>
            <select
              value={targetCurrency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              disabled={savingField === 'currency'}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              {availableCurrencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol}) - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Push Alerts & Notifications */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Bell className="h-4 w-4 text-purple-500" />
            <span>Real-time Alert Notifications</span>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
              notificationPermission === 'granted'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
            }`}
          >
            {notificationPermission === 'granted' ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-800 dark:text-white">Desktop Push Notifications</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              Receive instant operating system notifications in addition to in-app toasts when your threshold price alerts trigger.
            </p>
          </div>

          <button
            onClick={handleRequestNotifications}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition shrink-0"
          >
            <Bell className="h-4 w-4 text-purple-500" />
            {notificationPermission === 'granted' ? 'Test Notification' : 'Enable Push Alerts'}
          </button>
        </div>
      </div>

      {/* 5. Interactive Help & Tour */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
          <HelpCircle className="h-4 w-4 text-amber-500" />
          <span>Interactive Onboarding & Help</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-800 dark:text-white">Replay Onboarding Tour</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              Walk through the 5-step guided setup again to configure your preferred exchange market, display language, portfolio currency, and starter stocks.
            </p>
          </div>
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition shrink-0"
          >
            <RotateCcw className="h-4 w-4" />
            Replay Tour
          </button>
        </div>
      </div>

      {/* 6. Account Actions / Logout */}
      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 dark:border-red-900/40 dark:bg-red-950/20 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-red-900 dark:text-red-300 border-b border-red-200/60 pb-3 dark:border-red-900/40">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span>Session & Account Management</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-xs font-semibold text-red-950 dark:text-red-200">Sign Out of StockMatrix</h4>
            <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
              Securely terminate your current session on this browser.
            </p>
          </div>

          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-red-600/20 hover:bg-red-500 transition shrink-0"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Onboarding Tour Modal */}
      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={async () => {
          setIsOnboardingOpen(false);
          showSuccessFeedback('Tour completed successfully');
        }}
      />
    </div>
  );
};
