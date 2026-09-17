from datetime import datetime, timezone
import zoneinfo
from typing import List, Dict, Any

SUPPORTED_MARKETS: List[Dict[str, Any]] = [
    {
        "code": "US",
        "name": "United States",
        "suffix": "",
        "currency": "USD",
        "currency_symbol": "$",
        "exchange": "NYSE/NASDAQ",
        "timezone": "America/New_York",
        "open_time": "09:30",
        "close_time": "16:00",
        "trading_days": [0, 1, 2, 3, 4], # Mon-Fri
        "default_index": "^GSPC",
        "popular_symbols": ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA"]
    },
    {
        "code": "IN",
        "name": "India (NSE/BSE)",
        "suffix": ".NS",
        "currency": "INR",
        "currency_symbol": "₹",
        "exchange": "NSE",
        "timezone": "Asia/Kolkata",
        "open_time": "09:15",
        "close_time": "15:30",
        "trading_days": [0, 1, 2, 3, 4],
        "default_index": "^NSEI",
        "popular_symbols": ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS"]
    },
    {
        "code": "UK",
        "name": "United Kingdom",
        "suffix": ".L",
        "currency": "GBP",
        "currency_symbol": "£",
        "exchange": "LSE",
        "timezone": "Europe/London",
        "open_time": "08:00",
        "close_time": "16:30",
        "trading_days": [0, 1, 2, 3, 4],
        "default_index": "^FTSE",
        "popular_symbols": ["SHEL.L", "AZN.L", "HSBA.L", "ULVR.L", "BP.L"]
    },
    {
        "code": "JP",
        "name": "Japan",
        "suffix": ".T",
        "currency": "JPY",
        "currency_symbol": "¥",
        "exchange": "TSE",
        "timezone": "Asia/Tokyo",
        "open_time": "09:00",
        "close_time": "15:30",
        "trading_days": [0, 1, 2, 3, 4],
        "default_index": "^N225",
        "popular_symbols": ["7203.T", "6758.T", "9984.T", "6861.T"]
    },
    {
        "code": "DE",
        "name": "Germany",
        "suffix": ".DE",
        "currency": "EUR",
        "currency_symbol": "€",
        "exchange": "XETRA",
        "timezone": "Europe/Berlin",
        "open_time": "09:00",
        "close_time": "17:30",
        "trading_days": [0, 1, 2, 3, 4],
        "default_index": "^GDAXI",
        "popular_symbols": ["SAP.DE", "SIE.DE", "ALV.DE", "MBG.DE"]
    },
    {
        "code": "HK",
        "name": "Hong Kong",
        "suffix": ".HK",
        "currency": "HKD",
        "currency_symbol": "HK$",
        "exchange": "HKEX",
        "timezone": "Asia/Hong_Kong",
        "open_time": "09:30",
        "close_time": "16:00",
        "trading_days": [0, 1, 2, 3, 4],
        "default_index": "^HSI",
        "popular_symbols": ["0700.HK", "9988.HK", "1299.HK", "3690.HK"]
    },
    {
        "code": "CA",
        "name": "Canada",
        "suffix": ".TO",
        "currency": "CAD",
        "currency_symbol": "CA$",
        "exchange": "TSX",
        "timezone": "America/Toronto",
        "open_time": "09:30",
        "close_time": "16:00",
        "trading_days": [0, 1, 2, 3, 4],
        "default_index": "^GSPTSE",
        "popular_symbols": ["RY.TO", "TD.TO", "ENB.TO", "CNR.TO"]
    },
    {
        "code": "AU",
        "name": "Australia",
        "suffix": ".AX",
        "currency": "AUD",
        "currency_symbol": "A$",
        "exchange": "ASX",
        "timezone": "Australia/Sydney",
        "open_time": "10:00",
        "close_time": "16:00",
        "trading_days": [0, 1, 2, 3, 4],
        "default_index": "^AXJO",
        "popular_symbols": ["BHP.AX", "CBA.AX", "CSL.AX", "NAB.AX"]
    }
]

SUPPORTED_LANGUAGES = [
    {"code": "en", "name": "English"},
    {"code": "es", "name": "Spanish"},
    {"code": "hi", "name": "Hindi"},
    {"code": "ja", "name": "Japanese"},
    {"code": "de", "name": "German"},
    {"code": "fr", "name": "French"},
]

SUPPORTED_CURRENCIES = [
    {"code": "USD", "symbol": "$", "name": "US Dollar"},
    {"code": "INR", "symbol": "₹", "name": "Indian Rupee"},
    {"code": "GBP", "symbol": "£", "name": "British Pound"},
    {"code": "EUR", "symbol": "€", "name": "Euro"},
    {"code": "JPY", "symbol": "¥", "name": "Japanese Yen"},
    {"code": "CAD", "symbol": "CA$", "name": "Canadian Dollar"},
    {"code": "AUD", "symbol": "A$", "name": "Australian Dollar"},
]

def calculate_market_status(market: Dict[str, Any]) -> Dict[str, Any]:
    try:
        tz = zoneinfo.ZoneInfo(market.get("timezone", "UTC"))
    except Exception:
        tz = timezone.utc

    now_local = datetime.now(tz)
    weekday = now_local.weekday()  # 0 is Monday, 6 is Sunday
    current_time_str = now_local.strftime("%H:%M")
    
    open_str = market.get("open_time", "09:30")
    close_str = market.get("close_time", "16:00")
    trading_days = market.get("trading_days", [0, 1, 2, 3, 4])

    is_trading_day = weekday in trading_days
    is_open = is_trading_day and (open_str <= current_time_str < close_str)

    # Determine status message
    if is_open:
        status_text = "Open"
        detail = f"Closes at {close_str} {now_local.tzname()}"
    elif is_trading_day and current_time_str < open_str:
        status_text = "Pre-Market"
        detail = f"Opens today at {open_str} {now_local.tzname()}"
    else:
        status_text = "Closed"
        detail = f"Trading hours: {open_str} - {close_str} {now_local.tzname()}"

    return {
        "code": market["code"],
        "name": market["name"],
        "exchange": market["exchange"],
        "is_open": is_open,
        "status": status_text,
        "detail": detail,
        "local_time": now_local.strftime("%Y-%m-%d %H:%M:%S"),
        "timezone": market.get("timezone", "UTC"),
        "open_time": open_str,
        "close_time": close_str,
    }

