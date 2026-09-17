from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Query, HTTPException
from app.core.markets import (
    SUPPORTED_MARKETS,
    SUPPORTED_LANGUAGES,
    SUPPORTED_CURRENCIES,
    calculate_market_status
)
from app.services.data_fetcher import get_stock_quote, get_historical_data
from app.services.currency_service import get_exchange_rates, convert_currency

router = APIRouter()

@router.get("", summary="Get all supported markets with current trading status")
def get_markets() -> List[Dict[str, Any]]:
    markets_with_status = []
    for m in SUPPORTED_MARKETS:
        status_info = calculate_market_status(m)
        m_copy = dict(m)
        m_copy.update({
            "is_open": status_info["is_open"],
            "status": status_info["status"],
            "status_detail": status_info["detail"],
            "local_time": status_info["local_time"],
        })
        markets_with_status.append(m_copy)
    return markets_with_status

@router.get("/status", summary="Get current open/closed status for all markets")
def get_all_market_statuses() -> List[Dict[str, Any]]:
    return [calculate_market_status(m) for m in SUPPORTED_MARKETS]

@router.get("/status/{market_code}", summary="Get status for a specific market code")
def get_single_market_status(market_code: str) -> Dict[str, Any]:
    market = next((m for m in SUPPORTED_MARKETS if m["code"].upper() == market_code.upper()), None)
    if not market:
        raise HTTPException(status_code=404, detail=f"Market '{market_code}' not found")
    return calculate_market_status(market)

@router.get("/languages", summary="Get supported languages")
def get_languages() -> List[Dict[str, str]]:
    return SUPPORTED_LANGUAGES

@router.get("/currencies", summary="Get supported currencies")
def get_currencies() -> List[Dict[str, str]]:
    return SUPPORTED_CURRENCIES

@router.get("/rates", summary="Get latest forex exchange rates")
def get_rates(base: str = Query("USD", description="Base currency code, e.g. USD, EUR, INR")) -> Dict[str, Any]:
    rates = get_exchange_rates(base_currency=base)
    return {
        "base": base.upper(),
        "rates": rates
    }

@router.get("/convert", summary="Convert value between two currencies")
def convert(
    amount: float = Query(..., description="Amount to convert"),
    from_curr: str = Query(..., alias="from", description="Source currency code"),
    to_curr: str = Query(..., alias="to", description="Target currency code")
) -> Dict[str, Any]:
    converted = convert_currency(amount, from_curr, to_curr)
    return {
        "amount": amount,
        "from": from_curr.upper(),
        "to": to_curr.upper(),
        "converted_amount": converted
    }

@router.get("/quote/{symbol}", summary="Get detailed quote and statistics for a single symbol")
def get_quote(symbol: str) -> Dict[str, Any]:
    quote = get_stock_quote(symbol)
    return quote

@router.get("/history/{symbol}", summary="Get historical OHLCV chart data for a symbol")
def get_history(
    symbol: str,
    period: str = Query("1mo", description="Historical range, e.g. 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y, max"),
    interval: str = Query("1d", description="Data resolution, e.g. 1m, 5m, 15m, 1h, 1d, 1wk, 1mo")
) -> Dict[str, Any]:
    history = get_historical_data(symbol, period=period, interval=interval)
    return history

