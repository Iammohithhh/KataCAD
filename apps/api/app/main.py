import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import dossier, echo, generate, health, route

app = FastAPI(
    title="KatACAD API",
    description="Backend for the KatACAD exhibition demo",
    version="0.1.0",
)


def _allow_origins() -> list[str]:
    """Localhost during development plus any origins declared in env.

    `EXTRA_CORS_ORIGINS` is a comma-separated list (e.g. the Vercel
    production URL plus any preview-deployment hostname). Empty in
    development; set on the deployed backend.
    """
    defaults = ["http://localhost:3000", "http://127.0.0.1:3000"]
    extra = [o.strip() for o in os.getenv("EXTRA_CORS_ORIGINS", "").split(",") if o.strip()]
    return defaults + extra


app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(echo.router, prefix="/api")
app.include_router(route.router, prefix="/api")
app.include_router(generate.router, prefix="/api")
app.include_router(dossier.router, prefix="/api")
