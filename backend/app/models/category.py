from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base

def utc_now():
    return datetime.now(timezone.utc)

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    color = Column(String, default="#3b82f6", nullable=False)  # Hex color badge
    created_at = Column(DateTime, default=utc_now, nullable=False)

    # Relationships
    stock_categories = relationship("StockCategory", back_populates="category", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_user_category_name"),
    )


class StockCategory(Base):
    __tablename__ = "stock_categories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    symbol = Column(String, nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    # Relationships
    category = relationship("Category", back_populates="stock_categories")

    __table_args__ = (
        UniqueConstraint("user_id", "category_id", "symbol", name="uq_user_category_symbol"),
    )
