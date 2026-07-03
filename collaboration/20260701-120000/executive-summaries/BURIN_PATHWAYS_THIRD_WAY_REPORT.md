# Burin × Pathways: The Third Way — Executive Report

**Prepared for:** Cameron Sajedi and the Burin project  
**Prepared by:** Originator (Pathways framework author)  
**Date:** 2026-07-01  
**Channel:** `djat-burin-20260701`

---

## Executive summary

Burin provides **consensus-free spatiotemporal trust** — seals verifiable from a 70-byte burst to a handwritten page. Pathways provides **orchestration without a broker** — named, forkable, licensable workflow recipes with Aqua lineage.

**Together they enable a third way:** neither classic open source nor closed IP alone, but **dual-substrate licensing** — PolyForm NC kernel + Pathways `license_terms` on orchestration recipes, with offline dual attestation (orchestration + presence).

---

## Part A — Burin business model today

| Element | Posture |
|---------|---------|
| Kernel license | PolyForm Noncommercial 1.0.0 |
| Commercial kernel | Separate license — cameronsajedi@gmail.com |
| GTM | Witness-not-authority; Tier-1 device postmark |
| Distribution | Path dependency / reference; not PyPI |

Burin asks the least of the powerful party: witnesses relay and timestamp; their lies are locally provable.

---

## Part B — Pathways as additional licensing paradigm

Pathways `license_terms` travel with templates:

```yaml
license_terms:
  type: revenue-share
  royalty_split: [substrate-originator, pathways-formalization, witness-channel]
  substrate_license_ref:
    substrate: burin
    orchestration_scope: pathway-template-only
```

**The marketplace sells recipes, not the kernel.**

---

## Part C — Comparison matrix

| Dimension | Open source | Copyright | Burin NC | Pathways dual-license |
|-----------|-------------|-----------|----------|----------------------|
| Protects code | Weak (fork) | Expression | NC license | Kernel NC + recipe terms |
| Protects process | No | Weak | Seals only | Pathway runs + gates |
| Offline verify | Varies | No | Yes | Yes (dual plane) |
| Marketplace | No | No | No | Organic (fork + delta) |

---

## Part D — Flagship proof: H-BU1 / H-BU5

**H-BU1:** Dual-attestation sandwich — verify Aqua + Burin without merged super-hash.  
**H-BU5:** Field run offline verify — bundle + kernel verify, zero network.

Delivered via **Presence Passport** reference application.

---

## Part E — Commercial paths

1. **Kernel commercial license** — integrated products (Cameron Sajedi)
2. **Pathway royalty_split** — fork/use of presence workflow templates
3. **Witness relay fees** — satellite/ground channel (witness-not-authority)
4. **Conformance + support** — `Burin.Conformance.Test@v1` as build credential

---

## Recommendation

Treat Burin as a **foundational Pathways substrate** alongside Aqua. Encode presence in step artifacts; keep licensing planes explicit; ship Presence Passport as the proof that the design space is real.
