# Fitwise.stream Worklog

## Legend

| Symbol | Status      | Meaning                                           |
| ------ | ----------- | ------------------------------------------------- |
| ⬜     | NOT STARTED | Ready or waiting on dependencies                  |
| 🟦     | IN PROGRESS | Exactly one normal task should be active          |
| 🟩     | DONE        | Acceptance criteria met and tests passed          |
| 🟨     | BLOCKED     | Cannot proceed; blocker documented                |
| 🟥     | REWORK      | Previously attempted but failing acceptance/tests |
| ⏸      | DEFERRED    | Intentionally postponed by decision               |

## Progress rules

- **Implementation progress** uses the task weights in `BACKLOG.md` and counts only `DONE` implementation tasks.
- **Specification progress** is tracked separately so preparing this pack does not inflate implementation completion.
- A task does not contribute partial percentage while `IN PROGRESS`.

### Current progress

- Specification/development-pack progress: **100%**
- Implementation progress: **98%**
- Deployment progress: **98%**
- Current active task: **T028 — audit SEO metadata, hreflang, sitemap and robots**
- Next task: **Revisit GA4 privacy/consent if the owner later supplies notice/contact details**

## Task tracker

| ID   | Status         | Weight | Completed  | Verification / notes                                                                                             |
| ---- | -------------- | -----: | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| T001 | 🟩 DONE        |     4% | 2026-10-06 | `npm install`, `npm run build`, `npm run dev` all verified; Astro 7 static output, no framework runtime          |
| T002 | 🟩 DONE        |     3% | 2026-10-06 | `npm run verify` passes (typecheck, lint, format:check, test, build)                                             |
| T003 | 🟩 DONE        |     3% | 2026-10-06 | `npm run verify` passes; dev-server smoke test of `/`, `/workspace/`, `/bedroom/`, `/methodology/`               |
| T004 | 🟩 DONE        |     5% | 2026-10-06 | `npm run verify` passes (7/7 tests incl. new fixture/type tests)                                                 |
| T005 | 🟩 DONE        |     5% | 2026-10-06 | `npm run verify` passes (18/18 tests); build-abort behavior manually verified with injected bad data             |
| T006 | 🟩 DONE        |     4% | 2026-10-06 | `npm run verify` passes (40/40 tests)                                                                            |
| T007 | 🟩 DONE        |     6% | 2026-10-06 | `npm run verify` passes (53/53 tests, incl. equality/±1mm boundary cases)                                        |
| T008 | 🟩 DONE        |     6% | 2026-10-06 | `npm run verify` passes (66/66 tests)                                                                            |
| T009 | 🟩 DONE        |     6% | 2026-10-06 | `npm run verify` passes (78/78 tests)                                                                            |
| T010 | 🟩 DONE        |     4% | 2026-10-06 | `npm run verify` passes (82/82 tests); manual dev-server check of all 3 states + keyboard/ARIA                   |
| T011 | 🟩 DONE        |     6% | 2026-10-06 | `npm run verify` passes (90/90 tests); manual dev-server check of the diagram preview page                       |
| T012 | 🟩 DONE        |     7% | 2026-10-06 | `npm run verify` passes (98/98 tests); dev-server HTML inspection of `/workspace/`                               |
| T013 | 🟩 DONE        |     7% | 2026-10-06 | `npm run verify` passes (105/105 tests); dev-server HTML inspection of `/bedroom/`                               |
| T014 | 🟩 DONE        |     6% | 2026-10-06 | `npm run verify` passes (110/110 tests); all 14 pages built, 7 representative family pages checked               |
| T015 | 🟩 DONE        |     4% | 2026-10-06 | Workspace seed data wired; validator passes; `npm run verify` passes (110 tests), 16 pages built                 |
| T016 | 🟩 DONE        |     4% | 2026-10-06 | US/UK bed references, US room scenarios, sourced clearances, 19 intents; `npm run verify` passes; 20 pages built |
| T017 | 🟩 DONE        |     3% | 2026-10-06 | SEO envelopes, canonicals, social tags and typed JSON-LD breadcrumbs; 115 tests pass                             |
| T018 | 🟩 DONE        |     2% | 2026-10-06 | Build sitemap/robots, offline SEO/link validators, redirect registry and deterministic local URL diff; 123 tests |
| T019 | 🟩 DONE        |     4% | 2026-10-06 | Clean `npm ci`, 130 tests, 20-page build, SEO/link and route smoke checks pass; numeric boundaries hardened      |
| T020 | 🟩 DONE        |     3% | 2026-10-06 | Lighthouse: a11y/performance 100; keyboard, mobile/desktop visual QA passed; fixed SVG and accessibility issues  |
| T021 | 🟩 DONE        |     2% | 2026-10-06 | Gate E passed; owner sign-off recorded; local release candidate approved                                         |
| T022 | 🟩 DONE        |     3% | 2026-10-07 | Private S3/CloudFront/OAC/ACM deployed through GitHub OIDC; project tags and security smoke verified             |
| T023 | 🟩 DONE        |     2% | 2026-10-07 | Repeatable OIDC deploy, cache sync, invalidation and IndexNow workflow passed                                    |
| T024 | 🟩 DONE        |     1% | 2026-10-07 | Cloudflare apex HTTPS/DNS and production smoke pass; GSC/Bing/Yandex remain owner-operationally-pending          |
| T025 | 🟩 DONE        |     1% | 2026-10-08 | Dual-name certificate, CloudFront alias/301, Cloudflare DNS, and live redirect verified                          |
| T026 | 🟩 DONE        |     4% | 2026-10-08 | Sourced desk/bed-fit content and internal SEO links deployed; 161 tests and live sitemap/content smoke passed    |
| T027 | 🟩 DONE        |     5% | 2026-10-08 | Audit fixes and measured furniture/monitor guides deployed; 169 tests and live noindex/sitemap checks passed     |
| T028 | 🟦 IN PROGRESS |     2% | —          | Reciprocal en-US/en-GB hreflang and locale tags implemented/tested; deploy and live verification pending         |

## Session log

### 2026-10-06 — Development pack prepared

- Defined product scope and expansion strategy.
- Defined static-first architecture.
- Defined canonical data model direction and page families.
- Created weighted implementation backlog and progress legend.
- Chose private S3 + CloudFront OAC as the later production baseline.
- No application implementation has started.

### 2026-10-06 — T001 scaffold Astro static project (DONE)

- Ran `npm create astro@latest` (Astro 7.3.5, TypeScript strict template, minimal) into the project root.
- Set `astro.config.mjs`: `site: 'https://fitwise.stream'`, `output: 'static'`, `trailingSlash: 'always'`.
- Renamed package to `fitwise-stream`; Node 24.19.0 / npm 11.17.0 used locally (Node LTS line).
- Added minimal `src/pages/index.astro` and `src/pages/404.astro` (404 marked `noindex`).
- Verified: clean `npm install` (0 vulnerabilities), `npm run build` emits static `dist/` with `index.html` and `404.html`, `npm run dev` boots on port 4321. No React/Vue/Svelte dependency present.
- Repo is now git-initialized at project root (moved from scaffold tool's temp subfolder); no commit made yet pending user review.

### 2026-10-06 — T002 configure TypeScript, formatting, linting and scripts (DONE)

- Confirmed `tsconfig.json` extends `astro/tsconfigs/strict` (set by T001 scaffold).
- Added ESLint 10 flat config (`eslint.config.js`) with `@eslint/js`, `typescript-eslint`, `eslint-plugin-astro` recommended rulesets.
- Added Prettier 3 (`.prettierrc.json`, `.prettierignore`) with `prettier-plugin-astro` for `.astro` files.
- Added Vitest 5 with a placeholder unit test at `tests/unit/placeholder.test.ts`.
- Added `@astrojs/check` + `typescript` dev dependencies to support `astro check`.
- Added package scripts: `typecheck`, `lint`, `lint:fix`, `format`, `format:check`, `test`, `test:watch`, and an aggregate `verify` script matching `specs/LOCAL_DEVELOPMENT.md` §4.
- Documented all scripts in `README.md` under a new "Local development commands" section.
- Verified: `npm run verify` passes end-to-end (0 lint errors, 0 typecheck errors/warnings beyond one benign deprecation hint, 1/1 test passed, static build OK). 0 npm vulnerabilities throughout.

### 2026-10-06 — T003 global design tokens and base page shell (DONE)

- User direction: vibrant, animated, 2026-grade visual feel with a light/dark theme toggle available from day one (not a dark-only or light-only default).
- Added `src/styles/tokens.css`: light token set on `:root` (default), dark overrides under `:root[data-theme="dark"]`, brand gradient (violet → cyan), fit-state color tokens (fit/tight/does-not-fit, paired with text/icon per `specs/UX_UI.md` §8 — never color-only), spacing/type/radius/motion scales, and a `prefers-reduced-motion` override that collapses all durations.
- Added `src/styles/global.css`: reset, skip-link, visible `:focus-visible` ring on all interactive elements, responsive `.wrapper` container.
- Added `src/layouts/BaseLayout.astro`: shared HTML shell with an inline no-flash theme-detection script (reads `localStorage`, falls back to `prefers-color-scheme`), `noindex` prop for non-published pages.
- Added `src/components/layout/Header.astro` (sticky nav, active-route `aria-current`, theme-toggle button) and `Footer.astro`.
- Added `src/scripts/theme.ts`: small vanilla TypeScript module wiring the toggle button, persists choice to `localStorage` (key `fitwise-theme`), no framework.
- Rebuilt `src/pages/index.astro` with a vibrant gradient hero (CSS-only drifting glow animation, disabled under `prefers-reduced-motion`) and section stubs for workspace/bedroom/methodology, and `src/pages/404.astro` on the new shell.
- Added minimal `noindex` stub pages at `/workspace/`, `/bedroom/`, `/methodology/` purely so header/footer nav has no dead links; real templated content arrives in T014+.
- Verified: `npm run verify` passes (typecheck/lint/format/test/build all clean); dev server smoke-tested `/`, `/workspace/`, `/bedroom/`, `/methodology/` all return `200`.
- No new runtime dependency added; still zero UI framework.

### 2026-10-06 — T003 follow-up: theme-flicker fix and brand assets

- User reported the light/dark toggle flickers on page load in the dev server. Root cause: Astro's dev server injects component CSS (`tokens.css`/`global.css`) asynchronously via Vite's JS module pipeline, so the page briefly paints with default browser colors before the theme-correct background/text apply — independent of the theme-detection script, which already ran correctly before paint.
- Fix: added a small render-blocking inline `<style>` in `src/layouts/BaseLayout.astro` `<head>` that sets `html` background/text color for both `[data-theme]` states immediately, duplicating (and explicitly commented as duplicating) the two color pairs from `tokens.css`. This removes the flash in both dev and production builds.
- Added branded SVG assets under `public/assets/images/`: `favicon.svg` (gradient mark + clearance-bracket glyph, referenced from `BaseLayout.astro`), `logo.svg` (light-background wordmark lockup), `logo-dark.svg` (dark-background variant). Removed the unbranded default `public/favicon.svg` Astro generated in T001 now that it is superseded.
- Known limitation: `public/favicon.ico` remains the original unbranded default — regenerating a proper multi-resolution `.ico` needs an image-rasterization step (e.g. `sharp` or a `png-to-ico` dependency) not yet justified for a single file; kept at the site root only because browsers request `/favicon.ico` by convention. Revisit if/when an image-processing dependency is justified elsewhere.
- Verified: `npm run verify` passes; dev server smoke-tested `/`, `/assets/images/favicon.svg`, `/assets/images/logo.svg` all return `200`.
- Follow-up: swapped the header's CSS-drawn mark + inline text for the real `logo.svg`/`logo-dark.svg` assets (toggled via a `.brand__logo--light`/`--dark` pair, `display` controlled by `[data-theme]`). Extended the same critical inline `<style>` in `BaseLayout.astro` to pre-hide/show the correct logo variant before paint, preventing the same class of flash that affected the color tokens. `npm run verify` passes; dev server re-verified.

### 2026-10-06 — T004 canonical data schemas/types (DONE)

- Added `src/types/`: `units.ts` (`Millimetres`), `measurement.ts` (`Measurement`/`MeasurementKind`), `source.ts` (`SourceRecord`/`ConfidenceLevel`), `entity.ts` (`EntityBase`, `DisplayEntity`, `DeskEntity`, `BedEntity`, `RoomScenario`, plus the `Entity` union), `clearance.ts` (`ClearanceRule`), `relationship.ts` (`Relationship`), `page-intent.ts` (`PageIntent`), `seo.ts` (`SeoPublication`), and a barrel `index.ts` — all directly from `specs/DATA_MODEL.md` §2–8 and the §11/`TECHNICAL_SEO_PLAYBOOK.md` §2 SEO publication envelope.
- Noted one gap in the spec: `TECHNICAL_SEO_PLAYBOOK.md` §2's `SeoPublication` interface snippet has no join key, but its prose says the envelope "joins by PageIntent ID." Added an explicit `pageIntentId: string` field with an inline comment explaining why, rather than leaving the join unrepresentable. No ADR — this completes an underspecified field rather than overriding a decision.
- Canonical linear unit stays millimetres end-to-end (ADR-003); bed entities require `market` (`US`/`UK`/`EU`/`AU`/`other`) with no default, matching the "never assume universal" rule.
- Added `tests/fixtures/valid/sample-dataset.ts`: one small, cross-referenced, typed sample of every record family (sources, display/desk/bed entities, room scenario, clearance rule, relationship, page intent, SEO publication) — this is the compile-time proof the interfaces are usable, not just syntactically valid.
- Added `tests/fixtures/invalid/sample-invalid-records.ts`: one untyped case per build-failure invariant in `specs/DATA_MODEL.md` §9 (duplicate ids, missing entity reference, missing sourceId, non-positive dimension, derived-without-derivation, bed-missing-market, duplicate route, invalid relationship endpoint), for the T005 validator's tests to consume directly.
- Added `tests/unit/types.test.ts` asserting the valid fixtures load and cross-reference correctly, and that the invalid-case list covers all 8 named invariants.
- Verified: `npm run verify` passes (`astro check`: 0 errors across 26 files; eslint clean; prettier clean; vitest 7/7 passed; static build unaffected).

### 2026-10-06 — User granted full autonomy to drive backlog to completion

- User instruction: continue through the ordered backlog task by task without pausing for per-task confirmation, while still following AGENT_INSTRUCTIONS.md discipline (one task at a time, close-out steps, verify before marking done).

### 2026-10-06 — T005 build-time dataset validator (DONE)

- Added `src/lib/validation/dataset.ts`: `validateDataset(dataset)` implements all 8 build-failure invariants from `specs/DATA_MODEL.md` §9 (duplicate id/slug/route, published-page missing-entity reference, missing/invalid sourceId, non-positive dimension, derived-without-derivation, published-bed-missing-market, invalid relationship endpoint), plus a non-blocking warning for `SeoPublication.relatedPageIds` entries that don't resolve. Treats input defensively (runtime-unknown shapes), not just TS-trusted, since real datasets are authored as data files. `formatValidationResult()` renders actionable `ERROR [rule] message` / `WARN [rule] message` lines.
- Added `src/data/index.ts`: the single dataset aggregation point, currently empty — real entities land in T015/T016, not invented here.
- Wired validation into the production build via `src/lib/validation/build-integration.ts`, an Astro integration hooking `astro:build:start`, registered in `astro.config.mjs`. On any error it logs the full report and throws, aborting the build **before** route generation. Manually verified by temporarily injecting a record with a negative dimension and a missing sourceId into `src/data/index.ts`, confirming `astro build` failed with both clear messages, then restoring the real (empty) file.
- Added `tests/unit/validate-dataset.test.ts`: valid sample dataset passes with zero errors; each of the 8 invariants is independently exercised and asserted to produce the expected `rule`; every error message is asserted non-trivial and free of `undefined`/`[object Object]`.
- Fixing the validator against the T004 sample fixture caught a real data-quality gap: desk/room reference sizes and the recommended desk-side clearance were using `nominal`/`recommended` measurements with no `sourceId`, violating `AGENT_INSTRUCTIONS.md` §6 ("every non-derived measurement must have provenance"). Fixed by adding a `src-fitwise-internal-convention` `SourceRecord` and referencing it, rather than loosening the validator — internal conventions still need a traceable, confidence-rated record.
- Extended the validator to also check `BedEntity.defaultFrameAllowanceMm`'s four sub-measurements, which the first pass had missed.
- Added `"validate:data": "vitest run tests/unit/validate-dataset.test.ts"` script (matches `specs/LOCAL_DEVELOPMENT.md` §4's expected command list).
- Added an ESLint rule override (`varsIgnorePattern`/`argsIgnorePattern: '^_'`) to allow the conventional `_foo` unused-destructure pattern used in one test; applies project-wide going forward.
- Verified: `npm run verify` passes (astro check 0 errors/30 files; eslint clean; prettier clean; vitest 18/18; static build unaffected, logs "Dataset valid: 0 errors, 0 warnings.").

### 2026-10-06 — T006 unit conversion library (DONE)

- Added `src/lib/units/`: `constants.ts` (`MM_PER_INCH = 25.4` exact, `MM_PER_CM`, `MM_PER_M`, `MM_PER_FOOT`), `convert.ts` (pure, full-precision mm↔cm/m/inches/feet, plus `mmToFeetInches`/`feetInchesToMm` decomposition — no rounding anywhere in this file), `format.ts` (`roundTo` with a half-away-from-zero rule that sidesteps binary float artifacts, `formatCm`/`formatM`/`formatInches`/`formatFeetInches`/`formatMetric`/`formatLength` — all rounding happens only here, matching ADR-003/`DATA_MODEL.md` §9), `parse.ts` (`parseLength` turns user strings like `"140cm"`, `"1.4m"`, `"55in"`, `"4'7\""`, `"4 ft 7 in"` into millimetres, returning a `{ok, ...}` result instead of throwing).
- `formatFeetInches` specifically guards the case where rounding inches to a whole number produces `12`, carrying it into an extra foot rather than ever printing "ft 12 in".
- Added `tests/unit/units.test.ts`: round-trip tests (mm→unit→mm within declared floating-point tolerance) for every conversion pair, known-value checks (1 in = 25.4 mm, 6 ft = 1828.8 mm), boundary cases (0 mm, negative propagation), deterministic-formatting assertions, and parser tests covering valid formats plus empty/negative/garbage invalid input.
- Verified: `npm run verify` passes (astro check 0 errors/36 files; eslint and prettier clean; vitest 40/40; build unaffected).

### 2026-10-06 — T007 generic fit-state engine (DONE)

- Added `src/lib/fit/engine.ts`: `evaluateFit(checks: DimensionCheck[], assumptions?)` where each `DimensionCheck` is `{ dimension, label?, minimumMm, recommendedMm?, availableMm }`. Per dimension it computes `hardFit` (`availableMm >= minimumMm`), `recommendedFit` (`availableMm >= (recommendedMm ?? minimumMm)`), `marginMm` and `recommendedMarginMm`. The overall result takes the worst case across all dimensions: any failed hard constraint → `does_not_fit`; else any failed recommendation → `tight`; else `fits`. Output shape (`state`, `hardFit`, `recommendedFit`, `marginsMm`, `failedRecommendations`, `assumptions`) matches the example in `specs/ARCHITECTURE.md` §4.
- Deliberately generic/dimension-agnostic so both T008 (desk/monitor) and T009 (bed/room) geometry modules can feed it named checks (width, depth, left/right/front/back clearance, etc.) without duplicating fit logic.
- Added `tests/unit/fit-engine.test.ts`: the three named states from the acceptance criteria, a multi-dimension combination test (worst-dimension wins), an assumptions passthrough test, a `marginsMm` shape test, and six explicit equality/±1 mm boundary tests (both at the hard-minimum and at the recommended threshold) confirming the boundary is inclusive (`>=`, not `>`).
- Verified: `npm run verify` passes (astro check 0 errors/39 files; eslint/prettier clean; vitest 53/53; build unaffected).

### 2026-10-06 — T008 desk/monitor geometry (DONE)

- Added `src/lib/geometry/workspace.ts`: `deriveScreenDimensions(diagonalInches, aspectRatio)` derives SCREEN-only width/height via the Pythagorean relationship, always returning `kind: 'derived'` with `derivationId: 'derive-screen-dims-from-diagonal-aspect'` (the exact id already referenced in the T004 sample fixture); `resolveMonitorWidth(display)` prefers the sourced `overallWidthMm` and only falls back to the derived `screenWidthMm` when no overall width exists, always tagging the result with `basis: 'overall' | 'screen_only_approximation'` so callers can never silently present a screen-only figure as the device width; `computeConfigurationWidth({widthsMm, gapMm})` sums monitor widths plus `(n-1)` gaps; `buildWorkspaceWidthCheck()` turns a computed footprint + optional recommended side margin into a `DimensionCheck` ready for T007's `evaluateFit`.
- Angled/yawed monitor layouts are explicitly deferred, documented at the top of the module (per T008 step 3) rather than stubbed — no angle parameter exists yet, so there's nothing partially implemented to trip over later.
- Added `tests/unit/geometry-workspace.test.ts`: diagonal→screen-dimension derivation reconstructs the original diagonal and preserves the aspect ratio; provenance-preference tests for `resolveMonitorWidth` (including the "throws rather than invents a number" case); known-fixture width sums for 1/2/3 monitors with gaps; boundary/invalid-input rejections; and an end-to-end fixture — two 613 mm monitors with a 20 mm gap and 38 mm recommended side margins (matching `specs/ARCHITECTURE.md` §4's own 38 mm example) — hitting `fits`/`tight`/`does_not_fit` at 1400/1300/1200 mm desk widths via the real `evaluateFit` engine.
- Verified: `npm run verify` passes (astro check 0 errors/42 files; eslint/prettier clean; vitest 66/66; build unaffected).

### 2026-10-06 — T009 bed/room geometry (DONE)

- Added `src/lib/geometry/bedroom.ts`, mirroring the T008 workspace-geometry pattern: `computeBedFootprint(mattressWidthMm, mattressLengthMm, frameAllowanceMm)` adds frame allowance to mattress dimensions per side; `applyOrientation(footprint, 'portrait' | 'landscape')` swaps which bed axis is compared against room width vs room length; `buildBedRoomChecks(input)` produces `'room_width'`/`'room_length'` `DimensionCheck`s for T007's `evaluateFit`, folding in optional nightstand widths (added to the hard width footprint) and separate recommended side clearance (both sides) and foot clearance (once, since the head end is assumed against a wall).
- Added `tests/unit/geometry-bedroom.test.ts` covering all four T009 acceptance criteria: orientation-swap tests (portrait vs landscape maps footprint axes oppositely), frame-allowance tests (a non-zero allowance shrinks the hard margin by exactly its sum), clearance boundary tests (equality and ±1 mm at both the hard minimum and the recommended envelope), and a UK-King-vs-US-King fixture proving market-specific bed sizes are never conflated — the same 1800×2100 mm room fits a UK King (1500 mm wide) but not a US King (1930 mm wide).
- Verified: `npm run verify` passes (astro check 0 errors/44 files; eslint/prettier clean; vitest 78/78; build unaffected). Core-logic phase (T006–T009) is now complete.

### 2026-10-06 — T010 result summary and assumptions components (DONE)

- Added `src/lib/fit/display.ts`: `toDimensionDisplayRows(checks, result)` zips the `DimensionCheck[]` passed to `evaluateFit()` with its `FitResult` to produce UI-ready rows (`requiredMm`, `recommendedMm`, `availableMm`, `marginMm`, `hardFit`, `recommendedFit`), throwing rather than silently misaligning if `checks`/`result` don't match.
- Added `src/components/fit/`: `UnitValue.astro` (renders both pre-formatted metric and imperial strings server-side, toggled purely by CSS via a `data-unit-system` attribute on `<html>` — identical mechanism to the T003 theme toggle, so the canonical mm value and the computed `FitResult` never change, only which pre-rendered string is visible); `UnitToggle.astro` + `src/scripts/unit-system.ts` (persists choice to `localStorage` under `fitwise-unit-system`, mirrors `theme.ts`); `FitSummary.astro` (state badge is always icon + text, colored background comes from the `--color-state-fit/-tight/-no-fit` tokens reserved back in T003, never color alone); `DimensionTable.astro` (required/recommended/available/margin table with `scope="col"/"row"`, a pure-CSS mobile card-stack layout per `specs/UX_UI.md` §7, and a `data-hard-fit` attribute driving a text-color cue, not a color-only one); `AssumptionList.astro`.
- Extended `BaseLayout.astro`'s existing no-flash critical inline script/style (from the T003 theme fix) to also read the stored unit-system preference and pre-hide the non-active unit span before first paint, applying the same lesson learned from the earlier flicker bug to this new toggle.
- Added `src/pages/dev/fit-components-preview.astro` (`noindex`, not linked from navigation) rendering all three fit states end to end using real `evaluateFit()` + `buildWorkspaceWidthCheck()` output, as a durable QA fixture for this and future component work. Manually verified via the dev server: all three `data-fit-state` values render with correct markup, `aria-pressed` on the toggle, `scope` on table headers, and visible focus via the existing global `:focus-visible` styles.
- While wiring the second toggle script, caught and fixed a latent bug: `theme.ts` and `unit-system.ts` both declared a top-level `const STORAGE_KEY` with no top-level `import`/`export`, so TypeScript treated them as sharing one global script scope — harmless with one file, but `astro check` failed with "Cannot redeclare block-scoped variable" as soon as the second one existed. Fixed by adding `export {}` to both to force module scope; worth keeping in mind for any future plain `<script>` files.
- Verified: `npm run verify` passes (astro check 0 errors/53 files; eslint/prettier clean; vitest 82/82; build emits 6 pages including the new preview route).

### 2026-10-06 — T011 responsive scale-diagram primitives (DONE)

- Added `src/lib/diagram/scale.ts`: `computeScale(containerWidthPx, containerHeightPx, spaceWidthMm, spaceDepthMm)` returns the largest uniform px-per-mm that fits the space into the container while preserving aspect ratio (same function for desk/monitor or bed/room diagrams — "scale is relative within each diagram", `specs/ARCHITECTURE.md` §4); `mmToPx`; `labelFontSizePx(scale)` clamps label text to a legible 11–18px range regardless of whether the diagram represents a small desk or a large room.
- Added `src/components/diagram/`: `ScaleDiagram.astro` (SVG wrapper with `role="img"` + `aria-labelledby` pointing at a visually-hidden `<figcaption>` carrying the full text alternative, plus shared arrowhead `<marker>` defs scoped by an `id` prop so multiple diagrams can coexist on one page); `SpaceRect.astro` (dashed outline, no fill); `ObjectRect.astro` (solid fill + border, always renders a centred text label — never relies on the fill color alone to say what it is); `ClearanceZone.astro` (dotted outline, no fill, distinct stroke pattern from both the space and the object); `DimensionArrow.astro` (line + markers with a dual metric/imperial label, reusing the exact `data-unit`/`data-unit-system` CSS toggle mechanism built for T010's `UnitValue.astro`, just as SVG `<tspan>`s instead of HTML `<span>`s); `Legend.astro` (plain HTML list whose item text spells out the non-color distinction in words, e.g. "dashed outline" / "solid fill" / "dotted outline").
- Every shape primitive is visually distinguishable by stroke/fill pattern, not color alone, and both the legend text and the object/clearance labels are always present — satisfies the "understandable without color" acceptance criterion independent of any specific color choice.
- Added `tests/unit/diagram-scale.test.ts`: width-constrained vs height-constrained scaling, "larger space → smaller scale" monotonicity, boundary/invalid-input rejection, and `labelFontSizePx` clamp-range tests.
- Added `src/pages/dev/diagram-preview.astro` (`noindex`, unlinked) assembling a real two-monitor-desk diagram using T008's `computeConfigurationWidth()`, as a durable visual QA fixture; manually verified it returns `200` via the dev server and resizes responsively (the `<svg>` is `width:100%; height:auto` with a `viewBox`, so it scales fluidly from mobile to desktop without JS).
- Verified: `npm run verify` passes (astro check 0 errors/63 files; eslint/prettier clean; vitest 90/90; build emits 7 pages including the new preview route).

### 2026-10-06 — T012 workspace interactive FitCheck (DONE)

- Added `src/lib/fit/copy.ts`: `FIT_STATE_BADGE_COPY` (icon + label per `FitState`), extracted out of `FitSummary.astro` so the identical copy can be imported by the client-side recompute script too — server and client can never show different icons/labels for the same state.
- Added optional `id` props to `UnitValue.astro`, `DimensionTable.astro` (deriving per-cell ids from `id` + `row.dimension`), `FitSummary.astro` (plus `data-field="icon"/"label"/"detail"` markers), and `AssumptionList.astro` (`data-field="items"` on the `<ul>`) — all additive, so every existing T010/T011 usage (including the two dev preview pages) keeps working unchanged.
- Added `src/lib/diagram/render-workspace.ts`: `renderWorkspaceDiagramMarkup(input)`, a single pure function that builds the dynamic SVG markup (dashed desk outline, 1–2 monitor rects, side clearance zones, dual-unit dimension arrow) as a string. Called by `WorkspaceFitCheck.astro` at build time for the default answer, and by the browser script for every live recompute — one implementation, so the server-rendered and client-recomputed diagrams can never drift out of sync.
- Added `src/components/fitcheck/WorkspaceFitCheck.astro`: desk width, monitor count and monitor size are always visible; desk depth, an optional exact monitor-width override, gap and recommended side clearance are collapsed under a `<details>` "More assumptions" per `specs/UX_UI.md` §5 — present and functional, just not cluttering the primary flow. The full default scenario (1400 mm desk, two screen-derived 27" monitors) is computed via the real `evaluateFit`/`buildWorkspaceWidthCheck`/`deriveScreenDimensions` functions at build time, so it is a complete, correct answer with JavaScript disabled.
- Added `src/scripts/workspace-fitcheck.ts`: listens for `input`/`change` on the form, validates every numeric field inline (a `role="alert"` error span + `aria-invalid` per field; invalid input stops recompute and keeps the last valid result visible rather than showing a broken state), resolves monitor width (override takes precedence over the diagonal-derived screen width, each path producing its own honest assumption sentence), recomputes `evaluateFit`, and patches the summary badge, detail sentence, dimension-table cells, assumptions list and diagram SVG directly via the DOM — no framework, no network request of any kind.
- Replaced the `/workspace/` placeholder stub with the real `WorkspaceFitCheck` (still `noindex` until T017/T018 wire up real SEO publication).
- While reviewing the rendered HTML, caught and fixed a copy bug: `buildWorkspaceWidthCheck`'s dimension `label` was the raw key `'desk_width'` (producing "...remains on desk_width."); fixed to the readable `'desk width'`. Applied the same fix to `'room_width'`/`'room_length'` in `src/lib/geometry/bedroom.ts` ahead of T013, since it's the identical pattern. Verified no test depended on the old label strings — all existing assertions key off `dimension`, which was untouched (`grep` confirmed).
- Verified: `npm run verify` passes (astro check 0 errors/68 files; eslint/prettier clean; vitest 98/98; build emits 7 pages). Manually inspected the rendered `/workspace/` HTML via the dev server: exactly one real `FitSummary` (the extra `data-fit-state` text matches were CSS attribute-selector rules in the component's own scoped stylesheet, not duplicate elements — confirmed by line-numbered `grep`), correct default "Fits" state with the right margin value, all form fields and ARIA error spans present.

### 2026-10-06 — T013 bedroom interactive FitCheck (DONE)

- Mirrored T012's architecture exactly, now proven as a reusable pattern. Added `src/lib/diagram/render-bedroom.ts`: `renderBedroomDiagramMarkup(input)`, the bedroom counterpart of `renderWorkspaceDiagramMarkup` — room outline, bed rectangle, up to two nightstand rectangles (placed left/right of the bed, matching `buildBedRoomChecks`' assumption that nightstand width adds to the hard footprint), side clearance zones (both sides), a foot clearance zone, and a dual-unit dimension arrow. Shared between build-time SSR and the browser recompute.
- Added `src/components/fitcheck/BedroomFitCheck.astro`: room width/length, a bed-size preset selector (UK Double, UK King, US Queen, US King — explicitly labelled in the assumptions text as "typical nominal mattress sizes, not a specific product," mirroring how T012 labels its diagonal-derived monitor width, to stay honest per `AGENT_INSTRUCTIONS.md` §6) and orientation are always visible; frame allowance, side/foot clearance targets and nightstand count/width are collapsed under "More assumptions."
- Added `src/scripts/bedroom-fitcheck.ts`: same inline-validation-and-DOM-patch pattern as `workspace-fitcheck.ts`, extended to patch **both** the `room_width` and `room_length` table rows (the workspace page only has one dimension; bedroom has two).
- Replaced the `/bedroom/` placeholder stub with the real `BedroomFitCheck` (still `noindex` pending T017/T018).
- Default scenario (UK King, 3000×3600 mm room, portrait orientation, 50 mm frame allowance, 600 mm side/foot clearance) fits comfortably; verified via dev-server HTML inspection — "Fits comfortably — approximately 140.0 cm / 4 ft 7 in remains on room width." Hard footprint = 1500 mm mattress + 50 mm frame allowance each side = 1600 mm; hard margin = 3000 − 1600 = 1400 mm = 140.0 cm, matching the displayed value exactly.
- Caught and fixed a test bug during `npm run verify` (not a product bug): a `diagram-render-bedroom.test.ts` case's `baseInput` included `footClearanceMm: 600`, so it legitimately rendered 3 clearance zones (2 side + 1 foot) rather than the 2 the test expected — fixed by isolating the variable under test rather than loosening the assertion.
- Verified: `npm run verify` passes (astro check 0 errors/72 files; eslint/prettier clean; vitest 105/105; build emits 7 pages).
- **Core FitCheck UI phase (T006–T013) is now fully complete.** Both the workspace and bedroom tools are live, interactive without a framework, functional without JavaScript (SSR default answer), validate input inline, and make zero network requests to compute a result.

### 2026-10-06 — T014 build static page-family templates (DONE)

- Added `src/lib/content/get-published-page-intents.ts`: `getPublishedRoutes(dataset)` is the single mechanism that turns a `PageIntent` into a route — filters `status === 'published'` and derives a slug, so `draft`/`deferred` intents can never produce a buildable path (tested, directly satisfies T014's 2nd acceptance criterion).
- Added `src/lib/content/breadcrumbs.ts`: `buildBreadcrumb(route, cluster)`, a Home → Cluster → Page trail derived purely from the URL shape — an explicit placeholder, to be replaced by the real `breadcrumbIds`-driven ancestor chain once T017 implements the SEO publication envelope.
- Added 6 template components under `src/components/content/templates/`, covering all 7 launch families from `specs/CONTENT_SEO.md`: `EntityTemplate`, `FitAnswerTemplate` (shared by `object_to_space` and `configuration` — same answer/diagram/table/assumptions structure, different editorial framing, per §3), `SpaceToObjectTemplate` (reverse-fit table), `ComparisonTemplate`, `ClearanceTemplate`, `HubTemplate` — all wrapped by a shared `PageFamilyLayout.astro` (breadcrumb nav + H1 + body slot), plus a new `FitResultSection.astro` bundling `FitSummary`/`ScaleDiagram`/`DimensionTable`/`AssumptionList` for the fit-calculation templates.
- Added `src/pages/[...slug].astro`: the real dynamic route, wired to the actual `src/data` dataset via `getPublishedRoutes`, fully automatic end-to-end for the `hub` and `entity` families. It currently emits **zero** pages, by design, since `dataset.pageIntents` is still empty pending T015/T016.
- **Discovered and documented a genuine data-model gap** rather than quietly working around it: `PageIntent.entityIds` is an unordered list with no role semantics (nothing says "this id is the desk, that one is the monitor") and `PageIntent` has no field for page-specific calculation parameters (gap, margin, orientation). This makes full automatic generation impossible today for the 5 calculation-heavy families without a schema addition. Flagged in `PROJECT_STATE.json` as something to raise as an ADR when T015/T016/T017 need it, rather than bending the data model mid-task.
- To still satisfy "at least one representative page from each required launch family builds," hand-authored one real page per family under `/workspace/` (all `noindex`, since none is yet backed by a published `PageIntent`/`SeoPublication` record): `desk-size-for-two-27-inch-monitors` (object_to_space), `dual-monitors-and-laptop-desk-size` (configuration — generalizes `computeConfigurationWidth` to three arbitrary labelled items, not just monitors), `what-fits-on-a-140cm-desk` (space_to_object), `120cm-vs-140cm-desk` (comparison), `desk-depth-for-monitor` (clearance), `desk-size-guide` (hub), `27-inch-monitor-dimensions` (entity). Every number on every page is computed through the real `lib/fit`/`lib/geometry`/`lib/units` functions already built in T006–T013, not invented.
- Caught and fixed 3 visually-hidden caption bugs while inspecting rendered HTML (`"What fitsa 140cm desk"`, `"...dimensionsmeasurements"`, `"...deskcomparison"` — missing spaces in concatenated JSX text+expression). The first fix attempt (a literal space between `{expr}` and text) was silently removed by the next `npm run format` — a Prettier JSX-whitespace-collapsing quirk — so re-fixed using a single template-literal expression (``{`${h1} measurements`}``) per caption, which survives formatting. Worth remembering for any future adjacent-expression-and-text JSX in this codebase.
- Verified: `npm run verify` passes (astro check 0 errors/92 files; eslint/prettier clean; vitest 110/110; build emits 14 pages, including all 7 new representative pages, each manually checked at `200` and spot-verified for correct fit-state output via dev-server HTML inspection).

### 2026-10-06 — T015 populate verified seed workspace dataset (IN PROGRESS, paused for review)

Paused mid-task at the user's request to document progress. Current state is safe: the build is green (`npm run verify` passes) because the new files below exist but are not yet imported by `src/data/index.ts` — the real dataset is still empty, so nothing changed about what the site builds today.

**Research done** (via live web search, each cited with URL/publisher/access date in `src/data/sources.ts`):

- IKEA LAGKAPTEN desk range: common sizes 120×60, 140×60, 160×80 cm (medium confidence — product line is real, exact current spec page not individually loaded).
- Samsung Smart Monitor M7 (32"): 716.1 mm wide without stand (medium confidence, retailer-hosted spec mirror).
- LG 34WP85C-B (34" 21:9 ultrawide): 814.0 mm wide without stand (high confidence, manufacturer page).
- Samsung CHG90 (49" 32:9 super ultrawide): 1195.8 mm active display width (medium confidence; explicitly noted as active-area, not full bezel width).
- OSHA Computer Workstations eTool: preferred eye-to-screen viewing distance 20–40 in (~500–1000 mm) (high confidence, official US government source) — used to source the "recommended" half of the desk-depth-for-monitor clearance rule, rather than inventing a number.
- Everything else without a precise external citation (38 mm monitor side margin, 20 mm monitor gap, 300 mm stand-footprint estimate) is attributed to a `src-fitwise-internal-convention` SourceRecord, the same honest pattern established in T004/T005 — never silently uncited.

**Files written so far:**

- `src/data/sources.ts` — the 6 SourceRecords above.
- `src/data/workspace/entities.ts` — 5 `DisplayEntity` records (24"/27"/32"/34"/49") with screen-only dimensions computed live via the real `deriveScreenDimensions()` function (not hand-typed, so numbers and `derivationId` can never drift), plus sourced `overallWidthMm` for the 32"/34"/49" where a real product spec was found; 3 `DeskEntity` records (120/140/160 cm) sourced to the IKEA product line.
- `src/data/workspace/clearance-rules.ts` — 3 `ClearanceRule` records (desk side margin, desk depth for monitor using the OSHA-sourced figure, monitor gap).
- `src/data/workspace/page-intents.ts` — all 22 workspace rows (P001–P022) transcribed verbatim from `data/INITIAL_CONTENT_MAP.csv`, status copied exactly (`published`/`draft`) so draft rows stay unpublishable, `entityIds` mapped to the new entities where the CSV's intent makes an unambiguous pairing possible.
- Exported `titleCaseFromSlug` from `src/lib/content/breadcrumbs.ts` (was private) for reuse in hub-link label generation.
- Removed `src/pages/workspace/desk-size-guide.astro` (the T014 hand-authored demo hub page) because `pi-p001-desk-size-guide` now claims that exact route as a real, data-driven `published` hub `PageIntent` — once wired in, the dynamic `[...slug].astro` route will generate this page for real and a hand-authored file at the same path would collide at build time.

**Still to do before T015 can be marked DONE:**

1. Wire `sources`, `displayEntities`, `deskEntities`, `clearanceRules` and `pageIntents` into `src/data/index.ts` (currently still the empty placeholder from T005).
2. Improve `[...slug].astro`'s `hub` branch to generate real sibling links (currently stubs `links={[]}`) — now that real data exists, list other published `PageIntent`s in the same cluster using `titleCaseFromSlug` for labels.
3. Generalize the `entity` branch to render a row per resolved entity (currently only looks at the first match and only handles `widthMm`) so `pi-p019-monitor-size-chart`'s five linked displays all render.
4. Run `npm run validate:data` / full `npm run verify` against the real, non-empty dataset — this is the first time the T005 validator and the real production data meet, so expect to iterate on any invariant violations it surfaces (missing `relationships` for entityIds referenced only loosely, etc.).
5. Decide whether `relationships` records are needed yet (current files don't add any) — likely yes, at minimum `fits_on` links between the display and desk entities referenced together in `object_to_space`/`configuration` intents.
6. Close out: update `WORKLOG.md`/`WORKLOG.json`/`PROJECT_STATE.json` to DONE, and verify with `npm run dev` that the new `/workspace/desk-size-guide/`, `/workspace/monitor-size-chart/` and `/workspace/fitcheck/` routes render correctly end-to-end from the dynamic route.

### 2026-10-06 — SEO pack hardening (documentation revision v0.2.0)

- Audited original T017/T018 and identified gaps in automatic sitemap/robots maintenance, stable `lastmod`, redirects, site-verification operations and cross-engine indexing.
- Added authoritative SEO technical/playbooks, offline gates, search-engine operations and editorial search growth; updated existing task cards, QA/acceptance and local/AWS specs.
- No application tasks were executed and no public search engine or AWS accounts were accessed. **Implementation remains 0%; no task status changed.**

### 2026-10-06 — T015 workspace dataset (DONE)

- Wired workspace entities, clearance rules, source registry, and 22 page intents into the production dataset; no entity permutations were generated.
- Generated hub links only to published hub/entity routes currently rendered by the generic route, avoiding links to page families not yet generated there.
- Expanded entity rendering to include all linked entities and their available physical measurements.
- `npm run validate:data` passes; `npm run verify` passes (110/110 tests, static build completes with 16 pages and real dataset validation reports 0 errors / 0 warnings).
- Draft page intents remain excluded from generated routes. T016 is now active; no deployment or external account operations performed.

### 2026-10-06 — T016 bedroom dataset (DONE)

- Added market-specific US Full/Queen/King and UK Standard Double/King/Super King bed references with cited provenance; names and geography make clear these are not universal dimensions.
- Added three US feet-based reference room scenarios, converted with the existing `feetToMm` function and a stable derivation ID.
- Added bedroom side, foot, and bed-to-furniture clearance guidance. Editorial recommendations and Fitwise internal planning conventions are identified as guidance, not building-code requirements.
- Transcribed bedroom intents P023-P041 with published/draft statuses preserved and attached relevant market/entity references.
- `npm run verify` passes (110/110 tests); production build validates the real combined dataset with 0 errors / 0 warnings and generates 20 pages. T017 is now active.

### 2026-10-06 — T017 publication metadata and structured data (DONE)

- Added stable SEO publication envelopes for generated hub/entity routes, with unique titles, descriptions, H1s, normalized canonical paths, editorial dates, market/language, and source provenance where applicable.
- Kept generic landing/tool pages `noindex` until their primary answers are rendered; only the monitor, US bed-size, and UK bed-size reference charts are currently indexable.
- Added absolute apex canonicals, Open Graph/Twitter metadata, truthful WebPage and homepage WebSite JSON-LD. Visible breadcrumbs and BreadcrumbList JSON-LD derive from the same PageIntent ancestor IDs; JSON serialization escapes `<`.
- Extended build-time dataset validation for missing/duplicate envelopes, duplicate titles/canonicals, invalid dates/paths, unpublished or non-indexable ancestors and related pages. Added positive and negative fixtures.
- `npm run verify` passes (115/115 tests); production validation reports 0 errors / 0 warnings and the build generates 20 pages. ADR-009 already records the publication-envelope architecture; no new architecture decision was needed. T018 is now active.

### 2026-10-06 — T018 sitemap, robots and internal-link validation (DONE)

- Added build-time `sitemap.xml` generated from indexable/published SEO envelopes plus the canonical homepage. Dates use only stable publication metadata; no build timestamp is added. Build also emits permissive plaintext `robots.txt` with the absolute sitemap URL.
- Added offline `validate:seo` checks for canonical/sitemap parity, duplicates, title/H1/meta, JSON-LD and breadcrumb consistency, robots, XML constraints, noindex exclusions, and redirect registry validity.
- Added `validate:links` for internal anchor/asset/fragment resolution and crawl reachability of every sitemap URL from Home; linked the workspace and bedroom reference pages from their category landing pages.
- Added `seo:diff` local added/materiallyUpdated/removed/unchanged output and ignored `.seo/manifest.json` baseline (`--record`). `data/redirects.json` documents the permanent redirect registry format; initially empty.
- Negative fixtures cover draft/noindex in sitemap, duplicate canonical, dangling breadcrumb, and missing internal link. `npm run verify` passes (123/123 tests); production validation has 0 errors/warnings, sitemap has 4 URLs, and all 19 built HTML routes pass link validation. A no-op rebuild reports all 4 sitemap URLs unchanged. ADR-009 already establishes the static publication architecture; no architecture change required. T019 is now active.

### 2026-10-06 — T019 route and calculation QA (DONE)

- Added build-output smoke checks for the homepage, both FitCheck hubs, representative authored/data-driven measurement pages, 404, sitemap, and robots as `validate:routes` in `npm run verify`.
- Added regression boundaries rejecting empty/invalid fit evaluations, non-finite geometry, negative clearances/frame allowances/nightstand widths, unsupported orientation values, and invalid diagram scaling/clamps.
- Hardened the fit, workspace/bedroom geometry, and diagram scale APIs against invalid/overflowing values. Test suite now passes 130/130; production dataset validation remains 0 errors/warnings and all static SEO/link/route checks pass.
- Initial `npm ci` attempts failed with Windows `EPERM` on the Astro native compiler binding. After confirming and stopping the user-authorized Astro CLI process PID 42356, a clean `npm ci` completed (389 packages, 0 vulnerabilities). The following `npm run verify` passed: 130/130 tests, 20-page build, zero data errors/warnings, SEO/link checks, and route smoke tests.
- T019's clean-install blocker is resolved and T020 is now active.

### 2026-10-06 — T021 local production gate (BLOCKED)

- `npm ci` passed (389 packages, 0 vulnerabilities); `npm run verify` passed (133 tests, type/lint/format, 20-page static build, and data/SEO/link/routes/content validators).
- Production preview returned 200 for Home, both hubs, dedicated workspace/bedroom reference pages, sitemap, and robots; an unknown path returned 404. `npm run qa:keyboard` passed on both FitCheck hubs.
- `npm run seo:diff` before/after a no-op build reported all four published URLs unchanged. No `.env*`/secret files or runtime secret requirements were found for the local static site.
- All explicit Gate E checklist items in `specs/ACCEPTANCE_CRITERIA.md` are checked. Offline evidence is in `SEO_RELEASE_AUDIT.md`; production-only Gate F checks were not run.
- The mandatory human reviewer signature on `SEO_RELEASE_AUDIT.md` is pending. Therefore T021 remains BLOCKED and `cloudDeploymentAllowed` stays false. No architecture change was made.

### 2026-10-06 — Offline AWS release preparation (drafts only)

- Per explicit request, prepared offline draft artifacts for T022-T024 without advancing their task statuses: CloudFormation template (`infra/fitwise-static-site.template.json`), deterministic file/cache/invalidation planner (`npm run deploy:plan`), read-only CI artifact workflow, and `PRODUCTION_RUNBOOK.md`.
- Infrastructure uses private S3 with all public-access blocks, OAC/SigV4 distribution-scoped `GetObject` policy, HTTPS/TLS, security headers, CloudFront directory-index function, short HTML TTLs, immutable hashed assets, lifecycle bounds and real 404 translation. No Lambda, public S3 website, certificate, or DNS resource is provisioned.
- `sam validate --template-file infra/fitwise-static-site.template.json --lint` and `npm run infra:validate` passed locally. Plan output enumerated 28 production objects, excluded both `/dev/` preview pages, grouped cache headers and invalidation paths, and reported `awsCallsMade: false`; no printed commands were executed.
- The workflow has read-only repository access and packages `dist/` excluding `/dev/`; it contains no AWS credentials, sync or invalidation step. The production runbook explicitly marks all future AWS/domain/search-console actions as unexecuted.
- `npm run verify` passes with 137 tests, all local data/SEO/link/route/content checks, and the infrastructure assertions. T021 remains blocked on the mandatory human SEO-audit signature; `cloudDeploymentAllowed` remains false and T022-T024 remain NOT_STARTED pending that gate.

### 2026-10-06 — Page-family coverage expansion (offline; T021 still blocked)

- Added a separate route-disposition manifest that preserves CSV PageIntent statuses. The build coverage gate now requires every intent to be generated, deferred with a reason, or draft-only; current counts are 29 generated, 6 deferred, and 6 drafts. Deferred/draft paths are checked absent from built output.
- Added evidence-backed renderers for workspace object-to-space, space-to-object, comparisons and desk-relevant clearances; bedroom object-to-space, room-to-bed fit, mattress comparisons and sourced bed clearances. All new generated family pages have SEO publication envelopes but default to `noindex`; sitemap stays at four indexable URLs pending editorial release decisions.
- Explicitly deferred P008 (unsourced laptop dimensions), P018 (missing chair data), P034/P035 (missing wardrobe/dresser geometry), and P036/P037 (missing nightstand measurements). Moved the unsourced P008 preview route under `/dev/`, excluded from production plans.
- Corrected the 49-inch display model: the Samsung source provides active panel width, not outer device width. Added a distinct `activeWidthMm`, preserved the screen-only fit approximation note, and added a regression test preventing it from being treated as overall width.
- Added unit tests for family calculations, market labels, evidence/deferral cases, and CloudFront directory rewrite/root/assets/query/403-404 behavior. `npm run verify` passes with 149 tests, 38 built pages, 0 data errors/warnings, 4 sitemap URLs, and route/link/content/infra validators passing.
- `SEO_RELEASE_AUDIT.md` was refreshed with this route set and remains unsigned. Obtain the required human signature before AWS permission; `cloudDeploymentAllowed` remains false. No AWS actions performed.
- Final `npm run verify` passes: 149/149 tests, type/lint/format, 38-page build, zero dataset errors/warnings, SEO/link/content/infra checks, and route smoke showing 29 generated/6 deferred/6 draft PageIntents. Sitemap remains four indexable URLs.

### 2026-10-06 — T021 owner sign-off and Gate E release

- Project-owner review/signature was confirmed via authenticated user interaction at 17:32 UTC and recorded in `SEO_RELEASE_AUDIT.md`; no personal display name was supplied or invented.
- All local Gate E evidence is recorded, including current generated/deferred/draft route coverage and the refreshed page-family smoke/a11y data. Production-only checks remain post-deployment.
- T021 is DONE. `cloudDeploymentAllowed` is true for the user's AWS request; this authorizes, but does not claim, infrastructure is deployed. T022 is now active.

### 2026-10-07 — T022/T023 production deployment (DONE)

- Confirmed AWS account `754246170171`, site-stack region `eu-north-1`, GitHub repository `nikatsam/Website_fitwise`, and the existing shared GitHub OIDC provider. The tagged OIDC role trusts only the immutable repository/environment subject for `production` on `main`.
- ACM certificate `arn:aws:acm:us-east-1:754246170171:certificate/0b912086-a718-4faf-b3d2-f3e8250a55e4` is ISSUED. Its `us-east-1` location is required for CloudFront custom-domain certificates.
- GitHub Actions run `37672593182` deployed private S3 and the global CloudFront distribution. Follow-up run `37674732291` updated the `ProvisioningStatus=Deployed` tags. Stack `fitwise-static-site` is `UPDATE_COMPLETE`, bucket `fitwise-static-site-754246170171-eu-north-1`, distribution `EY0IX2NYZEEG1`, default hostname `d1qzsj88vccaey.cloudfront.net`.
- CloudFront smoke: representative pages/sitemap/robots and IndexNow key return 200, HTTP redirects to HTTPS, unknown routes return 404, S3 direct access returns 403, and security/cache headers plus project tags are correct. IndexNow change notification ran; optional GSC API step was skipped.
- Cloudflare apex CNAME is configured; `https://fitwise.stream` returns 200 with the apex canonical and redirects HTTP to HTTPS. GA4 `G-J10W58E2ZL` now runs on the apex. No consent UI exists. Search Console/Bing/Yandex properties remain pending owner setup.
- T022 and T023 are DONE; the T024 production smoke and DNS steps have now passed. Search-engine properties are recorded as owner-operationally-pending.

### 2026-10-07 — T024 custom domain and production smoke (DONE)

- Cloudflare apex CNAME `@ -> d1qzsj88vccaey.cloudfront.net` resolves DNS-only. The apex HTTPS page returns 200; HTTP redirects to HTTPS; root canonical points to `https://fitwise.stream/`.
- The CloudFront distribution, ACM certificate, security headers, private S3 block, sitemap/robots, dynamic route rewrite, and actual 404 were checked on the production hostname. The IndexNow key is served and deployment notifications completed.
- GSC/Bing/Yandex account/property verification remains owner-operationally-pending. The optional GSC API step is skipped until the owner adds service-account/property configuration; no credentials are stored in the repo.
- `npm run verify` passes with 153 tests; all T001-T024 are done, implementation/deployment progress 100%. No T025 task card currently exists.

### 2026-10-07 to 2026-10-08 — T025 www hostname support (DONE)

- Updated the ACM request workflow to require both `fitwise.stream` and `www.fitwise.stream`, request both SANs, and print DNS validation records for both hostnames. It requests with `project=fitwise` alone, then adds `Project=FitWise` separately.
- The first dual-SAN request was denied when it submitted two differently-cased tag keys. The next attempt exposed ACM's additional `AddTagsToCertificate` authorization for tags embedded in `RequestCertificate`; the role policy was corrected through the existing `fitwise-github-oidc` CloudFormation stack and now separately authorizes the initial lowercase tag.
- Added `www.fitwise.stream` to CloudFront and a viewer-request 301 redirect to the apex that preserves path, single-value queries, and multi-value queries. Added offline infrastructure and redirect regression checks. T025 commits through `c55cf63` are published.
- ACM workflow run `37699499456` succeeded; apex and `www` validations are both `SUCCESS`, and certificate `arn:aws:acm:us-east-1:754246170171:certificate/d8916f6d-31f8-4696-b3fb-b6594c4b8df5` is `ISSUED`.
- Production deployment run `37744144860` completed. Stack `fitwise-static-site` is `UPDATE_COMPLETE`; distribution `EY0IX2NYZEEG1` is `Deployed` with both aliases and the dual-name certificate. The DNS-only Cloudflare `www` CNAME was added; live HTTPS returns 301 with path/query preserved and the apex returns 200.
- During rollout, IAM policy was corrected and the `UPDATE_ROLLBACK_FAILED` stack was recovered before the successful retry. Fixes are tracked in commits `4c9b0f4`, `7a4a11f`, and `c55cf63`.
- `npm run verify` passes with 155 tests, type/lint/format, the 38-page build, SEO/link/route/content checks and offline infrastructure validation; both CloudFormation templates pass `sam validate --lint`.

### 2026-10-08 — T026 content and internal SEO upgrades (DONE)

- Rebuilt the 140 cm desk matrix from sourced desk/display entities and geometry rules. It now distinguishes derived screen-only estimates from model-specific outer widths, reports physical footprint and margin-adjusted width, and cites the input sources.
- Updated Queen and US/UK King room-fit answers with market-specific computed planning dimensions. The copy calls these recommendations rather than legal minima and explicitly excludes unmeasured bed frames, furniture, doors and circulation.
- Added curated content navigation from Home, workspace/bedroom hubs, the 140 cm matrix and generated fit guides. Noindex pages now show a useful cluster breadcrumb but emit no canonical or breadcrumb structured data.
- Cross-linked the existing indexable US/UK bed references and updated material `lastmod` dates. Sitemap remains four indexable URLs; enriched noindex guides stay excluded pending search-demand/SERP-gap evidence.
- `npm run verify` passes with 161 tests, the 38-page build, SEO/link/route/content validators and infrastructure validation. Core commit `5f283fe` and bed-comparison correction `51d2021` are pushed and deployed by runs `37757168827` and `37758357733`.
- Public checks confirmed the desk/bed copy and links, the four canonical/indexable sitemap URLs with updated `lastmod`, and noindex exclusions. IndexNow notification succeeded; Search Console API submission was skipped because owner credentials are not configured.
- The live King-vs-Queen comparison now gives market-specific clear-space rectangles and excludes frame/furniture assumptions from any minimum claim.

### 2026-10-08 — T027 audit fixes and furniture examples (DONE)

- Corrected P026/P031 titles to distinguish US Full, UK Standard Double and US Queen. Replaced the inaccessible OSHA distance citation with CCOHS guidance; the bed-foot allowance is explicitly a FitWise assumption, separate from the sourced side clearance.
- Added sourced noindex static guides for Aeron Size B chair footprint, Samsung M7 stand/body depth, a standalone US PAX/GRIMO door-sweep example, HEMNES drawer extension and two HEMNES bedside-table footprint examples. UK MALM frame overhang now uses sourced outer-frame dimensions; fractional-inch dimensions are converted and rounded to whole mm.
- All new examples distinguish physical footprints from movement/standing/walking clearance; no universal minimum is asserted. P038 and draft room-size pages remain unbuilt; sitemap remains four URLs.
- `npm run verify` passes with 169 tests, 43-page build, 42 route/link checks, four canonical sitemap URLs and zero dataset warnings. Live FitCheck keyboard QA passes; mobile Lighthouse lab scores are 100 for performance/accessibility/best practices on sampled pages. New noindex pages return Lighthouse SEO 66 only for the intended crawlability block.

### 2026-10-08 — T028 technical SEO metadata audit (IN PROGRESS)

- Audited title/description, canonical, robots, Open Graph, Twitter, locale, BreadcrumbList, sitemap and redirect behavior across live indexable and noindex route types.
- The US and UK bed-size reference pages now have reciprocal `en-US`/`en-GB` hreflang, self-reference, canonical targets and matching Open Graph locales. Noindex routes remain excluded from canonicals/hreflang/structured breadcrumb data and the sitemap remains four URLs.
- Search Console query/index coverage remains owner-unverified; no indexability changes were made. Bing results were broad/ambiguous and DuckDuckGo automated retrieval was challenged.
- `npm run verify` passes with 170 tests; SEO validation checks hreflang reciprocity and canonical targets. T028 code is local and awaits push/deploy plus live alternate-tag verification.
- The owner chose to keep GA4 active; the missing privacy notice/consent gate remains a known future defect, not a resolved compliance item.

### 2026-10-06 — T020 accessibility, performance and manual QA (DONE)

- Ran Lighthouse mobile on Home, Workspace FitCheck, Bedroom FitCheck, monitor chart, and US bed chart; desktop on Workspace FitCheck. Every audited page scored 100 Accessibility, Performance, and Best Practices. Indexable pages scored 100 SEO; FitCheck landing SEO score 66 is expected because those routes are intentionally noindex pending indexable publication envelopes.
- Mobile Workspace/Bedroom LCP was 1.2s with CLS 0 and TBT 0ms; desktop Workspace LCP was 0.3s with CLS 0 and TBT 0ms. Local lab measurements only, not field CWV.
- Headless Chrome keyboard QA verified initial skip-link focus/activation, tab order, theme/unit toggle keyboard controls, disclosure toggling, input error state/description association, and polite fit-result announcement on both hubs.
- Reviewed mobile screenshots for Workspace and Bedroom and desktop Workspace; validated actual unknown-route HTTP 404 plus sitemap/robots. Found and fixed unstyled generated SVG markup (black blocks), insufficient dark-mode contrast on advanced-summary controls, skipped assumption heading level, and missing live/field error announcements.
- Findings, intended noindex deviation, Lighthouse metrics, and screen-reader limitation are documented in `QA_REPORT.md`. Screen-reader use was unavailable; Lighthouse accessibility and keyboard-event QA passed.
- `npm run verify` passes (130/130 tests), including type/lint/format, 20-page production build, dataset validation (0 errors/warnings), SEO/link/routes. Existing non-blocking `tseslint.config` deprecation hint remains. No architecture change; T021 is now active.
