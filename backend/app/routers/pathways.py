from __future__ import annotations

import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.pathway import PathwayRun, PathwayTemplate
from app.services.pathway_runner import PathwayRunner

router = APIRouter(prefix="/api/pathways", tags=["pathways"])
runner = PathwayRunner()


class LaunchRequest(BaseModel):
    pathway_id: str
    inputs: dict = {}


class RunOut(BaseModel):
    id: str
    pathway_id: str
    template_identity: str
    status: str
    current_step: int
    total_steps: int
    inputs: dict
    step_executions: list
    step_artifacts: dict
    final_output: str | None
    aqua_stub_id: str | None
    created_at: datetime
    completed_at: datetime | None
    error_message: str | None


def _run_to_out(r: PathwayRun) -> RunOut:
    return RunOut(
        id=r.id,
        pathway_id=r.pathway_id,
        template_identity=r.template_identity,
        status=r.status,
        current_step=r.current_step,
        total_steps=r.total_steps,
        inputs=r.inputs_json,
        step_executions=r.step_executions_json,
        step_artifacts=r.step_artifacts_json,
        final_output=r.final_output,
        aqua_stub_id=r.aqua_stub_id,
        created_at=r.created_at,
        completed_at=r.completed_at,
        error_message=r.error_message,
    )


@router.post("/launch", response_model=RunOut)
async def launch_pathway(req: LaunchRequest, db: Session = Depends(get_db)):
    template = db.query(PathwayTemplate).filter(PathwayTemplate.id == req.pathway_id).first()
    if not template:
        raise HTTPException(404, "Template not found")
    run = await runner.launch(db, template, req.inputs)
    return _run_to_out(run)


@router.get("/{run_id}", response_model=RunOut)
def get_run(run_id: str, db: Session = Depends(get_db)):
    run = db.query(PathwayRun).filter(PathwayRun.id == run_id).first()
    if not run:
        raise HTTPException(404, "Run not found")
    return _run_to_out(run)


@router.get("/{run_id}/export-bundle")
def export_dual_bundle(run_id: str, db: Session = Depends(get_db)):
    run = db.query(PathwayRun).filter(PathwayRun.id == run_id).first()
    if not run:
        raise HTTPException(404, "Run not found")
    bundle = {
        "bundle_type": "dual_attestation",
        "merge_policy": "hash_linked_cross_reference_only",
        "channel": "djat-burin-20260701",
        "run_id": run.id,
        "template_identity": run.template_identity,
        "orchestration_plane": {"aqua_stub_id": run.aqua_stub_id, "step_executions": run.step_executions_json},
        "presence_plane": {"step_artifacts": run.step_artifacts_json},
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "disclaimer": "Consistency proof, not ground truth. Burin kernel: PolyForm NC.",
    }
    content = json.dumps(bundle, indent=2)
    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{run_id}-dual-bundle.json"'},
    )
