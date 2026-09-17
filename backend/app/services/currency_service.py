from typing import Dict, Any
import requests
from app.core.cache import cache

# Fallback baseline rates relative to USD if external API is unreachable
DEFAULT_USD_RATES: Dict[str, float] = {
    "USD": 1.0,
    "INR": 83.25,
    "GBP": 0.79,
    "EUR": 0.92,
    "JPY": 154.50,
    "CAD": 1.36,
    "AUD": 1.53,
    "HKD": 7.82,
}

def get_exchange_rates(base_currency: str = "USD") -> Dict[str, float]:
    """Fetch live exchange rates with caching (1-hour TTL) and fallback."""
    base_curr = base_currency.strip().upper()
    cache_key = f"exchange_rates:{base_curr}"
    cached_rates = cache.get(cache_key)
    if cached_rates is not None:
        return cached_rates

    rates = {}
    try:
        # Fetch from open exchange rate API (open.er-api.com)
        response = requests.get(f"https://open.er-api.com/v6/latest/{base_curr}", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get("result") == "success" and "rates" in data:
                rates = data["rates"]
    except Exception:
        pass

    # If API fails or rates is empty, fallback to calculated defaults
    if not rates:
        usd_base = DEFAULT_USD_RATES.get(base_curr, 1.0)
        rates = {curr: round(rate / usd_base, 4) for curr, rate in DEFAULT_USD_RATES.items()}

    # Cache for 1 hour (3600s)
    cache.set(cache_key, rates, ttl=3600)
    return rates

def convert_currency(amount: float, from_curr: str, to_curr: str) -> float:
    """Convert amount from one currency to another."""
    from_c = from_curr.strip().upper()
    to_c = to_curr.strip().upper()

    if from_c == to_c or amount == 0:
        return amount

    rates = get_exchange_rates(base_currency=from_c)
    target_rate = rates.get(to_c)

    if target_rate is not None:
        return round(amount * target_rate, 2)
    
    # In direct fallback, convert through USD
    rates_usd = get_exchange_rates(base_currency="USD")
    rate_from = rates_usd.get(from_c, 1.0)
    rate_to = rates_usd.get(to_c, 1.0)
    usd_amount = amount / rate_from
    return round(usd_amount * rate_to, 2)
