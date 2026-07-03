# Presence Passport

**Prove you were there** — a guided app for field workers, inspectors, and citizen scientists.

No blockchain. No jargon-first UI. About 30 seconds start to finish.

## What it does (plain English)

1. You pick what you're proving (survey work vs. a site visit)
2. You mark your area on a map (or use your current location)
3. We create a **tamper-proof presence record** you can download and share
4. Anyone can verify it offline later

## Run locally

**You need two terminals:**

```bash
# Terminal 1 — API (required)
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000

# Terminal 2 — UI
cd presence-passport
npm install
npm run dev
```

Open **http://localhost:5173** and click **Create my presence passport**.

If the server isn't running, the app shows a clear error with setup instructions — it won't silently fail.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Button does nothing / "Server offline" | Start the backend on port 8000 (see above) |
| Map doesn't load | Check internet (map tiles come from OpenStreetMap) |
| "Could not create passport" | Use a larger area on the map; zoom out and tap again |

## Technical notes

- Pathway templates: `Presence.Survey.EffortProof@v1`, `Presence.Field.CaptureSeal@v1`
- Burin fingerprint depth: 7 (required for typical field polygons)
- Burin proves **consistency**, not ground truth

## Related reference app

For **multi-party conservation grant reporting** with Trust Key provenance, see **[Transect Trust](../transect-trust/README.md)** — live at [transect-trust.fly.dev](https://transect-trust.fly.dev/).
