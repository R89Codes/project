# Audit Report: 3-Coloring Tool vs `docs/project_description.md`

## 1. Build & runtime sanity

### `file://` open + console health
- **Status:** ⚠️ **Unverified in this environment**.
- I cannot run a real browser here (no Chromium/Firefox/playwright available), so I could not collect actual DevTools console output from `file:///.../index.html`.
- What I did run:
  - JS syntax parse of the inline module script via Node: **passes**.
- **Required by your prompt but unavailable here:** verbatim browser console errors/warnings with line numbers.

### External network requests (forbidden by spec)
- **Status:** ✅ No external scripts/fonts/CDNs detected.
- Static scan found no `<script src>`, `<link href>` external assets, CSS `@import`, `fetch()`, or XHR usage.
- Only URL-like string in code is SVG namespace constant: `"http://www.w3.org/2000/svg"` in [`index.html:586`](/home/user_rik/dev/projects/project/index.html:586) (not a network request).

### Single-file requirement
- **Status:** ✅ Conformant.
- App code is entirely inline in one file: [`index.html`](/home/user_rik/dev/projects/project/index.html).
- No separate runtime CSS/JS files are referenced.

---

## 2. Spec conformance — feature by feature

Legend: ✅ present and working, ⚠️ present but broken/incomplete, ❌ missing entirely, ➕ present but not in spec.

### §2 Global Architecture

| Requirement | Status | Evidence / Notes |
|---|---:|---|
| Single `index.html` with inline HTML/CSS/JS | ✅ | Present in one file. |
| No frameworks/libraries | ✅ | Vanilla JS only. |
| 4 tabs: Playground / Algorithms / Design / NP-Completeness | ✅ | Tab shell present at [`index.html:359-364`](/home/user_rik/dev/projects/project/index.html:359). |
| Pseudocode+explanation panel collapsible | ❌ | Spec §2.3: *"PSEUDOCODE + EXPLANATION PANEL ... (full width, collapsible)"*. Panels exist but are not collapsible. |
| Keep DOM query surface small / cache selectors per controller | ⚠️ | Frequent repeated `document.getElementById(...)` calls across handlers; minimal caching pattern not followed. |

### §3 Graph Data Model

| Requirement | Status | Evidence / Notes |
|---|---:|---|
| Vertex/Edge/Graph shapes per spec | ✅ | `Graph` model matches required fields and map/set structure ([`index.html:595-739`](/home/user_rik/dev/projects/project/index.html:595)). |
| Required API surface | ✅ | `addVertex/removeVertex/addEdge/removeEdge/neighbors/degree/clone/resetColors/toEdgeList/fromEdgeList` all implemented. |
| `adj` synchronized with `edges` on mutations | ✅ | `addEdge` updates both ([`637-648`](/home/user_rik/dev/projects/project/index.html:637)); `removeEdge` updates both ([`650-658`](/home/user_rik/dev/projects/project/index.html:650)); `removeVertex` removes incident edges via `removeEdge` ([`623-626`](/home/user_rik/dev/projects/project/index.html:623)); rebuild in `fromEdgeList` uses `addVertex/addEdge` ([`695-721`](/home/user_rik/dev/projects/project/index.html:695)). |
| `_validate()` helper | ✅ | Implemented at [`724-738`](/home/user_rik/dev/projects/project/index.html:724). |

### §4 SVG Renderer

| Requirement | Status | Evidence / Notes |
|---|---:|---|
| Renderer methods per spec (`render`, `updateVertex`, `flashEdge`, `setLayout`, `enableEditing`) | ✅ | Present in `GraphRenderer` ([`741+`](/home/user_rik/dev/projects/project/index.html:741)). |
| Rendering order edges -> vertices -> overlays | ⚠️ | Edges and vertices are correct order; spec overlays like frame-counter/current annotations are not fully implemented. |
| CSS transitions + speed scaling via CSS var | ✅ | Uses `--tx-speed` and transitions; speed slider updates var ([`2879-2883`](/home/user_rik/dev/projects/project/index.html:2879)). |
| Edit mode semantics (click add vertex, shift+click edge, right-click delete, drag move) | ✅ | Implemented ([`756-827`](/home/user_rik/dev/projects/project/index.html:756)). |
| Layouts include `manual`, `circle`, `reduction` (+ optional force) | ❌ | Spec §4: *"setLayout(kind) // \"manual\" | \"circle\" | \"force\" | \"reduction\""*. `reduction` layout mode is missing. |

### §5 Step Machine

| Requirement | Status | Evidence / Notes |
|---|---:|---|
| Build/Step/Play/Pause/Reset semantics | ✅ | Implemented in `StepMachine` and Playground controls. |
| Frame replay model for stepping backwards | ✅ | `goTo()` resets to base clone and reapplies frames ([`1536-1552`](/home/user_rik/dev/projects/project/index.html:1536)); `stepBack()` uses replay ([`1554-1559`](/home/user_rik/dev/projects/project/index.html:1554)). |
| Algorithms are DOM-free and emit frame events | ✅ | `buildGreedyFrames` / `buildBacktrackingFrames` do not touch DOM. |
| Contract `algorithmFn(clone, emit)` in controller | ⚠️ | Spec §5.2 says build should pass `emit` callback into algorithm; current design returns frames from builder functions (different contract). |
| Topbar step counter click opens scrubber | ❌ | Spec §12.1: *"Clicking opens a scrubber (range input) to jump."* Not implemented. |
| Extra `Step Back` button | ➕ | Not in required button set. Harmless, but scope creep. |

### §6 Algorithms

#### §6.1 Greedy

| Requirement | Status | Evidence / Notes |
|---|---:|---|
| Natural / Welsh-Powell / Random orderings | ✅ | Present in UI and ordering function. |
| Emit `check-edge` and `set-color` style frames | ✅ | Implemented in `buildGreedyFrames`. |
| Complexity/guarantee stated in Design tab | ✅ | `O(V+E)` and `Δ+1` shown in Design card. |
| Extra ordering `reverse-degree` | ➕ | Not required by spec. Harmless if retained. |

#### §6.2 Backtracking

| Requirement | Status | Evidence / Notes |
|---|---:|---|
| Recursive exact `k`-coloring with SAFE checks | ✅ | Implemented in `buildBacktrackingFrames`. |
| Emit recursion enter/exit + set/unset/check frames | ✅ | Implemented (`enter-recursion`,`exit-recursion`,`set-color`,`unset-color`,`check-edge`). |
| Worst-case complexity statement in UI | ✅ | Design card includes `O(k^V * E)`. |
| Operation cap in runtime | ⚠️ | Not in spec; can produce false negatives on hard inputs (`maxOperations`). |

#### §6.2 Test matrix result check (harness)

I ran an isolated Node harness mirroring current implementations for `Graph`, `buildGreedyFrames`, and `buildBacktrackingFrames`.

| Graph | Expected 3-color answer | Current backtracking result |
|---|---:|---:|
| K3 | YES | YES |
| K4 | NO | NO |
| Petersen | YES | YES |
| C5 | YES | YES |
| C6 | YES | YES |
| K_{3,3} | YES | YES |
| Crown S6 | YES | YES |
| Reduction example formula | YES | YES |

**Critical caveat:** Crown counterexample claim in §9.2 is still broken (see below), even though the decision result is correct.

#### §6.3 Side-by-side run

| Requirement | Status | Evidence / Notes |
|---|---:|---|
| Two independent renderer+machine pipelines from same input | ✅ | Present in `initAlgorithmsScaffold()`. |
| Build & run in lockstep | ✅ | `startAlgorithmsTimer()` steps both machines per tick. |
| Colors/operations/wall-time comparison | ✅ | Metrics panels populated for both. |

### §7 Growth-Curve Chart

| Requirement | Status | Evidence / Notes |
|---|---:|---|
| Hand-drawn SVG chart (no Chart.js) | ✅ | `drawChart()` custom SVG implementation. |
| Benchmark `n ∈ {4,6,8,10,12,14,16}` | ✅ | Implemented in benchmark handler ([`2266`](/home/user_rik/dev/projects/project/index.html:2266)). |
| Log-scale when growth diverges strongly | ✅ | Uses log when `yMax / yMin > 100`. |

### §8 NP-Completeness Tab

#### §8.1 Verifier panel

| Requirement | Status | Evidence / Notes |
|---|---:|---|
| Interactive verifier with edge-by-edge check animation | ✅ | Implemented in `np-verify` handler. |
| Certificate explanation text tying to `O(|V|+|E|)` | ⚠️ | Spec asks explicit narration text; implementation gives result stats but not the full required NP-membership explanation block. |

#### §8.2 Reduction builder

| Requirement | Status | Evidence / Notes |
|---|---:|---|
| Parser accepts `(x1 v x2 v -x3) ^ ...` and symbols | ✅ | `parse3CNFFormula()` handles `v/∨`, `^/∧`, `-/¬`. |
| Stage 1 palette triangle | ✅ | Present. |
| Stage 2 variable gadgets `(x_i, ¬x_i, B)` | ✅ | Present. |
| Stage 3 OR gadget edges exactly per spec | ❌ | Spec §8.2 says precise edges include `ga-gb`, `gb-gc`, `ga-gabc`, `gc-gabc`, `gabc-T` (plus literal-input edges). Code adds extra edges `gb-out` and `out-B`, which changes gadget semantics ([`2578-2583`](/home/user_rik/dev/projects/project/index.html:2578)). |
| Clause gadget as specified "classic 6-vertex OR-gadget" | ❌ | Code adds 4 internal vertices/clause (`ga`,`gb`,`gc`,`out`) only. |
| Click gadget -> case analysis pop-over | ❌ | Spec §8.2: *"tool should let the user click a gadget and see the case analysis in a pop-over."* Missing. |
| Polynomiality readout | ⚠️ | Readout exists, but claims formulas that do not match constructed gadget cardinality. |

#### §8.3 Forward direction

| Requirement | Status | Evidence / Notes |
|---|---:|---|
| Assignment -> staged coloring workflow | ✅ | Implemented with SAT solve + fixed-color extension + animation. |
| Pause after each clause with explanation | ⚠️ | Spec §8.3 asks clause-by-clause pauses; current flow colors all vertices sequentially, no per-clause stop. |
| End with green ACCEPT banner | ❌ | No ACCEPT banner widget/state; only text update. |

#### §8.4 Backward direction

| Requirement | Status | Evidence / Notes |
|---|---:|---|
| Read assignment from coloring | ✅ | Implemented via palette color mapping and variable vertices. |
| Highlight true literals per clause | ⚠️ | Spec asks clause literal highlighting; current output is textual clause true/false list only. |
| End with green "Formula satisfied" banner | ❌ | No dedicated banner component; only text. |

### §9 Design & Analysis tab

| Requirement | Status | Evidence / Notes |
|---|---:|---|
| Paradigm cards with complexity and caveats | ✅ | Present and mostly aligned. |
| Crown counterexample demonstrates bad ordering inflation | ❌ | Spec §9.2 requires natural ordering demonstration with 4 colors; current natural ordering on Crown S6 gives 2 colors. |
| Side-by-side natural vs Welsh-Powell on crown graph | ❌ | Spec §9.2 asks left/right comparison; implementation has single graph and single run output. |
| Ordering selector re-runs greedy and shows ordering badges | ⚠️ | Re-runs and shows sequence text; badges are injected into labels (works) but not shown as clear numbered badges style per spec intent. |

### §10 Presets

| Requirement | Status | Evidence / Notes |
|---|---:|---|
| Required preset list incl. reduction example | ✅ | All required presets present. |
| Extra preset C6 | ➕ | Not required but harmless. |

### §11 Educational Content

| Requirement | Status | Evidence / Notes |
|---|---:|---|
| Collapsible overview on Playground | ✅ | `<details open>` present. |
| Worked examples block (K4, Petersen, odd/even cycles) | ❌ | Spec §11.2 required explicit worked examples; not provided as a dedicated section/content. |
| Key concept callouts (χ(G), decision vs optimization, certificate, gadget, etc.) | ❌ | Only limited concept text appears; most required callouts are missing. |
| CLRS reference in overview | ⚠️ | Not present. |

### §12 UI Details

| Requirement | Status | Evidence / Notes |
|---|---:|---|
| Topbar includes speed, step, status, reset | ✅ | Implemented. |
| Step counter opens scrubber | ❌ | Missing. |
| Button-state enable/disable logic | ✅ | Mostly implemented for both Playground and Algorithms. |
| Pseudocode line highlighting | ✅ | Implemented in both Playground and Algorithms. |
| Explanation box with concrete-values table (vertex/neighbors/used/next) | ❌ | Only free-text explanation is shown; table missing. |
| Counters panel (vertices, edges checked, backtracks, colors used) | ✅ | Present. |

### §13 Accessibility & Polish

| Requirement | Status | Evidence / Notes |
|---|---:|---|
| SVG labels/titles | ✅ | SVGs use `aria-label`; edges/vertices include `<title>`. |
| Colorblind mode with patterns | ✅ | Pattern mode toggle and SVG pattern fills implemented. |
| Keyboard shortcuts (Space, →, ←, R) | ✅ | Implemented in `wireKeyboardShortcuts()`. |
| Focus rings | ✅ | `:focus-visible` styles present. |
| `prefers-reduced-motion` behavior | ✅ | Reduced-motion CSS branch present. |

---

## 3. Grading-rubric coverage

### CLO-3 (10 marks): paradigm + approximation + counterexample
- **Current band:** **Poor**.
- Why not Excellent:
  - §9.2 counterexample is not functioning as required (natural ordering does **not** show 4 colors on crown graph).
  - Missing side-by-side natural vs Welsh-Powell crown demonstration.
- To reach Excellent:
  - Implement a guaranteed bad ordering sequence for crown graph (e.g., alternating `a1,b1,a2,b2,...`) that demonstrably inflates greedy colors.
  - Render side-by-side comparison exactly as spec states.
  - Keep explicit NP-hard ordering insight visible near the demo.

### CLO-4 (10 marks): brute-force + practical + visual compare
- **Current band:** **Good**.
- Why not Excellent:
  - Core compare flow is strong, but step-scrubber/jump control from §12.1 is missing.
  - Backtracking cap can truncate exactness in some cases (not ideal for "exact" positioning).
- To reach Excellent:
  - Add scrubber jump UI tied to `goTo(t)`.
  - Make exact-mode behavior explicit (either remove cap for normal runs or surface cap-trigger clearly as "incomplete").

### CLO-5 (20 marks): NP-completeness proof tooling
- **Current band:** **Poor**.
- Why not Excellent:
  - OR-gadget edges do not match §8.2 "precise edges" requirement.
  - Clause gadget cardinality/readout mismatch undermines proof fidelity.
  - Missing case-analysis pop-over and missing C/D acceptance banners / per-clause highlighting pauses.
- To reach Excellent:
  - Correct clause gadget construction exactly to spec.
  - Align graph-size formulas with actual construction.
  - Add interactive case-analysis pop-over and explicit forward/backward proof UX milestones (per-clause highlights + final banners).

---

## 4. Correctness bugs (ranked)

### P0 (breaks CLO-level requirements)

1. **OR-gadget construction does not match spec edge set**
- **File:** [`index.html:2573-2583`](/home/user_rik/dev/projects/project/index.html:2573)
- **What’s wrong:** Code adds edges not listed in §8.2 precise gadget (`gb-out`, `out-B`).
- **Spec target:** §8.2 says precise clause gadget edges are `a-ga`, `b-gb`, `c-gc`, `ga-gb`, `gb-gc`, `ga-gabc`, `gc-gabc`, `gabc-T`.
- **Snippet:**
  ```js
  2578 g.addEdge(ga, out);
  2579 g.addEdge(gb, out); // extra vs spec
  2580 g.addEdge(gc, out);
  2581 g.addEdge(out, tId);
  2582 g.addEdge(out, bId); // extra vs spec
  ```
- **Should happen:** Match the spec edge list exactly.
- **Suggested fix:** Remove non-spec edges and ensure the clause gadget graph is precisely the one described in §8.2.

2. **Crown counterexample demo is mathematically wrong for the claimed behavior**
- **File:** [`index.html:2293-2323`](/home/user_rik/dev/projects/project/index.html:2293), [`index.html:1614-1631`](/home/user_rik/dev/projects/project/index.html:1614)
- **What’s wrong:** Natural ordering on the current Crown S6 setup yields 2 colors, not 4. This fails §9.2’s intended counterexample.
- **Spec target:** §9.2 requires showing greedy with bad ordering using more colors and contrasts with Welsh-Powell.
- **Should happen:** Deterministic bad order that provably inflates greedy color count.
- **Suggested fix:** Add an explicit "counterexample ordering" mode (`a1,b1,a2,b2,...`) and render side-by-side natural/bad vs Welsh-Powell as required.

3. **Reduction-size proof readout is inconsistent with actual built gadget cardinality**
- **File:** [`index.html:2566-2570`](/home/user_rik/dev/projects/project/index.html:2566), [`index.html:2588-2595`](/home/user_rik/dev/projects/project/index.html:2588)
- **What’s wrong:** Readout claims `|V| = 3 + 2n + 6m` while builder adds 4 clause-internal vertices per clause.
- **Spec target:** §8.2 polynomiality readout must correctly describe the construction actually shown.
- **Should happen:** Cardinality formulas and implementation agree.
- **Suggested fix:** Either change gadget to match claimed formula or update formulas to match built graph.

### P1 (user-visible wrong/incomplete behavior)

4. **Missing gadget case-analysis pop-over in NP reduction panel**
- **File:** NP tab UI and handlers (`index.html` around [`561-579`](/home/user_rik/dev/projects/project/index.html:561), [`2510+`](/home/user_rik/dev/projects/project/index.html:2510))
- **What’s wrong:** No click-to-inspect clause gadget truth-case analysis.
- **Spec target:** §8.2: *"tool should let the user click a gadget and see the case analysis in a pop-over."*
- **Suggested fix:** Add per-clause node hit targets + pop-over component with true/false case explanation.

5. **Forward/backward proof UX milestones required by spec are missing**
- **File:** [`index.html:2682-2778`](/home/user_rik/dev/projects/project/index.html:2682)
- **What’s wrong:** No final green banners; no per-clause pause/highlight flow.
- **Spec target:** §8.3 and §8.4 require staged clause explanation and end banners.
- **Suggested fix:** Add explicit step-by-step clause animation checkpoints and final verdict banner elements.

6. **Topbar step scrubber jump is missing**
- **File:** topbar + controls (`index.html:354`, step machine has `goTo` but no UI wiring)
- **What’s wrong:** Counter is not clickable scrubber despite spec requirement.
- **Spec target:** §12.1 step counter behavior.
- **Suggested fix:** Add `<input type="range">` scrubber tied to frame index and `StepMachine.goTo()`.

7. **Backtracking exactness can be silently truncated by operation caps**
- **File:** [`index.html:1281`](/home/user_rik/dev/projects/project/index.html:1281), [`2238`](/home/user_rik/dev/projects/project/index.html:2238), [`2272`](/home/user_rik/dev/projects/project/index.html:2272)
- **What’s wrong:** Cap can stop search before decision, violating "exact" expectation unless clearly signaled.
- **Spec target:** §6.2 exact backtracking framing.
- **Suggested fix:** Either remove caps for non-benchmark modes or surface cap-trigger as explicit "unknown/incomplete" outcome in UI.

### P2 (minor/cosmetic but still non-conformant)

8. **Pseudocode/explanation block not collapsible**
- **File:** panel structure in Playground/Algorithms (`index.html` around [`435-490`](/home/user_rik/dev/projects/project/index.html:435))
- **What’s wrong:** Missing collapsible behavior requested in layout skeleton.
- **Suggested fix:** Wrap in `<details>` with summary toggle or equivalent collapse control.

9. **Educational content required by §11.2 and §11.3 is mostly absent**
- **File:** overview content (`index.html:368-375`)
- **What’s wrong:** Worked examples and concept callouts are incomplete.
- **Suggested fix:** Add explicit worked-example section and required concept asides.

---

## 5. Things the spec is silent on

These are implementation choices that are not clearly specified as right/wrong:

- Added `Step Back` control and keyboard behavior beyond baseline spec.
- Added `reverse-degree` ordering option for greedy.
- Used `<select>` controls for verifier color assignment instead of radio-button groups.
- Applied operation caps in backtracking for responsiveness.
- Interpreted topbar `Reset All` as "reset active tab state" behavior.

---

## 6. Honest summary

This is **not** safe as a full-marks submission right now, and it is at risk on core grading weight because CLO-5 proof fidelity is compromised by the clause gadget mismatch. CLO-4 is mostly solid, but CLO-3 is also weakened because the crown counterexample does not demonstrate the claimed color inflation. The single highest-leverage fix is to correct the NP reduction gadget implementation and align proof UX (case analysis + forward/backward presentation) with §8. After that, fix the crown counterexample demo and side-by-side comparison in §9.2. Rough estimate to reach strong conformance/full-marks readiness: **~8–12 focused hours**.
