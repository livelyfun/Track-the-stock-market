import { apiFetch } from './api';
import {
  Watchlist,
  WatchlistItem,
  StockQuote,
  Market,
  HistoricalDataResponse,
  Category,
  StockCategoryAssignment,
  StockAlert
} from '../types';

export const watchlistService = {
  getWatchlist: (): Promise<Watchlist> => {
    return apiFetch<Watchlist>('/watchlist');
  },

  addSymbol: (symbol: string): Promise<WatchlistItem> => {
    return apiFetch<WatchlistItem>('/watchlist/items', {
      method: 'POST',
      body: JSON.stringify({ symbol }),
    });
  },

  removeSymbol: (symbol: string): Promise<{ status: string; message: string }> => {
    return apiFetch<{ status: string; message: string }>(`/watchlist/items/${encodeURIComponent(symbol)}`, {
      method: 'DELETE',
    });
  },
};

export const alertService = {
  // Get all alerts for user
  getAlerts: (): Promise<StockAlert[]> => {
    return apiFetch<StockAlert[]>('/alerts');
  },

  // Create alert
  createAlert: (data: { symbol: string; target_price: number; condition: 'ABOVE' | 'BELOW' }): Promise<StockAlert> => {
    return apiFetch<StockAlert>('/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update alert
  updateAlert: (id: number, data: Partial<StockAlert>): Promise<StockAlert> => {
    return apiFetch<StockAlert>(`/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete alert
  deleteAlert: (id: number): Promise<{ status: string; message: string }> => {
    return apiFetch<{ status: string; message: string }>(`/alerts/${id}`, {
      method: 'DELETE',
    });
  },
};

export const categoryService = {
  getCategories: (): Promise<Category[]> => {
    return apiFetch<Category[]>('/categories');
  },

  createCategory: (data: { name: string; color?: string }): Promise<Category> => {
    return apiFetch<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCategory: (id: number, data: { name?: string; color?: string }): Promise<Category> => {
    return apiFetch<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCategory: (id: number): Promise<{ status: string; message: string }> => {
    return apiFetch<{ status: string; message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  getAssignments: (): Promise<StockCategoryAssignment[]> => {
    return apiFetch<StockCategoryAssignment[]>('/categories/assignments');
  },

  assignCategory: (data: { category_id: number; symbol: string }): Promise<StockCategoryAssignment> => {
    return apiFetch<StockCategoryAssignment>('/categories/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  removeCategory: (categoryId: number, symbol: string): Promise<{ status: string; message: string }> => {
    return apiFetch<{ status: string; message: string }>(
      `/categories/assign/${categoryId}/${encodeURIComponent(symbol)}`,
      {
        method: 'DELETE',
      }
    );
  },
};

export const marketService = {
  getMarkets: (): Promise<Market[]> => {
    return apiFetch<Market[]>('/markets');
  },

  getCurrencies: (): Promise<{ code: string; symbol: string; name: string }[]> => {
    return apiFetch<{ code: string; symbol: string; name: string }[]>('/markets/currencies');
  },

  getRates: (base: string = 'USD'): Promise<{ base: string; rates: Record<string, number> }> => {
    return apiFetch<{ base: string; rates: Record<string, number> }>(`/markets/rates?base=${encodeURIComponent(base)}`);
  },

  getQuote: (symbol: string): Promise<StockQuote> => {
    return apiFetch<StockQuote>(`/markets/quote/${encodeURIComponent(symbol)}`);
  },

  getHistory: (
    symbol: string,
    period: string = '1mo',
    interval: string = '1d'
  ): Promise<HistoricalDataResponse> => {
    return apiFetch<HistoricalDataResponse>(
      `/markets/history/${encodeURIComponent(symbol)}?period=${encodeURIComponent(period)}&interval=${encodeURIComponent(interval)}`
    );
  },
};
