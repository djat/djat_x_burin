# START — Burin × Pathways handoff prompt

You are continuing work on **djat_x_burin**: the foundational integration of Burin (spatiotemporal trust primitive) into the Pathways orchestration framework.

## Read first

1. [`README.md`](README.md)
2. [`collaboration/20260701-120000/companion-bundle-index.md`](collaboration/20260701-120000/companion-bundle-index.md)
3. [`burin-pathways/APPLICATION_PLAYBOOK.md`](burin-pathways/APPLICATION_PLAYBOOK.md)
4. [`PATHWAYS_ARCHITECTURE_v1.1.0.md`](PATHWAYS_ARCHITECTURE_v1.1.0.md) §9.8 (Burin substrate)
5. [`Burin/SCOPE.md`](Burin/SCOPE.md) — scope boundary for Burin itself

## Channel

- **Counterparty:** Cameron Sajedi and the Burin project
- **Channel ID:** `djat-burin-20260701`
- **Kind:** open invitation (reciprocation optional)

## Flagship hypotheses

- **H-BU1** — Dual-attestation sandwich (Aqua + Burin, no merged super-hash)
- **H-BU5** — Field run offline verify

## Verify bundle

```bash
python3 tools/collaboration-bundle/sign_bundle.py verify collaboration/20260701-120000
```

## Run Presence Passport

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000
cd presence-passport && npm run dev
```

## Honest boundaries

- Burin proves **consistency**, not ground truth ([`Burin/CLAIMS.md`](Burin/CLAIMS.md))
- Omission cannot be defeated ([`Burin/SCOPE.md`](Burin/SCOPE.md) §0)
- Pathways `license_terms` on recipes ≠ Burin kernel commercial license
