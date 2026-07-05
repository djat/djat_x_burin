# djat_x_burin - Burin × Pathways

Open collaboration workspace encoding **Burin** (consensus-free spatiotemporal trust) as a foundational **Pathways** substrate primitive, with three reference applications.

**Live demo:** [http://209.46.125.56/](http://209.46.125.56/)  
**Repository:** [https://github.com/djat/djat_x_burin](https://github.com/djat/djat_x_burin)

## Repository layout

| Path | Role |
|------|------|
| [`Burin/`](Burin/) | Burin kernel + coverage engine (PolyForm Noncommercial) - git submodule |
| [`burin-pathways/`](burin-pathways/) | Pathways domain package - Presence + Conservation templates, Trust Key technique |
| [`trust-key/`](trust-key/) | **Reference app #3** - Trust Key technique (issue, verify, dimensional links) |
| [`transect-trust/`](transect-trust/) | **Reference app #2** - multi-party conservation grant quarter |
| [`presence-passport/`](presence-passport/) | **Reference app #1** - single-actor field workflows with dual attestation |
| [`collaboration/20260701-120000/`](collaboration/20260701-120000/) | Sealed collaboration bundle (open invitation) |
| [`backend/`](backend/) | Pathways FastAPI engine + Burin + conservation + Trust Key agents |
| [`PATHWAYS_ARCHITECTURE_v1.1.0.md`](PATHWAYS_ARCHITECTURE_v1.1.0.md) | Descriptive architecture (Burin §9.8–§9.9) |
| [`PATHWAYS_REFERENCE_v1.1.0.md`](PATHWAYS_REFERENCE_v1.1.0.md) | Normative RIS spec |

## Reference applications

| App | Audience | Live | Docs |
|-----|----------|------|------|
| **[Trust Key](trust-key/)** | Relying parties, implementers - portable provenance root | local dev (5176) | [Technique spec](burin-pathways/techniques/TRUST_KEY_TECHNIQUE.v1.md) |
| **[Transect Trust](transect-trust/)** | Funders, coordinators, field monitors - full grant quarter | [209.46.125.56](http://209.46.125.56/) | [Playbook](burin-pathways/TRANSECT_TRUST_PLAYBOOK.md) |
| **[Presence Passport](presence-passport/)** | Single field worker - one proof, one recipient | local dev (5173) | [README](presence-passport/README.md) |

## Quick start

### Trust Key (technique demo)

```bash
cd backend && uv sync && uv run uvicorn app.main:app --reload --port 8002
cd trust-key && npm install && npm run dev
```

Open http://127.0.0.1:5176 - run standalone Issue → Verify → Dimensional link pipeline.

### Transect Trust (conservation quarter)

```bash
cd backend && uv sync && uv run uvicorn app.main:app --reload --port 8002
cd transect-trust && npm install && npm run dev
```

Open http://127.0.0.1:5175 - walk the six-role estuary quarter demo (2026-Q2).

Or use the **live deployment**: http://209.46.125.56/

### Presence Passport

```bash
cd backend && uv sync && uv run uvicorn app.main:app --reload --port 8000
cd presence-passport && npm install && npm run dev
```

Open http://localhost:5173 - draw a survey region, run a presence pathway, verify offline.

### Deploy Transect Trust (Fly.io)

```bash
fly deploy   # from repo root - Dockerfile serves API + static UI
```

See [`fly.toml`](fly.toml) and [`Dockerfile`](Dockerfile).

### Verify collaboration bundle

```bash
python3 tools/collaboration-bundle/sign_bundle.py verify collaboration/20260701-120000
```

### Burin kernel (standalone)

```bash
cd Burin && uv run python -m burin.kernel verify --help
```

## Thesis

**Accountability without agreement** (Burin) meets **orchestration without a broker** (Pathways). Pathways licenses field-workflow *recipes*; Burin binds *where and when*; **Trust Key** supplies a portable provenance root for multi-party verification. Neither substrate requires the other's commercial license for noncommercial use.

## License

- **Burin kernel:** PolyForm Noncommercial 1.0.0 - commercial use: cameronsajedi@gmail.com
- **Pathways encoding + reference apps:** see bundle `license_terms` and [`burin-pathways/PACKAGE.yaml`](burin-pathways/PACKAGE.yaml)
- **Trust Key technique (`Pathways.TrustKey.*`):** co-authors DJ Thomson and Cameron Sajedi - see [`burin-pathways/techniques/TRUST_KEY_TECHNIQUE.v1.md`](burin-pathways/techniques/TRUST_KEY_TECHNIQUE.v1.md)
