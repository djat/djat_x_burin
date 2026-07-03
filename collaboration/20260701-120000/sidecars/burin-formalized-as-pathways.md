---
type: sidecar-document
title: "Burin formalized as Pathways"
flagship_hypothesis: H-BU1
filed: 2026-07-01
---

# Burin formalized as Pathways

**Status:** Adopted in reference implementation  
**Backed by:** [`burin-pathways/`](../burin-pathways/)

## Thesis

Burin is a **substrate primitive**, not an application. Pathways is the **orchestration spine**. Encoding Burin as first-class `burin_*` agents + `burin_seal` artifacts lets field workflows be named, forked, licensed, and audited — while presence proofs remain offline-verifiable without consensus.

## Load-bearing mappings

| Burin | Pathways |
|-------|----------|
| Seal | `_step_artifacts[order].burin_seal` |
| Witness log | `PathwayRunSource.role: presence_witness` |
| Trust card | R1 cold-start parallel (H-BU3) |
| ZK survey effort | `burin_zk_survey_proof` sub-pathway |
| Fraud proofs | R5 halt + `burin_fraud_proof` |

## Architecture pointer

PATHWAYS_ARCHITECTURE §9.9 — Burin Protocol presence substrate.

## What this sidecar does not claim

- Burin as truth oracle (see Burin/CLAIMS.md)
- Defeat of omission (see Burin/SCOPE.md §0)
- Pathways royalty covering kernel commercial license
