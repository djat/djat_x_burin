---
type: application-playbook
title: "Transect Trust - Conservation Grant Effort Hub"
bundle: burin-pathways v1.1.0-transect-trust
conformance_target: S
audience: Conservation funders, grantee chapters, Pathways implementers
filed: 2026-07-03
parent_playbook: APPLICATION_PLAYBOOK.md
---

# Transect Trust

## Multi-party aggregation on Burin + Pathways for conservation grant reporting

---

## §1 - Problem wedge

Funders require proof that transects were walked. Chapters cannot publish exact nest coordinates. Incumbent platforms (eBird, iNat) obscure on-platform but do not issue **portable, offline-verifiable bounded effort proofs** at a **public unit floor** (HUC12, PAD-US).

Transect Trust encodes the **multi-party workflow** as Pathways templates; Burin supplies presence + bounded disclosure inside field steps.

---

## §2 - Aggregating parties

| Layer | Party | PathwayRun role |
|-------|-------|-----------------|
| Policy | Funder program officer | `program_registration`, `funder_quarter_verify`, `quarterly_close` |
| Geometry bootstrap | Public catalog (USGS HUC, PAD-US) | `grant_award` boundary bind |
| Grantee | Chapter organization | Grant entity; coordinator reviews |
| Aggregation | Chapter coordinator | `coordinator_review` + witness attestation |
| Production | Field monitor | `field_effort_submission` |
| Substrate | Burin kernel | `burin_seal`, `burin_zk_survey_proof` artifacts |
| Orchestration | Pathways / Transect Trust IP | Template `license_terms`, run hypergraph |

---

## §3 - Pathway catalog (new IP)

| Template | Purpose |
|----------|---------|
| `Conservation.Program.Register@v1` | Acceptance policy + trust card + unit catalog |
| `Conservation.Grant.Award@v1` | Award bound to public unit boundary |
| `Conservation.Field.EffortSubmit@v1` | Field bounded effort + boundary validation |
| `Conservation.Grant.CoordinatorReview@v1` | Coordinator witness + fraud check |
| `Conservation.Funder.QuarterVerify@v1` | Offline seal batch + disclosure verify |
| `Conservation.Program.QuarterlyClose@v1` | Multi-run aggregation packet |
| `Conservation.Trust.CardIssue@v1` | Printable verifier cold-start |
| `Pathways.TrustKey.Issue@v1` | **Trust Key technique** - provenance root + deep link (DJ Thomson, Cameron Sajedi) |
| `Pathways.TrustKey.Verify@v1` | Offline relying-party Trust Key verification |
| `Pathways.TrustKey.BuildDimensionalLinks@v1` | Dimensional deep-link catalog from root key |
| `Pathways.TrustKey.IssueDimensionalLink@v1` | Issue scoped link (location, time, temperature, …) |
| `Pathways.TrustKey.VerifyDimensionalLink@v1` | Offline verify dimensional / one-time link |

Pattern: `patterns/Pattern.TrustKey.ProvenanceKey.yaml`

Quarter close launches **four linked PathwayRuns**: `Pathways.TrustKey.Issue@v1` → `VerifyDimensionalLink@v1` → `IssueDimensionalLink@v1` (one-time water panel) → `Conservation.Program.QuarterlyClose@v1`.

Agents: `conservation_program`, `conservation_grant`, `conservation_field`, `conservation_funder`, `pathways_trustkey` (+ embedded `burin_*`).

---

## §3a - Trust Key technique (generic Pathways IP)

**Authors:** DJ Thomson (co-author) · Cameron Sajedi (co-author)

**Templates:** `Pathways.TrustKey.Issue@v1` · `Pathways.TrustKey.Verify@v1`

A Trust Key is not a vendor login or a merged super-hash. It is a portable provenance root that:

1. **Opens back** into the full collaborative context (PathwayRuns, Burin seals, party attestations, step artifacts) via deep link manifest
2. **Separates planes** - orchestration (Pathways) and presence (Burin) cross-reference with `hash_linked_cross_reference_only`
3. **Travels privately** - peer-to-peer distribution; no public broadcast required
4. **Supports multi-sig** - optional envelope for institutional or community co-stewards
5. **Verifies offline** - relying party uses trust card / witness set; no live platform access
6. **Minimizes powerful-party work** - accept key, verify offline, follow deep link only if needed

Transect Trust launches sibling **PathwayRuns** for Issue, VerifyDimensionalLink, and IssueDimensionalLink before `Conservation.Program.QuarterlyClose@v1` records the close; the technique is domain-agnostic and reusable in any multi-party workflow.

See: `techniques/TRUST_KEY_TECHNIQUE.v1.md`

---

## §4 - Reference application

| | |
|---|---|
| **Live demo** | [http://209.46.125.56/](http://209.46.125.56/) |
| **Trust Key app** | [`trust-key/`](../trust-key/) - standalone technique demo |
| **Conservation UI** | [`transect-trust/`](../transect-trust/) |
| **Repository** | [github.com/djat/djat_x_burin](https://github.com/djat/djat_x_burin) |
| **API** | `backend/app/routers/transect_trust.py` |
| **Seed** | `backend/app/services/conservation_seed.py` (demo program `nea-estuary-transect-2026`) |
| **Bundle copy** | `collaboration/20260701-120000/assets/transect-trust/` |

---

## §5 - Licensing

Templates carry `royalty_split` with roles: `substrate-originator`, `pathways-formalization`, `program-operator`, `grantee-org`, `witness-channel`. Kernel remains PolyForm NC per `substrate_license_ref`.
