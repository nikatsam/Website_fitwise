# Fitwise Full Audit — 08 October 2026

**Audit scope:** planner product behavior, global measurement support, content assumptions, SEO and sitemap pipeline, dependencies, build/route validation, accessibility smoke checks, and deployment boundary.

**Audit result:** Local implementation and validation pass. The new universal calculator and related global-input improvements are not yet pushed or deployed to production.

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

- `npm run verify` passed: Astro typecheck (0 errors), ESLint, Prettier, 197 tests across 24 files, static build of 44 pages, SEO validation (4 sitemap URLs/4 canonical pages), internal-link validation (43 HTML routes/4 indexable URLs), route checks, content checks, and offline infrastructure validation.
- Dataset build validation: 0 errors and 0 warnings.
- `npm run qa:keyboard -- http://127.0.0.1:4322` passed in headless mobile Chrome for `/workspace/`, `/bedroom/`, and `/will-it-fit/`. This covered skip-link focus, tab navigation, keyboard-operated controls, unit toggle, form validation, global unit-suffixed input conversion, optional route visibility, and mobile overflow.
- `npm audit --audit-level=moderate` returned no advisories.
- Generated `/will-it-fit/` output contains the expected form and `noindex`; the SEO validator confirmed four indexable canonicals and sitemap entries remain unchanged.

## Open Risks and Follow-Up

- The universal route model is intentionally axis-aligned and upright; consumers still need to measure the tightest points and reason about turns, stairs, lifting/tilting, packaging, and installation clearances.
- Quantity estimates are grid bounds, not packing optimizers. They do not model mixed object sizes, stacking, load ratings, or usable access paths.
- Search demand and index eligibility cannot be assessed without Search Console access and a human SERP review. Utility and draft routes should remain noindex until evidence supports a separate editorial release.
- GA4 remains active by owner decision. Privacy notice and consent handling are still an owner/compliance follow-up, not a resolved item or legal conclusion.
- `tseslint.config` emits a TypeScript deprecation hint in `eslint.config.js`; typecheck still reports zero errors and ESLint passes.
- Production release was not run as part of this request. The tested changes exist only in the local worktree until separately pushed and deployed through the confirmed production workflow.
