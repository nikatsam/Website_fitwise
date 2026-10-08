# T029 — Expand Workspace and Bedroom FitChecks

**Phase:** Product/QA
**Dependencies:** T028

## Objective

Give the existing planners more realistic, configurable fit constraints while
keeping sourced dimensions separate from user-selected assumptions.

## Steps

- [x] Support 1-4 monitors and common 16:9, 21:9 and 32:9 screen-panel estimates, with exact overall-width override.
- [x] Make desk depth an active check using stand depth, user-measured rear cable/vent space, and a user-selected keyboard/mouse zone.
- [x] Add mattress-only and named UK MALM frame presets; default UK bed planning to sourced frame dimensions.
- [x] Use measured nightstand width/depth and rotate the diagram and side/foot clearance axes consistently for landscape beds.
- [x] Add optional PAX/GRIMO door-sweep and HEMNES dresser drawer-pullout checks using measured gaps; do not infer walking clearance.
- [x] Update fit summaries to name all failed dimensions and retain accessible labels/errors.
- [x] Add geometry, preset, summary, diagram and keyboard-QA regression coverage.
- [x] Keep planner pages noindex and the sitemap at four URLs.
- [x] Run `npm run verify`, mobile keyboard QA and representative mobile Lighthouse audits; confirm dynamic result rows remain responsive.
- [x] Commit and push T029 changes (`623d8bd`).
- [x] Deploy through GitHub OIDC (run `37838761910`) and run live planner keyboard/HTTP smoke checks.

## Acceptance criteria

- [x] Desk depth now affects the planner result; monitor width and stand-depth assumptions are independent.
- [x] Bed-frame, nightstand, door-sweep and drawer-pullout dimensions are sourced; movement/access spaces remain explicit user choices.
- [x] Landscape orientation applies side clearance along the bed-width axis and foot clearance along the bed-length axis.
- [x] Dynamic summaries report all failed constraints; dynamic furniture rows appear/disappear with their toggles.
- [x] `npm run verify` passes with 189 tests and a 43-page build; keyboard QA and sampled mobile Lighthouse checks pass.
- [x] Noindex routes remain absent from the four-URL sitemap.
- [x] Production deployment and live checks complete; indexability and sitemap remain unchanged.

## Guardrails

- Do not present user-selected movement/cable/working zones as universal ergonomics or code minimums.
- Keep new planner routes noindex; Search Console query data and a human SERP review are not available for index promotion.
- Keep the GA4 privacy/consent issue documented as deferred by owner decision; do not claim it is resolved.
