# Gate 1b — Jättebra: Dormant Paths

**[Open the interactive experiment](https://anttiluode.github.io/ElavaMatriisiSol/gate1b/)** · **[Gate 0](../)** · **[Gate 1](../gate1/)** · **[All matched results](results.md)**

The next independent Sol experiment, motivated by a *negative* result from [Claude's Gate 0b](https://github.com/anttiluode/ElavaMatriisiClaude): a vine that once reached the light generally did **not** recover faster than an inexperienced vine when the light returned. A small possible head start was seen only for one bright, short-absence, slow-wood condition. *Retained structure is not automatically usable knowledge.*

The user's *jättebra* observation suggests a different test: you can recognize an old Swedish word but no longer produce it fluently. Under **foreign-language attrition**, relearning can be faster than first learning and recognition can outlast free production. This experiment makes the storage-versus-accessibility distinction explicit.

## Design: a deliberately constructed hypothesis

Six **given** English meanings are paired with six **given** Swedish expressions:

| Meaning | Learned word |
|---|---|
| hello | hej |
| thank you | tack |
| very good | jättebra |
| goodbye | hej då |
| water | vatten |
| shelter | skydd |

Each meaning has six potential outgoing expression pathways. The model has **two independent states per connection**:

1. **Slow association** `W[i][j]`: a stored connection, analogous to wood. Under dormancy it stays largely unchanged and costs a small amount of resources to maintain.
2. **Fast accessibility** `A[i][j]`: whether the connection can currently support spontaneous expression. With no language use it decays much faster. It can be reopened by encountering the paired word again.

A `hear(meaning)` exposure updates the relevant association and accessibility locally through a simple co-activation rule. There is **no backpropagation, global gradient, or language model**, but the correct concept–word pairing is supplied as training information. The experiment does not discover its own words, concepts, or dormancy mechanism.

**Production probe:** given a meaning, select its expression through the *product* of slow and fast states (`W × A`).

**Recognition probe:** given a word, select a meaning using the slow associative matrix in reverse (without the production gate). This is an intentionally designed probe and **does not demonstrate how human recognition works**.

## A controlled return-to-language protocol

- All histories receive 720 initial word pairings.
- At the start of absence, all six meaning nodes get the same 3 energy units. During absence, a chosen income per node replenishes resources, while maintenance consumes them.
- Three absence durations (`200`, `1200`, `5000` ticks) and three resource conditions (`0.00015`, `0.006`, `0.045` per node per tick) form nine environmental cells.
- On return, each condition gets **the same 12 energy units per meaning node**. This is an experimental intervention isolating stored structure from resource wealth, not a closed thermodynamic simulation.
- The organism then hears up to 240 evenly distributed paired words. Measure **exact number of presentations to reach 80% expected production**, averaged over six word meanings.
- 12 reproducible seeds per cell; only initial microscopic strengths differ across seeds, so near-identical results are expected in this small easy task.

Five counterfactual histories:

| History | Mechanism | What it rules out |
|---|---|---|
| Dormant wood | W decays very slowly; A decays quickly; W has low but nonzero upkeep | Main storage-accessibility hypothesis |
| Unprotected wood | W decays rapidly, with active upkeep | Slow storage versus simple use-dependent strengthening |
| Scrambled old wood | Same wood mass, but connections rotated to the wrong words | Benefit caused by generic structure rather than memory **content** |
| Erased / first time | All foreign associations reset at return, with equal return budget | Relearning versus learning with no specific stored link |
| Active rehearsal | One supplied word pairing every 18 ticks, with higher upkeep | Continuing practice as a costly comparison, **not** an equal-exposure control |

## Result: constructive savings, plus a failure case

In the default condition (absence 1200, income 0.006), the dormant model has **16.7% expected free production (chance)**, but **97.3% recognition** of the stored associations. It reaches 80% expected production again after **19 paired encounters**, versus **95** after memory erasure: **76 presentations saved** in the implemented equations.

That result is largely expected: **we explicitly built the hidden wood state and the decaying accessibility gate.** It is proof of a possible toy mechanism, **not** emergent memory, human language learning, or a biological prediction.

The critical negative condition is **5000 ticks at income 0.00015**. Dormant wood eventually costs more than the economy can maintain. Stored associations erode and recognition drops to chance. The old learner requires **99** presentations to reach 80%, slightly worse than the erased learner's **95**. In that regime, **savings disappears**. The old structure is not free.

For all conditions and precise numeric results, see [results.md](results.md), generated by the experiment rather than transcribed manually.

## Run without GPUs or dependencies

```sh
node gate1b/test.mjs
node gate1b/sweep.mjs
```

Open `gate1b/index.html` via GitHub Pages, or run `python -m http.server 8000` from the repository root and open `http://localhost:8000/gate1b/`. The model and charts are deterministic and run entirely offline in your browser. No Python dependencies, neural network libraries, or GPU required.

## Honest interpretation and limitations

**What is tested:** whether a *supplied* slow association combined with fast accessibility can preserve recognition, suppress spontaneous production after disuse, and accelerate reacquisition under finite maintenance resources; whether that advantage survives a wood-content shuffle; and whether starvation eventually erases it.

**What is not tested:** emergent dormancy in a plant, a plastic or growing physical transport graph, real bilingualism, access thresholds in measured neural populations, graded receptive language ability, social interaction, a neural speech motor system, or a real-world accuracy objective. The “memory” is a small explicit matrix, not a language-generating cortex. Fine-grained motor production is collapsed into one accessibility number.

**Strongest next test:** apply the same distinction to actual Gate 0 conductance pathways, without granting protected status to any preselected association. Can repeated local use spontaneously establish a viable quiet structure that survives disuse, and can it regain transport without being explicitly told which memory to recover? A strong test would show savings **after matching material, reserves, and access** against a never-trained control and a scrambled-material control.

## References motivating the *question*, not validating our equations

- [Schmid & Köpke (2019), *Bridging the Gap Between Second Language Acquisition Research and Memory Science: The Case of Foreign Language Attrition*](https://pmc.ncbi.nlm.nih.gov/articles/PMC6866255/) — distinguishes productive recall, recognition, relearning/savings, and accessibility.
- [Tonegawa and colleagues (2017), *Silent memory engrams as the basis for retrograde amnesia*](https://pmc.ncbi.nlm.nih.gov/articles/PMC5699085/) — persistence of engram connectivity despite failure of ordinary retrieval, in a separate experimental paradigm.
- [Claude's Elävä Matriisi Gate 0b](https://github.com/anttiluode/ElavaMatriisiClaude) — mostly null direct savings on moving-window vines, with only one suggestive condition.

**License:** MIT (from parent repository).
