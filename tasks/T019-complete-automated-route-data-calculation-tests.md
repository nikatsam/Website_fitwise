# T019 — Complete automated route/data/calculation tests

**Phase:** QA  
**Dependencies:** T012, T013, T018

## Objective

Complete this task without expanding scope into later tasks.

## Steps

- Implement the comprehensive static SEO gate suite from `specs/SEO_AUTOMATED_GATES.md` as part of `npm run verify` (mandatory despite the existing shorter task name).

- Expand test coverage to all calculation boundaries and representative generated pages.
- Add regression fixtures for discovered defects.
- Add smoke tests for homepage, hubs, dedicated pages, 404, sitemap and robots.

## Acceptance criteria

- [x] Full automated suite passes from clean install (`npm ci`: 389 packages installed, 0 vulnerabilities; `npm run verify` passes).
- [x] Failures exit non-zero.

## Required close-out

- [x] Run relevant automated checks (`npm run verify`: 130 tests, build, data, SEO, link, and route smoke checks pass).
- [x] Update `WORKLOG.md` with completion and verification.
- [x] Update `WORKLOG.json` task status to DONE.
- [x] Update `PROJECT_STATE.json` and clear the resolved clean-install blocker.
- [x] No architecture change required; implementation hardens existing fit/geometry boundaries and static QA scripts.
