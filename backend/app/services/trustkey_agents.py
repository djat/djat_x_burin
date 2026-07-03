"""Pathways Trust Key technique — generic provenance root issuance and offline verify."""

from __future__ import annotations

import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlencode

from app.services.burin_agents import BurinAgents, _get_identity

TRUST_KEY_TECHNIQUE = "Pathways.TrustKey.Issue@v1"
TRUST_KEY_VERIFY_TECHNIQUE = "Pathways.TrustKey.Verify@v1"

# Registry-aligned dimension keys passed as deep-link query parameters.
TRUST_KEY_DIMENSION_KEYS = (
    "composite_domain",
    "context_lens",
    "capability",
    "agent_role",
    "quarter",
    "program_id",
    "grant_id",
    "habitat",
    "unit_id",
    "run_role",
    "run_id",
    "location",
    "time",
    "temperature",
)

TRUST_KEY_AUTHORS = [
    {
        "order": 1,
        "did": "did:placeholder:dj-thomson-pathways",
        "name": "DJ Thomson",
        "role": "co-author",
    },
    {
        "order": 2,
        "did": "did:placeholder:cameron-sajedi-burin",
        "name": "Cameron Sajedi",
        "role": "co-author",
    },
]

TRUST_KEY_UNIQUE_ASPECTS = [
    "provenance_root_key",
    "deep_link_to_originating_collaborative_context",
    "dual_plane_orchestration_and_presence",
    "no_merged_super_hash",
    "entirely_private_distribution",
    "multisig_capable_envelope",
    "offline_verifiable_without_issuer_platform",
    "hash_linked_cross_reference_only",
    "portable_relying_party_verification",
    "powerful_party_does_least",
    "dimensional_context_parameters",
    "one_time_dimensional_links",
]


def _flatten_dimensions(raw: dict | None) -> dict[str, str]:
    if not raw:
        return {}
    flat: dict[str, str] = {}
    for key, val in raw.items():
        if key not in TRUST_KEY_DIMENSION_KEYS or val is None:
            continue
        flat[key] = str(val)
    return flat


def _build_deep_link(
    context_id: str,
    trust_key_id: str,
    dimensions: dict[str, str] | None = None,
    *,
    one_time: bool = False,
    nonce: str | None = None,
) -> str:
    params: dict[str, str] = {"trust_key": trust_key_id}
    params.update(_flatten_dimensions(dimensions or {}))
    if one_time:
        params["one_time"] = "1"
        params["nonce"] = nonce or uuid.uuid4().hex[:8]
    query = urlencode(params)
    return f"transect-trust://context/{context_id}?{query}"


def _dimension_link_examples(context_id: str, trust_key_id: str, base: dict[str, str]) -> list[dict]:
    """Canonical dimensional slices — same root key, scoped deep links (some one-time)."""
    program_id = base.get("program_id", "nea-estuary-transect-2026")
    quarter = base.get("quarter", "2026-Q2")
    specs = [
        {
            "label": "Full quarter program context",
            "description": "Program officer archive: all Conservation runs for the reporting quarter.",
            "scope": {
                "program_id": program_id,
                "quarter": quarter,
                "composite_domain": "Conservation",
            },
            "one_time": False,
        },
        {
            "label": "Marsh bird grant — bounded effort slice",
            "description": "Maria’s primary grant proof: fauna / marsh habitat only.",
            "scope": {
                "composite_domain": "Conservation",
                "capability": "bounded-disclosure-effort",
                "habitat": "marsh",
                "grant_id": "grant_maria_bird_2026",
            },
            "one_time": False,
        },
        {
            "label": "Seagrass opt-in sibling run",
            "description": "Cross-initiative discovery match — subtidal flora, private to monitor until opt-in.",
            "scope": {
                "composite_domain": "Seagrass",
                "context_lens": "estuary-transect",
                "capability": "cross-initiative-discovery",
            },
            "one_time": True,
        },
        {
            "label": "Water panel fulfillment (Rutgers DO)",
            "description": "In-network measurement request — dissolved oxygen panel bounded by location, time, and temperature.",
            "scope": {
                "context_lens": "estuary-transect",
                "capability": "water-panel-fulfillment",
                "agent_role": "field_monitor",
                "location": "unit_huc_02040301",
                "time": "2026-Q2",
                "temperature": "12-18C",
            },
            "one_time": True,
        },
        {
            "label": "Mangrove restoration verification",
            "description": "Shoreline stabilization plot overlap — different funder, same bounded session.",
            "scope": {
                "composite_domain": "Mangrove",
                "habitat": "mangrove",
                "capability": "bounded-disclosure-effort",
            },
            "one_time": False,
        },
        {
            "label": "Coordinator witness attestation",
            "description": "Single run_role slice for fraud-check audit — burns after first offline verify.",
            "scope": {
                "run_role": "coordinator_review",
                "agent_role": "chapter_coordinator",
                "quarter": quarter,
            },
            "one_time": True,
        },
    ]
    links: list[dict] = []
    for spec in specs:
        scope = _flatten_dimensions(spec["scope"])
        one_time = bool(spec["one_time"])
        nonce = uuid.uuid4().hex[:8] if one_time else None
        deep_link = _build_deep_link(context_id, trust_key_id, scope, one_time=one_time, nonce=nonce)
        links.append(
            {
                "label": spec["label"],
                "description": spec["description"],
                "scope": scope,
                "deep_link": deep_link,
                "one_time": one_time,
                "use_limit": 1 if one_time else None,
                "uses_remaining": 1 if one_time else None,
                "link_id": hashlib.sha256(deep_link.encode()).hexdigest()[:12],
            }
        )
    return links


class TrustKeyAgents:
    def __init__(self) -> None:
        self._burin = BurinAgents()

    def run(self, agent_id: str, skill: str, config: dict, context: dict) -> tuple[str, dict]:
        if agent_id != "pathways_trustkey":
            raise ValueError(f"Unknown trust key agent: {agent_id}/{skill}")
        method = getattr(self, f"_{agent_id}_{skill}", None)
        if not method:
            raise ValueError(f"Unknown trust key skill: {agent_id}/{skill}")
        return method(config, context)

    def _resolve(self, val: Any, context: dict) -> Any:
        return self._burin._resolve(val, context)

    def _pathways_trustkey_collect_provenance_context(self, config: dict, context: dict) -> tuple[str, dict]:
        run_graph = self._resolve(config.get("run_graph"), context) or {}
        origin_channel = self._resolve(config.get("origin_channel"), context) or "pathways-trust-key"
        context_dimensions = _flatten_dimensions(self._resolve(config.get("context_dimensions"), context))
        dimension_scope = _flatten_dimensions(self._resolve(config.get("dimension_scope"), context))
        linked = context.get("linked_runs", {})
        indexed: dict[str, Any] = {}
        aggregated: dict[str, Any] = {}
        for role, run_id in run_graph.items():
            if run_id and run_id in linked:
                run = linked[run_id]
                arts = run.get("step_artifacts", {})
                indexed[role] = {
                    "run_id": run_id,
                    "template_identity": run.get("template_identity"),
                    "status": run.get("status"),
                    "step_artifact_keys": list(arts.keys()),
                }
                aggregated[role] = arts
        context_id = hashlib.sha256(
            json.dumps(
                {"run_graph": run_graph, "channel": origin_channel, "dimensions": context_dimensions},
                sort_keys=True,
                default=str,
            ).encode()
        ).hexdigest()[:16]
        artifact = {
            "artifact_type": "trust_key_provenance_context",
            "context_id": context_id,
            "origin_channel": origin_channel,
            "context_dimensions": context_dimensions,
            "dimension_scope": dimension_scope,
            "run_graph": run_graph,
            "indexed_runs": indexed,
            "aggregated_artifacts": aggregated,
            "run_count": len(indexed),
            "technique": TRUST_KEY_TECHNIQUE,
            "authors": TRUST_KEY_AUTHORS,
        }
        return f"Provenance context indexed ({len(indexed)} runs) for Trust Key mint.", artifact

    def _pathways_trustkey_mint_trust_key(self, config: dict, context: dict) -> tuple[str, dict]:
        dual_bundle = self._resolve(config.get("dual_bundle"), context) or {}
        prov = self._resolve(config.get("provenance_context"), context) or {}
        privacy_mode = self._resolve(config.get("privacy_mode"), context) or "private"
        one_time_key = bool(self._resolve(config.get("one_time_key"), context))
        use_limit = self._resolve(config.get("use_limit"), context)
        extra_dimensions = _flatten_dimensions(self._resolve(config.get("context_dimensions"), context))
        dimension_scope = _flatten_dimensions(self._resolve(config.get("dimension_scope"), context))
        context_dimensions = {**prov.get("context_dimensions", {}), **extra_dimensions, **dimension_scope}
        context_id = prov.get("context_id") or hashlib.sha256(json.dumps(dual_bundle, sort_keys=True, default=str).encode()).hexdigest()[:16]
        trust_key_id = f"tk_{uuid.uuid4().hex[:12]}"
        bundle_id = dual_bundle.get("bundle_id", "")
        deep_link = _build_deep_link(context_id, trust_key_id, context_dimensions, one_time=one_time_key)
        identity = _get_identity()
        key_material = hashlib.sha256(
            json.dumps(
                {
                    "trust_key_id": trust_key_id,
                    "bundle_id": bundle_id,
                    "context_id": context_id,
                    "context_dimensions": context_dimensions,
                    "pubkey": identity.pubkey.hex(),
                },
                sort_keys=True,
            ).encode()
        ).hexdigest()
        resolved_use_limit = 1 if one_time_key else (int(use_limit) if use_limit is not None else None)
        artifact = {
            "artifact_type": "pathways_trust_key",
            "trust_key_id": trust_key_id,
            "technique": TRUST_KEY_TECHNIQUE,
            "authors": TRUST_KEY_AUTHORS,
            "unique_aspects": TRUST_KEY_UNIQUE_ASPECTS,
            "privacy_mode": privacy_mode,
            "offline_verifiable": True,
            "platform_independent": True,
            "key_material_hex": key_material,
            "dual_bundle_id": bundle_id,
            "planes": {
                "orchestration": dual_bundle.get("orchestration_plane"),
                "presence": dual_bundle.get("presence_plane"),
            },
            "merge_policy": dual_bundle.get("merge_policy", "hash_linked_cross_reference_only"),
            "context_dimensions": context_dimensions,
            "dimension_scope": dimension_scope or None,
            "deep_link": deep_link,
            "one_time_key": one_time_key,
            "use_limit": resolved_use_limit,
            "uses_remaining": resolved_use_limit,
            "context_id": context_id,
            "minted_at": datetime.now(timezone.utc).isoformat(),
        }
        return (
            f"Trust Key `{trust_key_id}` minted (private={privacy_mode == 'private'}).",
            artifact,
        )

    def _pathways_trustkey_build_dimensional_links(self, config: dict, context: dict) -> tuple[str, dict]:
        trust_key = self._resolve(config.get("trust_key"), context) or {}
        prov = self._resolve(config.get("provenance_context"), context) or {}
        base = {**prov.get("context_dimensions", {}), **(trust_key.get("context_dimensions") or {})}
        context_id = trust_key.get("context_id", "")
        trust_key_id = trust_key.get("trust_key_id", "")
        links = _dimension_link_examples(context_id, trust_key_id, base)
        updated_key = {**trust_key, "dimensional_links": links}
        artifact = {
            "artifact_type": "trust_key_dimensional_links",
            "trust_key_id": trust_key_id,
            "dimensional_links": links,
            "dimension_keys_supported": list(TRUST_KEY_DIMENSION_KEYS),
            "trust_key": updated_key,
        }
        return f"Built {len(links)} dimensional deep links.", artifact

    def _pathways_trustkey_issue_dimensional_link(self, config: dict, context: dict) -> tuple[str, dict]:
        root = self._resolve(config.get("root_trust_key"), context) or {}
        scope = _flatten_dimensions(self._resolve(config.get("dimension_scope"), context))
        one_time = bool(self._resolve(config.get("one_time_key"), context))
        label = self._resolve(config.get("label"), context) or "Scoped dimensional link"
        context_id = root.get("context_id", "")
        trust_key_id = root.get("trust_key_id", "")
        if not trust_key_id:
            raise ValueError("root_trust_key missing trust_key_id")
        nonce = uuid.uuid4().hex[:8] if one_time else None
        deep_link = _build_deep_link(context_id, trust_key_id, scope, one_time=one_time, nonce=nonce)
        link = {
            "label": label,
            "scope": scope,
            "deep_link": deep_link,
            "one_time": one_time,
            "use_limit": 1 if one_time else None,
            "uses_remaining": 1 if one_time else None,
            "link_id": hashlib.sha256(deep_link.encode()).hexdigest()[:12],
        }
        artifact = {
            "artifact_type": "trust_key_dimensional_link",
            "root_trust_key_id": trust_key_id,
            "dimensional_link": link,
            "deep_link": deep_link,
            "dimension_scope": scope,
            "one_time_key": one_time,
        }
        return f"Issued dimensional link `{link['link_id']}` ({label}).", artifact

    def _pathways_trustkey_build_deeplink_manifest(self, config: dict, context: dict) -> tuple[str, dict]:
        trust_key = self._resolve(config.get("trust_key"), context) or {}
        # Accept trust_key from build_dimensional_links step (nested under .trust_key)
        if trust_key.get("artifact_type") == "trust_key_dimensional_links":
            trust_key = trust_key.get("trust_key") or trust_key
        prov = self._resolve(config.get("provenance_context"), context) or {}
        run_graph = prov.get("run_graph") or {}
        linked = context.get("linked_runs", {})
        entries = []
        root_dims = trust_key.get("context_dimensions") or {}
        for role, run_id in run_graph.items():
            if not run_id:
                continue
            run = linked.get(run_id, {})
            template = run.get("template_identity") or ""
            entry_dims = {**root_dims, "run_role": role, "run_id": run_id}
            if template.startswith("Conservation."):
                entry_dims.setdefault("composite_domain", "Conservation")
            entries.append(
                {
                    "role": role,
                    "run_id": run_id,
                    "template_identity": template,
                    "deep_link": _build_deep_link(
                        trust_key.get("context_id", ""),
                        trust_key.get("trust_key_id", ""),
                        entry_dims,
                    ),
                    "dimension_scope": _flatten_dimensions(entry_dims),
                }
            )
        artifact = {
            "artifact_type": "trust_key_deeplink_manifest",
            "trust_key_id": trust_key.get("trust_key_id"),
            "context_root": trust_key.get("deep_link"),
            "context_dimensions": root_dims,
            "dimensional_links": trust_key.get("dimensional_links", []),
            "entries": entries,
            "opens_back_into": "full collaborative context: PathwayRuns, Burin seals, party attestations, step artifacts",
            "dimension_keys_supported": list(TRUST_KEY_DIMENSION_KEYS),
        }
        trust_key = {**trust_key, "deeplink_manifest": artifact}
        return f"Deep-link manifest built ({len(entries)} runs).", artifact

    def _pathways_trustkey_apply_multisig_envelope(self, config: dict, context: dict) -> tuple[str, dict]:
        trust_key = self._resolve(config.get("trust_key"), context) or {}
        policy = self._resolve(config.get("multisig_policy"), context) or "optional"
        required_signers = self._resolve(config.get("required_signers"), context) or []
        artifact = {
            "artifact_type": "trust_key_multisig_envelope",
            "trust_key_id": trust_key.get("trust_key_id"),
            "multisig_policy": policy,
            "required_signers": required_signers,
            "signatures": [],
            "status": "OPEN" if policy != "none" else "NOT_REQUIRED",
            "note": "Demo stub — production binds per-party device or org keys",
        }
        return f"Multi-sig envelope prepared ({policy}).", artifact

    def _pathways_trustkey_load_trust_key(self, config: dict, context: dict) -> tuple[str, dict]:
        trust_key = self._resolve(config.get("trust_key"), context) or context.get("inputs", {}).get("trust_key") or {}
        if not trust_key.get("trust_key_id"):
            raise ValueError("Trust Key payload missing trust_key_id")
        return f"Loaded Trust Key `{trust_key['trust_key_id']}`.", {
            "artifact_type": "trust_key_load",
            "trust_key": trust_key,
        }

    def _pathways_trustkey_verify_trust_key_offline(self, config: dict, context: dict) -> tuple[str, dict]:
        trust_key = self._resolve(config.get("trust_key"), context) or {}
        trust_card = self._resolve(config.get("trust_card"), context) or {}
        dimension_scope = _flatten_dimensions(self._resolve(config.get("dimension_scope"), context))
        planes = trust_key.get("planes") or {}
        has_orchestration = bool(planes.get("orchestration") or trust_key.get("dual_bundle_id"))
        has_presence = bool(planes.get("presence"))
        keys = trust_card.get("witness_pubkeys") or []
        witness_ok = len(keys) > 0 or bool(trust_card)
        one_time = trust_key.get("one_time_key") or dimension_scope.get("one_time") == "1"
        uses_remaining = trust_key.get("uses_remaining")
        if uses_remaining is None and one_time:
            uses_remaining = 1
        one_time_blocked = one_time and uses_remaining is not None and int(uses_remaining) <= 0
        scope_ok = True
        if dimension_scope:
            key_dims = trust_key.get("context_dimensions") or {}
            for k, v in dimension_scope.items():
                if k in ("one_time", "nonce", "trust_key"):
                    continue
                if key_dims.get(k) and key_dims.get(k) != v:
                    scope_ok = False
        ok = has_orchestration and witness_ok and scope_ok and not one_time_blocked
        consumed = False
        if ok and one_time and uses_remaining is not None and int(uses_remaining) > 0:
            trust_key = {**trust_key, "uses_remaining": 0, "consumed_at": datetime.now(timezone.utc).isoformat()}
            consumed = True
        artifact = {
            "artifact_type": "trust_key_verification",
            "trust_key_id": trust_key.get("trust_key_id"),
            "technique": TRUST_KEY_VERIFY_TECHNIQUE,
            "verification_passed": ok,
            "dimension_scope_applied": dimension_scope or None,
            "one_time_consumed": consumed,
            "checks": {
                "orchestration_plane_present": has_orchestration,
                "presence_plane_present": has_presence,
                "trust_card_witness_set": witness_ok,
                "dimension_scope_matches": scope_ok,
                "one_time_not_expired": not one_time_blocked,
                "offline_capable": True,
                "platform_login_required": False,
            },
            "deep_link_resolvable": bool(trust_key.get("deep_link")),
            "dimensional_links_available": len(trust_key.get("dimensional_links") or []),
            "verified_at": datetime.now(timezone.utc).isoformat(),
            "trust_key": trust_key if consumed else None,
        }
        return f"Trust Key offline verify: {'PASS' if ok else 'FAIL'}.", artifact

    def _pathways_trustkey_resolve_deeplink_context(self, config: dict, context: dict) -> tuple[str, dict]:
        manifest = self._resolve(config.get("deeplink_manifest"), context) or {}
        linked = context.get("linked_runs", {})
        resolved = []
        for entry in manifest.get("entries", []):
            rid = entry.get("run_id")
            resolved.append(
                {
                    **entry,
                    "resolved": rid in linked,
                    "artifact_count": len(linked.get(rid, {}).get("step_artifacts", {})) if rid in linked else 0,
                }
            )
        artifact = {
            "artifact_type": "trust_key_context_resolution",
            "entries_resolved": len([r for r in resolved if r.get("resolved")]),
            "entries_total": len(resolved),
            "resolved": resolved,
        }
        return f"Deep-link context resolved ({artifact['entries_resolved']}/{artifact['entries_total']} runs).", artifact


trustkey_agents = TrustKeyAgents()
