# Transect Trust — reference application (bundle pointer)

Full source lives at the repo root:

| Path | Role |
|------|------|
| `transect-trust/` | React + Vite UI |
| `backend/` | FastAPI PathwayRun engine |
| `burin-pathways/` | Conservation + Trust Key templates |

## Live demo

**https://transect-trust.fly.dev/**

Deployed on Fly.io: one container serves the API and static UI; SQLite persists on a volume.

## Local dev

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8002
cd transect-trust && npm run dev   # http://127.0.0.1:5175
```

## Bundle documentation

- [Transect Trust playbook](../../burin-pathways/TRANSECT_TRUST_PLAYBOOK.md)
- [Trust Key technique](../../burin-pathways/techniques/TRUST_KEY_TECHNIQUE.v1.md)
- [Reference app sidecar](../../sidecars/transect-trust-reference-application.md)
- [Trust Key thesis sidecar](../../sidecars/trust-key-provenance-root-thesis.md)

This bundle directory intentionally does not duplicate the full app tree — see repo root for source.
