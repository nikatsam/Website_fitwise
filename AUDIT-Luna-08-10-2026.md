# Fitwise Full Audit — 08 October 2026

**Audit scope:** planner product behavior, global measurement support, content assumptions, SEO and sitemap pipeline, dependencies, build/route validation, accessibility smoke checks, and deployment boundary.

**Audit result:** The global calculator was deployed earlier. The two calculation/precision P0 fixes described in the 9 October follow-up below are now live. A further mobile/trust-navigation pass is locally verified and not yet deployed.

## Product and Calculations

- Added `/will-it-fit/`, a generic item-to-space review for furniture, appliances, equipment, boxes, and other rectangular objects. It accepts item width/depth/height, inside-space width/depth/height, a user-selected per-side planning margin, optional access-route measurements, quantity, and inter-item gap.
- The room calculation compares both axis-aligned floor orientations and selects the better fit. It checks height independently and returns individual required, recommended, available, and margin rows.
- Optional delivery-route checks compare upright narrow-face width and object height against a clear doorway, and narrow-face width against corridor width. The tool explicitly does not simulate turning, diagonal carry, tilting, stairs, thresholds, handles, packaging bulges, or irregular geometry.
- Quantity is an estimated maximum single-layer rectangular grid. It honors item gap and user-selected edge margin, tries both orientations, and returns zero when the object exceeds available height. Stacking, supports, access lanes, load limits, and obstacles are excluded.
- Added a copyable fit-review summary. The report includes metric and imperial values and identifies the result as a screening estimate.
- Bedroom planning now defaults to an editable, global custom mattress example (1600 × 2000 mm), not a US or UK preset. Room and furniture dimensions accept mm, cm, m, inches, or feet; market-specific and manufacturer-specific presets remain clearly identified as optional references.
- Home messaging now presents the global calculator first and makes the US/UK bedroom references secondary. The methodology page documents units, fit states, calculation limits, and the distinction between measured values and user assumptions.
- Fit and access results are dimensional screening only. They are not delivery guarantees, building-code interpretations, accessibility assessments, safety reviews, or ergonomic recommendations.

## Content and Data Review

- The P034 wardrobe example is described as a US-market IKEA PAX/GRIMO product-specific swing example to compare against the reader's actual measured bed/obstacle; it is not described as a matched bed/wardrobe set or a walking-aisle recommendation.
- The former Aeron Size B maximum-height issue is corrected in the source-backed data: 41.1 in is used, not 45.5 in. The manufacturer source record states its width, depth, and height ranges.
- Bedside-table, wardrobe, and dresser examples are no longer the default dimensions in the interactive bedroom planner. Generic editable placeholders are used; named IKEA items and US/UK mattress references remain only as explicit product/market examples.
- The 24-inch foot-clearance target remains a Fitwise modeling assumption. The source discusses space around each side; applying that figure at the foot is explicitly labeled extrapolation, not direct source guidance or a code minimum.
- Some older comparison/reference content remains intentionally US- or UK-specific because those product and mattress dimensions are market-specific. The general calculator accepts user-measured dimensions and does not assume those markets.

## SEO and Sitemap

- The site remains static Astro output. Sitemap generation is registry-driven from published, indexable SEO publication records; the homepage and three existing indexable content pages remain the four sitemap URLs.
- `/will-it-fit/` is an interactive utility page marked `noindex`; it has no canonical, hreflang, or Open Graph publication envelope and is not included in `sitemap.xml`. Route validation explicitly checks its built HTML and indexing directive.
- Strengthened `validate-seo.mjs`: every non-404 public HTML document must now have either an explicit `noindex` directive or a self-canonical. A built route without either signal is covered by a regression test.
- Strengthened sitemap output validation to require the sitemap XML declaration/root and complete `<url>` entries containing one `<loc>` and an optional `<lastmod>`, rejecting malformed or extra entry content. No third-party SEO or XML dependency was added; the generator emits a constrained sitemap schema.
- Existing sitemap checks still verify canonical host/path, duplicates, indexable canonical correspondence, date validity, URL/byte limits, and exclusion of noindex routes. `robots.txt` remains crawl-allowing and points to the apex sitemap URL.
- Search Console credentials/query data remain unavailable. No new page was promoted to indexable status, and the existing four-URL sitemap was deliberately retained.

## Dependencies and Release Pipeline

- `package.json` retains Astro as the runtime dependency; existing check, test, and SEO scripts remain development tooling. No new runtime or SEO package was needed.
- `npm audit --audit-level=moderate`: **0 vulnerabilities**. `npm audit --omit=dev --audit-level=moderate`: **0 vulnerabilities**.
- `npm run verify` remains the CI and production-deploy gate. The production workflow rebuilds and re-verifies the checked-out `main` branch and uploads the generated sitemap/robots outputs.
- `npm run infra:validate` passed offline for private S3/OAC/TLS and repository/environment-scoped GitHub OIDC configuration. No AWS APIs were called for this audit.
- The most recent GitHub workflow output recorded Node.js 20 action deprecation and an upcoming `ubuntu-latest` runner migration notice. These are maintenance warnings, not current build failures.

## Verification Evidence

- `npm run verify` passed: Astro typecheck (0 errors), ESLint, Prettier, 200 tests across 24 files, static build of 45 pages, SEO validation (4 sitemap URLs/4 canonical pages), internal-link validation (44 HTML routes/4 indexable URLs), route checks, content checks, and offline infrastructure validation.
- Dataset build validation: 0 errors and 0 warnings.
- `npm run qa:keyboard -- http://127.0.0.1:4322` passed in headless Chrome for `/workspace/`, `/bedroom/`, and `/will-it-fit/` at mobile widths, with an additional desktop bedroom-layout check. It covers skip-link focus, tab navigation, keyboard-operated controls, unit toggle, form validation, global unit-suffixed input conversion, optional route visibility, example notices, sticky-result synchronization, and mobile overflow.
- `npm audit --audit-level=moderate` returned no advisories.
- Generated `/will-it-fit/` output contains the expected form and `noindex`; the SEO validator confirmed four indexable canonicals and sitemap entries remain unchanged.

## Open Risks and Follow-Up

- The universal route model is intentionally axis-aligned and upright; consumers still need to measure the tightest points and reason about turns, stairs, lifting/tilting, packaging, and installation clearances.
- Quantity estimates are grid bounds, not packing optimizers. They do not model mixed object sizes, stacking, load ratings, or usable access paths.
- Search demand and index eligibility cannot be assessed without Search Console access and a human SERP review. Utility and draft routes should remain noindex until evidence supports a separate editorial release.
- GA4 remains active by owner decision. Privacy notice and consent handling are still an owner/compliance follow-up, not a resolved item or legal conclusion.
- `tseslint.config` emits a TypeScript deprecation hint in `eslint.config.js`; typecheck still reports zero errors and ESLint passes.
- Search demand and index eligibility cannot be assessed without Search Console access and a human SERP review. Utility and draft routes should remain noindex until evidence supports a separate editorial release.

## 9 October Follow-Up

- Fixed the dual-27 calculation disagreement across the workspace calculator, the 120/140 cm comparison, the dedicated two-27 page, the 140 cm layout matrix and the generated family page. All now use `buildWorkspaceConfigurationCheck`; derived screen-only widths are rounded consistently to the nearest millimetre before calculation.
- The shared dual-27 model is 1,216 mm physical width and 1,292 mm recommended width. The 120 cm desk has −16 mm physical and −92 mm recommended margin; the 140 cm desk has +184 mm physical and +108 mm recommended margin. The comparison now shows signed margins rather than an absolute shortfall.
- Added the canonical `formatMeasurement()` API and routed public dimension rendering through it. Regression cases cover `1930.3999999999999 → 1930.4 mm`, `1215.999999999 → 1216 mm`, and `3047.999999999 → 3048 mm`.
- The route validator now asserts the same 121.6 cm physical and 129.2 cm recommended outputs across five generated pages and rejects floating-point artifacts in the cited bedroom routes.
- Changes were committed as `06043e2` and deployed by workflow `37982399345`. Live checks confirmed all five comparison routes returned HTTP 200 with consistent values; the 10×10 and 10×12 bedroom routes returned HTTP 200 without floating-point leakage.
- Live `robots.txt` and `sitemap.xml` return HTTP 200; robots references the sitemap and the sitemap remains four URLs. Search Console queries and index status remain unverified because owner credentials are unavailable.
- A follow-up UX pass labels starter calculations as examples, adds a mobile-persistent result link, keeps desktop result panels sticky, progressively collapses the universal tool's optional route/quantity inputs, and renders comparison rows as mobile cards. The homepage now starts from fit relationships. `/about/` exposes the source registry and correction standard in the footer; it remains noindex pending owner/editorial review, and explicitly states that no correction contact is configured. This pass was committed as `6f38604` and deployed by workflow `37985786013`.
- Visible breadcrumbs and `BreadcrumbList` JSON-LD are present on the sampled indexable guide; a route regression now checks both. The original crawl's missing-breadcrumb observation did not reproduce in the generated page.
- Privacy/consent, a real correction-submission channel, an About byline/ownership statement, and publication review of the sources page remain open owner decisions. No privacy or contact details were invented.
- The 9 October follow-up passes `npm run verify` (200 tests, 45 pages, 44 internal HTML routes, four indexable URLs) and headless keyboard/mobile/desktop QA, including comparison-card overflow. Live HTTP checks returned 200 for `/`, `/about/`, `/workspace/`, `/bedroom/`, `/will-it-fit/`, and `/workspace/120cm-vs-140cm-desk/`; the about/tool routes are `noindex` with no canonical, and `/about/` remains excluded from the four-URL sitemap. Live robots/sitemap both return 200 and robots references the sitemap.
- Priority expansion 1, Dining Fit, is deployed as `aed4cf2` by workflow `37994959960`. `/dining/` accepts global-unit room/table/chair measurements, rotates rectangular tables to compare room fit, checks measured seat-width envelopes, and separates the hard furniture footprint from user-selected circulation space. The route is intentionally noindex; live checks return 200 while the sitemap remains four URLs. Verification now passes 205 tests, a 46-page build, and 45 internal routes; headless QA covers keyboard orientation changes and example-state behavior.
- Dining Fit v1 does not model round/oval tables, mixed chairs, table-base geometry, people passing, or sourced clearance recommendations. Appliance/install fit is next in the provided priority order; ventilation and service values must be user-entered or traced to exact manufacturer documentation rather than generalized into Fitwise minimums.
- To deliver all remaining priority areas together, appliance/install, delivery route, workspace compatibility, TV stand/wall, home gym, storage and pool/game-room calculations are now available as selectable modes in `/fit-services/`, deployed as `ed64bd0` by workflow `37998483044`. The studio is `noindex`; no new SEO pages or sitemap entries were added.
- The studio checks measured appliance openings and manual-entered clearances; upright delivery bottlenecks plus a conservative turn envelope; monitor/arm/desk dimensions with VESA and load compatibility; TV console or wall/VESA/load checks; user-selected gym operating zones; one-layer rectangular storage capacity and aisle targets; and pool-table room envelopes based on entered cue length. It does not claim to be a full motion solver or product catalog.
- Verification now passes 214 tests, a 47-page build, 46 internal routes and four indexable URLs. Headless mobile QA switched through all seven modes and both TV setups. Live checks returned HTTP 200 for `/fit-services/`, confirmed all mode IDs and its `noindex`/no-canonical policy, and verified it is absent from the four-URL sitemap.
- Remaining caveats are deliberate: exact manufacturer limits are user-entered, turns use a conservative diagonal bound, compatibility data must be copied from the exact manuals, gym zones are assumptions, storage is single-layer only, and pool clearance does not simulate angled play. The audit's later vehicle/garage idea is not implemented.
