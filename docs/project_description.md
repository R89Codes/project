# 3-Coloring Interactive Tool — Technical Specification

**Course:** BCS 309 Algorithms I — Final Project
**Student:** Rikhil Veneeth Nair
**Deadline:** April 30, 2026
**Deployment target:** GitHub Pages (single `index.html` at repo root)

---

## 0. How to use this document

This spec is the handoff from planning to implementation. Everything the grader looks for is mapped to a concrete UI region, data structure, or function. If a feature is not in here, it is not required. If it is in here, it is required.

**Hard constraints (non-negotiable):**

- **Single HTML file.** All HTML, CSS, and JS inline in `index.html`. No build step, no bundler, no external file imports.
- **No libraries or frameworks.** No React, Vue, Svelte, D3, Chart.js, jQuery, Bootstrap, Tailwind. Vanilla ES6+ only. SVG for all graphics. CSS custom properties for theming.
- **No `localStorage` / `sessionStorage` required** — state lives in memory. Persistence is not a requirement.
- **Must deploy to GitHub Pages.** That means it must work from `file://` as well (no CORS-required fetches, no dev-server assumptions).

**Target browsers:** Latest Chrome, Firefox, Safari, Edge. No IE.

---

## 1. Grading Map (what each CLO demands, what satisfies it)

| CLO | Marks | Brief requirement | Concrete deliverable in the tool |
|---|---|---|---|
| **CLO-5** | **20** | Prove 3-Coloring is NP-complete: in NP + reduction from 3-SAT (both directions + polynomial) | "NP-Completeness" tab: verifier widget, animated 3-SAT → 3-Coloring gadget builder, two-direction proof walkthrough, polynomiality readout |
| **CLO-4** | **10** | Brute-force + practical algorithm, visualise, compare | "Algorithms" tab: backtracking + greedy running on same graph, side-by-side mode, growth-curve chart, colours-used readout |
| **CLO-3** | **10** | Paradigm named + justified, approximation analysis, counterexamples | "Design" tab: paradigm panels, ordering selector, crown-graph counterexample explainer, Δ+1 bound statement |

**Total: 40 marks.** The NP-completeness tab is the largest build because CLO-5 is half the grade.

---

## 2. Global Architecture

### 2.1 File structure (inside the single `index.html`)

```
<!doctype html>
<html>
  <head>
    <meta>...
    <title>3-Coloring Playground</title>
    <style>/* ~600 lines: theme vars, layout, components */</style>
  </head>
  <body>
    <header class="topbar">...</header>
    <nav class="tabs">[Playground] [Algorithms] [Design] [NP-Completeness]</nav>
    <main class="tab-panels">
      <section id="tab-playground" class="panel active">...</section>
      <section id="tab-algorithms" class="panel">...</section>
      <section id="tab-design" class="panel">...</section>
      <section id="tab-np" class="panel">...</section>
    </main>
    <footer>...</footer>
    <script type="module">
      /* ~1500 lines:
         - Graph data model
         - SVG renderer
         - Algorithms (greedy, backtracking)
         - Step-machine (pre-built frame list)
         - Tab controllers
         - 3-SAT → 3-Coloring reducer
         - Verifier
         - Growth-curve chart
      */
    </script>
  </body>
</html>
```

Use a single `<script>` module (no inline event handlers in HTML). Keep the DOM query surface small — cache selectors once per tab controller.

### 2.2 Theme (CSS custom properties)

Must match the Kermani reference-tool aesthetic (dark, high-contrast, restrained accent).

```css
:root {
  --bg: #0f1419;
  --bg-elev: #161c23;
  --bg-panel: #1d242c;
  --border: #2a323c;
  --text: #e6edf3;
  --text-dim: #8b949e;
  --accent: #58a6ff;
  --accent-2: #f0883e;
  --success: #3fb950;
  --danger: #f85149;
  --warn: #d29922;

  /* The three colouring colours - tuned for colour-blind distinguishability */
  --color-1: #e5484d; /* red */
  --color-2: #30a46c; /* green */
  --color-3: #5b8def; /* blue */
  --color-4: #f0b72f; /* yellow - only shown to illustrate greedy failure */
  --color-unset: #3a4350;

  --radius: 6px;
  --mono: "SF Mono", "JetBrains Mono", Consolas, ui-monospace, monospace;
  --sans: -apple-system, "Inter", Segoe UI, Roboto, sans-serif;
}
```

### 2.3 Layout skeleton (every tab)

Two-column layout per the brief:

```
┌─────────────────────────────── topbar ───────────────────────────────┐
│ 3-Coloring Playground    [speed] [step: 12/47] [status: running]     │
├──────────────────────────────── tabs ─────────────────────────────────┤
│ [Playground] [Algorithms] [Design & Analysis] [NP-Completeness]      │
├──────────────┬────────────────────────────────────────────────────────┤
│              │                                                        │
│   CONTROLS   │                    VISUALIZATION                       │
│   (left,     │                    (right, flex-grow)                  │
│   ~320px)    │                                                        │
│              │                                                        │
│   presets    │   <svg viewBox> for the graph                         │
│   edit mode  │                                                        │
│   speed      │                                                        │
│   buttons    │                                                        │
│   counters   │                                                        │
│              │                                                        │
├──────────────┴────────────────────────────────────────────────────────┤
│                      PSEUDOCODE + EXPLANATION PANEL                   │
│                      (full width, collapsible)                        │
└───────────────────────────────────────────────────────────────────────┘
```

CSS Grid: `grid-template-columns: 320px 1fr;` for the main body; the pseudocode panel spans both.

---

## 3. Graph Data Model

Single source of truth for the whole app.

```js
// Vertex
{
  id: 0,              // integer, stable
  label: "v0",        // display label (or "x_1", "¬x_1" for reduction graphs)
  x: 340, y: 210,     // SVG coordinates (in viewBox units)
  color: null,        // null | 0 | 1 | 2 | 3  (3 = "4th colour", only for greedy-fail demos)
  fixed: false,       // if true, layout won't move it
  meta: {}            // reduction-specific (gadget: "palette"|"variable"|"clause", role: "T"|"F"|"B"|...)
}

// Edge (undirected; store each once, adjacency list derives both directions)
{
  id: "0-1",          // canonical: min-max
  u: 0, v: 1
}

// Graph
{
  vertices: Map<id, Vertex>,
  edges: Map<edgeId, Edge>,
  adj: Map<id, Set<id>>,  // adjacency list, kept in sync with edges
  nextId: number
}
```

**API surface on the graph object:**

```js
graph.addVertex({ x, y, label? }) -> id
graph.removeVertex(id)           // also removes incident edges
graph.addEdge(u, v)              // no-op if u==v or edge exists
graph.removeEdge(u, v)
graph.neighbors(id) -> Set<id>
graph.degree(id) -> number
graph.clone() -> Graph           // deep clone for sandboxing algorithm runs
graph.resetColors()              // sets every vertex.color to null
graph.toEdgeList() -> string     // for the text input
graph.fromEdgeList(str)          // parses "0-1, 1-2, 2-0" or newline-separated
```

**Keep `adj` and `edges` synchronised.** Every mutation path must update both. Write a `_validate()` debug helper that throws in dev.

---

## 4. SVG Renderer

One `<svg viewBox="0 0 800 500">` per tab that needs a graph. All coordinates are in viewBox units — never pixels.

```js
class GraphRenderer {
  constructor(svgElement, graph) {...}

  render()            // full re-render from graph state
  updateVertex(id)    // patch a single vertex (color change, position)
  flashEdge(u, v, cls) // briefly highlight an edge (conflict/inspection)
  setLayout(kind)     // "manual" | "circle" | "force" | "reduction"
  enableEditing(on)   // click-to-add-vertex, drag-to-add-edge
}
```

**Rendering order (z-order matters):**
1. Edges (as `<line>` or `<path>` for curved)
2. Vertices (as `<g>` containing `<circle>` + `<text>`)
3. Overlay annotations (current-vertex ring, frame counter)

**Transitions:** use CSS transitions on `fill` and `transform` (not SMIL). 150–250ms ease-out for colour changes, 300ms for position changes. Respect the speed slider by scaling the transition duration via a CSS variable:

```css
:root { --tx-speed: 200ms; }
circle.vertex { transition: fill var(--tx-speed) ease-out; }
```

**Interaction modes:**

- **View mode:** no editing.
- **Edit mode (Playground tab only):**
  - Click empty canvas → add vertex at click coords.
  - Click vertex → select. Shift+click another vertex → add edge between them.
  - Right-click vertex → delete.
  - Drag vertex → reposition (updates `x, y`).

**Layouts:**

- `manual` — use whatever coords are in the graph (for user-drawn graphs).
- `circle` — evenly spaced on a circle; used for presets like K4, Petersen.
- `reduction` — hand-coded structured layout for 3-SAT reduction graphs (see §8.2).
- `force` — optional nice-to-have; simple Fruchterman-Reingold, max 200 iters. Only used for "randomise" button.

---

## 5. Step Machine (the heart of "Build Steps / Step / Play / Pause / Reset")

The brief's exact button set is **Build Steps / Step / Play / Pause / Reset**. Interpret as:

- **Build Steps** — run the algorithm on the current graph in a sandboxed clone, record every state change into a `frames` array. Does not animate.
- **Step** — advance by one frame, apply it to the live graph, update UI.
- **Play** — advance frames on a timer; interval derived from speed slider.
- **Pause** — stop the timer (current frame index preserved).
- **Reset** — clear colours, rewind to frame 0, stop timer.

### 5.1 Frame schema

```js
{
  t: 5,                    // frame index
  kind: "set-color" | "unset-color" | "check-edge" | "conflict"
       | "enter-recursion" | "exit-recursion" | "pseudocode-line"
       | "counter-inc" | "status" | "note",
  payload: { ... },        // depends on kind
  pseudoLine: 7,           // which pseudocode line is active during this frame
  explanation: "Trying color 1 on v3 (neighbors use {0,2}).",
  counters: {              // snapshot AFTER this frame applies
    verticesColored: 4,
    backtracks: 1,
    edgesChecked: 18,
    colorsUsed: 3
  }
}
```

The UI state at any frame `t` is a pure function of `frames[0..t]` applied in order to a fresh graph clone. This makes stepping backward free (just replay from 0 to t-1).

### 5.2 Controller

```js
class StepMachine {
  constructor(graph, renderer, ui) {
    this.frames = [];
    this.t = 0;
    this.timer = null;
  }

  build(algorithmFn) {
    // Runs algorithm on a clone, recording frames via an emit() callback
    const clone = this.graph.clone();
    const emit = (frame) => this.frames.push(frame);
    algorithmFn(clone, emit);
  }

  step() {
    if (this.t >= this.frames.length) return;
    this.applyFrame(this.frames[this.t]);
    this.t++;
    this.ui.syncFrame(this.frames[this.t - 1]);
  }

  play()   { this.timer = setInterval(() => this.step(), this.frameDelay()); }
  pause()  { clearInterval(this.timer); this.timer = null; }
  reset()  { this.pause(); this.t = 0; this.graph.resetColors(); this.renderer.render(); }
  goTo(t)  { this.reset(); while (this.t < t) this.step(); } // for scrubber

  frameDelay() { return 800 - this.ui.speed * 75; } // speed slider 1..10 → 725ms..50ms
}
```

### 5.3 Algorithm contract (emit callbacks)

Every algorithm is written as a generator-style function that takes `(graph, emit)` and emits frames. No algorithm touches the DOM. No algorithm reads the clock. This is what makes them testable.

---

## 6. Algorithms

### 6.1 Greedy coloring

**Pseudocode (render verbatim in the Algorithms tab):**

```
GREEDY-COLOR(G, order):
1.   for each v in V(G):
2.       v.color ← null
3.   for each v in order:                      // iterate in chosen order
4.       used ← {}
5.       for each u in Neighbors(v):
6.           if u.color != null:
7.               used ← used ∪ {u.color}
8.       c ← smallest non-negative integer not in used
9.       v.color ← c
10.  return max(v.color for v in V) + 1       // number of colours used
```

**Orderings to expose in the UI:**

- `natural` — insertion order (what the user typed / preset default).
- `welsh-powell` — sort by degree descending. (This is the one that tends to do well.)
- `random` — Fisher–Yates shuffle.

**Emit contract:**

```js
function greedyColor(g, emit, order) {
  emit({ kind: "pseudocode-line", pseudoLine: 1, explanation: "Reset colors" });
  for (const v of g.vertices.values()) v.color = null;

  const sequence = orderVertices(g, order);
  emit({ kind: "note", explanation: `Order: ${sequence.map(x => x.label).join(", ")}` });

  let colorsUsed = 0;
  for (const v of sequence) {
    emit({ kind: "pseudocode-line", pseudoLine: 3, payload: { vertex: v.id },
           explanation: `Considering ${v.label}` });

    const used = new Set();
    for (const uId of g.adj.get(v.id)) {
      emit({ kind: "check-edge", payload: { u: v.id, v: uId }, pseudoLine: 5 });
      const u = g.vertices.get(uId);
      if (u.color !== null) used.add(u.color);
    }

    let c = 0; while (used.has(c)) c++;
    v.color = c;
    colorsUsed = Math.max(colorsUsed, c + 1);
    emit({ kind: "set-color", payload: { vertex: v.id, color: c }, pseudoLine: 9,
           explanation: `Assign color ${c} (neighbors use {${[...used].join(",")}})`,
           counters: { colorsUsed } });
  }
}
```

**Complexity:** O(V + E) — state this explicitly in the Design tab.
**Approximation:** uses at most **Δ+1** colours (Δ = max degree). Tight for complete graphs and odd cycles.

### 6.2 Backtracking (exact) coloring

Parameterised by `k` (number of colours allowed). For 3-coloring, `k = 3`. For chromatic number, call with `k = 1, 2, 3, ...` until success.

**Pseudocode:**

```
BACKTRACK-COLOR(G, k):
1.   if COLOR-VERTEX(G, 0, k): return true
2.   return false

COLOR-VERTEX(G, i, k):
3.   if i = |V|: return true                   // all vertices colored
4.   for c in 0..k-1:
5.       if SAFE(G, i, c):
6.           G.vertices[i].color ← c
7.           if COLOR-VERTEX(G, i+1, k): return true
8.           G.vertices[i].color ← null        // backtrack
9.   return false

SAFE(G, i, c):
10.  for each u in Neighbors(vertices[i]):
11.     if u.color = c: return false
12.  return true
```

**Emit contract highlights:**

- Emit `enter-recursion` / `exit-recursion` with the current recursion depth so the UI can draw a breadcrumb stack.
- Emit `set-color` on line 6 and `unset-color` on line 8 (so Reset/Step back works frame-by-frame).
- Emit `check-edge` inside SAFE so the user sees which edges are being tested.

**Complexity:** O(k^V · E) worst case — state this and note it's why we need the heuristic.

**Testing matrix (must pass before recording):**

| Graph | Expected χ | Expected 3-color answer |
|---|---|---|
| K3 (triangle) | 3 | YES |
| K4 | 4 | NO |
| Petersen | 3 | YES |
| C5 (5-cycle) | 3 | YES |
| C6 (6-cycle) | 2 | YES |
| Bipartite K_{3,3} | 2 | YES |
| Crown graph S8 (8 vertices) | 2 | YES, with interleaved natural order `a1,b1,a2,b2,a3,b3,a4,b4` greedy uses 4; Welsh-Powell uses 2 |
| Reduction graph from `(x ∨ y ∨ z) ∧ (¬x ∨ ¬y ∨ z)` | 3 | YES iff SAT |

Hard-code these as presets.

### 6.3 Running both side-by-side (Algorithms tab)

Two `GraphRenderer` + `StepMachine` pairs sharing the **same input graph clone** but **independent frame arrays**. A "Build & Run Both" button calls `build()` on both, then a master play controller drives both `step()` calls in lockstep.

Display below the two canvases:

```
                 Greedy (Welsh-Powell)    Backtracking
Colors used              3                      3
Operations          37                     412
Wall time           0.8 ms                 11.3 ms
```

Wall time measured via `performance.now()` on the actual build, not on the animation.

---

## 7. Growth-Curve Chart (no Chart.js — hand-drawn SVG)

A second `<svg viewBox="0 0 600 300">` in the Algorithms tab.

**Data generation:** when the user clicks "Benchmark", run both algorithms on random graphs of sizes `n ∈ {4, 6, 8, 10, 12, 14, 16}` (cap at 16 for brute-force), measure operations (the emit count is a good proxy), and plot two series.

**Chart implementation sketch:**

```js
function drawChart(svg, series) {
  // series = [{ label, points: [{x, y}], color }]
  const W = 600, H = 300, pad = { l: 50, r: 20, t: 20, b: 40 };
  const xs = series.flatMap(s => s.points.map(p => p.x));
  const ys = series.flatMap(s => s.points.map(p => p.y));
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMax = Math.max(...ys);
  const sx = x => pad.l + (x - xMin) / (xMax - xMin) * (W - pad.l - pad.r);
  const sy = y => H - pad.b - y / yMax * (H - pad.t - pad.b);

  // Draw axes (two <line>), ticks, labels (<text>), and one <polyline> per series.
  // Use y-axis log scale if yMax / yMin > 100.
}
```

Log-scale is important — brute-force operations grow exponentially while greedy stays linear; a linear y-axis will make greedy look like a flat line at zero.

---

## 8. NP-Completeness Tab (the biggest feature — 20 of 40 marks)

Four sub-panels, each in its own `<section>`. User scrolls through them or uses an in-tab sub-nav.

### 8.1 Panel A — "3-Coloring is in NP"

**UI:** an editable graph on the left, a colour-assignment panel on the right, a "Verify" button.

**Interaction:** user picks a colour for each vertex (three radio buttons per vertex). Pressing Verify runs this:

```
VERIFY(G, coloring):
  for each edge (u, v) in E:
    animate: highlight edge
    if coloring[u] == coloring[v]:
      return REJECT with edge (u,v) as witness
  return ACCEPT
```

Show the running edge check in animation. Display the final verdict with a badge. Display `|E|` operations and the time. Narrate in the explanation panel: *"A certificate is an assignment c: V → {0,1,2}. Verification iterates the edges once in O(|V|+|E|). Therefore 3-Coloring ∈ NP."*

### 8.2 Panel B — 3-SAT → 3-Coloring reduction, built live

**UI:** a text input on the left ("Enter a 3-CNF formula"), a "Build Graph" button, and an SVG canvas on the right that **animates the construction**.

**Parser:** accept formulas like `(x1 v x2 v -x3) ^ (-x1 v x2 v x3)`. Characters: `v` or `∨` for OR, `^` or `∧` for AND, `-` or `¬` for negation, `()` for clauses. Variables are `x1, x2, ...` or single letters. Build a small parser combinator — maybe 50 lines.

**Construction (animate in this order):**

**Stage 1 — Palette triangle.** Three vertices `T`, `F`, `B` (True, False, Base) fully connected. This fixes the three colours. In any valid 3-colouring, these three get distinct colours; name them after the vertex they're assigned to.

```
     T
    / \
   F---B
```

Place at top of canvas. Label clearly. Pause with explanation: *"Any 3-colouring must give T, F, B three distinct colours — this pins down what 'True' and 'False' mean in the rest of the graph."*

**Stage 2 — Variable gadgets.** For each variable `x_i`, add two vertices `x_i` and `¬x_i`. Connect them to each other AND both to `B`.

```
     B
    / \
   x_i ¬x_i
    \___/
```

The triangle `{x_i, ¬x_i, B}` forces `x_i` and `¬x_i` to take the two non-B colours — i.e., T and F, in some order. That order encodes the truth assignment.

Lay variable gadgets in a horizontal row below the palette, spacing `120px` apart.

**Stage 3 — Clause gadgets (OR-gadget).** Use one clause gadget per clause `(a ∨ b ∨ c)` with **six internal vertices**:

`x, y, z, m, n, o`

where `a, b, c` are the literal vertices that already exist from Stage 2.

ASCII sketch (matches the exact edge list below):

```
      a         b         c
      |         |         |
      x---------y         z
       \\       /         |\\
        \\     /          | \\
          m-------------n---o
                              |
                              F
```

Exact edge list for one clause:

- Literal-to-gadget edges: `a — x`, `b — y`, `c — z`
- Left triangle / merge: `x — y`, `x — m`, `y — m`
- Right triangle / merge: `m — n`, `n — z`, `n — o`, `z — o`
- Palette anchor: `o — F`

So each clause contributes exactly **6 new vertices** and **11 new edges**.

Correctness claim (short case analysis):

- In any valid colouring, literals `a, b, c` are in `{T, F}` (from Stage 2 variable gadgets).
- `x, y, m` form a triangle, so they must use three distinct colours.
- `n, z, o` form a triangle, and `o` is adjacent to `F`, so `o ≠ F`.

`(⇒)` If `a=b=c=F`, no extension exists:

1. Since `x` is adjacent to `a=F` and `y` is adjacent to `b=F`, we get `x,y ∈ {T,B}`.
2. Because `x,y,m` is a triangle, `m` must be the third colour, i.e. `m=F`.
3. Since `z` is adjacent to `c=F`, `z ≠ F`, so `z ∈ {T,B}`.
4. In triangle `n,z,o` with `o ≠ F`, the only way to use all three colours is `n=F`.
5. But edge `m — n` then forces `F ≠ F`, contradiction.

So when all three literals are `F`, the clause gadget is not 3-colourable.

`(⇐)` If at least one of `a,b,c` is `T`, an extension exists:

A concrete valid extension for each of the seven satisfying literal patterns is:

| `a,b,c` | `x` | `y` | `z` | `m` | `n` | `o` |
|---|---|---|---|---|---|---|
| `T,T,T` | `F` | `B` | `F` | `T` | `B` | `T` |
| `T,T,F` | `F` | `B` | `T` | `T` | `F` | `B` |
| `T,F,T` | `F` | `T` | `F` | `B` | `T` | `B` |
| `T,F,F` | `F` | `T` | `T` | `B` | `F` | `B` |
| `F,T,T` | `T` | `F` | `F` | `B` | `T` | `B` |
| `F,T,F` | `T` | `F` | `T` | `B` | `F` | `B` |
| `F,F,T` | `T` | `B` | `F` | `F` | `T` | `B` |

Each row satisfies all gadget edges, so every satisfying clause assignment extends to a valid 3-colouring of the gadget.

Therefore this gadget is 3-colourable **iff at least one of `a,b,c` is coloured `T`**.

Lay clause gadgets in a row below the variable gadgets.

**Stage 4 — Polynomiality readout.** Below the canvas, a live readout:

```
Formula: 3 variables, 2 clauses
Graph:   |V| = 3 + 2(3) + 6(2) = 21 vertices
         |E| = 3 + 3(3) + 11(2) = 34 edges
Construction: O(n + m)    ✓ polynomial
```

### 8.3 Panel C — Forward direction (φ satisfiable ⇒ graph 3-colourable)

**UI:** once panel B has built a graph, this panel takes a satisfying assignment (either user-provided or auto-found for small formulas via backtracking on SAT) and **colours the graph step by step**:

1. Colour palette: `T` → red, `F` → green, `B` → blue.
2. For each variable `x_i`: if `x_i = true` in the assignment, colour `x_i` as red, `¬x_i` as green (and vice versa).
3. For each clause: run the OR-gadget case analysis animation showing a valid colouring of the internal vertices.

Pause after each clause with explanation. End with green "ACCEPT" banner.

### 8.4 Panel D — Backward direction (graph 3-colourable ⇒ φ satisfiable)

**UI:** takes a 3-colouring of the constructed graph (computed via backtracking on the graph) and **reads off the assignment**:

1. Rename colours: whichever colour `T` has = "True", `F` has = "False", `B` has = "Base".
2. For each variable `x_i`: if `x_i` is coloured True, assignment is `x_i = true`, else `x_i = false`.
3. For each clause: highlight the literal(s) coloured True, showing the clause is satisfied.

End with the reconstructed assignment printed and a green "Formula satisfied" banner.

### 8.5 What I must be able to say on camera (Q&A prep)

The tool is not a substitute for understanding. Prepare to narrate, from memory:

- Why the palette triangle forces distinct colours (triangle = K3, must use 3 colours).
- Why the variable gadget forces `x_i ≠ ¬x_i ≠ B` (another triangle).
- Why the OR-gadget fails if all three literals are False (exhaustive case analysis).
- Why the construction is polynomial (size bounds above).

---

## 9. Design & Analysis Tab (CLO-3 — 10 marks)

Three widgets.

### 9.1 Paradigm panel

Two sibling cards:

**Card 1 — Backtracking (Exact).**
- Paradigm: **Backtracking with constraint propagation** (the constraint is "same colour as neighbour").
- When to use: small `n`, or when exact answer required.
- Complexity: `O(k^V · E)` worst case.
- Pruning: only tries colours not already used by a coloured neighbour (line 5 of pseudocode — not a full backtrack over all k choices).

**Card 2 — Greedy (Heuristic).**
- Paradigm: **Greedy with a fixed vertex ordering.**
- When to use: large graphs where approximate answer is acceptable.
- Complexity: `O(V + E)`.
- Approximation guarantee: at most `Δ+1` colours, where Δ = max degree. Tight for `K_{Δ+1}` and odd cycles.
- **Important caveat:** there is no known constant-factor polynomial-time approximation for the chromatic number `χ(G)` in general graphs (unless P = NP). State this on screen.

### 9.2 "Why can greedy use more than 3 colours on a 3-colourable graph?" — crown-graph explainer

Hard-code the 8-vertex crown graph `S_8`:

```
Vertices: a1, a2, a3, a4, b1, b2, b3, b4
Edges: a_i — b_j for all i ≠ j with i,j ∈ {1,2,3,4} (each side has 4 vertices)
```

This is bipartite (χ = 2, so obviously 3-colourable). But with ordering `a1, b1, a2, b2, a3, b3, a4, b4`, greedy assigns:
```
a1 → 0, b1 → 1, a2 → 1 (b1 is neighbor),
b2 → 2 (a1, a3 are not yet colored; a1 has 0), wait — re-derive carefully
```

**TODO for implementation:** actually produce an ordering that makes greedy use 4 colours on this graph. Standard textbook example: crown graph with specific ordering produces `n/2` colours. Verify empirically when building.

Display side-by-side:
- Left: greedy with natural ordering → uses 4 colours.
- Right: greedy with Welsh-Powell ordering → uses 2 colours.
- Below: explanation of why ordering matters, with the insight that **finding the optimal ordering is itself NP-hard** (otherwise we'd have a polytime chromatic number algorithm).

### 9.3 Ordering selector (interactive)

Dropdown: `natural | welsh-powell | random | reverse-degree`. Re-runs greedy on the current graph and updates the colour count. Also shows the full ordering in the "Order sequence" readout under the visualization.

---

## 10. Presets (seed the Playground tab)

Load via a dropdown or button row. Implementation: each preset is just a function returning a new `Graph`.

```js
const PRESETS = {
  "K4": () => makeComplete(4),                          // not 3-colourable
  "K3": () => makeComplete(3),                          // minimal 3-colourable
  "Petersen": () => makePetersen(),                     // classic, χ = 3
  "Bipartite K3,3": () => makeBipartite(3, 3),         // χ = 2
  "C5": () => makeCycle(5),                             // χ = 3
  "Crown S8": () => makeCrown(8),                       // CLO-3 counterexample
  "Map (USA-like)": () => makePlanar(),                 // 4-colourable, maybe not 3
  "Reduction example": () => reduce3SAT("(x1 v x2 v -x3) ^ (-x1 v x2 v x3)")
};
```

Put the specific graph builders (Petersen, Crown, etc.) near the top of the JS for easy reference during the Q&A. They double as test fixtures.

---

## 11. Educational Content

### 11.1 Collapsible overview (Playground tab, top)

A `<details>` element defaulting open on first visit. Contents:

- One-sentence problem statement.
- 2-coloring is polynomial (bipartiteness via BFS) — 3-coloring is NP-complete. The *threshold* is at 3.
- Applications: register allocation, exam scheduling, frequency assignment, map colouring (four-colour theorem for planar, but 3-colouring for planar is still NP-complete).
- Reference: *CLRS Ch. 34*.

### 11.2 Worked examples (in overview)

- **K4 is not 3-colourable.** Proof: 4 pairwise-adjacent vertices need 4 distinct colours.
- **Petersen is 3-colourable.** Show a valid 3-colouring.
- **Odd cycles require 3 colours; even cycles 2.** Tie to bipartiteness.

### 11.3 Key-concept boxes

Distinct styled `<aside class="concept">` callouts throughout the tabs:

- **Chromatic number χ(G):** the minimum number of colours needed.
- **Bipartiteness = 2-colouring.** In polynomial time.
- **Decision vs. optimisation:** 3-COLOR is the decision version of colouring. The optimisation version (find χ) is at least as hard.
- **Certificate:** a colouring assignment.
- **Gadget:** a subgraph that encodes a logical constraint.

---

## 12. UI Details (controls, counters, status)

### 12.1 Top bar (persistent across tabs)

```
[≡ 3-Coloring]   Speed: [1——●——10]   Step: 12/47   Status: ● Running   [Reset All]
```

- Speed slider: 1–10 integer.
- Step counter: current frame / total frames. Clicking opens a scrubber (range input) to jump.
- Status: one of `Idle`, `Building…`, `Running`, `Paused`, `Done`, `Conflict (K4 detected)`.
- Reset All: wipes frames and colours in the active tab.

### 12.2 Button states

Buttons disable themselves when invalid:

- **Build Steps:** enabled when graph is non-empty; disabled while running.
- **Step:** enabled when frames exist and `t < frames.length`.
- **Play:** enabled when frames exist and not already playing.
- **Pause:** enabled only when playing.
- **Reset:** always enabled.

### 12.3 Pseudocode panel

```html
<pre class="pseudocode">
<code data-line="1" class="line">GREEDY-COLOR(G, order):</code>
<code data-line="2" class="line">    for each v in V(G):</code>
<code data-line="3" class="line active">        v.color ← null</code>
...
</pre>
```

Apply `.active` to the `<code>` whose `data-line` matches the current frame's `pseudoLine`. CSS: `.active { background: var(--accent); color: var(--bg); }`.

### 12.4 Explanation box

Below pseudocode. Updates every step with the current frame's `explanation` string, plus a concrete-values table:

```
Current vertex: v3 (degree 2)
Neighbors: {v1:red, v2:green}
Used colors: {0, 1}
Next color: 2 (blue)
```

### 12.5 Counters panel

```
Vertices colored:  4 / 10
Edges checked:     18
Backtracks:        1
Colors used:       3
```

---

## 13. Accessibility & Polish

- All SVG elements need `aria-label` or `<title>` children.
- Colourblind-safe palette (the red-green-blue above was chosen for Deuteranopia distinguishability, but also add a **pattern mode** toggle that swaps solid fills for striped/dotted/solid patterns).
- Keyboard: Space = play/pause, → = step, ← = step back, R = reset.
- Focus rings on all interactive elements.
- `prefers-reduced-motion: reduce` → disable CSS transitions, snap to end state.

---

## 14. Build & Deployment Plan

**Deadline: April 30, 2026.** Five incremental passes; deploy after pass 2.

| Pass | Deliverable | Est. time |
|---|---|---|
| 1 | Scaffold: single HTML, dark theme, tab nav, graph data model, SVG renderer with circle layout | 4h |
| 2 | Backtracking + greedy algorithms, Step machine, Playground tab working end-to-end. **Deploy to GitHub Pages here.** | 6h |
| 3 | Pseudocode panels + line highlighting, counters, Algorithms tab with split view, growth-curve chart | 5h |
| 4 | NP-Completeness tab: verifier + 3-SAT parser + animated reduction builder + both directions | 8h |
| 5 | Polish: presets, crown counterexample, educational content, accessibility, keyboard shortcuts, QA across browsers | 4h |

**Total: ~27 hours of focused work.**

### Risk mitigations

- **3-SAT reduction layout is hard.** Mitigation: hand-code the layout (fixed coordinates per gadget type), do not rely on a force-directed solver. Animate colour changes only.
- **Brute-force chokes on n > 16.** Mitigation: cap input size at 16 vertices in the benchmark, surface the cap in the UI with a tooltip explaining why.
- **Single-file bloat.** Mitigation: keep helper functions lean, strip comments before deploying, consider minifying the CSS only (keep JS readable for grader inspection).
- **Forgetting a rubric item.** Mitigation: §1 table is the master checklist; review before recording.

---

## 15. Submission Checklist (missing any = ZERO)

Per the brief:

| # | Deliverable | How to produce |
|---|---|---|
| 1 | GitHub Pages link | Public repo, single `index.html` at root. Settings → Pages → Deploy from main → / (root). Test in incognito. |
| 2 | HTML file | Upload the same `index.html` to the LMS. Keep a copy named with student ID. |
| 3 | Teams recording (.mp4) | Teams meeting → **Start recording AND Start transcription** (both required). Screen-share the *tool*, not slides alone. Download .mp4 from OneDrive. |
| 4 | Transcript (.vtt or .docx) | Auto-generated *only if transcription was enabled during recording*. Download separately — distinct from the mp4. |

**Academic integrity:** AI tool use is explicitly permitted by the brief, but the Q&A is a live check. I must defend every algorithmic and proof decision myself. Rehearse the NP-completeness proof on a blank whiteboard.

---

## 16. Lesson Plan (Secondary — for the recording)

20–30 minute Teams session:

- **Part 1 — Hook & problem (2 min).** Map colouring / exam scheduling motivation; formal definition.
- **Part 2 — NP-completeness proof (6 min).** NP-Completeness tab: verifier demo, then drive the reduction animation clause-by-clause while narrating both directions.
- **Part 3 — Tool demo (7 min).** Playground → backtracking on K4 → greedy on the crown graph → split-screen on a reduced 3-SAT instance.
- **Part 4 — Algorithm design (6 min).** Design tab: paradigm names, ordering effect, Δ+1 bound, trade-offs.
- **Part 5 — Recap & Q&A prep (2 min).** One-screen summary; verbally re-state key proof points.

Supporting material: one-page slide deck as reveal backup, written script aligned to the tabs, at least one practice run with Teams recording enabled so the final take is fluent.

---

## 17. Out of Scope

To avoid scope creep — things explicitly **not** required:

- Saving graphs to disk / loading from file upload (no persistence).
- Multi-user collaboration.
- Import from DIMACS or other graph formats (edge-list text input is enough).
- WebGL / 3D rendering.
- Server-side SAT solver (just use backtracking client-side for small formulas).
- Mobile touch support beyond what's automatic (desktop primary).
- Internationalisation (English only).

---

## 18. Quick reference for Claude Code

When implementing:

1. **Start with the graph model and renderer** (§3, §4). Everything else depends on them.
2. **Then the step machine** (§5). Get it working with a dummy algorithm that just colours vertices one at a time.
3. **Then greedy, then backtracking** (§6). Keep the emit-based contract strict.
4. **Deploy now** — even if it's bare, get the GitHub Pages link live.
5. **Then the reduction** (§8) — this is the long pole, don't leave it for the end.
6. **Pseudocode highlighting and counters** can be added in parallel with algorithm work.
7. **Benchmark chart** (§7) last — it's valuable but a nice-to-have if time is tight.

When in doubt, cross-reference §1 (the grading map). Every feature in this spec exists to earn a specific rubric mark.
