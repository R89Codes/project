# Audit — `docs/LECTURE_PLAN.md` (Run 2)

## What was fixed
1. Button-label drift fixed:
- `Build` -> `Build Steps`
- `Build Reduction` -> `Build Graph`

2. Formula notation normalized:
- Replaced `~` examples with parser-canonical `-`.
- Added explicit syntax note: `-` (NOT), `v` (OR), `^` (AND).

3. Demo-flow ambiguity fixed:
- Explicitly instructs setting `Algorithm = Backtracking (k=3)` before K4 unsat demos.
- NP forward note now states that assignment is auto-found if satisfiable.

## Requirement coverage check

### 1) 8-section outline mirroring reference structure
Status: ✅ Pass
Evidence: [`docs/LECTURE_PLAN.md:8-16`](/home/user_rik/dev/projects/project/docs/LECTURE_PLAN.md:8)

### 2) Per-section purpose + callouts + math/code + tool cross-reference
Status: ✅ Pass
Evidence: [`docs/LECTURE_PLAN.md:20-192`](/home/user_rik/dev/projects/project/docs/LECTURE_PLAN.md:20)

### 3) Adaptability note per section
Status: ✅ Pass
Evidence: [`docs/LECTURE_PLAN.md:35-36,56-57,77-78,99-100,120-121,141-142,163-164,188-189`](/home/user_rik/dev/projects/project/docs/LECTURE_PLAN.md:35)

### 4) Estimated length per section
Status: ✅ Pass
Evidence: [`docs/LECTURE_PLAN.md:38-39,59-60,80-81,102-103,123-124,144-145,166-167,191-192`](/home/user_rik/dev/projects/project/docs/LECTURE_PLAN.md:38)

## Second run-through: failure-mode checks

1. UI-copy alignment (tabs/buttons)
- Checked plan action verbs against current controls in `index.html`.
- Result: no mismatches found in current plan.

2. Preset-name alignment
- Checked `C5`, `K4`, `Petersen`, `Crown S8` against `PRESETS`.
- Result: all exist.

3. Formula parser compatibility
- Checked plan syntax against `parse3CNFFormula` normalization and token rules.
- Result: examples in plan are parser-valid.

4. Feature dependency coverage
- Clause popover, forward/backward banners, and verifier widget all exist in code paths referenced by plan.
- Result: references are implementable as written.

## Remaining risks (non-blocking)
1. If button labels are renamed during later UI implementation, lecture cross-references may drift again; re-run this audit after UI merge.
2. Section 4 depends on strict fidelity to `docs/project_description.md` §8.2 case analysis; any spec edits there require updating lecture copy.

## Verdict
Plan is internally consistent, implementation-ready, and aligned with current UI behavior.
