from datetime import datetime
from typing import List
from pydantic import BaseModel, ConfigDict

class WatchlistItemBase(BaseModel):
    symbol: str

class WatchlistItemCreate(WatchlistItemBase):
    symbol: str

class WatchlistItemResponse(WatchlistItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    watchlist_id: int
    symbol: str
    added_at: datetime

class WatchlistBase(BaseModel):
    name: str = "My Watchlist"

class WatchlistCreate(WatchlistBase):
    pass

class WatchlistResponse(WatchlistBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    created_at: datetime
    items: List[WatchlistItemResponse] = []
