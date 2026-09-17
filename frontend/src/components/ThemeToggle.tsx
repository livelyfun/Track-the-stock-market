import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';

export const ThemeToggle: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        title={`Current mode: ${theme} (${resolvedTheme}). Click to toggle.`}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
        ) : (
          <Moon className="h-4 w-4 text-indigo-600 transition-transform duration-300 hover:-rotate-12" />
        )}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
      <button
        onClick={() => setTheme('light')}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
          theme === 'light'
            ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Sun className="h-3.5 w-3.5 text-amber-500" />
        <span className="hidden sm:inline">Light</span>
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
          theme === 'dark'
            ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Moon className="h-3.5 w-3.5 text-blue-400" />
        <span className="hidden sm:inline">Dark</span>
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
          theme === 'system'
            ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Laptop className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">System</span>
      </button>
    </div>
  );
};
