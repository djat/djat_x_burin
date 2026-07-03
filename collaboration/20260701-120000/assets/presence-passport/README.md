# Presence Passport

Reference UI for **Burin × Pathways** — field workflows with dual attestation.

## What it demonstrates

| Surface | Capability |
|---------|------------|
| Workflow picker | Pathway templates (`Presence.*`) |
| Field capture | Map region → rHEALPix coverage @ depth 7 |
| Run viewer | Step-by-step PathwayRun + Aqua stub |
| Dual license | Burin PolyForm NC + pathway `license_terms` |
| Export | Dual-attestation JSON bundle |
| Verify | Offline Burin seal verify via API |

## Run (full stack)

```bash
# Terminal 1 — backend
cd ../../backend && uv run uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
npm install && npm run dev
```

Open http://localhost:5173

## Flagship journey

1. Select **Survey effort proof (ZK bounded disclosure)**
2. Click map to set region
3. **Run presence pathway**
4. **Export dual-attestation bundle**
5. Paste bundle into verify panel

## Pathway anchors

- `Presence.Survey.EffortProof@v1`
- `Presence.Bundle.DualAttestation@v1` (export)

Hypotheses: **H-BU1**, **H-BU5**
