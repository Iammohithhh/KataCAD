from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import dossier, echo, generate, health, route

app = FastAPI(
    title="KatACAD API",
    description="Backend for the KatACAD exhibition demo",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(echo.router, prefix="/api")
app.include_router(route.router, prefix="/api")
app.include_router(generate.router, prefix="/api")
app.include_router(dossier.router, prefix="/api")
