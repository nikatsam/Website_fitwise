# T007 — Implement generic fit-state engine

**Phase:** Core logic  
**Dependencies:** T004, T006

## Objective

Complete this task without expanding scope into later tasks.

## Steps

- Implement fits/tight/does_not_fit semantics.
- Return structured diagnostics and margins.
- Separate hard footprint from recommended clearances.

## Acceptance criteria

- [ ] Hard fit + recommended fit => fits.
- [ ] Hard fit + failed recommendation => tight.
- [ ] Failed hard fit => does_not_fit.
- [ ] Equality and ±1 mm boundary tests pass.

## Required close-out

- [ ] Run relevant automated checks.
- [ ] Update `WORKLOG.md`.
- [ ] Update `WORKLOG.json`.
- [ ] Update `PROJECT_STATE.json`.
- [ ] Record any architecture change in `DECISIONS.md`.
