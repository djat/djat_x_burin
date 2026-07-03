# Dual-attestation sandwich thesis

**Flagship hypothesis:** H-BU1  
**Pathway:** [`Presence.Bundle.DualAttestation@v1`](../burin-pathways/pathways/Presence.Bundle.DualAttestation.v1.yaml)

## Statement

When a PathwayRun completes with Aqua orchestration attestation **and** Burin presence seals on steps,

**then** an assessor can verify both planes from one export artifact using `merge_policy: hash_linked_cross_reference_only` — without accepting a merged super-hash.

## Mechanism

```yaml
dual_attestation_bundle:
  orchestration_plane:
    aqua_stub_id: aqua_stub_*
    step_executions: [...]
  presence_plane:
    step_artifacts:
      burin_seal: {...}
  merge_policy: hash_linked_cross_reference_only
```

## Precedent

LCP triple-hash pattern (PoC bundle H-CONVERGE-MO-LCP-1) — cross-register independent domains without union seal.

## Confirm

Export from Presence Passport `/api/pathways/{run_id}/export-bundle` + offline verify per L6.
