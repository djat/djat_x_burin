"""Transect Trust orchestration — every action launches a PathwayRun."""

from __future__ import annotations

import time
import uuid
from datetime import datetime, timezone

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.conservation import (
    ConservationGrant,
    ConservationParty,
    ConservationProgram,
    ConservationQuarterClose,
    ConservationReportingUnit,
    ConservationSubmission,
    PathwayRunLink,
)
from app.models.pathway import PathwayRun, RunStatus
from app.services.burin_agents import _get_identity
from app.services.conservation_seed import DEMO_PROGRAM_ID
from app.services.pathway_runner import PathwayRunner
from app.services.template_loader import find_template_by_identity

runner = PathwayRunner()

TEMPLATE_IDS = {
    "program_register": "Conservation.Program.Register@v1",
    "grant_award": "Conservation.Grant.Award@v1",
    "field_submit": "Conservation.Field.EffortSubmit@v1",
    "coordinator_review": "Conservation.Grant.CoordinatorReview@v1",
    "funder_verify": "Conservation.Funder.QuarterVerify@v1",
    "quarterly_close": "Conservation.Program.QuarterlyClose@v1",
    "trust_card": "Conservation.Trust.CardIssue@v1",
    "trust_key_issue": "Pathways.TrustKey.Issue@v1",
    "trust_key_verify": "Pathways.TrustKey.Verify@v1",
    "trust_key_verify_dimensional": "Pathways.TrustKey.VerifyDimensionalLink@v1",
    "trust_key_issue_dimensional": "Pathways.TrustKey.IssueDimensionalLink@v1",
    "trust_key_build_dimensional": "Pathways.TrustKey.BuildDimensionalLinks@v1",
}


def _run_dict(db: Session, run_id: str) -> dict:
    run = db.query(PathwayRun).filter(PathwayRun.id == run_id).first()
    if not run:
        return {}
    return {
        "id": run.id,
        "template_identity": run.template_identity,
        "status": run.status,
        "inputs": run.inputs_json,
        "step_executions": run.step_executions_json,
        "step_artifacts": run.step_artifacts_json,
        "aqua_stub_id": run.aqua_stub_id,
    }


def _linked_runs(db: Session, run_ids: list[str]) -> dict:
    return {rid: _run_dict(db, rid) for rid in run_ids if rid}


def _link(db: Session, child_run_id: str, edge_role: str, party_did: str | None = None, **kwargs) -> None:
    db.add(
        PathwayRunLink(
            child_run_id=child_run_id,
            edge_role=edge_role,
            party_did=party_did,
            entity_type=kwargs.get("entity_type", ""),
            entity_id=kwargs.get("entity_id", ""),
            parent_run_id=kwargs.get("parent_run_id"),
        )
    )


def _template(db: Session, key: str):
    tpl = find_template_by_identity(db, TEMPLATE_IDS[key])
    if not tpl:
        raise ValueError(f"Template not seeded: {TEMPLATE_IDS[key]}")
    return tpl


def _artifact_by_type(run: PathwayRun, artifact_type: str) -> dict | None:
    for art in run.step_artifacts_json.values():
        if isinstance(art, dict) and art.get("artifact_type") == artifact_type:
            return art
    return None


def _merged_trust_key_from_run(run: PathwayRun) -> tuple[dict, dict | None, dict | None, str | None]:
    tk: dict = {}
    manifest = None
    multisig = None
    paper = None
    for art in run.step_artifacts_json.values():
        if not isinstance(art, dict):
            continue
        t = art.get("artifact_type")
        if t == "pathways_trust_key":
            tk = {**tk, **art}
        elif t == "trust_key_dimensional_links":
            tk = {**(art.get("trust_key") or {}), **tk}
        elif t == "trust_key_deeplink_manifest":
            manifest = art
        elif t == "trust_key_multisig_envelope":
            multisig = art
        elif art.get("spoken_seal_24w"):
            paper = art.get("spoken_seal_24w")
    if manifest:
        tk["deeplink_manifest"] = manifest
    return tk, manifest, multisig, paper


async def register_program(db: Session, program_id: str = DEMO_PROGRAM_ID) -> dict:
    program = db.query(ConservationProgram).filter(ConservationProgram.id == program_id).first()
    if not program:
        raise ValueError("Program not found")
    if program.program_run_id:
        return {"program": program, "run": _run_dict(db, program.program_run_id), "already_registered": True}

    identity = _get_identity()
    inputs = {
        "program_id": program_id,
        "program_name": program.name,
        "funder_did": "did:transect:nea-estuary-collab",
        "funder_name": "NE Estuary Collaborative",
        "acceptance_policy_ref": program.acceptance_policy_json.get("policy_ref", "nea-estuary-bounded-effort-v1"),
        "witness_pubkeys": [identity.pubkey.hex()],
        "reporting_period": "quarterly",
        "disclosure_floor_depth": 7,
        "k_min_effort": 3,
    }
    run = await runner.launch(db, _template(db, "program_register"), inputs)
    _link(db, run.id, "program_registration", "did:transect:nea-estuary-collab", entity_type="program", entity_id=program_id)

    trust_card = None
    policy = None
    for art in run.step_artifacts_json.values():
        if isinstance(art, dict):
            if art.get("artifact_type") == "burin_trust_card":
                trust_card = art
            if art.get("artifact_type") == "conservation_acceptance_policy":
                policy = art

    program.program_run_id = run.id
    program.trust_card_json = trust_card or {}
    program.acceptance_policy_json = policy or program.acceptance_policy_json
    program.status = "REGISTERED" if run.status == "COMPLETED" else run.status
    db.commit()
    return {"program": program, "run": _run_dict(db, run.id)}


async def issue_grant_award(db: Session, grant_id: str) -> dict:
    grant = db.query(ConservationGrant).filter(ConservationGrant.id == grant_id).first()
    if not grant:
        raise ValueError("Grant not found")
    if grant.award_run_id:
        return {"grant": grant, "run": _run_dict(db, grant.award_run_id), "already_awarded": True}

    program = db.query(ConservationProgram).filter(ConservationProgram.id == grant.program_id).first()
    unit = db.query(ConservationReportingUnit).filter(ConservationReportingUnit.id == grant.unit_id).first()
    if not program or not unit:
        raise ValueError("Program or unit missing")

    inputs = {
        "grant_id": grant.id,
        "program_id": grant.program_id,
        "grantee_did": "did:transect:hudson-estuary-audubon",
        "grantee_name": "Hudson Estuary Audubon Chapter",
        "unit_id": unit.id,
        "unit_geojson": unit.geojson,
        "unit_source_ref": unit.source_ref,
        "award_amount_usd": grant.award_amount_usd,
        "reporting_quarters": grant.reporting_quarters,
        "program_run_id": program.program_run_id,
        "disclosure_floor_depth": 7,
        "time_us": int(time.time() * 1_000_000),
    }
    linked = _linked_runs(db, [program.program_run_id] if program.program_run_id else [])
    run = await runner.launch(db, _template(db, "grant_award"), inputs, linked_runs=linked)
    _link(
        db,
        run.id,
        "grant_award",
        "did:transect:nea-estuary-collab",
        parent_run_id=program.program_run_id,
        entity_type="grant",
        entity_id=grant.id,
    )

    award = _artifact_by_type(run, "conservation_grant_award")
    grant.award_run_id = run.id
    if award:
        grant.boundary_fingerprint = award.get("boundary_fingerprint", grant.boundary_fingerprint)
    db.commit()
    return {"grant": grant, "run": _run_dict(db, run.id)}


async def submit_field_effort(
    db: Session,
    grant_id: str,
    monitor_did: str,
    monitor_name: str,
    quarter: str,
    transect_ids: list[str],
    polygon_geojson: dict,
    water_observations: dict | None = None,
) -> dict:
    grant = db.query(ConservationGrant).filter(ConservationGrant.id == grant_id).first()
    if not grant:
        raise ValueError("Grant not found")

    submission_id = f"sub_{uuid.uuid4().hex[:10]}"
    inputs = {
        "submission_id": submission_id,
        "grant_id": grant_id,
        "monitor_did": monitor_did,
        "monitor_name": monitor_name,
        "quarter": quarter,
        "transect_ids": transect_ids,
        "polygon_geojson": polygon_geojson,
        "grant_boundary_fingerprint": grant.boundary_fingerprint,
        "depth": 7,
        "time_us": int(time.time() * 1_000_000),
        "k_min": 3,
    }
    if water_observations:
        inputs["water_observations"] = water_observations
    linked = _linked_runs(db, [grant.award_run_id] if grant.award_run_id else [])
    run = await runner.launch(db, _template(db, "field_submit"), inputs, linked_runs=linked)

    sub = ConservationSubmission(
        id=submission_id,
        grant_id=grant_id,
        monitor_party_id="party_monitor_maria",
        quarter=quarter,
        transect_ids=transect_ids,
        field_run_id=run.id,
        status="SUBMITTED" if run.status == "COMPLETED" else run.status,
    )
    db.add(sub)
    _link(db, run.id, "field_effort_submission", monitor_did, parent_run_id=grant.award_run_id, entity_type="submission", entity_id=submission_id)
    db.commit()
    return {"submission": sub, "run": _run_dict(db, run.id)}


async def coordinator_review(db: Session, submission_id: str) -> dict:
    sub = db.query(ConservationSubmission).filter(ConservationSubmission.id == submission_id).first()
    if not sub or not sub.field_run_id:
        raise ValueError("Submission not found")

    if sub.review_run_id:
        prior = db.query(PathwayRun).filter(PathwayRun.id == sub.review_run_id).first()
        if prior and prior.status == RunStatus.FAILED.value:
            db.query(PathwayRunLink).filter(PathwayRunLink.child_run_id == prior.id).delete()
            db.delete(prior)
            sub.review_run_id = None
            sub.status = "SUBMITTED"
            db.flush()

    field_run = db.query(PathwayRun).filter(PathwayRun.id == sub.field_run_id).first()
    coverage_root = ""
    for art in field_run.step_artifacts_json.values():
        if not isinstance(art, dict):
            continue
        if art.get("coverage_root"):
            coverage_root = art["coverage_root"]
            break
        seal = art.get("burin_seal")
        if isinstance(seal, dict) and seal.get("commitment"):
            coverage_root = seal["commitment"]
            break

    review_id = f"rev_{uuid.uuid4().hex[:10]}"
    inputs = {
        "review_id": review_id,
        "submission_id": submission_id,
        "field_run_id": sub.field_run_id,
        "coordinator_did": "did:transect:hudson-audubon-coordinator",
        "coordinator_name": "Elena Kim",
        "grant_id": sub.grant_id,
        "quarter": sub.quarter,
        "coverage_root": coverage_root,
        "checklist_complete": True,
    }
    linked = _linked_runs(db, [sub.field_run_id])
    run = await runner.launch(db, _template(db, "coordinator_review"), inputs, linked_runs=linked)

    sub.review_run_id = run.id
    sub.status = "REVIEWED" if run.status == "COMPLETED" else run.status
    _link(db, run.id, "coordinator_review", "did:transect:hudson-audubon-coordinator", parent_run_id=sub.field_run_id, entity_type="submission", entity_id=submission_id)
    db.commit()
    return {"submission": sub, "run": _run_dict(db, run.id)}


async def funder_verify_quarter(db: Session, program_id: str, grant_id: str, quarter: str) -> dict:
    program = db.query(ConservationProgram).filter(ConservationProgram.id == program_id).first()
    subs = (
        db.query(ConservationSubmission)
        .filter(ConservationSubmission.grant_id == grant_id, ConservationSubmission.quarter == quarter)
        .all()
    )
    field_ids = [s.field_run_id for s in subs if s.field_run_id]
    review_ids = [s.review_run_id for s in subs if s.review_run_id]

    verify_id = f"ver_{uuid.uuid4().hex[:10]}"
    inputs = {
        "verify_id": verify_id,
        "program_run_id": program.program_run_id,
        "grant_id": grant_id,
        "quarter": quarter,
        "field_run_ids": field_ids,
        "review_run_ids": review_ids,
        "funder_did": "did:transect:nea-estuary-collab",
        "trust_card": program.trust_card_json,
    }
    all_ids = ([program.program_run_id] if program.program_run_id else []) + field_ids + review_ids
    linked = _linked_runs(db, [i for i in all_ids if i])
    run = await runner.launch(db, _template(db, "funder_verify"), inputs, linked_runs=linked)

    verdict = _artifact_by_type(run, "funder_verdict")
    passed = verdict.get("verification_passed", False) if verdict else False

    close = db.query(ConservationQuarterClose).filter(
        ConservationQuarterClose.program_id == program_id,
        ConservationQuarterClose.quarter == quarter,
    ).first()
    if close:
        close.verify_run_id = run.id
        close.verification_passed = passed
        close.status = "VERIFIED" if passed else "REJECTED"

    _link(db, run.id, "funder_quarter_verify", "did:transect:nea-estuary-collab", entity_type="quarter", entity_id=quarter)
    db.commit()
    return {"verify_run": _run_dict(db, run.id), "verification_passed": passed, "quarter_close": close}


async def close_quarter(db: Session, program_id: str, quarter: str) -> dict:
    program = db.query(ConservationProgram).filter(ConservationProgram.id == program_id).first()
    close = db.query(ConservationQuarterClose).filter(
        ConservationQuarterClose.program_id == program_id,
        ConservationQuarterClose.quarter == quarter,
    ).first()
    if not close or not close.verify_run_id:
        raise ValueError("Quarter must be verified before close")

    grants = db.query(ConservationGrant).filter(ConservationGrant.program_id == program_id).all()
    run_graph = {
        "program": program.program_run_id,
        "verify": close.verify_run_id,
    }
    for g in grants:
        if g.award_run_id:
            run_graph[f"award_{g.id}"] = g.award_run_id

    close_id = f"close_{uuid.uuid4().hex[:10]}"
    all_ids = list({v for v in run_graph.values() if v})
    linked = _linked_runs(db, all_ids)

    context_dimensions = {
        "program_id": program_id,
        "quarter": quarter,
        "composite_domain": "Conservation",
        "context_lens": "estuary-transect",
    }
    tk_inputs = {
        "origin_channel": "transect-trust-quarterly-close",
        "run_graph": run_graph,
        "context_dimensions": context_dimensions,
        "privacy_mode": "private",
        "multisig_policy": "optional",
        "required_signers": [],
    }
    tk_run = await runner.launch(db, _template(db, "trust_key_issue"), tk_inputs, linked_runs=linked)
    _link(
        db,
        tk_run.id,
        "trust_key_issue",
        "did:transect:nea-estuary-collab",
        parent_run_id=close.verify_run_id,
        entity_type="quarter",
        entity_id=quarter,
    )

    trust_key, deeplink_manifest, multisig_envelope, spoken_seal = _merged_trust_key_from_run(tk_run)
    linked_with_tk = {**linked, tk_run.id: _run_dict(db, tk_run.id)}

    verify_tk_inputs = {
        "trust_key": trust_key,
        "trust_card": program.trust_card_json or {},
        "dimension_scope": context_dimensions,
    }
    verify_tk_run = await runner.launch(
        db, _template(db, "trust_key_verify_dimensional"), verify_tk_inputs, linked_runs=linked_with_tk
    )
    _link(
        db,
        verify_tk_run.id,
        "trust_key_verify_dimensional",
        "did:transect:nea-estuary-collab",
        parent_run_id=tk_run.id,
        entity_type="quarter",
        entity_id=quarter,
    )

    dim_link_inputs = {
        "root_trust_key": trust_key,
        "label": "Water panel fulfillment (Rutgers DO)",
        "dimension_scope": {
            "context_lens": "estuary-transect",
            "capability": "water-panel-fulfillment",
            "agent_role": "field_monitor",
            "location": "unit_huc_02040301",
            "time": quarter,
            "temperature": "12-18C",
        },
        "one_time_key": True,
    }
    dim_link_run = await runner.launch(
        db, _template(db, "trust_key_issue_dimensional"), dim_link_inputs, linked_runs=linked_with_tk
    )
    _link(
        db,
        dim_link_run.id,
        "trust_key_issue_dimensional",
        "did:transect:nea-estuary-collab",
        parent_run_id=tk_run.id,
        entity_type="quarter",
        entity_id=quarter,
    )

    close_inputs = {
        "close_id": close_id,
        "program_id": program_id,
        "quarter": quarter,
        "run_graph": run_graph,
        "program_run_id": program.program_run_id,
        "verify_run_id": close.verify_run_id,
        "trust_key_run_id": tk_run.id,
        "trust_key_verify_run_id": verify_tk_run.id,
        "trust_key_dimensional_link_run_id": dim_link_run.id,
        "trust_key": trust_key,
        "deeplink_manifest": deeplink_manifest or {},
        "multisig_envelope": multisig_envelope or {},
        "spoken_seal_24w": spoken_seal or "",
        "close_packet_id": trust_key.get("dual_bundle_id", ""),
    }
    close_linked = {
        **linked_with_tk,
        verify_tk_run.id: _run_dict(db, verify_tk_run.id),
        dim_link_run.id: _run_dict(db, dim_link_run.id),
    }
    run = await runner.launch(db, _template(db, "quarterly_close"), close_inputs, linked_runs=close_linked)
    _link(
        db,
        run.id,
        "quarterly_close",
        "did:transect:nea-estuary-collab",
        parent_run_id=tk_run.id,
        entity_type="quarter",
        entity_id=quarter,
    )

    close.close_run_id = run.id
    close.status = "CLOSED" if run.status == "COMPLETED" else run.status
    db.commit()
    return {
        "close": close,
        "run": _run_dict(db, run.id),
        "trust_key_issue_run": _run_dict(db, tk_run.id),
        "trust_key_verify_run": _run_dict(db, verify_tk_run.id),
        "trust_key_dimensional_link_run": _run_dict(db, dim_link_run.id),
    }


def get_ecosystem_state(db: Session, program_id: str = DEMO_PROGRAM_ID) -> dict:
    program = db.query(ConservationProgram).filter(ConservationProgram.id == program_id).first()
    parties = db.query(ConservationParty).all()
    units = db.query(ConservationReportingUnit).filter(ConservationReportingUnit.program_id == program_id).all()
    grants = db.query(ConservationGrant).filter(ConservationGrant.program_id == program_id).all()
    subs = db.query(ConservationSubmission).all()
    links = db.query(PathwayRunLink).all()
    closes = db.query(ConservationQuarterClose).filter(ConservationQuarterClose.program_id == program_id).all()
    runs = (
        db.query(PathwayRun)
        .filter(
            or_(
                PathwayRun.template_identity.like("Conservation.%"),
                PathwayRun.template_identity.like("Pathways.TrustKey.%"),
            )
        )
        .all()
    )

    return {
        "program": {
            "id": program.id,
            "name": program.name,
            "status": program.status,
            "program_run_id": program.program_run_id,
            "trust_card": program.trust_card_json,
            "acceptance_policy": program.acceptance_policy_json,
        }
        if program
        else None,
        "parties": [
            {
                "id": p.id,
                "did": p.did,
                "role": p.role,
                "name": p.name,
                "organization": p.organization,
                "description": p.description,
            }
            for p in parties
        ],
        "reporting_units": [
            {
                "id": u.id,
                "unit_code": u.unit_code,
                "name": u.name,
                "unit_type": u.unit_type,
                "source_ref": u.source_ref,
                "geojson": u.geojson,
                "boundary_fingerprint": u.boundary_fingerprint,
            }
            for u in units
        ],
        "grants": [
            {
                "id": g.id,
                "grantee_party_id": g.grantee_party_id,
                "unit_id": g.unit_id,
                "award_run_id": g.award_run_id,
                "boundary_fingerprint": g.boundary_fingerprint,
                "award_amount_usd": g.award_amount_usd,
                "reporting_quarters": g.reporting_quarters,
                "status": g.status,
            }
            for g in grants
        ],
        "submissions": [
            {
                "id": s.id,
                "grant_id": s.grant_id,
                "monitor_party_id": s.monitor_party_id,
                "quarter": s.quarter,
                "transect_ids": s.transect_ids,
                "field_run_id": s.field_run_id,
                "review_run_id": s.review_run_id,
                "status": s.status,
            }
            for s in subs
        ],
        "quarter_closes": [
            {
                "id": c.id,
                "quarter": c.quarter,
                "verify_run_id": c.verify_run_id,
                "close_run_id": c.close_run_id,
                "verification_passed": c.verification_passed,
                "status": c.status,
            }
            for c in closes
        ],
        "pathway_run_links": [
            {
                "id": l.id,
                "parent_run_id": l.parent_run_id,
                "child_run_id": l.child_run_id,
                "edge_role": l.edge_role,
                "party_did": l.party_did,
                "entity_type": l.entity_type,
                "entity_id": l.entity_id,
            }
            for l in links
        ],
        "conservation_runs": [
            {
                "id": r.id,
                "template_identity": r.template_identity,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in runs
        ],
    }
