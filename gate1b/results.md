# Gate 1b — Preregistered matched tests and observed results

**Date:** 2026-11-14. **Seeds:** 2, 11, 31, 57, 91, 105, 203, 333, 440, 555, 809, 1001 (12 per condition).
**Initial pairing:** 720 concept–word presentations; **word inventory:** 6 English concepts paired with six Swedish tokens; **return:** 240 presentations.
**Energy:** all cases begin absence with 3 units per concept node; at return each concept is reset to 12 units across conditions to remove simple saved-energy advantages. The physical construction of the association and access gates is still imposed by the model.
**Threshold:** exact first presentation at which expected production probability crosses 80%, evaluated every single presentation. Chance is 1/6 = 16.7%.

| Absent ticks | Daily income/node | Dormant recognition | Dormant production | Dormant → 80% | Erased → 80% | Median saved pairs | Successful matched seeds | Stored reserve (dormant) |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 200 | 0.00015 | 97.3% | 36.8% | 14 | 95 | 81 | 12/12 | 16.3 |
| 200 | 0.006 | 97.3% | 36.8% | 14 | 95 | 81 | 12/12 | 23.4 |
| 200 | 0.045 | 97.3% | 36.8% | 14 | 95 | 81 | 12/12 | 70.2 |
| 1200 | 0.00015 | 97.3% | 16.7% | 19 | 95 | 76 | 12/12 | 8.0 |
| 1200 | 0.006 | 97.3% | 16.7% | 19 | 95 | 76 | 12/12 | 50.1 |
| 1200 | 0.045 | 97.3% | 16.7% | 19 | 95 | 76 | 12/12 | 180.0 |
| 5000 | 0.00015 | 16.7% | 16.7% | 99 | 95 | -4 | 0/12 | 0.0 |
| 5000 | 0.006 | 97.2% | 16.7% | 19 | 95 | 76 | 12/12 | 151.9 |
| 5000 | 0.045 | 97.2% | 16.7% | 19 | 95 | 76 | 12/12 | 180.0 |

## Controls and interpretation

- **Dormant:** stable wood trace with low maintenance cost; access decays through disuse. The correct English↔Swedish pairing was supplied during initial learning.
- **Decay:** wood decays rapidly, with non-dormant upkeep.
- **Scrambled:** preserved wood values but rotated token associations so content-specific storage is destroyed without reducing the amount of structural material.
- **Erased / first-time:** previously paid training ends with weight reset just before the return; it is a counterfactual erasure, not a realistic person with no history.
- **Rehearsal:** repeats one observed pairing every 18 absence ticks at an active-energy cost; it is a costly upper comparison, not a matched learning-exposure control.

The 80% crossing is measured analytically from the toy softmax decision probability, rather than a limited sample of random behavioral responses. Across these seeds, initial weights differ only slightly, so identical thresholds are expected, not a robust estimate of biological variability.

The constructed dormant path exhibits recall/recognition dissociation because the model deliberately separates a fast output gate from slow wood. The positive savings test therefore establishes *sufficiency under explicit assumptions*, not emergence of that mechanism or proof that real language attrition works this way.

**Crucial negative case:** 5,000 ticks at income 0.00015 per node exhaust stored reserves. Dormant recognition falls to chance and savings disappears (in fact, reacquisition becomes slightly slower than the erased control). Protecting memory consumes finite resources; it is not a magical free archive.

**Not tested:** realistic language comprehension, acquisition from continuous perception, neural anatomy, social feedback, long-term generational transmission, growing physical graph topology, a genuinely emergent dormancy decision, and resource competition between exploration and maintenance in Gate 0.

## Reproduce
Run `node gate1b/test.mjs` and `node gate1b/sweep.mjs` from the repository root. All code is plain JavaScript; Node 22 needs no dependencies. The browser page can be opened on GitHub Pages.
