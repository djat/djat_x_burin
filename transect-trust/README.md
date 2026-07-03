# Transect Trust

**Conservation grant effort hub** — multi-party web application on Burin + Pathways for NE Estuary-style grant reporting, cross-habitat collaboration, and **Trust Key** provenance roots.

| | |
|---|---|
| **Live demo** | [https://transect-trust.fly.dev/](https://transect-trust.fly.dev/) |
| **Repository** | [https://github.com/djat/djat_x_burin](https://github.com/djat/djat_x_burin) |
| **Playbook** | [`burin-pathways/TRANSECT_TRUST_PLAYBOOK.md`](../burin-pathways/TRANSECT_TRUST_PLAYBOOK.md) |
| **Trust Key technique** | [`burin-pathways/techniques/TRUST_KEY_TECHNIQUE.v1.md`](../burin-pathways/techniques/TRUST_KEY_TECHNIQUE.v1.md) |
| **Sibling app** | [Presence Passport](../presence-passport/README.md) — single-actor field proof |

Presence Passport is a single-actor wizard: one field worker, one proof file, one recipient.

Transect Trust models **how parties aggregate**: funders, grantee chapters, coordinators, field monitors, public unit geometry, witness attestation — **every action launches a PathwayRun**.

## Who it is for

| Party | Person (demo) | Role | Pathway template |
|-------|---------------|------|------------------|
| **Funder** | Dr. Sam Okoro | NE Estuary Collaborative — acceptance policy & verification | `Conservation.Program.Register@v1`, `Conservation.Funder.QuarterVerify@v1`, `Conservation.Program.QuarterlyClose@v1` |
| **Grantee org** | Hudson Estuary Audubon Chapter | Receives award bound to public unit | (entity on `Conservation.Grant.Award@v1`) |
| **Chapter coordinator** | Elena Kim | Aggregates volunteer submissions; witness-attests | `Conservation.Grant.CoordinatorReview@v1` |
| **Field monitor** | Maria Reyes | Bounded effort proof without nest pins | `Conservation.Field.EffortSubmit@v1` |
| **Public geometry** | USGS HUC / PAD-US | Pre-seeded reporting units — no vendor GIS | Bound on award + field validation |
| **Burin substrate** | — | Seals, ZK effort stub, offline verify | Embedded `burin_*` steps |
| **Pathways orchestration** | — | Licensable workflow IP, run graph | All `Conservation.*` + `Pathways.TrustKey.*` templates |
| **Trust Key** | DJ Thomson · Cameron Sajedi (co-authors) | Provenance root + dimensional deep links | `Pathways.TrustKey.Issue@v1`, `VerifyDimensionalLink@v1`, … |

## Run locally

```bash
# Terminal 1 — backend (port 8002 for Transect Trust)
cd backend && uv sync && uv run uvicorn app.main:app --reload --port 8002

# Terminal 2 — Transect Trust UI (port 5175; proxies /api → 8002)
cd transect-trust && npm install && npm run dev
```

Open http://127.0.0.1:5175

Or use the **live deployment**: https://transect-trust.fly.dev/

## Deploy (Fly.io)

From repo root:

```bash
fly deploy
```

See [`../fly.toml`](../fly.toml) and [`../Dockerfile`](../Dockerfile).

## Demo workflow (2026-Q2)

1. **Sam (Funder)** — Register program → Issue grant award  
2. **Maria (Field)** — Submit bounded effort on Piermont Marsh HUC unit  
3. **Elena (Coordinator)** — Review + witness attestation  
4. **Sam (Funder)** — Verify quarter → Close quarter (launches Trust Key sibling PathwayRuns)

Each step creates a `PathwayRun` linked via `pathway_run_links` (PathwayRunSource edges).

## API

All under `/api/transect-trust/` — see `backend/app/routers/transect_trust.py`.

## Encoded IP

- Conservation templates: `burin-pathways/pathways/Conservation.*.v1.yaml`
- Trust Key templates: `burin-pathways/pathways/Pathways.TrustKey.*.v1.yaml`
- Agents: `backend/app/services/conservation_agents.py`, `trustkey_agents.py`
- Playbook: `burin-pathways/TRANSECT_TRUST_PLAYBOOK.md`
