# T005 — Implement build-time dataset validator

**Phase:** Data  
**Dependencies:** T004

## Objective

Complete this task without expanding scope into later tasks.

## Steps

- Create validation invoked by test/build pipeline.
- Validate IDs, sources, published page references, positive dimensions, derivations and duplicate routes.
- Produce actionable failure messages.

## Acceptance criteria

- [ ] Known invalid fixtures fail with clear reasons.
- [ ] Valid sample dataset passes.
- [ ] Production build calls validator before generating pages.

## Required close-out

- [ ] Run relevant automated checks.
- [ ] Update `WORKLOG.md`.
- [ ] Update `WORKLOG.json`.
- [ ] Update `PROJECT_STATE.json`.
- [ ] Record any architecture change in `DECISIONS.md`.
