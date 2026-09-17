from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.watchlist import Watchlist
from app.models.watchlist_item import WatchlistItem
from app.schemas.watchlist import WatchlistResponse, WatchlistItemCreate, WatchlistItemResponse
from app.routers.deps import get_current_user

router = APIRouter()

def get_or_create_user_watchlist(db: Session, user_id: int) -> Watchlist:
    watchlist = db.query(Watchlist).filter(Watchlist.user_id == user_id).first()
    if not watchlist:
        watchlist = Watchlist(name="Default Watchlist", user_id=user_id)
        db.add(watchlist)
        db.commit()
        db.refresh(watchlist)
    return watchlist

@router.get("", response_model=WatchlistResponse, summary="Get current user's watchlist")
def get_watchlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    watchlist = get_or_create_user_watchlist(db, current_user.id)
    return watchlist

@router.post("/items", response_model=WatchlistItemResponse, status_code=status.HTTP_201_CREATED, summary="Add symbol to user's watchlist")
def add_item_to_watchlist(
    item_in: WatchlistItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    symbol = item_in.symbol.strip().upper()
    if not symbol:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Symbol cannot be empty."
        )

    watchlist = get_or_create_user_watchlist(db, current_user.id)

    existing_item = (
        db.query(WatchlistItem)
        .filter(
            WatchlistItem.watchlist_id == watchlist.id,
            WatchlistItem.symbol == symbol
        )
        .first()
    )
    if existing_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Symbol '{symbol}' is already in your watchlist."
        )

    item = WatchlistItem(
        watchlist_id=watchlist.id,
        symbol=symbol
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/items/{symbol}", status_code=status.HTTP_200_OK, summary="Remove symbol from user's watchlist")
def remove_item_from_watchlist(
    symbol: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    symbol = symbol.strip().upper()
    watchlist = get_or_create_user_watchlist(db, current_user.id)

    item = (
        db.query(WatchlistItem)
        .filter(
            WatchlistItem.watchlist_id == watchlist.id,
            WatchlistItem.symbol == symbol
        )
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Symbol '{symbol}' not found in your watchlist."
        )

    db.delete(item)
    db.commit()
    return {"status": "ok", "message": f"Symbol '{symbol}' removed from watchlist."}
