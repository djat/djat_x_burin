# Transect Trust

**Conservation grant effort hub** - multi-party web application on Burin + Pathways for NE Estuary-style grant reporting, cross-habitat collaboration, and offline funder verification.

| | |
|---|---|
| **Live demo** | [http://209.46.125.56/](http://209.46.125.56/) |
| **Repository** | [https://github.com/djat/djat_x_burin](https://github.com/djat/djat_x_burin) |
| **Playbook** | [`burin-pathways/TRANSECT_TRUST_PLAYBOOK.md`](../burin-pathways/TRANSECT_TRUST_PLAYBOOK.md) |
| **Trust Key technique** | [`trust-key/`](../trust-key/) - separate reference app |
| **Sibling apps** | [Presence Passport](../presence-passport/README.md) · [Trust Key](../trust-key/README.md) |

Presence Passport is a single-actor wizard. **Trust Key** is a separate reference app for the portable provenance root technique. Transect Trust models **how parties aggregate** on Burin + Pathways for conservation grant reporting - quarter close launches sibling `Pathways.TrustKey.*` PathwayRuns on the shared backend.

## Who it is for

| Party | Person (demo) | Role | Pathway template |
|-------|---------------|------|------------------|
| **Funder** | Dr. Sam Okoro | NE Estuary Collaborative - acceptance policy & verification | `Conservation.Program.Register@v1`, `Conservation.Funder.QuarterVerify@v1`, `Conservation.Program.QuarterlyClose@v1` |
| **Grantee org** | Hudson Estuary Audubon Chapter | Receives award bound to public unit | (entity on `Conservation.Grant.Award@v1`) |
| **Chapter coordinator** | Elena Kim | Aggregates volunteer submissions; witness-attests | `Conservation.Grant.CoordinatorReview@v1` |
| **Field monitor** | Maria Reyes | Bounded effort proof without nest pins | `Conservation.Field.EffortSubmit@v1` |
| **Public geometry** | USGS HUC / PAD-US | Pre-seeded reporting units - no vendor GIS | Bound on award + field validation |
| **Burin substrate** | - | Seals, ZK effort stub, offline verify | Embedded `burin_*` steps |
| **Pathways orchestration** | - | Licensable workflow IP, run graph | All `Conservation.*` templates |

## Run locally

```bash
# Terminal 1 - backend (port 8002)
cd backend && uv sync && uv run uvicorn app.main:app --reload --port 8002

# Terminal 2 - Transect Trust UI (port 5175)
cd transect-trust && npm install && npm run dev
```

Open http://127.0.0.1:5175

Or use the **live deployment**: http://209.46.125.56/

## Deploy (Fly.io)

From repo root: `fly deploy` - see [`../fly.toml`](../fly.toml) and [`../Dockerfile`](../Dockerfile).

## Demo workflow (2026-Q2)

1. **Sam (Funder)** - Register program → Issue grant award  
2. **Maria (Field)** - Submit bounded effort on Piermont Marsh HUC unit  
3. **Elena (Coordinator)** - Review + witness attestation  
4. **Sam (Funder)** - Verify quarter → Close quarter (launches Trust Key sibling PathwayRuns)

Explore Trust Key issue/verify/dimensional links in the **[Trust Key app](../trust-key/)** (port 5176).

## API

All under `/api/transect-trust/` - see `backend/app/routers/transect_trust.py`.

## Encoded IP

- Conservation templates: `burin-pathways/pathways/Conservation.*.v1.yaml`
- Trust Key templates: `burin-pathways/pathways/Pathways.TrustKey.*.v1.yaml` (demoed in `trust-key/`)
- Agents: `backend/app/services/conservation_agents.py`, `trustkey_agents.py`
- Playbook: `burin-pathways/TRANSECT_TRUST_PLAYBOOK.md`
