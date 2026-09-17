from datetime import datetime, timezone
import asyncio
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from jose import JWTError, jwt

from app.core.config import settings
from app.core.ws_manager import ws_manager
from app.db.session import SessionLocal
from app.models.user import User
from app.models.watchlist import Watchlist
from app.services.data_fetcher import get_stock_quote

router = APIRouter()

def authenticate_ws_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            return None
        return int(user_id_str)
    except (JWTError, ValueError):
        return None

@router.websocket("/prices")
async def websocket_prices(
    websocket: WebSocket,
    token: Optional[str] = Query(None)
):
    if not token:
        auth_header = websocket.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Missing authentication token")
        return

    user_id = authenticate_ws_token(token)
    if not user_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid or expired token")
        return

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="User not found")
            return
        
        await ws_manager.connect(user_id, websocket)

        watchlist = db.query(Watchlist).filter(Watchlist.user_id == user_id).first()
        symbols = [item.symbol for item in watchlist.items] if (watchlist and watchlist.items) else []
        
        initial_quotes = []
        if symbols:
            initial_quotes = await asyncio.to_thread(
                lambda syms: [get_stock_quote(s) for s in syms],
                symbols
            )

        initial_message = {
            "type": "INITIAL_PRICES",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "watchlist": watchlist.name if watchlist else "Default Watchlist",
            "symbols": symbols,
            "data": initial_quotes
        }
        await ws_manager.send_personal_json(initial_message, websocket)
    finally:
        db.close()

    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        await ws_manager.disconnect(user_id, websocket)
    except Exception:
        await ws_manager.disconnect(user_id, websocket)
