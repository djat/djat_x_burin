# ZK step artifact binding

**Hypothesis:** H-BU6

Pathway step N emitting `burin_zk_survey_proof` MUST reference `coverage_root` from step N-1 `burin_seal`. Enables bounded disclosure pull-stream (Burin RFC 0002) as a pathway sub-run without FHE.
