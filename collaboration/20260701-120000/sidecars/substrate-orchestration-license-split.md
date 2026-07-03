# Substrate-orchestration license split

**Hypothesis:** H-BU2  
**Pattern:** [`Pattern.BurinSubstrate.DualLicenseSplit`](../burin-pathways/patterns/Pattern.BurinSubstrate.DualLicenseSplit.yaml)

## Problem

Burin kernel is PolyForm Noncommercial. Pathways templates may carry marketplace economics. Without machine-readable separation, licensees confuse recipe rights with kernel commercial obligations.

## Solution

`substrate_license_ref` on `PathwayLicenseTerms` (proposed N5):

- `orchestration_scope: pathway-template-only`
- `commercial_kernel_contact: cameronsajedi@gmail.com`

## Commerce model

| Revenue | Layer |
|---------|-------|
| Kernel commercial license | Cameron Sajedi / Burin project |
| Pathway royalty_split | Pathways marketplace |
| Witness relay fees | Satellite/ground channel partners |

Noncommercial research/education: both free.
