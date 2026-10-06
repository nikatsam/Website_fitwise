# T020 — Run accessibility/performance/manual QA pass

**Phase:** QA  
**Dependencies:** T019

## Objective

Complete this task without expanding scope into later tasks.

## Steps

- Run accessibility checks and manual keyboard test.
- Review representative pages at mobile/desktop widths.
- Run production-preview performance audit where tooling permits.
- Fix critical/serious accessibility issues and obvious performance regressions.

## Acceptance criteria

- [x] QA findings and Lighthouse results documented in `QA_REPORT.md`.
- [x] Critical/serious accessibility issues resolved (contrast, heading order, status live region, form error associations).
- [x] Performance/accessibility targets met: all audited routes 100 for Performance and Accessibility. Intentional `noindex` landing routes have Lighthouse SEO 66 and this deviation is documented.

## Required close-out

- [x] Run relevant automated checks (`npm run verify`, Lighthouse mobile/desktop, headless Chrome keyboard QA).
- [x] Update `WORKLOG.md`.
- [x] Update `WORKLOG.json`.
- [x] Update `PROJECT_STATE.json`.
- [x] No architecture change required; existing publication and rendering architecture retained.
