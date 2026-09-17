from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class CategoryBase(BaseModel):
    name: str
    color: Optional[str] = "#3b82f6"

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

class StockCategoryAssign(BaseModel):
    category_id: int
    symbol: str

class CategoryResponse(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    color: str
    created_at: datetime

class StockCategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    category_id: int
    symbol: str
    category: Optional[CategoryResponse] = None
