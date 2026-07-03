# Transect Trust

**Conservation grant effort hub** — a multi-party web application distinct from [Presence Passport](../presence-passport/README.md).

Presence Passport is a single-actor wizard: one field worker, one proof file, one recipient.

Transect Trust models **how parties aggregate** on Burin + Pathways for NE Estuary-style grant reporting: funders, grantee chapters, coordinators, field monitors, public unit geometry, and witness attestation — **every action launches a PathwayRun**.

## Who it is for

| Party | Person (demo) | Role | Pathway template |
|-------|---------------|------|------------------|
| **Funder** | Dr. Sam Okoro | NE Estuary Collaborative — acceptance policy & verification | `Conservation.Program.Register@v1`, `Conservation.Funder.QuarterVerify@v1`, `Conservation.Program.QuarterlyClose@v1` |
| **Grantee org** | Hudson Estuary Audubon Chapter | Receives award bound to public unit | (entity on `Conservation.Grant.Award@v1`) |
| **Chapter coordinator** | Elena Kim | Aggregates volunteer submissions; witness-attests | `Conservation.Grant.CoordinatorReview@v1` |
| **Field monitor** | Maria Reyes | Bounded effort proof without nest pins | `Conservation.Field.EffortSubmit@v1` |
| **Public geometry** | USGS HUC / PAD-US | Pre-seeded reporting units — no vendor GIS | Bound on award + field validation |
| **Burin substrate** | — | Seals, ZK effort stub, offline verify | Embedded `burin_*` steps |
| **Pathways orchestration** | — | Licensable workflow IP, run graph | All `Conservation.*` templates |

## Run

```bash
# Terminal 1 — backend (shared with Presence Passport)
cd backend && uv sync && uv run uvicorn app.main:app --reload --port 8000

# Terminal 2 — Transect Trust UI (port 5175)
cd transect-trust && npm install && npm run dev
```

Open http://127.0.0.1:5175

## Demo workflow (2026-Q2)

1. **Sam (Funder)** — Register program → Issue grant award  
2. **Maria (Field)** — Submit bounded effort on Piermont Marsh HUC unit  
3. **Elena (Coordinator)** — Review + witness attestation  
4. **Sam (Funder)** — Verify quarter → Close quarter  

Each step creates a `PathwayRun` linked via `pathway_run_links` (PathwayRunSource edges).

## API

All under `/api/transect-trust/` — see `backend/app/routers/transect_trust.py`.

## Encoded IP

New pathway templates live in `burin-pathways/pathways/Conservation.*.v1.yaml`.  
Application agents: `backend/app/services/conservation_agents.py`.  
Playbook: `burin-pathways/TRANSECT_TRUST_PLAYBOOK.md`.
