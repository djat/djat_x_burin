# Patch N7 — `spatiotemporal_gate` (R6 extension)

**Target:** `gate_profile.R6` (contextual register)

**Status:** Proposed (2026-07-01)

---

## Motivation

Field workflows must refuse step transitions when the device-reported cell falls outside a declared public rHEALPix region (conservation boundaries, jurisdiction boxes).

## Proposed text

```yaml
gate_profile:
  registers:
    R6:
      enabled: true
      spatiotemporal_gate:
        public_region_cell: "Q,4,5,3"   # coarse rHEALPix SUID
        require_cell_inside: true
        phase_bindings:
          intake: { max_zoom: 6 }
          capture: { max_zoom: 9 }
          export: { allow_outside: false }
```

Engine MUST refuse launch or step advance when `burin_seal.cell` is outside `public_region_cell` at the active phase zoom.

## Conformance test

**FT-33.** Template with spatiotemporal_gate refuses out-of-bounds seal; in-bounds seal proceeds.
