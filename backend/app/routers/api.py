from fastapi import APIRouter
from app.routers import health, auth, markets, watchlist, categories, alerts

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(markets.router, prefix="/markets", tags=["markets"])
api_router.include_router(watchlist.router, prefix="/watchlist", tags=["watchlist"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
