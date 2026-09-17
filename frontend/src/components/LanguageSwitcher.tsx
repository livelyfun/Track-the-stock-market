import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Languages, Check, ChevronDown } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const { user, updateUserPreferences } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  ];

  // Sync i18n language with user preference on login
  useEffect(() => {
    if (user?.preferred_language && user.preferred_language !== i18n.language) {
      i18n.changeLanguage(user.preferred_language);
    }
  }, [user?.preferred_language, i18n]);

  const handleLanguageChange = async (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    setIsOpen(false);

    if (user) {
      try {
        await updateUserPreferences({ preferred_language: langCode });
      } catch (err) {
        console.error('Failed to persist language preference:', err);
      }
    }
  };

  const currentLang =
    availableLanguages.find((l) => l.code === i18n.language) || availableLanguages[0];

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <Languages className="h-3.5 w-3.5 text-blue-500" />
        <span>{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.name}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-36 origin-top-right rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-900 slide-in-from-top-2">
            <div className="space-y-0.5">
              {availableLanguages.map((lang) => {
                const isSelected = i18n.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-600/20 dark:text-blue-400'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
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
