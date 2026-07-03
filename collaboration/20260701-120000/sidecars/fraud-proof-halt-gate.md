# Fraud-proof halt gate

**Hypothesis:** H-BU7

When `EquivocationFraud` is detected in witness log, pathway executor sets `RunStatus.HALTED` and records `burin_fraud_proof` — R5 register when gate profiles ship.
