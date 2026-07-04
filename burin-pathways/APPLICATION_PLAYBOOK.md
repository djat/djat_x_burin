---
type: application-playbook
title: "Burin as Pathways - Application Playbook"
bundle: burin-pathways v1.0.0
conformance_target: S
audience: Pathways implementers integrating Burin spatiotemporal presence substrate
filed: 2026-07-01
---

# Burin as Pathways

## A reusable Pathways sub-bundle formalizing the Burin spatiotemporal trust primitive

---

## §1 - What this bundle is

This bundle formalizes **Burin** - *accountability without agreement* - as a Pathways **substrate primitive**, not an application. Burin supplies consensus-free, offline-verifiable **presence attestation** (where + when + what commitment); Pathways supplies **orchestration attestation** (what workflow ran, under what policy, with what lineage).

Burin is source-available under **PolyForm Noncommercial 1.0.0**. Commercial kernel use requires a separate license from Cameron Sajedi (cameronsajedi@gmail.com). Pathways `license_terms` on templates in this bundle govern **orchestration recipes** only - see §4.

The companion Burin project docs live at [`../Burin/`](../Burin/): [`SCOPE.md`](../Burin/SCOPE.md), [`KERNEL.md`](../Burin/KERNEL.md), [`ATTESTATION_MODEL.md`](../Burin/ATTESTATION_MODEL.md).

## §2 - The invariant

> **Every presence-bearing step MUST emit a verifiable `burin_seal` artifact on `_step_artifacts[order]`, OR an explicit `presence_waived` attestation signed by the launch authority.**

Steps that canonicalize geometry, commit coverage, seal, witness, or export paper-degradable presence **MUST NOT** complete without a Burin artifact or waiver.

Violations are refused at launch when `Pattern.PresencePathway.PresenceRequired` is registered.

## §3 - Template catalog

| Template | Purpose |
|----------|---------|
| [`Presence.Field.CaptureSeal@v1`](pathways/Presence.Field.CaptureSeal.v1.yaml) | polygon → canonicalize → commit → seal |
| [`Presence.Survey.EffortProof@v1`](pathways/Presence.Survey.EffortProof.v1.yaml) | capture → seal → ZK survey effort proof |
| [`Presence.Boundary.OverlapProof@v1`](pathways/Presence.Boundary.OverlapProof.v1.yaml) | two regions → overlap without full map disclosure |
| [`Presence.Witness.AppendAttestation@v1`](pathways/Presence.Witness.AppendAttestation@v1.yaml) | append-only witness log + fraud detection |
| [`Presence.Export.DegradeToPaper@v1`](pathways/Presence.Export.DegradeToPaper.v1.yaml) | run → 24-word seal + trust card |
| [`Presence.Bundle.DualAttestation@v1`](pathways/Presence.Bundle.DualAttestation@v1.yaml) | Aqua run + Burin seal → collaboration bundle |
| [`Burin.Conformance.Test@v1`](pathways/Burin.Conformance.Test@v1.yaml) | BT-1..BT-7 conformance cases |

## §4 - Dual licensing commerce model

Pathways enables a **third way** atop Burin's PolyForm NC kernel:

| Layer | What is licensed | Mechanism |
|-------|------------------|-----------|
| **Burin kernel** | Cryptographic primitive (seal, coverage, ZK) | PolyForm NC; commercial → Cameron Sajedi |
| **Pathway templates** | Field workflow recipes using Burin | `license_terms` + `royalty_split` + `substrate_license_ref` |
| **Witness channel** | Relay/timestamp (satellite, ground) | Separate commercial terms; witness-not-authority |

```yaml
license_terms:
  type: revenue-share
  attribution_required: true
  royalty_split:
   - { did: did:placeholder:cameron-sajedi-burin, pct: 40, role: substrate-originator }
   - { did: did:placeholder:dj-thomson-pathways, pct: 40, role: pathways-formalization }
   - { did: did:placeholder:channel-partner, pct: 20, role: witness-channel }
  substrate_license_ref:
    substrate: burin
    kernel_license: PolyForm-Noncommercial-1.0.0
    commercial_kernel_contact: cameronsajedi@gmail.com
    orchestration_scope: pathway-template-only
```

Noncommercial research, education, and evaluation may run **both** kernel and templates freely.

## §5 - Adoption

1. Register this bundle (`burin-pathways/PACKAGE.yaml`) in your Pathways build catalog.
2. Seed registry entries from [`registry/`](registry/).
3. Install Burin as path dependency: `burin @ file://../Burin`
4. Register agents: `burin_presence`, `burin_canonicalize`, `burin_zk`, `burin_export`
5. Run [`Burin.Conformance.Test@v1`](pathways/Burin.Conformance.Test.v1.yaml) - results feed build manifest
6. Seed a **trust card** (witness key-set + DGGS params) as cold-start artifact parallel to practice profile R1

## §6 - Witness business model

Burin's adoption thesis ([`SCOPE.md`](../Burin/SCOPE.md) §0): the satellite operator is a **witness**, holding no authority. Pathways encodes witnesses as `burin_presence` agent steps with `role: presence_witness` on `PathwayRunSource` edges.

Revenue paths:
- **Witness relay fees** - per seal broadcast (70-byte GSMC tier)
- **Pathway royalty_split** - fork/use of presence workflow templates
- **Kernel commercial license** - integrated products using Burin in revenue-generating activity

## §7 - Artifact types

| Artifact | Schema ref | Plane |
|----------|------------|-------|
| `burin_seal` | proposed-spec-patches/N6-burin-seal-artifact.md | Presence |
| `burin_coverage_root` | step artifact | Presence |
| `burin_zk_survey_proof` | step artifact | Presence (bounded disclosure) |
| `burin_fraud_proof` | step artifact; triggers R5 halt | Presence |
| `spoken_seal_24w` | derivative export | Degrade-to-paper |
| `aqua_tree_id` | existing Pathways | Orchestration |

## §8 - Conformance

Level **S** minimum: hash-bound bundles + Burin offline verify.

Level **F** target: Aqua-attested runs + dual-substrate verify bundle (proposed L6).

See [`test/HYPOTHESES.md`](test/HYPOTHESES.md) in the collaboration bundle for pre-registered proof experiments.

## §9 - Transect Trust (Conservation domain extension)

**[Transect Trust](../transect-trust/)** is the second reference application: multi-party conservation grant reporting, cross-habitat collaboration, private in-network water requests, and offline funder verification with **Trust Key** provenance roots.

| | |
|---|---|
| **Live demo** | [http://209.46.125.56/](http://209.46.125.56/) |
| **Playbook** | [`TRANSECT_TRUST_PLAYBOOK.md`](TRANSECT_TRUST_PLAYBOOK.md) |
| **Trust Key technique** | [`techniques/TRUST_KEY_TECHNIQUE.v1.md`](techniques/TRUST_KEY_TECHNIQUE.v1.md) |
| **Trust Key app** | [`../trust-key/`](../trust-key/) |
| **UI source** | [`../transect-trust/`](../transect-trust/) |
| **API** | `backend/app/routers/transect_trust.py` |

Conservation templates: `Conservation.*.v1.yaml`. Trust Key templates: `Pathways.TrustKey.*.v1.yaml`. Quarter close launches sibling PathwayRuns (Issue → VerifyDimensionalLink → IssueDimensionalLink → QuarterlyClose). Confirmed: **H-BU11** in the collaboration bundle.
