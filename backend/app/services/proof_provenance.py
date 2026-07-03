"""Proof provenance — devices, data sources, account IDs, implicit trust layers."""

from __future__ import annotations

from app.models.conservation import ConservationParty, ConservationReportingUnit
from app.models.pathway import PathwayRun
from app.services.burin_agents import _get_identity
from app.services.conservation_seed import DEMO_PROGRAM_ID, PARTIES

# Global implicit trust stack (honest boundaries for demo + production path)
IMPLICIT_TRUST_STACK = [
    {
        "layer": "Relying party acceptance",
        "assumption": "The funder (Sam) chose to accept Trust Keys matching the program trust card; Burin does not force this.",
        "who_must_act": "NE Estuary Collaborative program officer",
    },
    {
        "layer": "Trust card / witness key-set",
        "assumption": "Verifier trusts seals signed by pubkeys listed on the printable trust card distributed at program registration.",
        "who_must_act": "Funder distributes card; verifiers load it before checking files",
    },
    {
        "layer": "Demo signer custody (this deployment)",
        "assumption": "All seals share one ephemeral backend-generated SM2 key — NOT per-volunteer device keys.",
        "who_must_act": "Production would bind Maria's phone or chapter HSM",
    },
    {
        "layer": "Server clock",
        "assumption": "time_us on seals comes from the API server clock, not GNSS or an independent witness timestamp.",
        "who_must_act": "Production may add witness channel or BeiDou RDSS relay",
    },
    {
        "layer": "Public unit geometry",
        "assumption": "Grant boundary is USGS HUC / PAD-US catalog shape — assumed correct, not field-surveyed here.",
        "who_must_act": "USGS / GAP; funder picks unit from catalog",
    },
    {
        "layer": "Map interaction (field step)",
        "assumption": "Work zone polygon reflects where the user tapped the map — not independent GPS witness.",
        "who_must_act": "Field monitor; optional browser geolocation not wired in demo",
    },
    {
        "layer": "Pathways orchestration",
        "assumption": "Step order and agent outputs faithfully recorded in PathwayRun — aqua_stub is hash placeholder, not full Aqua tree.",
        "who_must_act": "Pathways engine operator",
    },
    {
        "layer": "ZK effort proof (stub)",
        "assumption": "Bounded-disclosure claim is stub-bound to coverage root — full PLONK proof not yet in this build.",
        "who_must_act": "Burin/zk prover in production path",
    },
    {
        "layer": "Ground truth",
        "assumption": "Proof shows record integrity and agreed workflow — NOT that birds/nests exist or Maria was physically on site.",
        "who_must_act": "Human relying party interprets evidence",
    },
]

STEP_PROVENANCE_TEMPLATE: dict[str, dict] = {
    "Conservation.Program.Register@v1": {
        "devices_used": [],
        "devices_not_used": ["Field GPS", "Mobile EVV app", "Satellite relay"],
        "data_sources": [
            {"kind": "policy_document", "ref": "nea-estuary-bounded-effort-v1", "role": "Acceptance policy text"},
            {"kind": "server_generated", "ref": "demo_witness_pubkey", "role": "Trust card witness key-set"},
        ],
        "actor_party_ids": ["party_funder_nea"],
    },
    "Conservation.Grant.Award@v1": {
        "devices_used": [],
        "data_sources": [
            {"kind": "public_dataset", "ref": "USGS WBD HUC12 / PAD-US unit polygon", "role": "Grant boundary canonicalization"},
            {"kind": "server_clock", "ref": "backend time_us", "role": "Award seal timestamp"},
        ],
        "actor_party_ids": ["party_funder_nea"],
    },
    "Conservation.Field.EffortSubmit@v1": {
        "devices_used": [
            {"kind": "client_browser", "ref": "Web browser + Leaflet map", "role": "Work zone polygon (tap-to-mark)"},
        ],
        "devices_not_used": ["Dedicated GPS logger", "eBird/iNaturalist app", "Satellite position witness"],
        "data_sources": [
            {"kind": "public_dataset", "ref": "Grant unit boundary fingerprint", "role": "Boundary validation"},
            {"kind": "openstreetmap", "ref": "OSM tile basemap", "role": "Map display only — not in seal"},
            {"kind": "user_input", "ref": "transect_ids B,C", "role": "Declared transects (not GPS-tracked)"},
            {"kind": "server_clock", "ref": "backend time_us", "role": "Presence seal timestamp"},
            {"kind": "dggs", "ref": "rHEALPix WGS84 depth-7", "role": "Cell canonicalization"},
            {"kind": "field_observation", "ref": "water_observations (intrinsic + honored private requests)", "role": "In-network measurement fulfillment — demo readings"},
            {"kind": "trust_network", "ref": "nea-estuary-trust-network-v1", "role": "Private request routing gate (requester DID on trust card)"},
        ],
        "actor_party_ids": ["party_monitor_maria"],
    },
    "Conservation.Grant.CoordinatorReview@v1": {
        "devices_used": [],
        "data_sources": [
            {"kind": "prior_run", "ref": "field_effort PathwayRun artifacts", "role": "Review loads submission seals"},
            {"kind": "server_clock", "ref": "backend time_us", "role": "Witness attestation timestamp"},
        ],
        "actor_party_ids": ["party_coord_elena"],
    },
    "Conservation.Funder.QuarterVerify@v1": {
        "devices_used": [
            {"kind": "verifier_client", "ref": "Funder laptop (offline-capable verify)", "role": "Seal batch check against trust card"},
        ],
        "data_sources": [
            {"kind": "trust_card", "ref": "program trust_card_json", "role": "Witness pubkey acceptance set"},
            {"kind": "aggregated_runs", "ref": "program + field + review runs", "role": "Quarter packet"},
        ],
        "actor_party_ids": ["party_funder_nea"],
    },
    "Conservation.Program.QuarterlyClose@v1": {
        "devices_used": [],
        "data_sources": [
            {"kind": "run_graph", "ref": "All linked PathwayRuns", "role": "Archive aggregation"},
            {"kind": "trust_key_technique", "ref": "Pathways.TrustKey.Issue@v1", "role": "Provenance root mint"},
        ],
        "actor_party_ids": ["party_funder_nea"],
    },
    "Pathways.TrustKey.Issue@v1": {
        "devices_used": [],
        "data_sources": [
            {"kind": "run_graph", "ref": "Linked PathwayRun artifacts", "role": "Provenance context"},
            {"kind": "dual_bundle", "ref": "Orchestration + presence planes", "role": "Hash-linked cross-reference"},
        ],
        "actor_party_ids": [],
        "technique_authors": ["DJ Thomson (co-author)", "Cameron Sajedi (co-author)"],
    },
    "Pathways.TrustKey.Verify@v1": {
        "devices_used": [
            {"kind": "verifier_client", "ref": "Relying party laptop", "role": "Offline Trust Key verify"},
        ],
        "data_sources": [
            {"kind": "trust_key", "ref": "pathways_trust_key artifact", "role": "Verification target"},
            {"kind": "trust_card", "ref": "Witness pubkey acceptance set", "role": "Cold-start acceptance"},
        ],
        "actor_party_ids": [],
        "technique_authors": ["DJ Thomson (co-author)", "Cameron Sajedi (co-author)"],
    },
    "Pathways.TrustKey.BuildDimensionalLinks@v1": {
        "devices_used": [],
        "data_sources": [
            {"kind": "trust_key", "ref": "pathways_trust_key root", "role": "Dimensional link catalog source"},
        ],
        "actor_party_ids": [],
        "technique_authors": ["DJ Thomson (co-author)", "Cameron Sajedi (co-author)"],
    },
    "Pathways.TrustKey.IssueDimensionalLink@v1": {
        "devices_used": [],
        "data_sources": [
            {"kind": "trust_key", "ref": "Root trust key", "role": "Scoped link issuance"},
            {"kind": "dimension_scope", "ref": "Query parameters", "role": "location, time, temperature, capability, etc."},
        ],
        "actor_party_ids": [],
        "technique_authors": ["DJ Thomson (co-author)", "Cameron Sajedi (co-author)"],
    },
    "Pathways.TrustKey.VerifyDimensionalLink@v1": {
        "devices_used": [
            {"kind": "verifier_client", "ref": "Relying party laptop", "role": "Offline dimensional verify"},
        ],
        "data_sources": [
            {"kind": "trust_key", "ref": "pathways_trust_key", "role": "Verification target"},
            {"kind": "dimension_scope", "ref": "Scoped query params", "role": "One-time or multi-use slice"},
        ],
        "actor_party_ids": [],
        "technique_authors": ["DJ Thomson (co-author)", "Cameron Sajedi (co-author)"],
    },
}


def _signer_info() -> dict:
    identity = _get_identity()
    pk = identity.pubkey.hex()
    return {
        "account_id": f"demo_burin_signer_{pk[:16]}",
        "pubkey_hex": pk,
        "algorithm": "SM2",
        "custody": "ephemeral_demo_backend_process",
        "note": "Single shared demo key for all seals — production binds per-party device or org key",
    }


def _party_accounts(party_ids: list[str], db) -> list[dict]:
    accounts = []
    for pid in party_ids:
        row = db.query(ConservationParty).filter(ConservationParty.id == pid).first()
        if row:
            accounts.append(
                {
                    "party_id": row.id,
                    "account_id": row.id,
                    "did": row.did,
                    "role": row.role,
                    "name": row.name,
                    "organization": row.organization,
                }
            )
        else:
            seed = next((p for p in PARTIES if p["id"] == pid), None)
            if seed:
                accounts.append(
                    {
                        "party_id": seed["id"],
                        "account_id": seed["id"],
                        "did": seed["did"],
                        "role": seed["role"],
                        "name": seed["name"],
                        "organization": seed["organization"],
                    }
                )
    return accounts


def _extract_seal_meta(run: PathwayRun) -> dict:
    meta: dict = {}
    for art in run.step_artifacts_json.values():
        if not isinstance(art, dict):
            continue
        if art.get("burin_seal"):
            seal = art["burin_seal"]
            att = seal.get("attestation") or seal
            meta["coverage_root"] = art.get("coverage_root") or att.get("root")
            meta["time_us"] = att.get("time_us") or att.get("issued_at")
            meta["signer_pubkey"] = seal.get("pubkey") or att.get("witness_pk")
        if art.get("artifact_type") == "burin_zk_survey_proof":
            zk = art.get("burin_zk_survey_proof", {})
            meta["zk_k_proven"] = zk.get("k_proven")
            meta["zk_stub"] = zk.get("type") == "survey_effort_stub"
        if art.get("unit_source_ref"):
            meta["unit_source_ref"] = art.get("unit_source_ref")
    inputs = run.inputs_json or {}
    if inputs.get("unit_source_ref"):
        meta["unit_source_ref"] = inputs["unit_source_ref"]
    if inputs.get("transect_ids"):
        meta["transect_ids"] = inputs["transect_ids"]
    if inputs.get("polygon_geojson"):
        meta["work_zone_provided"] = True
    return meta


def build_run_provenance(run: PathwayRun, db) -> dict:
    template = run.template_identity
    tpl = STEP_PROVENANCE_TEMPLATE.get(template, {})
    party_ids = tpl.get("actor_party_ids", [])
    accounts = _party_accounts(party_ids, db)
    signer = _signer_info()

    # Enrich data sources from run inputs
    data_sources = list(tpl.get("data_sources", []))
    inputs = run.inputs_json or {}
    if inputs.get("grant_boundary_fingerprint"):
        data_sources.append(
            {
                "kind": "prior_seal",
                "ref": inputs["grant_boundary_fingerprint"][:16] + "…",
                "role": "Grant boundary fingerprint check",
            }
        )
    if inputs.get("program_run_id"):
        data_sources.append(
            {"kind": "prior_run", "ref": inputs["program_run_id"], "role": "Linked program registration"}
        )

    seal_meta = _extract_seal_meta(run)

    return {
        "run_id": run.id,
        "template_identity": template,
        "actor_accounts": accounts,
        "burin_signer": signer,
        "seal_extract": seal_meta,
        "devices_used": tpl.get("devices_used", []),
        "devices_not_used": tpl.get("devices_not_used", []),
        "data_sources": data_sources,
        "implicit_trust_layers": IMPLICIT_TRUST_STACK,
    }


def build_trust_stack(db) -> dict:
    return {
        "program_id": DEMO_PROGRAM_ID,
        "burin_signer": _signer_info(),
        "parties": [
            {
                "party_id": p.id,
                "account_id": p.id,
                "did": p.did,
                "role": p.role,
                "name": p.name,
            }
            for p in db.query(ConservationParty).all()
        ],
        "implicit_trust_layers": IMPLICIT_TRUST_STACK,
        "public_data_catalog": [
            {
                "unit_id": u.id,
                "unit_code": u.unit_code,
                "source_ref": u.source_ref,
            }
            for u in db.query(ConservationReportingUnit).filter(
                ConservationReportingUnit.program_id == DEMO_PROGRAM_ID
            ).all()
        ],
    }
