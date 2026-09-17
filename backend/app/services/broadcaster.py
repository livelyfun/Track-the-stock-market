import asyncio
import logging
from datetime import datetime, timezone
from app.core.ws_manager import ws_manager
from app.db.session import SessionLocal
from app.models.watchlist import Watchlist
from app.models.alert import Alert
from app.services.data_fetcher import get_stock_quote

logger = logging.getLogger(__name__)

async def price_broadcast_loop(interval_seconds: int = 5):
    """Background task running continuously to fetch prices, check alerts, and broadcast updates."""
    logger.info("Starting real-time price & alert broadcaster background task...")
    while True:
        try:
            active_user_ids = ws_manager.get_active_user_ids()
            if active_user_ids:
                db = SessionLocal()
                try:
                    for user_id in active_user_ids:
                        # 1. Fetch Watchlist quotes
                        watchlist = db.query(Watchlist).filter(Watchlist.user_id == user_id).first()
                        quotes_map = {}
                        if watchlist and watchlist.items:
                            symbols = [item.symbol for item in watchlist.items]
                            quotes = await asyncio.to_thread(
                                lambda syms: [get_stock_quote(s) for s in syms],
                                symbols
                            )
                            for q in quotes:
                                quotes_map[q["symbol"]] = q

                            payload = {
                                "type": "PRICE_UPDATE",
                                "timestamp": datetime.now(timezone.utc).isoformat(),
                                "data": quotes
                            }
                            await ws_manager.send_user_json(user_id, payload)

                        # 2. Check active alerts for this user
                        active_alerts = db.query(Alert).filter(
                            Alert.user_id == user_id,
                            Alert.is_active == True,
                            Alert.is_triggered == False
                        ).all()

                        for alert in active_alerts:
                            quote = quotes_map.get(alert.symbol)
                            if not quote:
                                quote = await asyncio.to_thread(get_stock_quote, alert.symbol)
                            
                            curr_price = quote.get("current_price", 0.0)
                            if curr_price <= 0:
                                continue

                            triggered = False
                            if alert.condition == "ABOVE" and curr_price >= alert.target_price:
                                triggered = True
                            elif alert.condition == "BELOW" and curr_price <= alert.target_price:
                                triggered = True

                            if triggered:
                                alert.is_triggered = True
                                alert.triggered_at = datetime.now(timezone.utc)
                                db.add(alert)
                                db.commit()

                                # Broadcast Alert Event to User via WebSocket
                                alert_payload = {
                                    "type": "ALERT_TRIGGERED",
                                    "timestamp": datetime.now(timezone.utc).isoformat(),
                                    "data": {
                                        "id": alert.id,
                                        "symbol": alert.symbol,
                                        "condition": alert.condition,
                                        "target_price": alert.target_price,
                                        "current_price": curr_price,
                                        "currency": quote.get("currency", "USD"),
                                        "message": f"🚨 Alert: {alert.symbol} is {alert.condition} {quote.get('currency', 'USD')} {alert.target_price} (Current: {curr_price})"
                                    }
                                }
                                await ws_manager.send_user_json(user_id, alert_payload)

                finally:
                    db.close()
        except Exception as e:
            logger.error(f"Error in price_broadcast_loop: {e}", exc_info=True)

        await asyncio.sleep(interval_seconds)
