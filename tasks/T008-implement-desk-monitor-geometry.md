# T008 — Implement desk/monitor geometry

**Phase:** Core logic  
**Dependencies:** T007

## Objective

Complete this task without expanding scope into later tasks.

## Steps

- Implement one/two-monitor total-width geometry.
- Support gaps, side margins and overall-width overrides.
- If angled monitors are implemented, test projected-width formula; otherwise explicitly defer angle control.
- Differentiate screen-only derived dimensions from sourced overall dimensions.

## Acceptance criteria

- [ ] Known fixtures produce expected widths and fit states.
- [ ] No claim treats diagonal size as exact overall width without provenance.

## Required close-out

- [ ] Run relevant automated checks.
- [ ] Update `WORKLOG.md`.
- [ ] Update `WORKLOG.json`.
- [ ] Update `PROJECT_STATE.json`.
- [ ] Record any architecture change in `DECISIONS.md`.
