# Gate 1 — Signal Graft 🌿

**[Open the live communication experiment](https://anttiluode.github.io/ElavaMatriisiSol/gate1/)** · [Back to Gate 0](https://anttiluode.github.io/ElavaMatriisiSol/) · [Claude's independent Gate 0](https://github.com/anttiluode/ElavaMatriisiClaude)

Two organisms develop **separate** small, resource-maintained association matrices. A sees a hidden environmental event; B receives only A's chosen symbols and must visit a patch in a 2×2 room to harvest resources. B shares a small fraction of harvest with A as an economic receipt. **No matrix weights cross the channel.**

This is a deliberately small **signaling game**, NOT biological language, a model of the developing brain, or an emergence of unrestricted language from raw sensory experience. In particular, both agents' input/output interfaces and the possibility of two signal slots are **supplied by the designer**.

## The proposed bridge

Gate 0: a physical structure is maintained or lost as a consequence of its own transport economy.

Gate 1: can two separately initialized, locally maintained pathways become coordinated through transmitted signals and resource consequences? Can a third independently initialized receiver learn the convention without copying the first receiver?

Observation and language are different: the event in the room exists whether or not the organisms have any signal for it.

## Environment and information boundary

- The room contains **four** possible resource patches: lower left (0), upper left (1), lower right (2), upper right (3).
- A gets the location event (two binary factors). B sees only A's message.
- B chooses one patch. Actual local harvest is **8** units for exact contact, **1.5** for one matching coordinate (near miss), and **0** for two mismatched coordinates. This graded ecological feedback makes the tiny learning task much easier.
- B pays a signal/interaction charge of **0.38** and shares **25%** of harvested resources with A. Both pay upkeep; reserves are bounded from **0** to **100**.
- Both update selected associations from the economic receipt, **not from supervised target-symbol labels**. There is no global backpropagation or shared error gradient.
- Each connection has fast adaptive state and slowly changing **wood** conductance. Consolidation and maintenance are toy analogies, not biological neuron/glia models.
- B's learned action can never directly read A's underlying observation. A and B each retain their own matrices.

**Economic caveat:** in the default well-resourced room, banks eventually saturate and the budget does not strongly constrain learning. This gate tests communication/transfer, **not** a demonstrated advantage from costly metabolic structure. Future gates should connect signal learning more tightly to the sparse transport economy from Gate 0 and examine scarcity.

## Two controlled architectures

**Factorized protocol (two symbol slots):**

- Slot 1 gets the first coordinate; slot 2 gets the second coordinate.
- Each slot has two possible symbols. Total joint message capacity: **four** messages (2 bits).
- Sender A separately learns two 2×2 observation→symbol matrices. Receiver B learns two separate 2×2 symbol→action matrices.
- The factorization is GIVEN BY DESIGN. It is a compositional inductive bias, not grammar discovered from unstructured input.

**Holistic protocol (one four-valued symbol):**

- Sender A learns a single 4×4 event→symbol mapping. B learns a single 4×4 symbol→patch mapping.
- Total message capacity: also **four** messages (2 bits).
- No built-in mechanism combines previously learned pieces for an entirely unseen event row.
- We deliberately withhold the fourth event during training by default. Thus the fourth row of the holistic sender's mapping remains untrained, while the factorized system has observed both factor values in other combinations.
- When the fourth event is INCLUDED in training, the holistic version also learns the full mapping.

The comparison demonstrates the benefit of an architecture's predefined factorization, not emergent syntax, open-vocabulary language, or semantic understanding.

## Controls

The page continually evaluates both networks without altering their weights:

1. **Seen combinations:** accuracy on the three events available during training.
2. **Fourth combination:** accuracy on the fourth event (held out by default).
3. **Silence:** random receiver action with no message.
4. **Shuffle:** sender messages generated from unrelated random events.
5. **Independent learner C:** a newly seeded receiver, learning from actual transmitted messages and its **own** harvest while sender A is frozen. Neither A nor original B is modified, and C's weights are never copied.

Compare models with a matched seed and training count. To examine a different regime, uncheck *Withhold fourth combination* and reset.

## Reference results (the committed toy rules)

Run with Node.js:

\`\`\`sh
node gate1/test.mjs
\`\`\`

Eight seeds (3, 5, 17, 73, 1105, 1121, 2036, 3341), **1,000** paired learning events per model, three event combinations presented during training:

| Test | Factorized (two slots) | Holistic (one slot) |
|---|---:|---:|
| Three trained events, greedy evaluation | 8/8 seeds reached 100% | 8/8 seeds reached 100% |
| Fourth, withheld event | 8/8 seeds reached 100% | 8/8 seeds got 0% |
| Random action without message | about 25% in a uniform four-patch room | same |
| Shuffled messages | approximately chance with a uniform four-event test | approximately chance, potentially biased by untrained fourth row |
| Third receiver after 600 examples | 8/8 seeds reached 100% on trained events | also learns trained events; fourth remains untrained |

Some third receivers start with a partially or even fully compatible mapping **by chance** in this tiny two-bit world. The transfer test therefore reports before and after performance rather than treating success alone as proof of learning. Eight seeds and 1,000 encounters are small illustrative tests, not a generalization guarantee.

These outcomes are very strong **because the architecture and environmental feedback make the problem easy**. They should not be called 'emergent language' or generalized to realistic sensory environments.

## Reproducibility and files

- \`index.html\` — static browser interface
- \`app.js\` — UI, numeric displays and controlled interactions
- \`engine.mjs\` — pure seeded agent dynamics, separate fast/slow matrices, environment, isolated evaluation, third-agent transfer
- \`test.mjs\` — repeatability, negative controls, held-out comparison, frozen sender, no weight sharing, bounded resources

No external JS dependencies or backend. The page runs on GitHub Pages; locally, serve the repo directory with \`python -m http.server\` then visit \`/gate1/\` (some browsers restrict ES-module imports directly from file://).

## What should be tested next

- Pair **actual adaptive transport graphs** instead of fixed small association matrices, with real construction and upkeep of each edge.
- Remove the hand-supplied split into two factors; require learners to infer useful partitions from continuous observations.
- Increase ambiguity, perceptual variation, delayed consequences, competing tasks and resource scarcity.
- Test population-to-population cultural transmission beyond one new receiver, and replace shared harvest receipt with more localized acknowledgements.
- Check whether retaining old 'wood' pathways helps transfer after long disuse, and whether a richer body can adapt its curiosity under scarcity.

**A living communication system is not merely a structure that sends symbols. Its past use must change which future messages it can afford to understand.**
