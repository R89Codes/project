# Lecture Plan — 3-Coloring (Pre-Implementation)

## Scope and constraints
- This is a planning-only document. No HTML/CSS changes are included here.
- Structure follows `docs/ui_template.md` §7 exactly (8 required sections).
- Pedagogical style mirrors the `lecture.html` reference: numbered roadmap, colored section badges, semantic callout boxes, explicit transitions to the interactive tool, a cross-section "common thread" move, and a short appendix concept hook.

## Roadmap skeleton (for lecture UI)
1. What is Graph Coloring? (`blue` badge)
2. The 3-Coloring Problem (`yellow` badge)
3. Why It's Hard — NP-Completeness (`red` badge)
4. Reduction from 3-SAT (`purple` badge)
5. Exact Algorithm — Backtracking (`green` badge)
6. Practical Algorithm — Greedy (`amber` badge)
7. When Greedy Fails — Crown Graph (`red` badge)
8. Interactive Tool — Try It Yourself (`blue` badge)

## Section-by-section plan

### 1) What is Graph Coloring?
Purpose: Give intuitive definition + real-world motivation before complexity details.

Callout boxes needed:
- `key-concept`: Proper coloring definition (`adjacent vertices must have different colors`) and chromatic number `χ(G)`.
- `example`: Small 5-vertex toy graph with one valid 3-coloring and one invalid coloring.
- `check-understanding`: One quick prompt ("If two non-adjacent vertices share a color, is that allowed?").

Math/code content:
- Inline math: `c: V -> {1,2,3,...}`, `chi(G)`.
- No pseudocode block.

Interactive cross-reference:
- Try it yourself: go to `Playground`, load `C5`, click `Build Steps` then `Step` to see a legal coloring evolve.

Adaptability note:
- Directly adaptable from reference opening style (motivation + terminology), but domain examples must be recolored for graph coloring (register allocation, exam scheduling, frequency assignment).

Estimated length:
- 3 short paragraphs + 2 callouts (about one screen).

### 2) The 3-Coloring Problem
Purpose: State the exact decision problem and position it against 2-coloring and 4-coloring facts.

Callout boxes needed:
- `key-concept`: Formal language (`Given G, does there exist a proper coloring with <=3 colors?`).
- `warning`: Hardness threshold confusion (`2-coloring is easy, 3-coloring is NP-complete`).
- `check-understanding`: Mini true/false on "K4 is 3-colorable".

Math/code content:
- Inline math: `3-COL = { G | chi(G) <= 3 }`.
- Tiny code-style snippet for a verifier idea (`check every edge once`).

Interactive cross-reference:
- Try it yourself: `Playground` -> preset `K4`; set `Algorithm = Backtracking (k=3)`; click `Build Steps` then `Play`; observe `NO` (conflict).

Adaptability note:
- Partly adaptable from reference "problem framing" section, but needs new threshold story (2 vs 3 colors) specific to this project spec.

Estimated length:
- 2 to 4 short paragraphs + 2 callouts.

### 3) Why It's Hard — NP-Completeness
Purpose: Explain NP membership and why decision is hard in plain language.

Callout boxes needed:
- `key-concept`: Certificate for 3-coloring and `O(|V|+|E|)` verification.
- `warning`: P vs NP remains open; NP-complete means "as hard as any NP problem".
- `example`: Small certificate check walk-through on a 6-cycle.

Math/code content:
- Inline math: `O(|V|+|E|)`, `3-COL in NP`.
- Short verifier pseudocode block (edge scan, fail on equal endpoints).

Interactive cross-reference:
- Try it yourself: `NP-Completeness` tab -> "In NP" verifier widget -> run certificate check animation and read operation count.

Adaptability note:
- Directly adaptable from reference's complexity-motivation pattern, but replace approximation language with NP verification language.

Estimated length:
- 3 short paragraphs + 3 callouts.

### 4) Reduction from 3-SAT
Purpose: Teach reduction mechanics and the three gadget families used in this project.

Callout boxes needed:
- `key-concept`: Reduction contract (`phi satisfiable iff G_phi is 3-colorable`).
- `example`: Tiny formula mapped to palette/variable/clause gadgets.
- `warning`: Common reduction mistakes (wrong palette anchors, wrong OR-gadget edges).
- `check-understanding`: Ask which direction is easier (forward vs backward) and why.

Math/code content:
- Inline math: `phi in 3-SAT`, `G_phi`, `iff`.
- Compact edge-list code block for one clause gadget (`x,y,z,m,n,o`) exactly as spec states.

Interactive cross-reference:
- Try it yourself: `NP-Completeness` -> enter a 3-CNF formula -> click `Build Graph` -> inspect one clause gadget and its case-analysis pop-over.

Adaptability note:
- Not directly adaptable from reference content; requires custom 3-coloring-specific proof framing and exact gadget semantics from project spec §8.2.

Estimated length:
- 4 to 5 short paragraphs + 3 to 4 callouts.

### 5) Exact Algorithm — Backtracking
Purpose: Present complete-search solver and where pruning saves work.

Callout boxes needed:
- `key-concept`: Recursive assignment + `SAFE` predicate pruning.
- `example`: Small recursion tree snippet showing one dead-end branch pruned.
- `check-understanding`: Why worst-case is still exponential despite pruning.

Math/code content:
- Pseudocode block (spec-aligned): `BACKTRACK(v_idx)`, `SAFE(v,c)`.
- Inline math: worst-case `O(3^n)` with pruning effect commentary.

Interactive cross-reference:
- Try it yourself: `Algorithms` tab -> source graph `K4` then `Build & Run Both` -> compare backtracking outcome and operation count.

Adaptability note:
- Directly adaptable from reference's exact-algorithm treatment style (clear pseudocode + complexity reality), but algorithm content is different.

Estimated length:
- 3 short paragraphs + 2 to 3 callouts.

### 6) Practical Algorithm — Greedy
Purpose: Explain fast heuristic behavior, ordering dependence, and non-optimality.

Callout boxes needed:
- `key-concept`: Greedy rule (`smallest available color`) and `Delta + 1` upper bound.
- `example`: Same graph with two orderings yielding different colors used.
- `warning`: Greedy is not an approximation for chromatic number in general graphs.

Math/code content:
- Pseudocode block: `GREEDY(order)`.
- Inline math: `O(V+E)` time, uses at most `Delta+1` colors.

Interactive cross-reference:
- Try it yourself: `Algorithms` tab -> source `C6` and switch ordering between `natural` and `Welsh-Powell`; run side-by-side and compare counts.

Adaptability note:
- Partly adaptable from reference's "practical greedy" narrative, but must avoid approximation-ratio promises (spec explicitly warns none for general `chi`).

Estimated length:
- 3 short paragraphs + 3 callouts.

### 7) When Greedy Fails — Crown Graph
Purpose: Deliver the key counterexample: same graph, different order, dramatically different greedy result.

Callout boxes needed:
- `example`: Crown `S8` interleaved order `a1,b1,a2,b2,a3,b3,a4,b4` gives 4 colors.
- `key-concept`: Graph remains bipartite (`chi=2`) while greedy can still use 4.
- `warning`: Finding best ordering is itself computationally hard.
- `check-understanding`: Ask why Welsh-Powell drops back to 2 on the same graph.

Math/code content:
- Inline math: `chi(S8)=2`, greedy(order)=4 for interleaved order.
- Optional tiny table of per-vertex assignment sequence (no long proof block).

Interactive cross-reference:
- Try it yourself: `Design` tab -> load `Crown S8` counterexample -> run natural vs Welsh-Powell and inspect "Order sequence".

Adaptability note:
- New for this project; only the reference's "counterexample + warning" teaching move is reusable.

Estimated length:
- 2 to 4 short paragraphs + 3 callouts.

### 8) Interactive Tool — Try It Yourself
Purpose: Bridge lecture to action with a guided mini-lab sequence.

Callout boxes needed:
- `teaching-tip` (implemented via `key-concept` visual style and title): suggested demo order for class/lab.
- `check-understanding`: short checklist of what students should be able to answer after experiments.
- `example`: 4-step lab path with specific preset/button actions.

Math/code content:
- No heavy math.
- One ordered list of experiments.
- Formula input syntax note: use `-` for negation, `v` for OR, and `^` for AND (same as the current textarea default).

Interactive cross-reference:
- Sequence:
1. `Playground` -> `K4` -> set `Algorithm = Backtracking (k=3)` -> `Build Steps` -> `Play` -> observe unsat.
2. `Algorithms` -> `Petersen` -> run both algorithms -> compare operations.
3. `Design` -> `Crown S8` -> compare orderings.
4. `NP-Completeness` -> formula `(x1 v x2 v -x3) ^ (-x1 v x2 v x3)` -> click `Build Graph`, then `Forward Direction`, then `Backward Direction` (forward uses an auto-found satisfying assignment if one exists).

Adaptability note:
- Directly adaptable from reference's "interactive tool" close + teaching-tip cadence; experiments must be replaced with 3-coloring presets and tabs.

Estimated length:
- 2 short paragraphs + one numbered list + 2 callouts.

## Cross-section pedagogical moves (copied intentionally from reference)
- Opening motivation move ("why this topic matters before definitions").
- Mid-lecture synthesis block ("Common Thread") adapted to this subject as: "Constraint satisfaction + local vs global choices" connecting NP proof, backtracking, and greedy behavior.
- Teaching-tip callout near the end for lecture delivery sequence.
- Appendix hook below tool: "Exact/exponential perspective" (short pointer, not full duplicate lecture) to reinforce why practical heuristics are used.

## Length and pacing budget
- Total target reading time: ~10 minutes (as required by `ui_template.md` §7).
- Per-section target: one screen each, avoid long walls of text.
- Total callouts target: 18 to 24 boxes across all 8 sections, distributed (no section without at least one).

## Risks and dependencies before implementation
- Section 4 (reduction) depends on strict consistency with current `docs/project_description.md` §8.2 gadget definitions and case analysis.
- Section 7 language must stay aligned with the updated `Crown S8` spec wording.
- Any UI copy that names tabs/buttons must match final button labels in `index.html`.
