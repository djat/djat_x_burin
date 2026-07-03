# Companion bundle index — Burin × Pathways

**Channel:** `djat-burin-20260701`  
**Prepared for:** Cameron Sajedi and the Burin project  
**Status:** SEALED — open invitation (updated 2026-07-03 with Transect Trust documentation + bundle assets)

## Read order

| # | Document | Role |
|---|----------|------|
| 1 | [collaboration-spine.md](collaboration-spine.md) | Thesis and invitation |
| 2 | [executive-summaries/BURIN_PATHWAYS_THIRD_WAY_REPORT.md](executive-summaries/BURIN_PATHWAYS_THIRD_WAY_REPORT.md) | Business model + third way |
| 3 | [burin-pathways/APPLICATION_PLAYBOOK.md](burin-pathways/APPLICATION_PLAYBOOK.md) | Domain playbook (Presence) |
| 4 | [burin-pathways/TRANSECT_TRUST_PLAYBOOK.md](burin-pathways/TRANSECT_TRUST_PLAYBOOK.md) | Conservation quarter + Trust Key |
| 5 | [burin-pathways/techniques/TRUST_KEY_TECHNIQUE.v1.md](burin-pathways/techniques/TRUST_KEY_TECHNIQUE.v1.md) | Trust Key technique spec |
| 6 | [collaboration-pathways/test/HYPOTHESES.md](collaboration-pathways/test/HYPOTHESES.md) | Pre-registered hypotheses |
| 7 | [sidecars/burin-formalized-as-pathways.md](sidecars/burin-formalized-as-pathways.md) | Flagship encoding thesis |
| 8 | [sidecars/trust-key-provenance-root-thesis.md](sidecars/trust-key-provenance-root-thesis.md) | Trust Key + dimensional links |
| 9 | [sidecars/transect-trust-reference-application.md](sidecars/transect-trust-reference-application.md) | Transect Trust context |
| 10 | [assets/presence-passport/README.md](assets/presence-passport/README.md) | Reference app (Presence) |
| 11 | [assets/transect-trust/README.md](assets/transect-trust/README.md) | Reference app (Conservation) — UI source + live link |

## Verify

```bash
python3 tools/collaboration-bundle/sign_bundle.py verify collaboration/20260701-120000
```

## Flagship proofs

- **H-BU1** — Dual-attestation sandwich (Aqua + Burin, no merged super-hash)
- **H-BU5** — Field run offline verify (Presence Passport)
- **H-BU11** — Trust Key quarter close with dimensional PathwayRuns (Transect Trust)

## Live reference applications

| App | URL |
|-----|-----|
| Transect Trust | https://transect-trust.fly.dev/ |
| Presence Passport | local / bundle assets |

## Honest boundaries

Burin proves **consistency**, not ground truth. Pathways `license_terms` on recipes ≠ Burin kernel commercial license (PolyForm NC → cameronsajedi@gmail.com). Transect Trust uses a shared demo signer and stub ZK where noted.
