# Patch N5 — `substrate_license_ref` for dual-substrate licensing

**Target:** `PathwayLicenseTerms` in PATHWAYS_ARCHITECTURE §18.1 / RIS §4.2

**Status:** Proposed (Burin integration, 2026-07-01)

**Origin:** [`burin-pathways/APPLICATION_PLAYBOOK.md`](../../burin-pathways/APPLICATION_PLAYBOOK.md) §4

---

## Motivation

Burin kernel code is PolyForm Noncommercial; Pathways templates using Burin may carry `royalty_split` and marketplace economics. Without an explicit substrate pointer, licensees cannot mechanically distinguish **orchestration recipe rights** from **kernel commercial obligations**.

## Proposed text

```python
class SubstrateLicenseRef(BaseModel):
    substrate: str                    # e.g. "burin"
    kernel_license: str             # e.g. "PolyForm-Noncommercial-1.0.0"
    commercial_kernel_contact: Optional[str]
    orchestration_scope: str        # e.g. "pathway-template-only"

class PathwayLicenseTerms(BaseModel):
    # ... existing fields ...
    substrate_license_ref: Optional[SubstrateLicenseRef] = None
```

## Conformance test addition

**FT-31.** Template with `substrate_license_ref` round-trips; fork preserves ref; UI MUST display kernel license separately from pathway `type`.
