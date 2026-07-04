---
technique_id: Pathways.TrustKey.Issue@v1
pattern: Pattern.TrustKey.ProvenanceKey
version: 1
authors:
 - order: 1
    name: DJ Thomson
    did: did:placeholder:dj-thomson-pathways
    role: co-author
 - order: 2
    name: Cameron Sajedi
    did: did:placeholder:cameron-sajedi-burin
    role: co-author
---

# Trust Key - Pathways technique

## Concept

A **Trust Key** is a generic Pathways technique for issuing a cryptographic **provenance root** to any multi-party collaborative context. It is encoded as:

| Artifact | Template |
|----------|----------|
| Issue | `Pathways.TrustKey.Issue@v1` |
| Verify | `Pathways.TrustKey.Verify@v1` |
| Pattern | `patterns/Pattern.TrustKey.ProvenanceKey.yaml` |

## Authors

1. **DJ Thomson** - co-author (`did:placeholder:dj-thomson-pathways`)
2. **Cameron Sajedi** - co-author (`did:placeholder:cameron-sajedi-burin`)

Royalty split on Trust Key templates: 55% technique-originator (DJ) / 45% co-author (Cameron) on standalone templates; domain compositions (e.g. quarterly close) may allocate additional shares to program operators.

## Unique aspects

| Aspect | Meaning |
|--------|---------|
| `provenance_root_key` | One portable key binds the entire context graph |
| `deep_link_to_originating_collaborative_context` | Resolves to PathwayRuns, seals, attestations, artifacts |
| `dual_plane_orchestration_and_presence` | Pathways orchestration + Burin presence, not one blob |
| `no_merged_super_hash` | `merge_policy: hash_linked_cross_reference_only` |
| `entirely_private_distribution` | Key file travels peer-to-peer; contents stay private |
| `multisig_capable_envelope` | Optional co-steward signatures |
| `offline_verifiable_without_issuer_platform` | No vendor login; trust card + local verify |
| `portable_relying_party_verification` | Funder, auditor, counterparty on their own device |
| `powerful_party_does_least` | Verify offline; deep link only if more detail needed |
| `dimensional_context_parameters` | Query params slice any registry facet without re-minting |
| `one_time_dimensional_links` | Scoped links with `one_time=1` burn after first verify |

## Dimensional deep-link parameters

The root `deep_link` and every scoped `dimensional_link` accept registry-aligned query parameters:

`composite_domain` · `context_lens` · `capability` · `agent_role` · `quarter` · `program_id` · `grant_id` · `habitat` · `unit_id` · `run_role` · `run_id` · `location` · `time` · `temperature`

Pass `one_time=1` and a `nonce` on any scoped link to mint a **one-time key** from the same root - verify burns that slice after first use.

### Example dimensional links (Transect Trust quarter)

| Slice | One-time | Parameters |
|-------|----------|------------|
| Full quarter program | no | `program_id`, `quarter`, `composite_domain=Conservation` |
| Marsh bird grant effort | no | `composite_domain`, `capability=bounded-disclosure-effort`, `habitat=marsh`, `grant_id` |
| Seagrass opt-in sibling | yes | `composite_domain=Seagrass`, `context_lens`, `capability=cross-initiative-discovery`, `one_time=1` |
| Water panel (Rutgers DO) | yes | `context_lens`, `capability=water-panel-fulfillment`, `location`, `time`, `temperature`, `one_time=1` |
| Mangrove restoration | no | `composite_domain=Mangrove`, `habitat=mangrove`, `capability=bounded-disclosure-effort` |
| Coordinator witness | yes | `run_role=coordinator_review`, `agent_role=chapter_coordinator`, `quarter`, `one_time=1` |

## Issue pipeline (steps)

1. `collect_provenance_context` - index run graph + aggregated artifacts
2. `assemble_dual_attestation_bundle` - orchestration + presence planes
3. `mint_trust_key` - provenance root + key material + deep link URI
4. `build_dimensional_links` - catalog of registry-aligned dimensional deep links
5. `build_deeplink_manifest` - per-run deep links back into context
6. `apply_multisig_envelope` - optional multi-signature wrapper
7. `degrade_to_paper` - optional 24-word spoken seal on presence anchor

## Standalone Pathway templates

| Template | PathwayRun purpose |
|----------|-------------------|
| `Pathways.TrustKey.BuildDimensionalLinks@v1` | Rebuild dimensional link catalog from root |
| `Pathways.TrustKey.IssueDimensionalLink@v1` | Issue one scoped link (optional one-time) |
| `Pathways.TrustKey.VerifyDimensionalLink@v1` | Verify scoped / one-time link offline |

Quarter close orchestrates sibling PathwayRuns: Issue → VerifyDimensionalLink → IssueDimensionalLink → QuarterlyClose record.

## Verify pipeline (steps)

1. `load_trust_key`
2. `verify_trust_key_offline` - against trust card witness set
3. `resolve_deeplink_context` - hydrate linked runs when available

## Composition in Transect Trust

`Conservation.Program.QuarterlyClose@v1` embeds the Issue pipeline after run-graph validation and royalty attribution, producing a `pathways_trust_key` artifact on the quarterly close record.

**Reference application:** [Transect Trust](../../assets/transect-trust/) - live at [http://209.46.125.56/](http://209.46.125.56/). Playbook: [`TRANSECT_TRUST_PLAYBOOK.md`](../TRANSECT_TRUST_PLAYBOOK.md).

## Agent

`pathways_trustkey` - implemented in `backend/app/services/trustkey_agents.py`
