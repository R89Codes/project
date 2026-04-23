# UI Template — 3-Coloring Tool

This is the visual and structural template the tool must follow. Source of inspiration: the `String Matching — Naive & KMP` reference lecture tool (BSD 404, Dr. Arash Kermani). The reference is the house style for this course and what the grader is used to seeing.

**Use this file alongside `project_description.md`.** The project description tells you what the tool *does*; this file tells you what it *looks like*.

---

## 1. The three shifts from the current implementation

1. **Lecture-first layout.** The first thing on the page is a full-width collapsible lecture section with a numbered learning roadmap. The interactive tool sits *below* the lecture, not beside it. Currently the tool is top-aligned; move it down.
2. **Glassmorphic dark theme with a radial gradient background.** The current flat `#0f1419` background looks dead. Replace with a radial gradient and glass-style cards with soft borders, rounded corners, and layered backgrounds.
3. **Semantic callout boxes throughout.** Use color-tinted boxes (key concept / warning / example) instead of plain paragraphs. The reference tool uses these heavily and they're what makes the lecture feel alive.

Keep everything else from `project_description.md` (single file, no libraries, four tabs, CLO mapping). This is a styling pass, not a rewrite.

---

## 2. Design tokens (replace the current `:root` block entirely)

```css
:root {
  /* Base */
  --bg: #0b1020;
  --panel: rgba(255, 255, 255, 0.05);
  --stroke: rgba(255, 255, 255, 0.12);
  --text: #e8ecff;
  --muted: #b7c0ff;

  /* Accents (use for callouts, badges, status pills) */
  --accent-blue: #6aa9ff;
  --accent-yellow: #ffd166;
  --accent-green: #64f0c8;
  --accent-red: #ff5c7a;
  --accent-purple: #c77dff;

  /* The three coloring colors (must be visually distinct on dark bg) */
  --color-1: #ff5c7a;   /* red   -> "T" */
  --color-2: #64f0c8;   /* green -> "F" */
  --color-3: #6aa9ff;   /* blue  -> "B" */
  --color-4: #ffd166;   /* yellow — only shown when greedy uses >3 colors */
  --color-unset: rgba(255, 255, 255, 0.10);

  /* Utility */
  --radius: 14px;
  --radius-lg: 18px;
  --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --sans: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;

  /* Animation speed (scaled by speed slider) */
  --tx-speed: 200ms;
}
```

## 3. Body & background

```css
body {
  margin: 0;
  font-family: var(--sans);
  color: var(--text);
  min-height: 100vh;
  background: radial-gradient(
    1200px 800px at 20% 0%,
    #14204a 0%,
    var(--bg) 45%,
    #070a14 100%
  );
}
```

This one rule does more visual work than any other in the file. Do not skip it.

## 4. Typography hierarchy

```css
h1 {
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  margin: 18px 0 4px;
  letter-spacing: -0.3px;
}
.subtitle {
  text-align: center;
  font-size: 12px;
  color: var(--muted);
  margin: 0 0 14px;
}
```

Page header pattern:

```html
<h1>3-Coloring — Greedy & Backtracking</h1>
<p class="subtitle">BCS 309 — Algorithms I | Dr. Arash Kermani | Interactive Lecture Tool</p>
```

## 5. Card component (use for every panel)

```css
.card {
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.06),
    rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}
.card h2 {
  margin: 0;
  padding: 14px 14px 10px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
```

Every panel in the tool — controls, visualization, pseudocode, stats — is a `.card`. No plain divs for container regions.

---

## 6. Lecture section (the big new piece)

This is the full-width section that sits at the top of the page, below the header and above the tabs.

### 6.1 Structure

```html
<div class="intro-section">
  <div class="intro-card">
    <div class="intro-header" id="introToggleBtn">
      <h2>Lecture Notes — Start Here</h2>
      <button class="intro-toggle" id="introToggleText">Collapse</button>
    </div>
    <div class="intro-body" id="introBody">
      <!-- Learning Roadmap -->
      <!-- Section 1 … Section N -->
    </div>
  </div>
</div>
```

### 6.2 Lecture styling

```css
.intro-section {
  max-width: 1280px;
  margin: 0 auto 14px;
  padding: 0 14px;
}
.intro-card {
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.06),
    rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}
.intro-header {
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.intro-header h2 { margin: 0; font-size: 16px; }
.intro-toggle {
  background: rgba(106, 169, 255, 0.14);
  border: 1px solid rgba(106, 169, 255, 0.25);
  color: var(--accent-blue);
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  width: auto;
}
.intro-body {
  padding: 18px 20px;
  line-height: 1.7;
  font-size: 13px;
  overflow: hidden;
  max-height: 8000px;
  transition: max-height 0.4s ease, padding 0.4s ease;
}
.intro-body.collapsed {
  max-height: 0 !important;
  padding-top: 0;
  padding-bottom: 0;
}
.intro-body h3 {
  font-size: 15px;
  color: var(--accent-blue);
  margin: 18px 0 6px;
  font-weight: 700;
}
.intro-body h3:first-child { margin-top: 0; }
.intro-body p { margin: 0 0 12px; color: var(--text); }
```

### 6.3 Learning Roadmap (navigation grid at top of lecture body)

```html
<div class="roadmap">
  <div class="roadmap-title">Learning Roadmap</div>
  <div class="roadmap-grid">
    <a href="#sec1" class="roadmap-item" data-accent="blue">
      <b>1.</b> What is Graph Coloring?
    </a>
    <a href="#sec2" class="roadmap-item" data-accent="yellow">
      <b>2.</b> The 3-Coloring Problem
    </a>
    <a href="#sec3" class="roadmap-item" data-accent="red">
      <b>3.</b> Why It's Hard — NP-Completeness
    </a>
    <a href="#sec4" class="roadmap-item" data-accent="purple">
      <b>4.</b> Reduction from 3-SAT
    </a>
    <a href="#sec5" class="roadmap-item" data-accent="green">
      <b>5.</b> Exact Algorithm — Backtracking
    </a>
    <a href="#sec6" class="roadmap-item" data-accent="blue">
      <b>6.</b> Practical Algorithm — Greedy
    </a>
    <a href="#sec7" class="roadmap-item" data-accent="yellow">
      <b>7.</b> When Greedy Fails — Crown Graph
    </a>
    <a href="#sec8" class="roadmap-item" data-accent="green">
      <b>8.</b> Interactive Tool — Try It Yourself
    </a>
  </div>
</div>
```

```css
.roadmap {
  background: linear-gradient(135deg,
    rgba(106, 169, 255, 0.08),
    rgba(199, 125, 255, 0.06));
  border: 1px solid rgba(106, 169, 255, 0.18);
  border-radius: var(--radius);
  padding: 16px 20px;
  margin-bottom: 18px;
}
.roadmap-title {
  font-weight: 800;
  font-size: 14px;
  color: var(--accent-blue);
  margin-bottom: 10px;
}
.roadmap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
  font-size: 12px;
}
.roadmap-item {
  text-decoration: none;
  color: var(--text);
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: border-color 0.15s;
}
.roadmap-item:hover { border-color: rgba(255, 255, 255, 0.25); }
.roadmap-item[data-accent="blue"] b   { color: var(--accent-blue); }
.roadmap-item[data-accent="yellow"] b { color: var(--accent-yellow); }
.roadmap-item[data-accent="red"] b    { color: var(--accent-red); }
.roadmap-item[data-accent="green"] b  { color: var(--accent-green); }
.roadmap-item[data-accent="purple"] b { color: var(--accent-purple); }
```

### 6.4 Numbered section headers

Each lecture section starts with a colored circular badge matching the roadmap color:

```html
<h3 id="sec1" class="lecture-h3">
  <span class="sec-badge" data-accent="blue">1</span>
  What is Graph Coloring?
</h3>
```

```css
.lecture-h3 {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sec-badge {
  color: var(--bg);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  flex-shrink: 0;
}
.sec-badge[data-accent="blue"]   { background: var(--accent-blue); }
.sec-badge[data-accent="yellow"] { background: var(--accent-yellow); }
.sec-badge[data-accent="red"]    { background: var(--accent-red); }
.sec-badge[data-accent="green"]  { background: var(--accent-green); }
.sec-badge[data-accent="purple"] { background: var(--accent-purple); }
```

### 6.5 Semantic callout boxes (use these generously in the lecture body)

Four variants — key concept, warning, example, check-understanding. Use them instead of plain paragraphs for anything worth drawing attention to.

```css
.key-concept {
  border-radius: var(--radius);
  border: 1px solid rgba(100, 240, 200, 0.15);
  background: rgba(100, 240, 200, 0.04);
  padding: 14px 16px;
  margin: 12px 0;
  font-size: 12.5px;
  line-height: 1.65;
}
.key-concept .kc-title {
  font-weight: 700;
  color: var(--accent-green);
  margin-bottom: 4px;
  font-size: 13px;
}

.warning-box {
  border-radius: var(--radius);
  border: 1px solid rgba(255, 92, 122, 0.15);
  background: rgba(255, 92, 122, 0.04);
  padding: 14px 16px;
  margin: 12px 0;
  font-size: 12.5px;
  line-height: 1.65;
}
.warning-box .wb-title {
  font-weight: 700;
  color: var(--accent-red);
  margin-bottom: 4px;
  font-size: 13px;
}

.example-box {
  border-radius: var(--radius);
  border: 1px solid rgba(106, 169, 255, 0.15);
  background: rgba(106, 169, 255, 0.04);
  padding: 14px 16px;
  margin: 12px 0;
  font-size: 12.5px;
  line-height: 1.65;
}
.example-box .eb-title {
  font-weight: 700;
  color: var(--accent-blue);
  margin-bottom: 4px;
  font-size: 13px;
}

.check-box {
  background: rgba(106, 169, 255, 0.06);
  border-radius: 10px;
  padding: 10px 14px;
  margin: 12px 0;
  font-size: 12px;
  color: var(--muted);
  border: 1px dashed rgba(106, 169, 255, 0.2);
}
.check-box b { color: var(--accent-blue); }
```

Usage:

```html
<div class="key-concept">
  <div class="kc-title">Key Idea</div>
  A graph is 3-colorable iff its chromatic number χ(G) ≤ 3. The decision
  problem "is χ(G) ≤ 3?" is NP-complete, while "is χ(G) ≤ 2?" (bipartiteness)
  is solvable in polynomial time. The hardness threshold is exactly at 3.
</div>

<div class="example-box">
  <div class="eb-title">Worked Example</div>
  K₄ (complete graph on 4 vertices) is not 3-colorable — four pairwise-adjacent
  vertices need four distinct colors. The Petersen graph, however, is
  3-colorable despite being non-planar.
</div>

<div class="warning-box">
  <div class="wb-title">Common Mistake</div>
  Greedy coloring does not always find the minimum number of colors.
  On the crown graph S₈, greedy with natural ordering uses 4 colors even
  though χ = 2. The order in which you process vertices matters.
</div>

<div class="check-box">
  <b>Check your understanding:</b> The complete graph K₅ requires how many
  colors? Why? (Answer: 5 — every pair of vertices is adjacent.)
</div>
```

### 6.6 Inline math & code block styling

```css
.math-inline {
  display: inline-block;
  padding: 1px 7px;
  background: rgba(106, 169, 255, 0.08);
  border-radius: 5px;
  font-family: var(--mono);
  font-size: 13px;
  color: var(--accent-blue);
}
.code-block {
  display: block;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  font-family: var(--mono);
  font-size: 12.5px;
  color: var(--accent-blue);
  margin: 8px 0;
  line-height: 1.7;
  white-space: pre-wrap;
}
```

Example usage in lecture body:

```html
Given an undirected graph <span class="math-inline">G = (V, E)</span>,
decide whether there exists a coloring <span class="math-inline">c : V → {0, 1, 2}</span>
such that <span class="math-inline">c(u) ≠ c(v)</span> for every edge
<span class="math-inline">(u, v) ∈ E</span>.

<div class="code-block">GREEDY-COLOR(G, order):
  for each v in order:
    used = { c(u) : u ∈ Neighbors(v), c(u) ≠ null }
    c(v) = smallest non-negative integer not in used</div>
```

---

## 7. Lecture content — what to write in each of the 8 sections

Keep each section 2–5 short paragraphs with at least one callout box. The lecture should take a student ~10 minutes to read.

1. **What is Graph Coloring?** — definition, real-world applications (register allocation, exam scheduling, map coloring), an example-box with a small graph.
2. **The 3-Coloring Problem** — formal decision problem statement, contrast with 2-coloring (bipartiteness, polynomial) and 4-coloring (planar graphs, famous theorem), a key-concept box about the hardness threshold.
3. **Why It's Hard — NP-Completeness** — plain-English NP definition, what a certificate is for 3-coloring, why verification is fast but solving seems hard. Warning-box about the P vs NP open problem.
4. **Reduction from 3-SAT** — explain what a reduction is, preview the three gadget types (palette / variable / clause). Point forward to the NP-Completeness tab for the interactive version. Example-box with a tiny formula and its corresponding graph shape.
5. **Exact Algorithm — Backtracking** — recursive idea, pseudocode in a code-block, complexity. Key-concept box about pruning via the SAFE check.
6. **Practical Algorithm — Greedy** — greedy pseudocode, complexity, Δ+1 bound. Key-concept box about approximation.
7. **When Greedy Fails — Crown Graph** — the crown S₈ counterexample, why ordering matters. Warning-box about no known constant-factor approximation for χ.
8. **Interactive Tool — Try It Yourself** — a short paragraph telling the student to scroll down and use the tool. A numbered list of suggestions: *"Try Playground → K4 → Run backtracking → observe it reports NO."*, etc. This section is a bridge into the tool below.

---

## 8. Interactive tool below the lecture

Keep the existing four-tab structure from `project_description.md`. Apply the visual template below.

### 8.1 Two-column wrap

```css
.wrap {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 14px 18px;
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 14px;
}
@media (max-width: 980px) {
  .wrap { grid-template-columns: 1fr; }
}
```

Left column (420px): controls card, stats card, status pills.
Right column (flex-grow): visualization card, pseudocode card, explanation card.

### 8.2 Controls styling (replace current flat buttons/selects)

```css
.controls { padding: 12px 14px 14px; }
label {
  display: block;
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 6px;
}
select, input[type="text"], input[type="range"], button {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.20);
  color: var(--text);
  padding: 10px 12px;
  outline: none;
  font-size: 13px;
}
input[type="text"] {
  font-family: var(--mono);
  font-size: 14px;
  letter-spacing: 1px;
}
button {
  cursor: pointer;
  font-weight: 650;
  background: rgba(106, 169, 255, 0.14);
  transition: transform 0.08s ease, background 0.12s ease;
}
button:hover { background: rgba(106, 169, 255, 0.22); }
button:active { transform: scale(0.99); }
button.secondary { background: rgba(255, 255, 255, 0.08); }
button.secondary:hover { background: rgba(255, 255, 255, 0.13); }
button.danger { background: rgba(255, 92, 122, 0.18); }
button.danger:hover { background: rgba(255, 92, 122, 0.26); }

.row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.btnRow { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 10px; }
@media (max-width: 980px) { .btnRow { grid-template-columns: repeat(3, 1fr); } }
```

Button row for the 5 algorithm controls:

```html
<div class="btnRow">
  <button id="build">Build Steps</button>
  <button id="step" class="secondary">Step</button>
  <button id="play">Play</button>
  <button id="pause" class="secondary">Pause</button>
  <button id="reset" class="danger">Reset</button>
</div>
```

### 8.3 Stat pills (replace the current boxed numbers)

```css
.stat {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.10);
}
.pill {
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(0, 0, 0, 0.18);
  padding: 10px 12px;
  font-size: 12px;
  color: var(--muted);
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.pill b {
  color: var(--text);
  font-weight: 750;
}
.pill.wide { grid-column: 1 / -1; }
```

Usage:

```html
<div class="stat">
  <div class="pill"><span>Colors used</span> <b id="stat-colors">—</b></div>
  <div class="pill"><span>Operations</span> <b id="stat-ops">—</b></div>
  <div class="pill"><span>Edges checked</span> <b id="stat-edges">—</b></div>
  <div class="pill"><span>Wall time</span> <b id="stat-time">—</b></div>
</div>
```

### 8.4 Phase bar (replaces static "Status: Running" text)

Colored banner above the visualization that changes border color based on algorithm phase:

```css
.phase-bar {
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(0, 0, 0, 0.22);
  padding: 10px 14px;
  font-size: 12px;
  color: var(--muted);
  line-height: 1.6;
  transition: border-color 0.3s;
}
.phase-bar .phaseTitle {
  font-weight: 800;
  font-size: 13px;
  margin-bottom: 2px;
}
.phase-bar.phase-idle    { border-color: rgba(255, 255, 255, 0.10); }
.phase-bar.phase-running { border-color: rgba(106, 169, 255, 0.35); }
.phase-bar.phase-running .phaseTitle { color: var(--accent-blue); }
.phase-bar.phase-done    { border-color: rgba(100, 240, 200, 0.35); }
.phase-bar.phase-done .phaseTitle { color: var(--accent-green); }
.phase-bar.phase-error   { border-color: rgba(255, 92, 122, 0.35); }
.phase-bar.phase-error .phaseTitle { color: var(--accent-red); }
```

### 8.5 Pseudocode panel (replace current plain `<pre>`)

```css
.mono {
  font-family: var(--mono);
  font-size: 12px;
  color: rgba(232, 236, 255, 0.95);
  line-height: 1.45;
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: var(--radius);
  padding: 12px;
  overflow: auto;
  max-height: 720px;
}
.codeLine {
  padding: 2px 6px;
  border-radius: 6px;
  white-space: pre;
  transition: background 0.15s, border-left 0.15s, box-shadow 0.15s;
}
.codeLine.active {
  background: rgba(255, 209, 102, 0.28);
  border-left: 4px solid rgba(255, 209, 102, 0.8);
  box-shadow: inset 0 0 0 9999px rgba(255, 209, 102, 0.05);
}
.codeHelp {
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(0, 0, 0, 0.18);
  padding: 10px 12px;
  font-size: 12.5px;
  color: var(--muted);
  min-height: 44px;
  line-height: 1.55;
  transition: background 200ms ease;
}
.codeHelp b { color: var(--text); }
.codeHelp.highlight-explain {
  background: rgba(255, 209, 102, 0.08);
  border-color: rgba(255, 209, 102, 0.22);
}
```

### 8.6 Visualization card padding

```css
.viz {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: var(--muted);
  align-items: center;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
  border: 1px solid rgba(255, 255, 255, 0.18);
}
```

Legend above the SVG:

```html
<div class="legend">
  <span><span class="dot" style="background: var(--color-1)"></span>Color 1 (T)</span>
  <span><span class="dot" style="background: var(--color-2)"></span>Color 2 (F)</span>
  <span><span class="dot" style="background: var(--color-3)"></span>Color 3 (B)</span>
  <span><span class="dot" style="background: var(--color-4)"></span>Color 4 (greedy overflow)</span>
</div>
```

### 8.7 SVG vertex styling

```css
.vertex circle {
  stroke: rgba(255, 255, 255, 0.25);
  stroke-width: 2;
  transition: fill var(--tx-speed) ease-out;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}
.vertex.current circle {
  stroke: var(--accent-yellow);
  stroke-width: 3;
  animation: vertexPulse 1.5s ease-in-out infinite;
}
.vertex text {
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 700;
  fill: var(--text);
  pointer-events: none;
  user-select: none;
}
.edge {
  stroke: rgba(255, 255, 255, 0.25);
  stroke-width: 2;
  transition: stroke 0.15s;
}
.edge.conflict {
  stroke: var(--accent-red);
  stroke-width: 3;
  animation: edgeShake 0.3s ease;
}
@keyframes vertexPulse {
  0%, 100% { filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3)); }
  50%      { filter: drop-shadow(0 0 10px var(--accent-yellow)); }
}
@keyframes edgeShake {
  0%, 100% { transform: translateX(0); }
  25%      { transform: translateX(-2px); }
  75%      { transform: translateX(2px); }
}
```

The `vertex.current` pulse is what makes the animation feel alive — this is the single biggest visual-liveness win.

### 8.8 Crown graph label fix (relevant to the open P2)

Drop the `[N]` ordering index from inside the circle. The order sequence panel on the left already shows `a1 → b1 → a2 → …` in order; the in-circle index is redundant *and* causes the label overlap issue. Vertex labels become just `a1`, `b1`, etc.

```html
<!-- Before: -->
<text>a1 [1]</text>
<!-- After: -->
<text>a1</text>
```

Update the Ordering selector sidebar to display the numbered sequence clearly:

```html
<div class="pill wide">
  <span>Order sequence</span>
  <b>a1 → b1 → a2 → b2 → a3 → b3 → a4 → b4</b>
</div>
```

Also update `project_description.md` §9.3 to remove the "numbered badge on each vertex" sentence, since we're replacing that with the sidebar list.

---

## 9. Tab navigation (the four tabs sit directly above the `.wrap`)

```css
.tabs {
  max-width: 1280px;
  margin: 0 auto 14px;
  padding: 0 14px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.tab {
  padding: 10px 18px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.10);
  color: var(--muted);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s;
}
.tab:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text);
}
.tab.active {
  background: rgba(106, 169, 255, 0.14);
  border-color: rgba(106, 169, 255, 0.35);
  color: var(--accent-blue);
}
```

---

## 10. Full page order (top to bottom)

```
┌─────────────────────────────────────────────────┐
│ <h1> + <subtitle>                               │
├─────────────────────────────────────────────────┤
│                                                 │
│ Lecture Notes — Start Here      [Collapse]     │
│ ┌─────────────────────────────────────────────┐ │
│ │ Learning Roadmap (8 numbered nav links)     │ │
│ │ Section 1 (blue badge)                      │ │
│ │ Section 2 (yellow badge)                    │ │
│ │ ...                                         │ │
│ │ Section 8 (green badge) — Interactive Tool  │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ [Playground] [Algorithms] [Design] [NP-Comp]    │
├──────────┬──────────────────────────────────────┤
│          │                                      │
│ Controls │  Visualization (.card)               │
│ (.card)  │                                      │
│          │                                      │
│ Stats    │  Pseudocode + Explanation (.card)    │
│ pills    │                                      │
│          │  Growth Curve (Algorithms tab only)  │
│ Phase    │                                      │
│ bar      │                                      │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

On narrow viewports (<980px), the two columns collapse to stacked. Nothing else changes.

---

## 11. What this template does NOT change

- The graph data model, step machine, algorithms, reduction construction — untouched.
- The four tabs and their responsibilities — untouched.
- The CLO mapping — untouched.
- Keyboard shortcuts, accessibility, colorblind pattern mode — untouched.
- The tech constraints (single file, no libraries) — reinforced, not weakened.

---

## 12. Implementation order (hand this to Claude Code)

1. Replace `:root` tokens and `body` background.
2. Add the lecture section HTML + CSS at the top of the body.
3. Write the 8 lecture section contents with their callout boxes.
4. Restyle the four-tab nav.
5. Restyle the control panel (buttons, selects, stat pills, phase bar).
6. Restyle the pseudocode and explanation panels.
7. Restyle the SVG vertex/edge rules, including the `.current` pulse.
8. Fix the crown graph labels (remove `[N]`).
9. Verify nothing in the tool's *logic* broke by re-running the manual test checklist from the post-audit browser session.

Each step is a separate commit. If something breaks, bisect.

---

## 13. Acceptance check (before moving on)

Open the tool and confirm:

- [ ] Page header is centered, radial gradient visible behind it.
- [ ] Lecture section is full-width, collapsible, with a Collapse/Expand toggle that works.
- [ ] Roadmap has 8 clickable links, each jumping to its section.
- [ ] Each lecture section has a colored numbered badge matching its roadmap color.
- [ ] At least one key-concept, warning-box, example-box, and check-box appears in the lecture.
- [ ] Tabs sit between the lecture and the tool, with the active tab visually distinct.
- [ ] Controls card has rounded corners, soft border, gradient background.
- [ ] Algorithm control buttons have distinct styles (primary / secondary / danger).
- [ ] Stat pills are horizontal `<label>: <bold value>` format.
- [ ] Phase bar changes border color between idle / running / done.
- [ ] Pseudocode lines have a yellow highlight when active.
- [ ] Graph vertices have a yellow pulsing ring when marked `.current`.
- [ ] Crown graph labels no longer overlap — the `[N]` is gone, the sidebar shows the sequence instead.
- [ ] On a narrow viewport, the two-column wrap collapses to one column cleanly.

If all 14 check. If not, the template was implemented incompletely — don't paper over it, revisit whichever step is missing.
