# Patch N8 — Presence vs orchestration attestation glossary

**Target:** RIS §21 Glossary / Book §5.4

**Status:** Proposed (2026-07-01)

---

## Proposed entries

| Term | Definition |
|------|------------|
| **Orchestration attestation** | Aqua Protocol revision over templates/runs — workflow lineage |
| **Presence attestation** | Burin seal / witness log — commitment + optional where/when |
| **Dual-attestation sandwich** | Bundle exporting both without merged super-hash |

Implementations MUST NOT collapse these senses in UI labels or API field names named `attestation` without a plane qualifier.
