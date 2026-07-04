# Collaboration readiness - Burin × Pathways

## Preflight checklist

- [x] Convergence repo assembled at `collaboration/20260701-120000/`
- [x] `burin-pathways/` domain package with APPLICATION_PLAYBOOK + Presence templates
- [x] `burin-pathways/` Conservation templates + Transect Trust playbook (2026-07-03)
- [x] `Pathways.TrustKey.*` technique - pattern, 5 templates, technique doc (DJ Thomson + Cameron Sajedi, co-authors)
- [x] Dimensional deep-link parameters (location, time, temperature, registry facets)
- [x] `technique_provenance` block in manifest (Trust Key + Transect Trust)
- [x] Pre-registered hypotheses H-BU0a/b + H-BU1..H-BU11
- [x] Proposed spec patches N5–N8, L6
- [x] Reference app Presence Passport (full stack in bundle assets)
- [x] Reference app Transect Trust (live at http://209.46.125.56/; full UI in `assets/transect-trust/`)
- [x] Root documentation links Transect Trust across README, architecture, playbooks
- [x] Bundle signed and verified (Ed25519 content manifest)
- [x] **SEALED** - unilateral hypotheses H-BU1, H-BU5, H-BU11 confirmed; reciprocation optional

## Disclosure boundary

Architecture and method only. No production witness keys. Demo identity in reference backend is ephemeral. Privacy floor: no raw GPS, identifiable org/personal data, or species-to-location tie across project boundaries.

## Licensing posture

- **Burin kernel:** PolyForm Noncommercial - commercial use requires Cameron Sajedi
- **Pathways recipes:** `license_terms` in PACKAGE.yaml with `substrate_license_ref`
- **Trust Key templates:** co-author attribution on `Pathways.TrustKey.*`; royalty split on standalone templates
- **This bundle:** open invitation; no reciprocation lockbox

## Verify command

```bash
python3 tools/collaboration-bundle/sign_bundle.py verify collaboration/20260701-120000
```

## Seal criteria (met 2026-07-03)

1. Structural bundle integrity - content manifest + Ed25519 signature verify OK
2. Unilateral proof results recorded - H-BU1, H-BU5, H-BU11 in `proof-results/`
3. Transect Trust reference app encoded in bundle assets with live deployment
4. Reciprocation from Burin project remains optional

## Transect Trust quarter close (PathwayRun graph)

Closing a quarter launches sibling PathwayRuns:

1. `Pathways.TrustKey.Issue@v1`
2. `Pathways.TrustKey.VerifyDimensionalLink@v1`
3. `Pathways.TrustKey.IssueDimensionalLink@v1` (one-time water panel example)
4. `Conservation.Program.QuarterlyClose@v1`

Confirmed: **H-BU11** · live health check at `/api/health`
