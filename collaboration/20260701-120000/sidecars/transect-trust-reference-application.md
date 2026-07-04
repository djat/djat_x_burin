---
type: sidecar
title: "Transect Trust - reference application and ecosystem seed"
filed: 2026-07-03
live_url: http://209.46.125.56/
---

# Transect Trust reference application

Transect Trust is the **second reference application** in the Burin × Pathways collaboration space (alongside Presence Passport). It demonstrates multi-party conservation grant reporting with cross-habitat collaboration, private in-network measurement requests, and offline funder verification.

## What it proves

- **Conservation.*** domain templates (program register → grant award → field effort → coordinator review → funder verify → quarter close)
- **Pathways.TrustKey.*** as first-class PathwayRuns (Issue, Verify, BuildDimensionalLinks, IssueDimensionalLink, VerifyDimensionalLink)
- **Dual attestation** in a full quarter workflow - not a single demo step
- **Sibling PathwayRuns** for primary grant proof, opt-in collaborations, and water panel fulfillment
- **Privacy floor** - no raw GPS, no identifiable org/personal data, no species-to-location tie across project boundaries

## Live deployment

| | |
|---|---|
| **URL** | http://209.46.125.56/ |
| **Host** | VPS (FastAPI/Uvicorn + React static UI) |
| **Repo paths** | `transect-trust/` (UI), `backend/` (API), `burin-pathways/` (templates) |

## Demo program

- Program: `nea-estuary-transect-2026` (NE Estuary Transect Monitoring 2026)
- Quarter: `2026-Q2`
- Six roles: funder, chapter coordinator, field monitor, grantee org, presence witness, application

## Honest boundaries

- Shared demo signer (not per-party device keys)
- Stub ZK where noted in developer mode
- Cross-initiative discovery narrated in UI; overlap checks use registry facet AND-filters

## Related bundle paths

- `burin-pathways/TRANSECT_TRUST_PLAYBOOK.md`
- `burin-pathways/techniques/TRUST_KEY_TECHNIQUE.v1.md`
- `burin-pathways/patterns/Pattern.TrustKey.ProvenanceKey.yaml`
- `sidecars/trust-key-provenance-root-thesis.md`
