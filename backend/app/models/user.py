from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    preferred_market = Column(String, default="US", nullable=False)
    preferred_language = Column(String, default="en", nullable=False)
    preferred_currency = Column(String, default="USD", nullable=False)
    has_completed_onboarding = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    watchlists = relationship("Watchlist", back_populates="user", cascade="all, delete-orphan")
