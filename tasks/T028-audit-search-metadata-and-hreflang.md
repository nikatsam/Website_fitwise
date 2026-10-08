# T028 — Audit search metadata and hreflang

**Phase:** SEO/QA
**Dependencies:** T027

## Objective

Audit public SEO metadata, canonical/robots behavior, breadcrumb markup, sitemap
and engine-submission signals. Add reciprocal US/UK hreflang without changing
the existing indexability gate.

## Steps

- [x] Inspect live title/description, canonical, robots, Open Graph, Twitter, language, structured data and breadcrumb output.
- [x] Verify HTTP/HTTPS/www redirects, sitemap, robots, DNS and true-404 behavior.
- [x] Confirm noindex guides emit no canonical/hreflang/breadcrumb JSON-LD and remain outside the sitemap.
- [x] Check Search Console credentials/query access; none are configured. Record public SERP observations without inferring volume.
- [x] Add reciprocal `en-US`/`en-GB` hreflang and matching Open Graph locales for the published US/UK bed-dimension pages.
- [x] Add local regression validation for self-reference, canonical targets and reciprocal hreflang.
- [x] Commit/push, deploy through GitHub OIDC, and verify live hreflang tags and unchanged sitemap.

## Acceptance criteria

- [x] Indexable pages keep absolute HTTPS apex self-canonicals and truthful WebPage/BreadcrumbList data.
- [x] Hreflang alternates target published indexable canonical pages and point back reciprocally.
- [x] Robots remains permissive and references the generated sitemap; the sitemap remains four canonical URLs.
- [x] Production output matches the verified local hreflang output.

## Guardrails

- Do not claim Google/Bing/Yandex indexation based on metadata tests, IndexNow or sitemap submission.
- Do not emit hreflang for noindex, draft or deferred routes.
- Search Console query data remains owner-only; no new pages are promoted without it and a human SERP-gap review.
