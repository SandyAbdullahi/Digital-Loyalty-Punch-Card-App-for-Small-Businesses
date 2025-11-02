from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.v1.auth import router as auth_router
from .api.v1.customer import router as customer_router
from .api.v1.merchants import router as merchants_router
from .api.v1.programs import router as programs_router
from .api.v1.qr import router as qr_router
from .core.config import settings
# from .core.limiter import limiter

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# app.state.limiter = limiter

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(customer_router, prefix=f"{settings.API_V1_STR}/customer", tags=["customer"])
app.include_router(merchants_router, prefix=f"{settings.API_V1_STR}/merchants", tags=["merchants"])
app.include_router(programs_router, prefix=f"{settings.API_V1_STR}/programs", tags=["programs"])
app.include_router(qr_router, prefix=f"{settings.API_V1_STR}/qr", tags=["qr"])

@app.get("/health")
def health_check():
    return {"status": "ok"}