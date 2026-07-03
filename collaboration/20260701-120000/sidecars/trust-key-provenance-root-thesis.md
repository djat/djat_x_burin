---
type: sidecar
title: "Trust Key — provenance root with dimensional deep links"
technique: Pathways.TrustKey.Issue@v1
pattern: Pattern.TrustKey.ProvenanceKey
authors:
  - DJ Thomson (co-author)
  - Cameron Sajedi (co-author)
filed: 2026-07-03
reference_app: transect-trust
---

# Trust Key thesis

A **Trust Key** is generic Pathways IP: a cryptographic provenance root for any multi-party context. It is not a vendor login, not a merged super-hash, and not a platform-held archive.

## Stack composition (technical)

| Plane | Substrate | Attests |
|-------|-----------|---------|
| Orchestration | Pathways | Which workflow ran, under which rules, with what lineage |
| Presence | Burin | Sealed artifacts intact and offline-checkable at bounded resolution |
| Provenance root | Trust Key | Portable key opening back into full context via deep link |

Planes cross-reference with `hash_linked_cross_reference_only` — no silent merge.

## Dimensional parameters

Deep links accept registry-aligned query parameters to slice context without re-minting the root:

`composite_domain` · `context_lens` · `capability` · `agent_role` · `quarter` · `program_id` · `grant_id` · `habitat` · `unit_id` · `run_role` · `run_id` · `location` · `time` · `temperature`

The same root key can issue **one-time dimensional links** (`one_time=1` + `nonce`) that burn after first offline verify.

## Pathway templates

| Template | PathwayRun role |
|----------|-----------------|
| `Pathways.TrustKey.Issue@v1` | Mint root + build dimensional catalog |
| `Pathways.TrustKey.Verify@v1` | Offline relying-party verify |
| `Pathways.TrustKey.BuildDimensionalLinks@v1` | Rebuild dimensional link catalog |
| `Pathways.TrustKey.IssueDimensionalLink@v1` | Issue scoped / one-time link |
| `Pathways.TrustKey.VerifyDimensionalLink@v1` | Verify scoped slice offline |

Quarter close in Transect Trust launches sibling PathwayRuns: Issue → VerifyDimensionalLink → IssueDimensionalLink → `Conservation.Program.QuarterlyClose@v1`.

## Practice example (Transect Trust)

One estuary quarter: a field session seals one PathwayRun; opt-in seagrass/mangrove collaborations and in-network water requests spawn sibling runs. At close the funder receives a Trust Key, verifies offline, and opens dimensional deep links only if the audit needs more than the scoped slice.

See `burin-pathways/techniques/TRUST_KEY_TECHNIQUE.v1.md` and `burin-pathways/TRANSECT_TRUST_PLAYBOOK.md`.
