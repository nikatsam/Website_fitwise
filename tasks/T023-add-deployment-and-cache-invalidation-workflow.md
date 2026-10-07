# T023 — Add deployment and cache invalidation workflow

**Phase:** AWS  
**Dependencies:** T022

## Objective

Complete this task without expanding scope into later tasks.

## Steps

- Create documented repeatable build/sync/deploy process.
- Set cache metadata for HTML vs hashed assets.
- Add minimal invalidation strategy.

## Acceptance criteria

- [x] Dry-run/local object and invalidation plan is documented and validated.
- [x] GitHub Actions production workflow repeats build, CloudFormation apply, cache-metadata sync groups, and calculated invalidation without file-by-file edits.

## Required close-out

- [x] Run relevant automated checks and complete one OIDC-backed production deployment.
- [x] Update `WORKLOG.md`.
- [x] Update `WORKLOG.json`.
- [x] Update `PROJECT_STATE.json`.
- [x] No architecture change required beyond ADR-011.
