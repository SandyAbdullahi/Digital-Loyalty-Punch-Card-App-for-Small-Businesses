from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .api.v1.auth import router as auth_router
from .api.v1.customer import router as customer_router
from .api.v1.merchants import router as merchants_router
from .api.v1.programs import router as programs_router
from .api.v1.qr import router as qr_router
from .api.v1.analytics import router as analytics_router
from .core.config import settings
# from .core.limiter import limiter

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# app.state.limiter = limiter

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(customer_router, prefix=f"{settings.API_V1_STR}/customer", tags=["customer"])
app.include_router(merchants_router, prefix=f"{settings.API_V1_STR}/merchants", tags=["merchants"])
app.include_router(programs_router, prefix=f"{settings.API_V1_STR}/programs", tags=["programs"])
app.include_router(qr_router, prefix=f"{settings.API_V1_STR}/qr", tags=["qr"])
app.include_router(analytics_router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
