from __future__ import annotations

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.database import Base, SessionLocal, engine
from app.models.pathway import PathwayTemplate
from app.routers import burin, pathway_templates, pathways, transect_trust
from app.services.conservation_seed import seed_conservation_demo
from app.services.template_loader import identity_of, load_yaml_templates, template_to_row


def seed_templates():
    db = SessionLocal()
    try:
        by_identity = {identity_of(t): t for t in db.query(PathwayTemplate).all()}
        for data in load_yaml_templates():
            ident = f"{data['domain']}.{data['subdomain']}.{data['action']}@v{data.get('version', 1)}"
            if ident in by_identity:
                row = by_identity[ident]
                row.display_name = data.get("display_name", row.display_name)
                row.description = data.get("description", row.description)
                row.steps_json = data.get("steps", [])
                row.input_contract = data.get("input_contract", {})
                row.output_contract = data.get("output_contract", {})
                row.license_terms = data.get("license_terms", {})
                row.tags = data.get("tags", [])
                continue
            db.add(template_to_row(data))
        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_templates()
    db = SessionLocal()
    try:
        seed_conservation_demo(db)
    finally:
        db.close()
    yield


app = FastAPI(title="Burin × Pathways API", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pathway_templates.router)
app.include_router(pathways.router)
app.include_router(burin.router)
app.include_router(transect_trust.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "burin-pathways-backend", "apps": ["presence-passport", "transect-trust"]}


static_dir = os.getenv("STATIC_DIR")
if static_dir and Path(static_dir).is_dir():
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
