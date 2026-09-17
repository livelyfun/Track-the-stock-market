import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.routers.api import api_router
from app.routers import websocket
from app.services.broadcaster import price_broadcast_loop

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    # Start background price broadcasting and alert checking task
    broadcast_task = asyncio.create_task(price_broadcast_loop(interval_seconds=5))
    logger.info("Price broadcast and alert task started.")

    yield

    # Teardown
    broadcast_task.cancel()
    try:
        await broadcast_task
    except asyncio.CancelledError:
        logger.info("Background price broadcast task cancelled.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local/container dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# Include WebSocket router (direct /ws and /api/v1/ws)
app.include_router(websocket.router)
app.include_router(websocket.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
    }
