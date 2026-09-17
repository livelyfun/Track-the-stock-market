import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { marketService } from '../services/watchlist';

interface CurrencyContextType {
  targetCurrency: string;
  setTargetCurrency: (currency: string) => Promise<void>;
  rates: Record<string, number>;
  convertPrice: (amount: number, fromCurrency: string) => { price: number; isConverted: boolean; symbol: string };
  availableCurrencies: { code: string; symbol: string; name: string }[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  INR: '₹',
  GBP: '£',
  EUR: '€',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
  HKD: 'HK$',
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUserPreferences } = useAuth();
  const [targetCurrency, setTargetCurrencyState] = useState<string>(
    user?.preferred_currency || localStorage.getItem('app_currency') || 'USD'
  );
  const [rates, setRates] = useState<Record<string, number>>({});
  const [availableCurrencies, setAvailableCurrencies] = useState<
    { code: string; symbol: string; name: string }[]
  >([
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  ]);

  // Sync with user's preferred currency on login
  useEffect(() => {
    if (user?.preferred_currency && user.preferred_currency !== targetCurrency) {
      setTargetCurrencyState(user.preferred_currency);
    }
  }, [user?.preferred_currency]);

  // Fetch exchange rates and available currencies
  useEffect(() => {
    marketService.getCurrencies().then(setAvailableCurrencies).catch(console.error);
    marketService.getRates('USD').then((res) => setRates(res.rates)).catch(console.error);
  }, []);

  const setTargetCurrency = async (currency: string) => {
    const cleanCurr = currency.toUpperCase();
    setTargetCurrencyState(cleanCurr);
    localStorage.setItem('app_currency', cleanCurr);

    if (user) {
      try {
        await updateUserPreferences({ preferred_currency: cleanCurr });
      } catch (err) {
        console.error('Failed to save preferred currency:', err);
      }
    }
  };

  const convertPrice = (
    amount: number,
    fromCurrency: string
  ): { price: number; isConverted: boolean; symbol: string } => {
    const from = (fromCurrency || 'USD').toUpperCase();
    const to = targetCurrency.toUpperCase();
    const targetSymbol = CURRENCY_SYMBOLS[to] || to;

    if (!amount || from === to) {
      return { price: amount || 0, isConverted: false, symbol: CURRENCY_SYMBOLS[from] || from };
    }

    // Convert via USD baseline
    const fromRate = rates[from] || 1.0;
    const toRate = rates[to] || 1.0;
    const usdValue = amount / fromRate;
    const convertedValue = usdValue * toRate;

    return {
      price: convertedValue,
      isConverted: true,
      symbol: targetSymbol,
    };
  };

  return (
    <CurrencyContext.Provider
      value={{
        targetCurrency,
        setTargetCurrency,
        rates,
        convertPrice,
        availableCurrencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
