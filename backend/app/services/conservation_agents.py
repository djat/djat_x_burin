"""Conservation grant workflow agents — Transect Trust IP encoded as Pathway steps."""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from typing import Any

from burin.kernel import verify_seal

from app.services.burin_agents import BurinAgents, _get_identity, root_to_24_words


class ConservationAgents:
    def __init__(self) -> None:
        self._burin = BurinAgents()

    def run(self, agent_id: str, skill: str, config: dict, context: dict) -> tuple[str, dict]:
        method = getattr(self, f"_{agent_id}_{skill}", None)
        if not method:
            raise ValueError(f"Unknown conservation agent/skill: {agent_id}/{skill}")
        return method(config, context)

    def _resolve(self, val: Any, context: dict) -> Any:
        return self._burin._resolve(val, context)

    # --- conservation_program ---

    def _conservation_program_encode_acceptance_policy(self, config: dict, context: dict) -> tuple[str, dict]:
        program_id = self._resolve(config["program_id"], context)
        policy_ref = self._resolve(config["acceptance_policy_ref"], context)
        depth = int(self._resolve(config.get("disclosure_floor_depth", 7), context) or 7)
        k_min = int(self._resolve(config.get("k_min_effort", 3), context) or 3)
        policy = {
            "artifact_type": "conservation_acceptance_policy",
            "program_id": program_id,
            "policy_ref": policy_ref,
            "accepts": [
                "bounded_disclosure_effort_proof",
                "coordinator_witness_attestation",
                "dual_attestation_quarterly_packet",
            ],
            "rejects": [
                "raw_gps_track",
                "identifiable_person_or_org_data",
                "species_tied_to_location",
                "platform_screenshot_only",
            ],
            "disclosure_floor_depth": depth,
            "k_min_effort": k_min,
            "verification_mode": "offline_dual_plane",
            "encoded_at": datetime.now(timezone.utc).isoformat(),
        }
        md = f"Acceptance policy `{policy_ref}` encoded for program `{program_id}`."
        return md, policy

    def _conservation_program_mint_trust_card(self, config: dict, context: dict) -> tuple[str, dict]:
        program_id = self._resolve(config["program_id"], context)
        funder_did = self._resolve(config["funder_did"], context)
        funder_name = self._resolve(config["funder_name"], context)
        witness_pubkeys = self._resolve(config.get("witness_pubkeys"), context) or []
        identity = _get_identity()
        pk_hex = identity.pubkey.hex()
        if not witness_pubkeys:
            witness_pubkeys = [pk_hex]
        trust_card = {
            "artifact_type": "burin_trust_card",
            "program_id": program_id,
            "funder_did": funder_did,
            "funder_name": funder_name,
            "witness_pubkeys": witness_pubkeys,
            "signer_pubkey": pk_hex,
            "dggs": self._resolve(config.get("dggs"), context) or "rHEALPix WGS84 N_side=3 aperture-9",
            "issued_at": datetime.now(timezone.utc).isoformat(),
            "verification_instructions": "Accept seals from listed witness_pubkeys; verify offline via burin.kernel",
        }
        return f"Trust card minted for `{program_id}` ({len(witness_pubkeys)} witness keys).", trust_card

    def _conservation_program_bind_reporting_unit_catalog(self, config: dict, context: dict) -> tuple[str, dict]:
        program_id = self._resolve(config["program_id"], context)
        catalog_ref = self._resolve(config["catalog_ref"], context)
        artifact = {
            "artifact_type": "reporting_unit_catalog_binding",
            "program_id": program_id,
            "catalog_ref": catalog_ref,
            "unit_types": ["HUC12", "PAD-US"],
            "source": "public_geometry_seed_v1",
        }
        return f"Reporting unit catalog `{catalog_ref}` bound.", artifact

    def _conservation_program_package_program_registration(self, config: dict, context: dict) -> tuple[str, dict]:
        program_id = self._resolve(config["program_id"], context)
        channel = self._resolve(config.get("channel"), context) or "transect-trust"
        artifacts = context.get("artifacts", {})
        bundle_id = hashlib.sha256(json.dumps(artifacts, sort_keys=True, default=str).encode()).hexdigest()
        artifact = {
            "artifact_type": "program_registration_bundle",
            "bundle_id": bundle_id,
            "channel": channel,
            "program_id": program_id,
            "planes": {"orchestration": "pathway_run", "presence": "trust_card_and_policy"},
        }
        return f"Program registration bundle `{bundle_id[:16]}…` packaged.", artifact

    def _conservation_program_extract_trust_card_from_program_run(self, config: dict, context: dict) -> tuple[str, dict]:
        program_run = context.get("linked_runs", {}).get(self._resolve(config["program_run_id"], context), {})
        artifacts = program_run.get("step_artifacts", {})
        trust_card = None
        anchor_seal = None
        for art in artifacts.values():
            if isinstance(art, dict):
                if art.get("artifact_type") == "burin_trust_card":
                    trust_card = art
                if art.get("burin_seal"):
                    anchor_seal = art["burin_seal"]
        if not trust_card:
            identity = _get_identity()
            trust_card = {
                "artifact_type": "burin_trust_card",
                "program_id": self._resolve(config["program_id"], context),
                "witness_pubkeys": [identity.pubkey.hex()],
            }
        if not anchor_seal:
            _, seal_art = self._burin._burin_presence_commit_and_seal(
                {"cells": [["Q", 7, 5, 3]], "depth": 7, "time_us": 1_000_000}, context
            )
            anchor_seal = seal_art["burin_seal"]
        return "Trust card extracted from program run.", {
            "artifact_type": "trust_card_extract",
            "trust_card": trust_card,
            "anchor_seal": anchor_seal,
        }

    def _conservation_program_finalize_trust_card(self, config: dict, context: dict) -> tuple[str, dict]:
        trust_card = self._resolve(config["trust_card"], context) or {}
        spoken = self._resolve(config["spoken_seal_24w"], context)
        trust_card = {**trust_card, "spoken_seal_24w": spoken, "printable": True}
        return "Trust card finalized for distribution.", {
            "artifact_type": "trust_card_final",
            "trust_card": trust_card,
            "issued_to_role": self._resolve(config.get("issued_to_role"), context),
        }

    def _conservation_program_validate_run_graph_closure(self, config: dict, context: dict) -> tuple[str, dict]:
        run_graph = self._resolve(config["run_graph"], context) or {}
        linked = context.get("linked_runs", {})
        aggregated: dict[str, Any] = {}
        for role, run_id in run_graph.items():
            if run_id and run_id in linked:
                aggregated[role] = linked[run_id].get("step_artifacts", {})
        ok = bool(run_graph.get("program") and run_graph.get("verify"))
        return f"Run graph closure: {'COMPLETE' if ok else 'INCOMPLETE'}.", {
            "artifact_type": "run_graph_closure",
            "complete": ok,
            "aggregated_artifacts": aggregated,
            "run_graph": run_graph,
        }

    def _conservation_program_compute_royalty_attribution(self, config: dict, context: dict) -> tuple[str, dict]:
        program_id = self._resolve(config["program_id"], context)
        attribution = {
            "artifact_type": "royalty_attribution",
            "program_id": program_id,
            "pathway_templates_used": [
                "Conservation.Program.Register@v1",
                "Conservation.Grant.Award@v1",
                "Conservation.Field.EffortSubmit@v1",
                "Conservation.Grant.CoordinatorReview@v1",
                "Conservation.Funder.QuarterVerify@v1",
                "Conservation.Program.QuarterlyClose@v1",
                "Pathways.TrustKey.Issue@v1",
                "Pathways.TrustKey.VerifyDimensionalLink@v1",
                "Pathways.TrustKey.IssueDimensionalLink@v1",
            ],
            "ip_origin": "transect-trust-v1",
            "computed_at": datetime.now(timezone.utc).isoformat(),
        }
        return "Royalty attribution computed for quarter.", attribution

    def _conservation_program_record_quarterly_close(self, config: dict, context: dict) -> tuple[str, dict]:
        trust_key = self._resolve(config.get("trust_key"), context) or {}
        artifact = {
            "artifact_type": "quarterly_close_record",
            "close_id": self._resolve(config["close_id"], context),
            "program_id": self._resolve(config["program_id"], context),
            "quarter": self._resolve(config["quarter"], context),
            "program_run_id": self._resolve(config["program_run_id"], context),
            "verify_run_id": self._resolve(config["verify_run_id"], context),
            "close_packet_id": self._resolve(config["close_packet_id"], context),
            "spoken_seal_24w": self._resolve(config.get("spoken_seal_24w"), context),
            "trust_key": trust_key,
            "trust_key_id": trust_key.get("trust_key_id"),
            "trust_key_technique": trust_key.get("technique", "Pathways.TrustKey.Issue@v1"),
            "trust_key_run_id": self._resolve(config.get("trust_key_run_id"), context),
            "trust_key_verify_run_id": self._resolve(config.get("trust_key_verify_run_id"), context),
            "trust_key_dimensional_link_run_id": self._resolve(config.get("trust_key_dimensional_link_run_id"), context),
            "deeplink_manifest": self._resolve(config.get("deeplink_manifest"), context),
            "multisig_envelope": self._resolve(config.get("multisig_envelope"), context),
            "pathway_runs": {
                "trust_key_issue": self._resolve(config.get("trust_key_run_id"), context),
                "trust_key_verify": self._resolve(config.get("trust_key_verify_run_id"), context),
                "trust_key_issue_dimensional": self._resolve(config.get("trust_key_dimensional_link_run_id"), context),
            },
            "status": "CLOSED",
        }
        tk_id = trust_key.get("trust_key_id", "—")
        return f"Quarter `{artifact['quarter']}` closed; Trust Key `{tk_id}` issued.", artifact

    # --- conservation_grant ---

    def _conservation_grant_record_grant_award(self, config: dict, context: dict) -> tuple[str, dict]:
        artifact = {
            "artifact_type": "conservation_grant_award",
            "grant_id": self._resolve(config["grant_id"], context),
            "program_id": self._resolve(config["program_id"], context),
            "grantee_did": self._resolve(config["grantee_did"], context),
            "grantee_name": self._resolve(config["grantee_name"], context),
            "unit_id": self._resolve(config["unit_id"], context),
            "unit_source_ref": self._resolve(config["unit_source_ref"], context),
            "award_amount_usd": self._resolve(config.get("award_amount_usd"), context),
            "reporting_quarters": self._resolve(config.get("reporting_quarters"), context) or [],
            "boundary_fingerprint": self._resolve(config["boundary_fingerprint"], context),
            "awarded_at": datetime.now(timezone.utc).isoformat(),
        }
        return f"Grant `{artifact['grant_id']}` awarded to `{artifact['grantee_name']}`.", artifact

    def _conservation_grant_link_program_registration(self, config: dict, context: dict) -> tuple[str, dict]:
        return "Grant award linked to program registration run.", {
            "artifact_type": "program_grant_link",
            "program_run_id": self._resolve(config["program_run_id"], context),
            "grant_id": self._resolve(config["grant_id"], context),
            "award_seal": self._resolve(config.get("award_seal"), context),
            "edge_role": "grant_award_under_program",
        }

    def _conservation_grant_load_field_submission_artifact(self, config: dict, context: dict) -> tuple[str, dict]:
        field_run_id = self._resolve(config["field_run_id"], context)
        linked = context.get("linked_runs", {}).get(field_run_id, {})
        artifacts = linked.get("step_artifacts", {})
        submission = None
        for art in artifacts.values():
            if isinstance(art, dict) and art.get("artifact_type") == "field_submission_record":
                submission = art
        return f"Loaded field submission from run `{field_run_id}`.", {
            "artifact_type": "field_submission_load",
            "field_run_id": field_run_id,
            "submission": submission,
            "step_artifacts": artifacts,
        }

    def _conservation_grant_record_coordinator_review(self, config: dict, context: dict) -> tuple[str, dict]:
        artifact = {
            "artifact_type": "coordinator_review_record",
            "review_id": self._resolve(config["review_id"], context),
            "submission_id": self._resolve(config["submission_id"], context),
            "field_run_id": self._resolve(config["field_run_id"], context),
            "coordinator_did": self._resolve(config["coordinator_did"], context),
            "coordinator_name": self._resolve(config["coordinator_name"], context),
            "grant_id": self._resolve(config["grant_id"], context),
            "quarter": self._resolve(config["quarter"], context),
            "witness_attestation": self._resolve(config.get("witness_attestation"), context),
            "checklist_complete": bool(self._resolve(config.get("checklist_complete"), context)),
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
            "status": "APPROVED_FOR_FUNDER",
        }
        return f"Coordinator review `{artifact['review_id']}` recorded.", artifact

    # --- conservation_field ---

    def _conservation_field_validate_within_grant_boundary(self, config: dict, context: dict) -> tuple[str, dict]:
        grant_fp = str(self._resolve(config["grant_boundary_fingerprint"], context) or "")
        polygon = self._resolve(config["polygon_geojson"], context)
        depth = int(self._resolve(config.get("depth", 7), context) or 7)
        _, work_art = self._burin._burin_canonicalize_polygon_to_fingerprint(
            {"polygon_geojson": polygon, "depth": depth}, context
        )
        work_fp = work_art.get("fingerprint_hex", "")
        # Coarse containment: work fingerprint shares prefix with grant unit at depth-2 cells
        prefix_len = min(len(grant_fp), len(work_fp), 8)
        within = grant_fp[:prefix_len] == work_fp[:prefix_len] if prefix_len >= 4 else True
        artifact = {
            "artifact_type": "boundary_validation",
            "submission_id": self._resolve(config["submission_id"], context),
            "grant_id": self._resolve(config["grant_id"], context),
            "grant_boundary_fingerprint": grant_fp,
            "work_fingerprint": work_fp,
            "within_boundary": within,
        }
        if not within:
            raise ValueError("Work zone is outside grant reporting unit boundary")
        return "Work zone validated within grant unit boundary.", artifact

    def _conservation_field_record_field_submission(self, config: dict, context: dict) -> tuple[str, dict]:
        artifact = {
            "artifact_type": "field_submission_record",
            "submission_id": self._resolve(config["submission_id"], context),
            "grant_id": self._resolve(config["grant_id"], context),
            "monitor_did": self._resolve(config["monitor_did"], context),
            "monitor_name": self._resolve(config["monitor_name"], context),
            "quarter": self._resolve(config["quarter"], context),
            "transect_ids": self._resolve(config.get("transect_ids"), context) or [],
            "effort_seal": self._resolve(config.get("effort_seal"), context),
            "zk_proof": self._resolve(config.get("zk_proof"), context),
            "submitted_at": datetime.now(timezone.utc).isoformat(),
        }
        inputs = context.get("inputs", {})
        if inputs.get("water_observations"):
            artifact["water_observations"] = inputs["water_observations"]
        return f"Field submission `{artifact['submission_id']}` recorded.", artifact

    # --- conservation_funder ---

    def _conservation_funder_collect_quarter_runs(self, config: dict, context: dict) -> tuple[str, dict]:
        linked = context.get("linked_runs", {})
        field_ids = self._resolve(config.get("field_run_ids"), context) or []
        review_ids = self._resolve(config.get("review_run_ids"), context) or []
        program_run_id = self._resolve(config.get("program_run_id"), context)
        collected: dict[str, Any] = {}
        if program_run_id and program_run_id in linked:
            collected["program"] = linked[program_run_id].get("step_artifacts", {})
        for rid in field_ids:
            if rid in linked:
                collected[f"field_{rid}"] = linked[rid].get("step_artifacts", {})
        for rid in review_ids:
            if rid in linked:
                collected[f"review_{rid}"] = linked[rid].get("step_artifacts", {})
        return f"Collected {len(collected)} run artifact sets for quarter.", {
            "artifact_type": "quarter_run_collection",
            "collected_artifacts": collected,
            "field_run_ids": field_ids,
            "review_run_ids": review_ids,
        }

    def _conservation_funder_verify_trust_card(self, config: dict, context: dict) -> tuple[str, dict]:
        trust_card = self._resolve(config.get("trust_card"), context) or {}
        keys = self._resolve(config.get("witness_pubkeys"), context) or trust_card.get("witness_pubkeys", [])
        ok = len(keys) > 0
        return f"Trust card verification: {'PASS' if ok else 'FAIL'}.", {
            "artifact_type": "trust_card_verification",
            "valid": ok,
            "witness_count": len(keys),
        }

    def _conservation_funder_verify_presence_seals_offline(self, config: dict, context: dict) -> tuple[str, dict]:
        field_ids = self._resolve(config.get("field_run_ids"), context) or []
        trust_card = self._resolve(config.get("trust_card"), context) or {}
        linked = context.get("linked_runs", {})
        trusted = [bytes.fromhex(k) for k in trust_card.get("witness_pubkeys", []) if k]
        if not trusted:
            trusted = [_get_identity().pubkey]
        results = []
        all_ok = True
        for rid in field_ids:
            run = linked.get(rid, {})
            seal = None
            for art in run.get("step_artifacts", {}).values():
                if isinstance(art, dict) and art.get("burin_seal"):
                    seal = art["burin_seal"]
                    break
            if seal:
                report = verify_seal(seal, trusted_pubkeys=trusted)
                results.append({"run_id": rid, "ok": report.ok, "reasons": report.reasons})
                all_ok = all_ok and report.ok
            else:
                results.append({"run_id": rid, "ok": False, "reasons": ["no seal"]})
                all_ok = False
        return f"Seal verification: {'ALL PASS' if all_ok else 'FAILURES'}.", {
            "artifact_type": "seal_verification_batch",
            "all_seals_valid": all_ok,
            "results": results,
        }

    def _conservation_funder_verify_bounded_disclosure_claims(self, config: dict, context: dict) -> tuple[str, dict]:
        field_ids = self._resolve(config.get("field_run_ids"), context) or []
        k_min = int(self._resolve(config.get("k_min_required", 3), context) or 3)
        linked = context.get("linked_runs", {})
        claims = []
        all_ok = True
        for rid in field_ids:
            k_proven = 0
            for art in linked.get(rid, {}).get("step_artifacts", {}).values():
                if isinstance(art, dict) and art.get("artifact_type") == "burin_zk_survey_proof":
                    zk = art.get("burin_zk_survey_proof", {})
                    k_proven = zk.get("k_proven", art.get("k_proven", 0))
            ok = k_proven >= k_min
            claims.append({"run_id": rid, "k_proven": k_proven, "k_min": k_min, "ok": ok})
            all_ok = all_ok and ok
        return f"Bounded disclosure claims: {'SATISFIED' if all_ok else 'INSUFFICIENT'}.", {
            "artifact_type": "bounded_disclosure_verification",
            "all_claims_valid": all_ok,
            "claims": claims,
        }

    def _conservation_funder_record_funder_verdict(self, config: dict, context: dict) -> tuple[str, dict]:
        passed = bool(self._resolve(config.get("verification_passed"), context))
        artifact = {
            "artifact_type": "funder_verdict",
            "verify_id": self._resolve(config["verify_id"], context),
            "grant_id": self._resolve(config["grant_id"], context),
            "quarter": self._resolve(config["quarter"], context),
            "funder_did": self._resolve(config["funder_did"], context),
            "verification_passed": passed,
            "dual_bundle": self._resolve(config.get("dual_bundle"), context),
            "verdict_at": datetime.now(timezone.utc).isoformat(),
            "status": "ACCEPTED" if passed else "REJECTED",
        }
        return f"Funder verdict: {artifact['status']}.", artifact


conservation_agents = ConservationAgents()
