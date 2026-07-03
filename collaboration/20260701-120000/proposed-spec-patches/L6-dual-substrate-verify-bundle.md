# Patch L6 — Dual-substrate verify bundle

**Target:** Conformance §13 / collaboration bundle verify

**Status:** Proposed (2026-07-01)

**Flagship hypothesis:** H-BU1, H-BU5

---

## Motivation

Field evidence exports must verify offline: Pathways bundle integrity (Ed25519 + content manifest) AND Burin seal chain — without requiring a single merged hash.

## Verify procedure

1. `python3 tools/collaboration-bundle/sign_bundle.py verify <bundle_dir>` → orchestration plane OK
2. For each `pathway-runs/*.json`, extract `step_artifacts[*].burin_seal`
3. `python -m burin.kernel verify` on each seal → presence plane OK
4. Cross-reference: run `aqua_stub_id` and `burin_seal.coverage_root` linked in bundle manifest `dual_attestation_refs[]`

## Conformance test

**FT-34.** Dual-substrate bundle passes both verify paths with network disabled.
