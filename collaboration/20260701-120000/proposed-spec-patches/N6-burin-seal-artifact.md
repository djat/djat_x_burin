# Patch N6 — `BurinSealArtifact` step output schema

**Target:** Step `output_schema` / `_step_artifacts[order]` artifact types

**Status:** Proposed (2026-07-01)

---

## Motivation

Presence-bearing steps need a typed, verifier-portable artifact distinct from Aqua orchestration attestations.

## Proposed schema

```json
{
  "$id": "pathways.artifact.burin_seal.v1",
  "type": "object",
  "required": ["artifact_type", "seal", "coverage_root"],
  "properties": {
    "artifact_type": { "const": "burin_seal" },
    "seal": { "type": "object", "description": "burin.kernel Seal.to_dict()" },
    "coverage_root": { "type": "string", "pattern": "^[0-9a-f]{64}$" },
    "fingerprint_hex": { "type": "string" },
    "spoken_seal_24w": { "type": "string" }
  }
}
```

Related types: `burin_zk_survey_proof`, `burin_fraud_proof`, `presence_waived`.

## Conformance test

**FT-32.** Pathway run with `burin_presence` step validates against schema; offline verify via `burin.kernel verify_seal`.
