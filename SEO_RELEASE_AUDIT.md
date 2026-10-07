# SEO Release Audit — FitWise v1

Release ID / commit: `a3170de9443219caa414ca5dcb8728183fe3258e`<br>
Local gate date: 2026-10-06; production smoke date: 2026-10-07<br>
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

## Production Checks — 2026-10-07

- [x] Site stack `fitwise-static-site` is `UPDATE_COMPLETE` in `eu-north-1`; bucket `fitwise-static-site-754246170171-eu-north-1` is private/tagged, and CloudFront distribution `EY0IX2NYZEEG1` is `Deployed` with alias `fitwise.stream`, TLS minimum `TLSv1.2_2021`, and tag `project=fitwise`.
- [x] The issued apex ACM certificate is in `us-east-1`, as required by CloudFront. S3 Block Public Access, SSE-S3, versioning, OAC and the origin policy are active.
- [x] CloudFront default host `d1qzsj88vccaey.cloudfront.net` returned 200 for Home, workspace/bedroom hubs, representative static answer pages, sitemap (`application/xml`), robots (`text/plain`), and the IndexNow key; HTTP returned 301 to HTTPS; an unknown route returned 404; direct S3 access returned 403.
- [x] Live response headers include CSP, HSTS, nosniff, DENY framing, Referrer-Policy, and Permissions-Policy. The 4-URL indexable sitemap and route disposition policy remain intact.
- [x] GitHub OIDC deployment runs `37672593182` and `37674732291` completed. IndexNow change notification completed; optional Search Console API submission was skipped because no service-account/property values are set.
- [x] Cloudflare apex CNAME `@` -> `d1qzsj88vccaey.cloudfront.net` (DNS only, TTL Auto) resolves. `https://fitwise.stream/` returns 200 with the apex canonical; HTTP redirects to HTTPS. Host-gated GA4 is enabled on this hostname.
- [x] Google Search Console, Bing Webmaster, and Yandex status is recorded as **operationally pending**; their account/property verification requires owner access. Search Console API resubmission remains disabled until its service account/property variables are configured.

**Outcome:** PASS — production site is live on the custom apex with HTTPS. Search-engine property verification is operationally pending owner access.

**Evidence:** Workflow runs above, live HTTP checks, AWS stack/resource reads, `QA_REPORT.md`, route-disposition manifest, and Gate E sign-off.

## Follow-up — T025 www hostname (in progress)

- The production evidence above applies to `fitwise.stream` only. The deployed certificate and CloudFront aliases currently cover the apex only; `www.fitwise.stream` is not configured or verified.
- Commits `7659715`, `f6f0a66`, and `c2e5c51` publish the dual-name ACM request workflow, CloudFront alias and permanent apex redirect with path/query preservation. The scoped OIDC policy update is deployed, but the CloudFront changes are not yet deployed.
- ACM certificate `arn:aws:acm:us-east-1:754246170171:certificate/d8916f6d-31f8-4696-b3fb-b6594c4b8df5` is `PENDING_VALIDATION`: apex validation is `SUCCESS`; the `www` validation CNAME remains pending owner action in Cloudflare. GitHub `ACM_CERTIFICATE_ARN`, CloudFront deployment, the DNS-only `www` traffic CNAME, and HTTPS redirect smoke checks remain pending.
