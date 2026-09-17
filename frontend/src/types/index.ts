export interface User {
  id: number;
  email: string;
  preferred_market: string;
  preferred_language: string;
  preferred_currency: string;
  has_completed_onboarding: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Market {
  code: string;
  name: string;
  suffix: string;
  currency: string;
  currency_symbol: string;
  exchange: string;
  default_index: string;
  popular_symbols: string[];
}

export interface WatchlistItem {
  id: number;
  watchlist_id: number;
  symbol: string;
  added_at: string;
}

export interface Watchlist {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
  items: WatchlistItem[];
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface StockCategoryAssignment {
  id: number;
  user_id: number;
  category_id: number;
  symbol: string;
  category?: Category;
}

export interface StockAlert {
  id: number;
  user_id: number;
  symbol: string;
  target_price: number;
  condition: 'ABOVE' | 'BELOW';
  is_triggered: boolean;
  triggered_at?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface StockQuote {
  symbol: string;
  name?: string;
  current_price: number;
  previous_close: number;
  change: number;
  change_percent: number;
  currency: string;
  day_high?: number;
  day_low?: number;
  fifty_two_week_high?: number;
  fifty_two_week_low?: number;
  market_cap?: number;
  volume?: number;
  pe_ratio?: number;
  categories?: Category[];
}

export interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalDataResponse {
  symbol: string;
  period: string;
  interval: string;
  data: CandleData[];
  error?: string;
}
