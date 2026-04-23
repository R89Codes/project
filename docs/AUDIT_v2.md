# Audit v2 — Post-Polish-Pass Report

**Scope:** Visual polish pass only (pulse animation, metric hierarchy, edge visibility, status pill
colors, empty-state hints). Logic, algorithms, reduction math, and spec proof content not touched.

**Date:** 2026-04-23  
**Auditor:** Claude Code (static analysis; browser verification marked ❓)

---

## 1. Polish-Pass Verification

| Change | Status | Evidence |
|---|---|---|
| Pulse animation 1.5s (`vertexPulse`) | ✅ | `:313-316` — `.vertex.current circle { animation: vertexPulse 1.5s ease-in-out infinite; }` |
| Metric label `--accent`, value `--text` | ✅ | `:235-243` — `.metric-label { color: var(--accent); }` / `.metric-value { color: var(--text); }` |
| Edge stroke `--text-dim` | ✅ | `:287` — `.edge { stroke: var(--text-dim); }` |
| Status pill: Running=blue, Done=green, Error=red, Building=accent-2 | ✅ | `:123-145` classes; `:2119-2145` `setStatus()` function |
| Growth Curve empty-state hint | ✅ | `:1974-1984` — `drawChart()` renders "Click Build & Run Both to begin" when series is empty |
| Renderer `data-empty-hint` support | ✅ | `:1179-1192` — `render()` reads `this.svg.dataset.emptyHint`; both algorithm SVGs have the attribute (`:623`, `:634`) |

### ⚠️ Spec-code drift: pulse animation differs from `ui_template.md §8.7`

The template specifies:
```css
.vertex.current circle { stroke: var(--accent-yellow); }
@keyframes vertexPulse {
  0%, 100% { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
  50%       { filter: drop-shadow(0 0 10px var(--accent-yellow)); }
}
```

The current code (`:313-332`):
```css
.vertex.current circle { stroke: var(--accent-2); }   /* orange, not yellow */
@keyframes vertexPulse {
  0%,100% { stroke-opacity: 0.65; transform: scale(1); }
  50%     { stroke-opacity: 1;    transform: scale(1.06); }
}
```

Two deviations: (a) `--accent-2` (orange `#f0883e`) instead of `--accent-yellow`; (b) `scale + stroke-opacity` instead of `filter: drop-shadow` glow. The `--accent-yellow` token does not exist in the current `:root` — the template's token set was never fully applied. The animation is present and functional; the visual character differs from what the template intends. P2 cosmetic drift; reconcile during the template rollout pass.

❓ Browser verification required: confirm the pulse is visible and not clipped by `overflow: hidden` on parent containers.

---

## 2. Algorithms Tab Rendering Bug — Root Cause

**Bug:** Both graph canvases appear empty after "Build & Run Both" is clicked, even though algorithms run to completion and metrics populate correctly.

**Root cause:** `StepMachine.build()` at line **1650** resets the working graph to a fresh clone of `this.baseGraph`:

```js
// StepMachine.build(), lines 1644–1658
build(buildFn) {
  ...
  this.graph = this.baseGraph.clone();  // ← positions reset here
  this.renderer.setGraph(this.graph);   // ← render() called with zeroed positions
  ...
}
```

`this.baseGraph` is set during `setGraph(inputGraph.clone())` (line 1631), **before** `setLayout("circle")` is called. All preset factory functions initialize vertices at `{x:0, y:0}` (e.g. `makeComplete` at line 1778). `setLayout("circle")` modifies `this.graph` in-place but never writes back to `this.baseGraph`.

**Click-handler sequence (lines 2466–2490):**
1. `greedyMachine.setGraph(inputGraph.clone())` → `baseGraph` gets un-positioned clone; `render()` runs (all vertices at x=0,y=0)
2. `greedyRenderer.setLayout("circle")` → circle positions applied to `machine.graph` (**not** `baseGraph`)
3. `greedyMachine.build(...)` → `this.graph = this.baseGraph.clone()` (x=0,y=0 again); `render()` called → all vertices overlap at origin

**Visual result:** In `viewBox="0 0 800 500"`, origin is the top-left corner. All overlapping vertex circles collapse to one nearly-invisible dot — effectively an empty canvas.

**Fix direction (not applied — diagnosis only):** Simplest fix: move both `setLayout("circle")` calls to **after** both `machine.build()` calls in the `alg-build-run` handler. Frame data stores vertex IDs and colors only (no positions), so post-build layout application is safe.

---

## 3. UI Template Rollout Status

Reference: `docs/ui_template.md §13` (14 acceptance checkboxes).

| # | Checkpoint | Status | Notes |
|---|---|---|---|
| 1 | Page header centered; radial gradient visible | 🟡 | Body has `radial-gradient(circle at top right, ...)` (`:38`); template specifies `1200px 800px at 20% 0%` with 3 color stops. Gradient present, wrong spec. |
| 2 | Lecture section: full-width, collapsible, Collapse/Expand toggle | ❌ | No `.intro-section`, `.intro-card`, or `.intro-body` elements. |
| 3 | Roadmap: 8 clickable links to sections | ❌ | No `.roadmap` or `#sec1`–`#sec8` anchors. |
| 4 | Lecture sections have colored numbered badges | ❌ | No `.sec-badge` elements. |
| 5 | At least one `.key-concept`, `.warning-box`, `.example-box`, `.check-box` | ❌ | None of these CSS classes defined or used. |
| 6 | Tabs between lecture and tool; active tab visually distinct | 🟡 | Tabs exist, active state styled (`:162-166`); uses old flat style, not template's glassmorphic tab. |
| 7 | Controls card: rounded corners, soft border, gradient background | 🟡 | `.controls` has `border-radius: 6px` (template: 14–18px) and opaque `--border` (template: `rgba(255,255,255,0.10)`). No gradient. |
| 8 | Buttons: distinct primary / secondary / danger styles | ❌ | No `.secondary` or `.danger` classes in markup or CSS. All buttons share one base style. |
| 9 | Stat pills: horizontal `label : bold value` format | ❌ | `.metric` uses stacked two-line format. Template requires `display:flex; justify-content:space-between`. |
| 10 | Phase bar changes border color per algorithm state | ❌ | No `.phase-bar` element. State shown only via topbar `.status` pill. |
| 11 | Pseudocode active line: yellow highlight | ❌ | `.line.active { background: var(--accent); }` (`:264`) — blue, not template's `rgba(255,209,102,0.28)` yellow. |
| 12 | Graph vertices pulse with yellow ring when `.current` | ✅ | Present. ⚠️ Ring color is orange (`--accent-2`), not yellow (see §1 drift). |
| 13 | Crown graph: no `[N]` suffix; sidebar shows sequence | 🟡 | No `[N]` in labels (stripped at `:1388`). Sequence shown as text in metric grid, not in the dedicated sidebar pill-wide format. |
| 14 | Narrow viewport: two-column wrap collapses to single column | ❓ | `.workspace { grid-template-columns: 320px 1fr; }` has no `@media` breakpoint. Requires browser verification. |

**Tally:** 1 done, 4 partial, 8 not started, 1 browser-only.

---

## 4. Correctness Regression Sanity Check

All four spot-checks pass. The visual polish pass introduced no correctness regressions.

### OR-gadget (6 vertices, 11 edges)

Code (lines 2935–2945) produces exactly the spec §8.2 edge list per clause:

| Code call | Spec label |
|---|---|
| `litIds[0]→vx`, `litIds[1]→vy`, `litIds[2]→vz` | `a—x`, `b—y`, `c—z` |
| `vx→vy`, `vx→vm`, `vy→vm` | left triangle `x—y`, `x—m`, `y—m` |
| `vm→vn`, `vn→vz`, `vn→vo`, `vz→vo` | right triangle `m—n`, `n—z`, `n—o`, `z—o` |
| `vo→fId` | palette anchor `o—F` |

6 internal vertices (x,y,z,m,n,o), 11 edges. ✅ Exact match.

### Polynomiality readout

Lines 2951–2958 compute `formulaV = 3 + 2*n + 6*m` and `formulaE = 3 + 3*n + 11*m`, and display both the formula expansion and actual `g.vertices.size` / `g.edges.size`. These will agree for any valid formula because the construction is exactly the one the formula describes. ✅

### Crown counterexample

`initDesignScaffold` (`:2539`) uses `makeCrown(8, { interleaved: true })`. Interleaved insertion: `a1(id=0), b1(id=1), a2(id=2), ...`

**Natural** ordering (sort by id → interleaved sequence a1,b1,a2,b2,a3,b3,a4,b4):  
a1→0, b1→0, a2→1 (b1=0 blocks), b2→1 (a1=0 blocks), a3→2, b3→2, a4→3, b4→3 → **4 colors** ✅

**Welsh-Powell** (sort by degree, all deg=3; tie-break by label numerically → a1,a2,a3,a4,b1,b2,b3,b4):  
a1→a4: all color 0 (no b's colored yet); b1→b4: all color 1 → **2 colors** ✅

### Case-analysis popover (8 rows)

`OR_GADGET_CASE_ANALYSIS` (`:2783-2798`): 8 entries — 1 all-false contradiction + 7 satisfying. All 7 satisfying rows match the `project_description.md §8.2` table exactly (x,y,z,m,n,o values cross-verified). Click handler (`:2996-3012`) is wired: finds clause by vertex id, calls `openClauseCasePopover`. ✅

❓ Browser verification required: confirm SVG vertex click events fire correctly on `<g class="vertex">` elements in the reduction graph.

---

## 5. New Findings

### P1 — Algorithms tab empty canvas (root cause identified, not fixed)

- **File:** `index.html:1650` (`StepMachine.build()`), triggered by `alg-build-run` handler at `:2466-2490`
- **What's wrong:** `build()` resets `this.graph = this.baseGraph.clone()`, discarding circle layout positions. All vertices render at {x:0, y:0}.
- **What should happen:** Vertices display in circle layout after build.
- **Fix:** Move the two `setLayout("circle")` calls (currently at `:2471-2472`) to after both `machine.build()` calls return.

### P1 — No responsive breakpoint for narrow viewports

- **File:** `index.html:177-181`
- **What's wrong:** `.workspace { grid-template-columns: 320px 1fr; }` has no `@media` rule. The 320px column will overflow or clip on screens narrower than ~700px.
- **What should happen:** `ui_template.md §8.1` requires `@media (max-width: 980px) { .wrap { grid-template-columns: 1fr; } }`.
- **Fix:** Add `@media (max-width: 980px) { .workspace { grid-template-columns: 1fr; } }` to the stylesheet.

### P2 — Pseudocode active-line uses blue highlight, not yellow

- **File:** `index.html:264-267`
- **What's wrong:** `.line.active { background: var(--accent); color: #071524; }` — blue.
- **What should happen:** Template §8.5: `rgba(255, 209, 102, 0.28)` yellow with `border-left: 4px solid rgba(255, 209, 102, 0.8)`.
- **Fix:** Part of the template rollout; update when applying the new token set.

### P2 — Pulse animation spec-code drift (detailed in §1)

- **File:** `index.html:313-332` vs `ui_template.md §8.7`
- `--accent-2` (orange) where template specifies `--accent-yellow`; `scale + stroke-opacity` keyframes instead of `filter: drop-shadow` glow.
- Reconcile during template rollout when `--accent-yellow` token is introduced.

---

## 6. Honest Summary

The polish pass is a **net positive**: all six targeted changes are present, correctly wired, and introduce no correctness regressions. The three previously-reported P0 bugs (OR-gadget construction, crown counterexample, polynomiality readout) are confirmed resolved. The case-analysis popover and forward/backward proof UX (P1 items CLAUDE.md marks resolved) are confirmed implemented.

The **highest-leverage next piece of work** is fixing the Algorithms tab empty-canvas bug — root cause is now known, fix is a two-line reorder in the click handler, and it directly impacts CLO-4's visual comparison story. Second priority: add the missing responsive breakpoint (one CSS rule, avoids the grader seeing a broken layout on a smaller monitor). Third: the full template rollout (8 of 14 checkboxes not started).

No findings should block other work except the Algorithms rendering bug, which makes CLO-4's primary demo non-functional in its current state.
