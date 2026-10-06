# T015 — Populate verified seed workspace dataset

**Phase:** Content engine  
**Dependencies:** T005

## Objective

Complete this task without expanding scope into later tasks.

## Steps

- Add verified seed data for common monitor screen sizes, selected overall-size examples if sourced, standard desk widths, gaps/margins and clearance assumptions.
- Include provenance and derivation IDs.
- Populate workspace page intents from INITIAL_CONTENT_MAP.csv.

## Acceptance criteria

- [x] Validator passes.
- [x] Every critical measurement has source or derivation provenance.
- [x] No thin permutation explosion.

## Required close-out

- [x] Run relevant automated checks.
- [x] Update `WORKLOG.md`.
- [x] Update `WORKLOG.json`.
- [x] Update `PROJECT_STATE.json`.
- [x] No architecture change required; connected existing records and route components to the production dataset.
