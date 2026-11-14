# Elävä Matriisi — Sol 🌿

**[Gate 1b — Jättebra: dormant pathways and language savings](https://anttiluode.github.io/ElavaMatriisiSol/gate1b/)** · [Methods and matched results](gate1b/README.md) · [Nine-condition ledger](gate1b/results.md)

**[Gate 1 — Signal Graft: two organisms learn a shared signaling convention](https://anttiluode.github.io/ElavaMatriisiSol/gate1/)** · [Gate 1 methods and tests](gate1/README.md)


**A matrix that must pay for the right to keep changing.**

**[Open the interactive browser laboratory](https://anttiluode.github.io/ElavaMatriisiSol/)** · [Köynnös inspiration](https://github.com/anttiluode/Koynnos)

> A living matrix is not merely a matrix that changes. It is a matrix whose structure must continuously sustain the conditions that allow it to change.

A dependency-free, deterministic browser laboratory about local reserves, adaptive transport, growth loans, and structural memory. Inspired by the photographed climbing vine wrapping around a real hanging chain, Köynnös, discussions with Claude, and classical Physarum transport-network models.

## What happens

- **Local reserves:** every node stores a finite amount of energy. The shared root begins with reserves and receives a small basal input. Light sources produce a finite stream of energy shared among nodes in their neighborhood.
- **Conservative transport:** adjoining nodes exchange energy according to the difference in their reserves and their connecting edge's conductance. Outgoing flux is scaled when a donor cannot afford it. Transport does not create energy.
- **Canalization-like reinforcement:** flux maintains the conductance of the edge carrying it; unused conductance gradually decays. This mechanism is inspired more directly by Physarum tube models than by the detailed molecular physiology of auxin.
- **Exploratory loans:** a growing tip spends local resources before it can earn anything. Loan patience determines how long exploration can continue without reaching a productive light patch. Current loan expiry is an explicit pruning approximation, not yet emergent biological senescence.
- **Structure grows on structure:** all new stems start at existing viable nodes. No one creates arbitrary distant matrix connections.
- **Damage:** severing an edge removes the connected descendant subtree, which may be partially regrown through surviving branches.

No task accuracy reward, backpropagation, global error signal, or shortest-path oracle is involved. There are still designer-chosen growth, light-seeking, and loan-expiry rules: this is **not objective-free artificial intelligence**, a real plant simulator, or a demonstrated biological learning mechanism.

## Controls and experiments

1. **Patience:** try seed 1105 with 70, 130, and 230 ticks. Short loans may kill all three initial explorations; longer loans make costly exploration possible but do not automatically make the network more efficient.
2. **Move light:** drag a glowing source. The environment changes while the established network remains.
3. **Cut branch:** select a stem to sever it and everything downstream. This is a real interruption of the transport graph.
4. **Shade / restore:** reduce source income to 8%, then restore it.
5. **Ablations:** compare Living, Fixed channels (no conductance adaptation), and Free growth (no paid growth and no expiring exploratory loans). Mode changes reset the seed.

The ledger reports total stored resources, living connections, active explorations, successful light contacts, withered directions, and recovered resource. Animated dots show actual flux, not arbitrary visual particles.

## Mathematical core

With energy E at each node, conductance D on an edge, and transported flux Q:

Proposed flow: Q_ij = clip(0.17 D_ij (E_i - E_j), -1.35, 1.35).

Every node's outgoing proposals are scaled to its available energy before simultaneous transfer, conserving transport resources and preventing negative node inventories.

Conductance update: D_ij(next) = clip(D_ij + 0.018 sqrt(abs(Q_ij)) - 0.003 D_ij, 0.03, 2.6).

External light income and a basal root input replenish the system. Per-node maintenance and new-segment construction dissipate resources. A new segment charges 0.42 resource units and transfers 0.19 from its parent to its new node. Withering recovers only 58% of remaining stored energy from lost segments; it does **not** create new energy. The actual numeric constants are experimental choices.

**Global budget = the sum of finite local node reserves.** The root is a large local reserve, not an omniscient treasurer. Other nodes trade via actual edges.

## Run

The interface is the index.html entry point; matrix.js is the engine and app.js the canvas UI. It uses no external libraries or fonts. GitHub Pages serves it directly. You can run a local HTTP server from the folder with Python's http.server module if your browser blocks ES modules under file://.

For automated tests, run **npm test** with modern Node.js (zero dependencies). A fixed random seed permits matched comparisons.

## Important limitations

- This version grows a **tree**, not a general recurrent graph with loops. It can be represented as a sparse matrix, but is not a trainable neural weight matrix.
- The loan is finite resource exposure plus a **timeout**, not yet a literal debt ledger with measured repayment. Arrival near a source makes local income possible; it does not certify lifetime profitability.
- Pruning on loan expiry is still an **explicit code rule**. A stronger test would replace expiry with gradual subsidy withdrawal and let maintenance costs and conductivity decay determine failure.
- Results must be compared across seeds and matched external income. More surviving edges or faster growth do not establish intelligence.
- No accurate neurobiology, gene expression, kinesin motors, astrocytes, or plant vasculature is claimed.

## Scientific ancestry

- [Tero, Kobayashi & Nakagaki (2007): Physarum adaptive transport network](https://doi.org/10.1016/j.jtbi.2006.07.015).
- [Hajný, Tan & Friml (2022): Auxin canalization](https://doi.org/10.1016/j.pbi.2022.102174).
- [Köynnös](https://github.com/anttiluode/Koynnos): exploratory feelers, scaffold reuse and failure at a shared load-bearing pin.
- The planned companion [ElavaMatriisiClaude](https://github.com/anttiluode/ElavaMatriisiClaude), developed independently around the same question.

**MIT license.**
