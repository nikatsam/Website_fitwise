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
