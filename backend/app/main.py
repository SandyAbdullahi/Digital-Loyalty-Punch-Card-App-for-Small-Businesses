from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.v1.auth import router as auth_router
from .api.v1.merchants import router as merchants_router
from .api.v1.programs import router as programs_router
from .core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(merchants_router, prefix=f"{settings.API_V1_STR}/merchants", tags=["merchants"])
app.include_router(programs_router, prefix=f"{settings.API_V1_STR}/programs", tags=["programs"])

@app.get("/health")
def health_check():
    return {"status": "ok"}