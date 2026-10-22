# Architecture Decision Record

Accepted decisions are authoritative unless superseded by a later ADR.

## ADR-001 — Static-first Astro

**Status:** Accepted  
**Decision:** Use Astro with static output as the site generator. TypeScript is mandatory.  
**Rationale:** The product consists primarily of structured reference pages and deterministic client-side calculations. Static output minimizes runtime cost, operational burden and failure modes.  
**Consequences:** No server-side rendering in v1. Interactive components must progressively enhance static HTML.

## ADR-002 — No frontend framework in v1

**Status:** Accepted  
**Decision:** Use Astro components plus vanilla browser TypeScript/JavaScript.  
**Rationale:** The initial interactions are forms, toggles and deterministic diagrams; React/Vue/Svelte would add bundle and conceptual overhead without clear benefit.  
**Revisit trigger:** A future interaction becomes significantly harder to implement/test maintainably without a component runtime.

## ADR-003 — Millimetres as canonical linear unit

**Status:** Accepted  
**Decision:** Store and calculate linear dimensions in millimetres.  
**Rationale:** Avoid conversion drift and support metric/imperial display consistently.

## ADR-004 — Build-time validated local data

**Status:** Accepted  
**Decision:** Store initial data in version-controlled local files and validate schemas at build/test time.  
**Rationale:** No database is required for the initial dataset or traffic model.

## ADR-005 — Private S3 + CloudFront OAC for production static hosting

**Status:** Accepted  
**Decision:** When deploying to AWS, use a regular private S3 bucket as CloudFront origin with Origin Access Control. Do not expose the S3 website endpoint publicly.  
**Rationale:** AWS recommends OAC for restricting S3 origins to CloudFront; it preserves HTTPS and keeps the bucket private.  
**Reference:** https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html

## ADR-006 — No Lambda in normal page path

**Status:** Accepted  
**Decision:** HTML generation happens at build time; Lambda/API Gateway cannot be required for ordinary page viewing.  
**Rationale:** Maintain static reliability and keep traffic cost predictable.

## ADR-007 — Publish pages selectively

**Status:** Accepted  
**Decision:** Do not automatically publish every entity × space permutation. Use hub/matrix pages until search/user evidence justifies a dedicated URL.  
**Rationale:** Prevent thin-content and crawl-space explosion.

## ADR-008 — Local-first development gate

**Status:** Accepted  
**Decision:** No AWS resource creation until the local acceptance criteria are complete.  
**Rationale:** Keep development reproducible and avoid cloud dependency/cost while the product model is still changing.

## ADR-009 — SEO publishing is deterministic and static

**Status:** Accepted | **Date:** 2026-10-06
**Decision:** PageIntent publication metadata is the sole source for indexable HTML, canonical, structured breadcrumbs, related links, XML sitemap and significant-update date; testing is offline, engine submission is post-deploy.
**Rationale:** Prevent drift between robots/sitemap/canonical links and keep local-first workflow safe.
**Consequences:** `validate:seo`/`seo:diff` and editorial publication envelopes are mandatory; separate engine ops for Google/Bing/Yandex. Refer to `specs/TECHNICAL_SEO_PLAYBOOK.md`.

## ADR-010 — Light/dark theme toggle via data-attribute + CSS custom properties, no CSS-in-JS

**Status:** Accepted | **Date:** 2026-10-06
**Decision:** Implement visual theming with CSS custom properties scoped under `:root` (light, default) and `:root[data-theme="dark"]` (override), switched by a small vanilla-TypeScript module that toggles the attribute and persists the choice in `localStorage`. An inline, synchronous `<head>` script sets the initial attribute before first paint (reading `localStorage`, falling back to `prefers-color-scheme`) to avoid a flash of the wrong theme.
**Rationale:** Satisfies the product owner's request for a vibrant, modern 2026 feel with both light and dark themes available immediately, without introducing a frontend framework, state library or CSS-in-JS dependency, consistent with ADR-002.
**Consequences:** All future components must source color/spacing/motion values from `src/styles/tokens.css` tokens rather than hard-coded values, so they theme correctly automatically. Fit-state colors (`--color-state-fit/-tight/-no-fit`) are reserved per theme but must always be paired with text/icon per `specs/UX_UI.md` §8 — color is never the only signal.

## ADR-011 — CloudFormation for static AWS infrastructure (proposed, offline only)

**Status:** Proposed; no AWS deployment authorization  
**Date:** 2026-10-06  
**Decision:** Use a direct CloudFormation JSON template rather than CDK for the v1 S3/CloudFront/OAC stack. The draft creates a private REST-origin S3 bucket, distribution-scoped OAC policy, ACM certificate parameter, CloudFront Function directory-index rewrite, bounded cache policies, and security headers.  
**Rationale:** The hosting topology is small and declarative; direct CloudFormation avoids another runtime/build dependency and makes the exact least-privilege bucket policy inspectable.  
**Consequences:** `infra/fitwise-static-site.template.json` is an un-deployed draft. Offline structural and SAM validation do not create resources or replace an authorized review. Do not deploy until T021's signed SEO release audit is recorded and `PROJECT_STATE.json` permits AWS work.

## ADR-012 — Locale routing and translation catalogs

**Status:** Accepted | **Date:** 2026-10-22
**Decision:** Serve each non-English language under a two-letter path prefix (`/es/`, `/ja/`, `/de/`, `/fr/`, `/zh/`, `/pt/`) from the shared `[lang]` page routes. Translations are stored as per-chunk JSON leaves keyed by a 12-hex SHA-1 of the English/Spanish source path, rebuilt into generated UI and content catalogs. UI catalogs load per locale through `import.meta.glob`, so each language downloads only its own strings; content catalogs are generated at build time.
**Rationale:** Keeps every page static (ADR-001, ADR-006) and avoids a runtime translation service or framework. Stable IDs let source text change without silently mis-translating, because the catalog test fails on missing, unknown or placeholder-mismatched leaves.
**Consequences:** Adding or editing wording means editing the chunk JSON, running `I18N_WRITE=1 npx vitest run tests/unit/i18n-catalogs.test.ts`, then `npm run verify`. Placeholders such as `{x}` and `{{x}}` must survive translation. Sitemap, hreflang and validators cover all locales; the regional bed pages keep `en-US`/`en-GB` and `es-US`/`es-GB` alternates only. Translated cited source titles intentionally stay in their original language.

## ADR-013 — Pin GitHub Actions to commit SHAs

**Status:** Accepted | **Date:** 2026-10-22
**Decision:** Every `uses:` in `.github/workflows/` references an exact commit SHA with the release tag in a trailing comment. Releases must be at least two weeks old when adopted. Major-version upgrades are made only when the action's inputs still match the workflow.
**Rationale:** AGENTS.md requires immutable pins for security-sensitive actions, and the production workflow assumes AWS and Google credentials. GitHub deprecated Node 20 for actions in the runner; the upgrades keep CI on supported runtimes.
**Consequences:** Upgrading an action means resolving a new tag to its commit SHA (`gh api repos/<owner>/<repo>/git/ref/tags/<tag>`, dereferencing annotated tags) and updating the line. The deploy workflow's AWS and Google sign-in steps are exercised only on production deploys, so confirm them after any change there.

## ADR-014 — Google AdSense loaded site-wide with narrow CSP allowances

**Status:** Accepted | **Date:** 2026-10-22
**Decision:** Load `adsbygoogle.js` for publisher `ca-pub-5374485543598957` in the `<head>` of every page built from `BaseLayout`, with `public/ads.txt` authorizing the same publisher. The CloudFront response-headers policy allows Google's ad, syndication and DoubleClick hosts in `script-src`, `img-src`, `connect-src` and `frame-src`, and nothing else.
**Rationale:** AdSense requires the loader on every page and an `ads.txt` at the root to verify the seller. The CSP must allow those hosts, or the browser blocks the ads and the loader fails silently.
**Consequences:** The `ads.txt` line must match the AdSense account exactly. Because the deploy uploads only named files, any new root-level static file needs its own upload line in `deploy-production.yml`. Serving ads in the UK/EU requires a privacy notice and a consent mechanism (Consent Mode or a CMP), which are not yet implemented; any privacy page added later must be reviewed before the snippet is removed from it.
