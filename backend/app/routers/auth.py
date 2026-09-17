from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.markets import SUPPORTED_MARKETS
from app.db.session import get_db
from app.models.user import User
from app.models.watchlist import Watchlist
from app.schemas.user import UserCreate, UserLogin, UserPreferencesUpdate, UserResponse, Token
from app.routers.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Register a new user")
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system."
        )
    
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        preferred_market=user_in.preferred_market or "US",
        preferred_language=user_in.preferred_language or "en",
        preferred_currency=user_in.preferred_currency or "USD",
        has_completed_onboarding=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    default_watchlist = Watchlist(name="Default Watchlist", user_id=user.id)
    db.add(default_watchlist)
    db.commit()

    return user

@router.post("/login", response_model=Token, summary="Login and get JWT access token")
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse, summary="Get current logged in user details")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/preferences", response_model=UserResponse, summary="Update user preferences (protected)")
def update_preferences(
    preferences_in: UserPreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if preferences_in.preferred_market is not None:
        valid_market_codes = [m["code"] for m in SUPPORTED_MARKETS]
        if preferences_in.preferred_market not in valid_market_codes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid market code '{preferences_in.preferred_market}'. Supported: {valid_market_codes}"
            )
        current_user.preferred_market = preferences_in.preferred_market

    if preferences_in.preferred_language is not None:
        current_user.preferred_language = preferences_in.preferred_language

    if preferences_in.preferred_currency is not None:
        current_user.preferred_currency = preferences_in.preferred_currency

    if preferences_in.has_completed_onboarding is not None:
        current_user.has_completed_onboarding = preferences_in.has_completed_onboarding

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
