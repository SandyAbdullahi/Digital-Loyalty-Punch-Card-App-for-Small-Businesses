from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import PlainTextResponse

from .api.v1.auth import router as auth_router
from .api.v1.customer import router as customer_router
from .api.v1.merchants import router as merchants_router
from .api.v1.programs import router as programs_router
from .api.v1.qr import router as qr_router
from .api.v1.analytics import router as analytics_router
from .api.v1.websocket import router as websocket_router
from .api.v1.reward_logic import router as reward_logic_router
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
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(customer_router, prefix=f"{settings.API_V1_STR}/customer", tags=["customer"])
app.include_router(merchants_router, prefix=f"{settings.API_V1_STR}/merchants", tags=["merchants"])
app.include_router(programs_router, prefix=f"{settings.API_V1_STR}/programs", tags=["programs"])
app.include_router(qr_router, prefix=f"{settings.API_V1_STR}/qr", tags=["qr"])
app.include_router(analytics_router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])
app.include_router(websocket_router, prefix=f"{settings.API_V1_STR}/ws", tags=["websocket"])
app.include_router(reward_logic_router, prefix=f"{settings.API_V1_STR}", tags=["rewards"])

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    response = PlainTextResponse("Internal Server Error", status_code=500)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

@app.get("/health")
def health_check():
    return {"status": "ok"}
