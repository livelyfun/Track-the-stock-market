import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { CurrencySwitcher } from '../components/CurrencySwitcher';
import { ThemeToggle } from '../components/ThemeToggle';
import { MarketStatusBadge } from '../components/MarketStatusBadge';
import {
  TrendingUp,
  LayoutDashboard,
  ListOrdered,
  Globe,
  Settings,
  LogOut,
  Radio,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: t('nav.overview'), path: '/dashboard', icon: LayoutDashboard },
    { label: t('nav.watchlist'), path: '/dashboard/watchlist', icon: ListOrdered },
    { label: t('nav.markets'), path: '/dashboard/markets', icon: Globe },
    { label: t('nav.settings'), path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop + Mobile slide-over) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white/95 backdrop-blur-xl transition-transform duration-300 ease-in-out dark:border-slate-800/80 dark:bg-slate-900/90 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-800/80">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-600/30">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                StockMatrix
              </span>
              <span className="text-[10px] font-medium text-slate-400">Pro Terminal</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Platform Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Profile & Logout */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-medium text-slate-400">Theme</span>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 border border-blue-500/20">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{user?.email}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>{user?.preferred_market || 'US'} / {user?.preferred_currency || 'USD'}</span>
              </div>
            </div>
            <button
              onClick={logout}
              title={t('nav.logout')}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition dark:hover:bg-red-950/40 dark:hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col md:pl-64 min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 sm:px-8 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 md:hidden dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {navItems.find((item) => item.path === location.pathname)?.label || t('nav.overview')}
            </h1>

            {/* Live Market Indicator */}
            <div className="hidden sm:flex items-center">
              <MarketStatusBadge />
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="sm:hidden">
              <MarketStatusBadge showAllDropdown={false} />
            </div>
            <LanguageSwitcher />
            <CurrencySwitcher />
            <div className="hidden sm:block">
              <ThemeToggle compact />
            </div>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
