from typing import List, Dict, Any, Optional
import yfinance as yf
from app.core.cache import cache

def get_stock_quote(symbol: str) -> Dict[str, Any]:
    clean_sym = symbol.strip().upper()
    cache_key = f"quote:{clean_sym}"
    cached_data = cache.get(cache_key)
    if cached_data is not None:
        return cached_data

    try:
        ticker = yf.Ticker(clean_sym)
        info = {}
        try:
            info = ticker.info or {}
        except Exception:
            pass

        current_price = None
        prev_close = None
        currency = info.get("currency", "USD")
        short_name = info.get("shortName") or info.get("longName") or clean_sym

        if hasattr(ticker, "fast_info") and ticker.fast_info is not None:
            try:
                current_price = ticker.fast_info.last_price
                prev_close = ticker.fast_info.previous_close
                if not currency or currency == "USD":
                    currency = ticker.fast_info.currency or "USD"
            except Exception:
                pass

        if current_price is None:
            hist = ticker.history(period="5d")
            if not hist.empty:
                current_price = float(hist["Close"].iloc[-1])
                prev_close = float(hist["Close"].iloc[-2]) if len(hist) > 1 else current_price

        if current_price is None:
            current_price = info.get("currentPrice") or info.get("regularMarketPrice") or 0.0
            prev_close = info.get("regularMarketPreviousClose") or current_price

        change = current_price - prev_close if (current_price and prev_close) else 0.0
        change_percent = (change / prev_close * 100) if (prev_close and prev_close != 0) else 0.0

        data = {
            "symbol": clean_sym,
            "name": short_name,
            "current_price": round(current_price, 2) if current_price else 0.0,
            "previous_close": round(prev_close, 2) if prev_close else 0.0,
            "change": round(change, 2),
            "change_percent": round(change_percent, 2),
            "currency": currency,
            "day_high": round(info.get("dayHigh") or 0.0, 2),
            "day_low": round(info.get("dayLow") or 0.0, 2),
            "fifty_two_week_high": round(info.get("fiftyTwoWeekHigh") or 0.0, 2),
            "fifty_two_week_low": round(info.get("fiftyTwoWeekLow") or 0.0, 2),
            "market_cap": info.get("marketCap") or 0,
            "volume": info.get("volume") or 0,
            "pe_ratio": round(info.get("trailingPE"), 2) if info.get("trailingPE") else None,
        }

        cache.set(cache_key, data, ttl=60)
        return data
    except Exception as e:
        return {
            "symbol": clean_sym,
            "name": clean_sym,
            "current_price": 0.0,
            "previous_close": 0.0,
            "change": 0.0,
            "change_percent": 0.0,
            "currency": "USD",
            "error": str(e)
        }

def get_multiple_quotes(symbols: List[str]) -> List[Dict[str, Any]]:
    results = []
    for symbol in symbols:
        results.append(get_stock_quote(symbol))
    return results

def get_historical_data(
    symbol: str,
    period: str = "1mo",
    interval: str = "1d"
) -> Dict[str, Any]:
    clean_sym = symbol.strip().upper()
    cache_key = f"hist:{clean_sym}:{period}:{interval}"
    cached_data = cache.get(cache_key)
    if cached_data is not None:
        return cached_data

    try:
        ticker = yf.Ticker(clean_sym)
        df = ticker.history(period=period, interval=interval)

        candles = []
        for index, row in df.iterrows():
            timestamp_str = index.strftime("%Y-%m-%d") if hasattr(index, "strftime") else str(index)
            candles.append({
                "date": timestamp_str,
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            })

        data = {
            "symbol": clean_sym,
            "period": period,
            "interval": interval,
            "data": candles
        }
        cache.set(cache_key, data, ttl=300)
        return data
    except Exception as e:
        return {
            "symbol": clean_sym,
            "period": period,
            "interval": interval,
            "data": [],
            "error": str(e)
        }
