# 3-Coloring Interactive Tool — Project Context

> This file is auto-loaded by Claude Code at the start of every session in this repo.
> It's the shared context for the main agent and all subagents.
> Keep it short, concrete, and up-to-date.

## What this is

A single-file HTML interactive teaching tool for the Graph 3-Coloring problem, built as the final project for **BCS 309 Algorithms I** (Dr. Arash Kermani, Spring 2026). The tool demonstrates that 3-Coloring is NP-complete via a polynomial-time reduction from 3-SAT, and compares a brute-force backtracking solver against a greedy heuristic.

**Student:** Rikhil Veneeth Nair
**Deadline:** April 30, 2026
**Deployment:** GitHub Pages (single `index.html` at repo root)

## Authoritative documents (read in this order)

1. **`docs/project_description.md`** — the functional specification. What the tool does, data model, algorithms, reduction construction, CLO mapping. Source of truth for *what*.
2. **`docs/ui_template.md`** — the visual design spec. Design tokens, layout, components, acceptance checklist. Source of truth for *how it looks*.
3. **`docs/AUDIT.md`** — rolling audit log of bugs found and fixes applied. Source of truth for *bug history and regression prevention*.

If these three disagree, resolve the disagreement before writing code. Do not silently pick one.

## Hard constraints (non-negotiable)

- **Single HTML file.** All HTML, CSS, JS inline in `index.html`. No build step. No bundler.
- **No libraries or frameworks.** Vanilla ES6+ only. SVG for graphics. CSS custom properties for theming. Explicitly forbidden: React, Vue, D3, Chart.js, jQuery, Bootstrap, Tailwind.
- **Must work from `file://`.** No CORS-dependent fetches, no dev-server assumptions.
- **No `localStorage` / `sessionStorage`.** State lives in memory only.
- **Browser targets:** latest Chrome, Firefox, Safari, Edge. No IE.

## Grading structure

Total 40 marks across three Course Learning Outcomes:

| CLO | Marks | Responsibility |
|---|---|---|
| CLO-5 | 20 | NP-completeness proof (3-SAT reduction, both directions, polynomial) |
| CLO-4 | 10 | Brute-force + practical algorithm, visual comparison |
| CLO-3 | 10 | Paradigm identification, approximation analysis, counterexamples |

**CLO-5 is half the grade.** The NP-Completeness tab (the live 3-SAT → 3-Coloring reduction builder) is the highest-leverage feature. Prioritize accordingly.

## The four tabs

- **Playground** — graph editor and main visualizer (landing tab)
- **Algorithms** — backtracking vs greedy side-by-side, growth curve (carries CLO-4)
- **Design & Analysis** — paradigm justification, ordering selector, crown counterexample (carries CLO-3)
- **NP-Completeness** — verifier + animated reduction + forward/backward proof (carries CLO-5)

## Working rhythm (all agents follow this)

1. **One change at a time.** If a task implies multiple changes, do the first one, stop, report, wait for explicit approval before continuing.
2. **Stop and report after every fix.** Report format: what changed (file + line range), why (quote the spec section), how verified (test case walked), any spec ambiguity hit.
3. **Do not batch fixes.** "Continue" is a human-issued command, not a default.
4. **Manual browser verification is the final gate.** A fix is not "done" until the human has opened the tool in a browser and confirmed the visible behavior. Code review is not a substitute.
5. **If uncertain whether something works, say so.** Do not guess.

## Standing rule: no spec-code drift

If any code change causes `index.html` to differ from a description in `docs/project_description.md` or `docs/ui_template.md` (graph sizes, vertex counts, edge counts, labels, formulas, pseudocode, UI copy, colors), **update the spec in the same pass** and show the spec diff alongside the code diff.

The spec and the code must always describe the same artifact. Leaving them inconsistent is the single biggest failure mode in this project.

## Subagent scope (if invoking a specialist)

- **Main agent** — owns algorithms, data model, step machine, reduction construction, everything in `project_description.md` that isn't purely visual.
- **UI/UX agent** — owns CSS, layout, SVG styling, animations, accessibility, cross-tab visual consistency. Reads `ui_template.md` as authoritative. Does *not* modify algorithm logic or the graph data model.
- **Spec guardian** (if created) — read-only detector of spec-code drift. Reports mismatches with citations; does not fix them.

If a task is ambiguous (is this a logic bug or a visual bug?), the main agent handles it and delegates to UI/UX only when the issue is clearly presentational.

## What NOT to do

- Do not introduce new colors, fonts, animation speeds, or spacing values that aren't in the `:root` design tokens. If something new is genuinely needed, update the tokens and `ui_template.md` together.
- Do not edit the NP-completeness proof content without explicit permission. The math in `project_description.md` §8.2 has been verified manually; do not "improve" it.
- Do not remove or weaken the `prefers-reduced-motion` branch, keyboard shortcuts, or colorblind pattern mode.
- Do not add external network requests of any kind — no fonts, no CDNs, no telemetry.
- Do not add `localStorage` usage, even for "harmless" things like remembering tab state.
- Do not invent case analysis for the OR-gadget. The 8 truth-assignment rows are hard-coded from the spec.

## Current project state (update this section as the project evolves)

- Native installer Claude Code in use (not npm).
- All three P0 audit bugs resolved: OR-gadget construction, crown counterexample, polynomiality readout.
- P1 #5 (forward/backward proof UX) resolved.
- P1 #4 (case-analysis pop-over) resolved.
- Open: P1 #6 (step scrubber), P1 #7 (backtracking operation cap), P2 #8 (collapsible pseudocode), P2 #9 (educational content expansion).
- Open visual work: UI template rollout per `ui_template.md`.
- Known visual bug under investigation: Algorithms tab graph canvases render empty despite algorithms completing successfully.

## Submission checklist (critical — missing any = ZERO per the brief)

1. GitHub Pages link (public repo, `index.html` at root)
2. HTML file uploaded to LMS
3. Teams recording (.mp4) with screen-share of the tool, not slides alone
4. Auto-generated transcript (.vtt or .docx) — requires "Start transcription" to be clicked during recording, separate from the mp4

## Tone

Be direct. Flag problems plainly. "This looks fine" is not an acceptable final status — actively try to find what's wrong before signing off on anything. The grader will not be gentle; neither should the agents be with themselves.
