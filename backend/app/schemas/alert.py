from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class AlertBase(BaseModel):
    symbol: str
    target_price: float
    condition: str = "ABOVE"  # "ABOVE" | "BELOW"

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    target_price: Optional[float] = None
    condition: Optional[str] = None
    is_active: Optional[bool] = None

class AlertResponse(AlertBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    symbol: str
    target_price: float
    condition: str
    is_triggered: bool
    triggered_at: Optional[datetime] = None
    is_active: bool
    created_at: datetime
