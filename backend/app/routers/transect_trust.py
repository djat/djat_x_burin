from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.pathway import PathwayRun
from app.services import conservation_service as svc
from app.services.proof_provenance import build_run_provenance, build_trust_stack

router = APIRouter(prefix="/api/transect-trust", tags=["transect-trust"])


class FieldSubmitRequest(BaseModel):
    grant_id: str
    monitor_did: str
    monitor_name: str
    quarter: str = "2026-Q2"
    transect_ids: list[str] = ["B", "C"]
    polygon_geojson: dict
    water_observations: dict | None = None


@router.get("/ecosystem")
def get_ecosystem(db: Session = Depends(get_db)):
    return svc.get_ecosystem_state(db)


@router.post("/program/register")
async def register_program(db: Session = Depends(get_db)):
    try:
        return await svc.register_program(db)
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.post("/grants/{grant_id}/award")
async def issue_award(grant_id: str, db: Session = Depends(get_db)):
    try:
        return await svc.issue_grant_award(db, grant_id)
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.post("/submissions/field")
async def submit_field(req: FieldSubmitRequest, db: Session = Depends(get_db)):
    try:
        return await svc.submit_field_effort(
            db,
            req.grant_id,
            req.monitor_did,
            req.monitor_name,
            req.quarter,
            req.transect_ids,
            req.polygon_geojson,
            water_observations=req.water_observations,
        )
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.post("/submissions/{submission_id}/review")
async def review_submission(submission_id: str, db: Session = Depends(get_db)):
    try:
        return await svc.coordinator_review(db, submission_id)
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.post("/programs/{program_id}/grants/{grant_id}/quarters/{quarter}/verify")
async def verify_quarter(program_id: str, grant_id: str, quarter: str, db: Session = Depends(get_db)):
    try:
        return await svc.funder_verify_quarter(db, program_id, grant_id, quarter)
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.post("/programs/{program_id}/quarters/{quarter}/close")
async def close_quarter(program_id: str, quarter: str, db: Session = Depends(get_db)):
    try:
        return await svc.close_quarter(db, program_id, quarter)
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.get("/trust-stack")
def get_trust_stack(db: Session = Depends(get_db)):
    return build_trust_stack(db)


@router.get("/runs/{run_id}/provenance")
def get_run_provenance(run_id: str, db: Session = Depends(get_db)):
    run = db.query(PathwayRun).filter(PathwayRun.id == run_id).first()
    if not run:
        raise HTTPException(404, "Run not found")
    return build_run_provenance(run, db)


@router.get("/runs/{run_id}")
def get_run(run_id: str, db: Session = Depends(get_db)):
    run = db.query(PathwayRun).filter(PathwayRun.id == run_id).first()
    if not run:
        raise HTTPException(404, "Run not found")
    out = svc._run_dict(db, run_id)
    out["provenance"] = build_run_provenance(run, db)
    return out
