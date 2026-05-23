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
    """Origins allowed by CORS.

    Default: any origin. This is a public booth demo with no
    sensitive endpoints, no auth, no cookies — locking origins down
    only causes outages when the deployed frontend's URL changes.

    Set `EXTRA_CORS_ORIGINS` (comma-separated) to override with a
    specific allow-list instead. Localhost is always included.
    """
    extra = [o.strip() for o in os.getenv("EXTRA_CORS_ORIGINS", "").split(",") if o.strip()]
    if extra:
        return ["http://localhost:3000", "http://127.0.0.1:3000"] + extra
    return ["*"]


_origins = _allow_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    # Wildcard origins are not allowed with credentials per the CORS spec;
    # the frontend uses no cookies, so disabling credentials is safe.
    allow_credentials="*" not in _origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(echo.router, prefix="/api")
app.include_router(route.router, prefix="/api")
app.include_router(generate.router, prefix="/api")
app.include_router(dossier.router, prefix="/api")
