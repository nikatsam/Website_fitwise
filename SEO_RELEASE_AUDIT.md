# SEO Release Audit — Local v1 Candidate

Release ID / commit: `local-v1-2026-10-06` (uncommitted worktree)  
Date: 2026-10-06  
Reviewer: **Project owner — sign-off confirmed through authenticated user interaction on 2026-10-06 17:32 UTC; personal display name was not supplied**

> This audit reflects the current offline page-family coverage build and is signed off by the project owner. Production-only checks below remain unperformed and must be completed after deployment.

## Offline checks

- [x] `npm ci` passed (389 packages, 0 vulnerabilities). `npm run verify` passed; `npm run validate:seo` passed (4 sitemap URLs, 4 indexable canonical pages); `npm run validate:content` passed (production dataset, route envelopes, sources, metadata).
- [x] Static build contains pre-rendered content/answers. The coverage gate classifies all 41 intents as 29 generated, 6 explicitly deferred, and 6 drafts; draft/deferred routes are absent. Route smoke covers representative manual and data-driven answer families, Home, hubs, and 404.
- [x] Published canonical/sitemap lists match: homepage plus monitor, US bed-size, and UK bed-size reference pages.
- [x] Draft/deferred routes are not built/published; generated calculation-family routes are `noindex` pending editorial review. Sitemap remains limited to Home and the monitor, US bed-size, and UK bed-size reference pages. No duplicate/cross-host canonicals.
- [x] `lastmod` is derived from stable editorial dates (`publishedOn`/`significantlyModifiedOn`), not build time. Two successive `npm run seo:diff` comparisons around a no-op build reported all four URLs `unchanged`.
- [x] `robots.txt` returns 200 `text/plain`, points to the generated sitemap, and has no blanket `Disallow: /`. Sitemap returns 200 `text/xml`.
- [x] `validate:seo` confirms unique canonicals, matching visible/JSON-LD breadcrumbs, valid structured data, and indexable-page metadata.
- [x] `validate:links` passes on all 37 HTML routes. Preview returns 200/text-html for representative new families, 404 for the deferred laptop route, and correct sitemap/robots MIME/status. `data/redirects.json` is empty.
- [x] Titles, H1s, descriptions, measurement dimensions, market labels and assumptions are statically rendered and pass the production content validator. Search measurements use registered source provenance.
- [x] Scale-diagram alternatives and rendered diagram styling reviewed. Lighthouse mobile/desktop and headless keyboard testing completed; detailed findings are in `QA_REPORT.md`.
- [x] Previous local manifest delta: added=[], materiallyUpdated=[monitor chart, US bed chart, UK bed chart], removed=[], unchanged=[homepage]. A new baseline was recorded; a no-op rebuild reported all four URLs unchanged.
- [x] `npm run deploy:plan` reports 45 production objects, excludes the three `/dev/` previews, and makes no AWS calls.
- [x] Mobile Workspace/Bedroom and desktop Workspace family pages score 100 for Accessibility and Performance in Lighthouse. SEO 66 is the expected noindex result; indexing remains an editorial decision.

## Production-only checks (after separately authorized AWS deployment)

- [ ] Apex HTTPS/host redirects, CDN rewrites, production route MIME/status, live 404/redirect behavior, WAF/cache headers, search-engine properties/submission, IndexNow, and live monitoring. **Not run. The T022 IAM OIDC role bootstrap exists; no Fitwise S3 bucket/CloudFront site stack, certificate request, Cloudflare DNS change, or public site endpoint has been created.**

**Outcome:** LOCAL GATE E PASS — AWS phase authorized; no site deployment performed by this audit.

**Evidence:** Local checks above, `QA_REPORT.md`, route-disposition manifest, and owner sign-off recorded in this session.

**Remaining work:** T022-T024 provisioning, DNS/TLS, production smoke tests, and search-engine onboarding remain pending. `PROJECT_STATE.json` permits the AWS phase; this does not indicate resources are already deployed.
