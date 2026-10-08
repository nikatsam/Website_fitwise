# T027 — Resolve audit findings and build sourced furniture guides

**Phase:** Content/QA
**Dependencies:** T026

## Objective

Correct the page/source issues found in the 2026-10-08 audit, add measured chair,
bed-frame, door-swing, drawer and monitor-depth examples from authoritative
sources, and preserve noindex status until the Search Console/SERP gate is met.

## Steps

- [x] Correct the Double-bed and Double-vs-Queen titles to identify the relevant markets and avoid presenting recommendations as minima.
- [x] Label the 24-inch foot-of-bed value as a FitWise assumption and retain source-backed side clearance separately.
- [x] Replace the inaccessible OSHA viewing-distance citation with accessible CCOHS guidance that does not claim a universal numeric distance.
- [x] Add a manufacturer-measured Aeron Size B chair example and explicitly leave movement/pull-back space user-specific.
- [x] Add UK MALM frame overhang, PAX/GRIMO 90-degree hinged-door sweep, HEMNES dresser drawer extension, and HEMNES bedside-table footprint examples.
- [x] Update monitor-depth guidance with M7 stand/body depth, CCOHS viewing context, and explicit cable/keyboard measurement limits.
- [x] Keep all new routes noindex, keep P038 and other draft room-size intents unbuilt, and leave the sitemap at four indexable URLs.
- [x] Record public SERP snapshots and the absence of Search Console query credentials; do not promote any page to indexable.
- [x] Run full validation, keyboard QA and representative mobile Lighthouse checks.
- [x] Record the owner's decision to keep GA4 active and track missing privacy/consent information as a future defect; do not claim compliance is resolved.
- [x] Commit, push, deploy through GitHub OIDC, and verify the live pages.

## Acceptance criteria

- [x] Every numeric example links to a measured manufacturer/source record or is explicitly labeled as a geometry/model assumption.
- [x] Chair movement and user-access zones have no invented universal minimum.
- [x] Furniture collision footprints are distinguished from standing/walking room allowances.
- [x] Noindex pages remain out of the sitemap and emit no canonical or breadcrumb JSON-LD.
- [x] `npm run verify` passes with 169 tests; the static build has 43 pages and the sitemap contains four canonical URLs.
- [x] Owner chose to keep GA4; the privacy/consent gap is explicitly recorded as a future defect. Live content, noindex behavior and sitemap were verified.

## Guardrails

- Do not consume Search Console credentials in client code or commit credentials. No GSC access is currently configured.
- Keep new furniture examples noindex until actual query evidence and a human SERP-gap review satisfy all release gates.
- Do not activate draft room-size pages or expand the sitemap for URL count alone.
- Do not claim the sample bed/wardrobe/chair examples are complete room plans or universal ergonomic/code minimums.
