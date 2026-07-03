# djat_x_burin — Burin × Pathways

Open collaboration workspace encoding **Burin** (consensus-free spatiotemporal trust) as a foundational **Pathways** substrate primitive, with a full-stack **Presence Passport** reference application.

## Repository layout

| Path | Role |
|------|------|
| [`Burin/`](Burin/) | Burin kernel + coverage engine (PolyForm Noncommercial) |
| [`burin-pathways/`](burin-pathways/) | Pathways domain package — templates, patterns, playbook |
| [`collaboration/20260701-120000/`](collaboration/20260701-120000/) | Sealed collaboration bundle (open invitation) |
| [`backend/`](backend/) | Minimal Pathways FastAPI engine + Burin agents |
| [`presence-passport/`](presence-passport/) | React UI — field workflows with dual attestation |
| [`PATHWAYS_ARCHITECTURE_v1.1.0.md`](PATHWAYS_ARCHITECTURE_v1.1.0.md) | Descriptive architecture (Burin §9.8) |
| [`PATHWAYS_REFERENCE_v1.1.0.md`](PATHWAYS_REFERENCE_v1.1.0.md) | Normative RIS spec |

## Quick start

### Presence Passport (full stack)

```bash
# Backend
cd backend && uv sync && uv run uvicorn app.main:app --reload --port 8000

# Frontend
cd presence-passport && npm install && npm run dev
```

Open http://localhost:5173 — draw a survey region, run a presence pathway, verify offline.

### Verify collaboration bundle

```bash
python3 tools/collaboration-bundle/sign_bundle.py verify collaboration/20260701-120000
```

### Burin kernel (standalone)

```bash
cd Burin && uv run python -m burin.kernel verify --help
```

## Thesis

**Accountability without agreement** (Burin) meets **orchestration without a broker** (Pathways). Pathways licenses field-workflow *recipes*; Burin binds *where and when*; neither requires the other's commercial license for noncommercial use.

## License

- **Burin kernel:** PolyForm Noncommercial 1.0.0 — commercial use: cameronsajedi@gmail.com
- **Pathways encoding + Presence Passport:** see bundle `license_terms` and [`burin-pathways/PACKAGE.yaml`](burin-pathways/PACKAGE.yaml)
