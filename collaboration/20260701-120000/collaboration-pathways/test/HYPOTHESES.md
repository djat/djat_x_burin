---
type: pre-registered-hypotheses
title: "Burin × Pathways - falsifiable hypotheses"
filed: 2026-07-01
status: pre-registered
context:
  reference_instance: djat-burin-20260701
  investigation_id: open-burin-pathways-20260701
---

# Pre-registered hypotheses - open Pathways × Burin invitation

## §1 - Structural hypotheses (must hold for any seal)

### H-BU0a - Link closure (structural)
**Hypothesis:** Every relative link in the convergence repo resolves within the bundle.  
**Falsifier:** Any broken relative link. **Fate if falsified:** INVALIDATED.

### H-BU0b - Content integrity + self-description (structural)
**Hypothesis:** `bundle_root_hash` recomputes; Ed25519 signature verifies; manifest carries `technique_provenance`.  
**Falsifier:** Hash/signature mismatch or missing provenance. **Fate if falsified:** INVALIDATED.

---

## §2 - The ten synergy hypotheses

### H-BU1 - Dual-attestation sandwich (M, unilateral)
**Hypothesis:** An assessor can verify Aqua PathwayRun stub + Burin seal from one export without a merged super-hash.  
**Pathway:** `Presence.Bundle.DualAttestation@v1`  
**Confirm:** `proof-results/H-BU1.yaml` + dual bundle export from Presence Passport.

### H-BU2 - Substrate-orchestration license split (S, unilateral)
**Hypothesis:** Pathway template carries `royalty_split` while `substrate_license_ref` points at PolyForm NC kernel.  
**Confirm:** `burin-pathways/PACKAGE.yaml` + patch N5.

### H-BU3 - Trust card ↔ practice profile (M, design_pending)
**Hypothesis:** Burin trust card resolves as R1 cold-start witness set at pathway launch.  
**Pathway:** `Presence.Export.DegradeToPaper@v1`  
**Sidecar:** `sidecars/trust-card-practice-profile-thesis.md`

### H-BU4 - Presence pathway marketplace fork (S, unilateral)
**Hypothesis:** Fork `Presence.Survey.EffortProof@v1` with three-party royalty_split; immutability per N1.  
**Confirm:** fork record in `proof-results/H-BU4.yaml`.

### H-BU5 - Field run offline verify (S, unilateral) **FLAGSHIP**
**Hypothesis:** Complete pathway run exports; `sign_bundle.py verify` + `burin.kernel verify` with zero network.  
**Confirm:** `proof-results/H-BU5.yaml`  
**Runbook:** launch EffortProof in Presence Passport → export bundle → offline verify.

### H-BU6 - ZK step artifact binding (M, design_pending)
**Hypothesis:** Step N `burin_zk_survey_proof` bound to step N-1 coverage root.  
**Sidecar:** `sidecars/zk-step-artifact-binding.md`

### H-BU7 - Fraud-proof halt gate (S, design_pending)
**Hypothesis:** EquivocationFraud triggers R5 halt.  
**Pathway:** `Presence.Witness.AppendAttestation@v1`

### H-BU8 - Spatiotemporal phase gate (M, design_pending)
**Hypothesis:** R6 binds phase transitions to public rHEALPix region.  
**Patch:** N7

### H-BU9 - Degrade-to-paper derivative (S, unilateral)
**Hypothesis:** Run exports 24-word spoken seal verifiable offline.  
**Pathway:** `Presence.Export.DegradeToPaper@v1`  
**Confirm:** `proof-results/H-BU9.yaml`

### H-BU10 - Witness-not-authority channel (S, unilateral)
**Hypothesis:** Satellite operator as pathway witness agent - relay revenue without authority.  
**Sidecar:** `sidecars/witness-not-authority-channel.md`

### H-BU11 - Trust Key quarter close with dimensional PathwayRuns (S, unilateral)
**Hypothesis:** A full conservation quarter closes with sibling PathwayRuns for Trust Key Issue, dimensional verify, one-time dimensional link issuance, and quarter record - not embedded steps in one run.  
**Pathways:** `Pathways.TrustKey.Issue@v1`, `Pathways.TrustKey.VerifyDimensionalLink@v1`, `Pathways.TrustKey.IssueDimensionalLink@v1`, `Conservation.Program.QuarterlyClose@v1`  
**Confirm:** `proof-results/H-BU11.yaml` + live Transect Trust at http://209.46.125.56/  
**Sidecars:** `sidecars/trust-key-provenance-root-thesis.md`, `sidecars/transect-trust-reference-application.md`

---

## §3 - Bundle fate

| State | Meaning |
|-------|---------|
| ASSEMBLED | Convergence complete; experiments pending |
| SEALED | H-BU0a/b confirmed + at least one of H-BU1..H-BU11 confirmed |
| INVALIDATED | Structural falsifier fired |

Reciprocation from Burin project upgrades INCONCLUSIVE hypotheses but is never required for SEALED.
