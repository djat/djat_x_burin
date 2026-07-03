# Transect Trust — reference application (bundle copy)

**Conservation grant effort hub** — multi-party web application on Burin + Pathways for NE Estuary-style grant reporting, cross-habitat collaboration, and **Trust Key** provenance roots.

| | |
|---|---|
| **Live demo** | [https://transect-trust.fly.dev/](https://transect-trust.fly.dev/) |
| **Repository** | [https://github.com/djat/djat_x_burin](https://github.com/djat/djat_x_burin) |
| **Playbook** | [`../../burin-pathways/TRANSECT_TRUST_PLAYBOOK.md`](../../burin-pathways/TRANSECT_TRUST_PLAYBOOK.md) |
| **Trust Key technique** | [`../../burin-pathways/techniques/TRUST_KEY_TECHNIQUE.v1.md`](../../burin-pathways/techniques/TRUST_KEY_TECHNIQUE.v1.md) |
| **Sibling app** | [Presence Passport](../presence-passport/README.md) — single-actor field proof |
| **Full stack (repo root)** | `transect-trust/` + `backend/` |

This directory mirrors the Transect Trust UI source from the repo root (excluding `node_modules` and `dist`). Run against the shared backend at repo root.

## Run locally (from repo root)

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8002
cd transect-trust && npm install && npm run dev   # http://127.0.0.1:5175
```

Or open the **live deployment**: https://transect-trust.fly.dev/

## Bundle documentation

- [Transect Trust playbook](../../burin-pathways/TRANSECT_TRUST_PLAYBOOK.md)
- [Trust Key technique](../../burin-pathways/techniques/TRUST_KEY_TECHNIQUE.v1.md)
- [Reference app sidecar](../../sidecars/transect-trust-reference-application.md)
- [Trust Key thesis sidecar](../../sidecars/trust-key-provenance-root-thesis.md)
