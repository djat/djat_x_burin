"""Transect Trust demo seed — parties, public reporting units, program scaffold."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.conservation import (
    ConservationGrant,
    ConservationParty,
    ConservationProgram,
    ConservationQuarterClose,
    ConservationReportingUnit,
)
from app.services.burin_agents import BurinAgents

DEMO_PROGRAM_ID = "nea-estuary-transect-2026"

PARTIES = [
    {
        "id": "party_funder_nea",
        "did": "did:transect:nea-estuary-collab",
        "role": "funder_program_officer",
        "name": "Dr. Sam Okoro",
        "organization": "NE Estuary Collaborative",
        "email": "sokoro@nea-estuary.example",
        "description": "Grant program officer, sets acceptance policy and verifies quarterly Trust Keys.",
    },
    {
        "id": "party_coord_elena",
        "did": "did:transect:hudson-audubon-coordinator",
        "role": "chapter_coordinator",
        "name": "Elena Kim",
        "organization": "Hudson Estuary Audubon Chapter",
        "email": "elena.kim@hudson-audubon.example",
        "description": "Aggregates volunteer submissions; witness-attests completeness for the chapter.",
    },
    {
        "id": "party_monitor_maria",
        "did": "did:transect:maria-reyes-monitor",
        "role": "field_monitor",
        "name": "Maria Reyes",
        "organization": "Hudson Estuary Audubon Chapter",
        "email": "maria.reyes@volunteer.example",
        "description": "Walks transects B and C; submits bounded effort proofs without nest pins.",
    },
    {
        "id": "party_grantee_org",
        "did": "did:transect:hudson-estuary-audubon",
        "role": "grantee_organization",
        "name": "Hudson Estuary Audubon Chapter",
        "organization": "Hudson Estuary Audubon Chapter",
        "email": "grants@hudson-audubon.example",
        "description": "Grantee organization receiving program funds.",
    },
    {
        "id": "party_witness_demo",
        "did": "did:transect:witness-channel-demo",
        "role": "presence_witness",
        "name": "Transect Witness Demo",
        "organization": "Burin witness channel (demo)",
        "email": "",
        "description": "Witness-not-authority relay — timestamps seals without deciding disputes.",
    },
]

# Public-unit-aligned geometry (simplified; source refs point to USGS HUC / PAD-US catalog shapes)
REPORTING_UNITS = [
    {
        "id": "unit_huc02020006",
        "unit_code": "HUC02020006",
        "name": "Piermont Marsh — Lower Hudson HUC unit",
        "unit_type": "HUC12",
        "source_ref": "USGS WBD HUC12 02020006 (public watershed boundary)",
        "geojson": {
            "type": "Polygon",
            "coordinates": [
                [
                    [-73.95, 41.00],
                    [-73.85, 41.00],
                    [-73.85, 41.10],
                    [-73.95, 41.10],
                    [-73.95, 41.00],
                ]
            ],
        },
    },
    {
        "id": "unit_huc02020007",
        "unit_code": "HUC02020007",
        "name": "Iona Island — Hudson estuary unit",
        "unit_type": "HUC12",
        "source_ref": "USGS WBD HUC12 02020007 (public watershed boundary)",
        "geojson": {
            "type": "Polygon",
            "coordinates": [
                [
                    [-73.90, 41.08],
                    [-73.80, 41.08],
                    [-73.80, 41.18],
                    [-73.90, 41.18],
                    [-73.90, 41.08],
                ]
            ],
        },
    },
    {
        "id": "unit_pad_constitution",
        "unit_code": "PAD-US-NY-ConstitutionMarsh",
        "name": "Constitution Marsh — PAD-US protected area",
        "unit_type": "PAD-US",
        "source_ref": "USGS GAP PAD-US 4.0 protected area unit (public)",
        "geojson": {
            "type": "Polygon",
            "coordinates": [
                [
                    [-73.92, 40.98],
                    [-73.82, 40.98],
                    [-73.82, 41.08],
                    [-73.92, 41.08],
                    [-73.92, 40.98],
                ]
            ],
        },
    },
]


def _fingerprint(geojson: dict, depth: int = 7) -> str:
    agents = BurinAgents()
    last_err: Exception | None = None
    for d in range(depth, 5, -1):
        try:
            _, art = agents._burin_canonicalize_polygon_to_fingerprint(
                {"polygon_geojson": geojson, "depth": d}, {"inputs": {}, "artifacts": {}}
            )
            return art["fingerprint_hex"]
        except Exception as exc:
            last_err = exc
    raise last_err or ValueError("Could not fingerprint unit")


def seed_conservation_demo(db: Session) -> None:
    if db.query(ConservationParty).first():
        return

    for p in PARTIES:
        db.add(ConservationParty(**p))

    program = ConservationProgram(
        id=DEMO_PROGRAM_ID,
        name="NE Estuary Transect Monitoring Program 2026",
        funder_party_id="party_funder_nea",
        status="READY",
        acceptance_policy_json={
            "policy_ref": "nea-estuary-bounded-effort-v1",
            "summary": "Accept offline verifiable effort proofs at HUC12/PAD-US unit floor; reject raw GPS tracks, identifiable personal or organizational data, and species observations tied to location.",
        },
    )
    db.add(program)

    fps: dict[str, str] = {}
    for u in REPORTING_UNITS:
        fp = _fingerprint(u["geojson"])
        fps[u["id"]] = fp
        db.add(
            ConservationReportingUnit(
                program_id=DEMO_PROGRAM_ID,
                boundary_fingerprint=fp,
                **u,
            )
        )

    db.add(
        ConservationGrant(
            id="grant_maria_piermont_2026",
            program_id=DEMO_PROGRAM_ID,
            grantee_party_id="party_grantee_org",
            unit_id="unit_huc02020006",
            boundary_fingerprint=fps["unit_huc02020006"],
            award_amount_usd=12500,
            reporting_quarters=["2026-Q2", "2026-Q3", "2026-Q4"],
            status="ACTIVE",
        )
    )

    db.add(
        ConservationQuarterClose(
            id="close_2026_q2",
            program_id=DEMO_PROGRAM_ID,
            quarter="2026-Q2",
            status="OPEN",
        )
    )

    db.commit()
