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

## T025 www hostname (complete)

- Commits through `c55cf63` publish the dual-name ACM workflow, CloudFront alias, permanent redirect, and scoped role fixes. Deployment run `37744144860` completed; distribution `EY0IX2NYZEEG1` is `Deployed` with both aliases.
- ACM certificate `arn:aws:acm:us-east-1:754246170171:certificate/d8916f6d-31f8-4696-b3fb-b6594c4b8df5` is `ISSUED`; both validations are `SUCCESS`. A direct edge test returned `301 Location: https://fitwise.stream/workspace/what-fits-on-a-140cm-desk?units=imperial`; the apex returned `200`.
- Owner-managed Cloudflare `www` CNAME (`www` -> `d1qzsj88vccaey.cloudfront.net`, DNS only, TTL Auto) is present. Public HTTPS returned the same 301 with path/query preserved.

## T026 content and internal SEO upgrades (complete)

- Updated the 140 cm desk matrix and US Queen/US-UK King room-fit answer copy with sourced inputs, transparent calculations and explicit exclusions.
- Added curated navigation on Home, cluster hubs, desk/bed fit pages and indexable US/UK bed reference pages. Updated material sitemap `lastmod` values for the indexable references.
- Noindex routes remain absent from the four-URL sitemap and continue to omit canonical and breadcrumb JSON-LD output. Their visibility in search remains gated on documented demand/SERP evidence.
- Core T026 changes were deployed by workflow `37757168827` from commit `5f283fe`; the comparison-copy correction was deployed by `37758357733` from `51d2021`. `npm run verify` passes with 161 tests.
- Public HTML checks confirmed the upgraded content and related navigation. The four-URL sitemap includes the updated `lastmod` dates for the three materially updated indexable references; the enhanced desk and room-fit pages remain noindex and absent from the sitemap until their search/SERP release evidence is documented.
- IndexNow notification succeeded. Search Console API sitemap submission was skipped because credentials and property configuration remain owner-managed.
- The live King-vs-Queen page now describes US-market mattress footprints and recommended clear-space rectangles without presenting planning assumptions as code minimums.

## T027 audit remediation and furniture examples (complete)

- Corrected P026/P031 market labels, separated the FitWise foot-clearance assumption from cited lateral clearance, and replaced the blocked OSHA numeric claim with accessible CCOHS guidance that does not assert a universal distance.
- Added source-backed static noindex pages for chair footprint/movement, monitor stand-depth/viewing-distance, wardrobe-door swing, dresser-drawer pull-out and bed-plus-nightstand footprints. UK MALM frame allowances use measured outer dimensions; no walking or ergonomic minimums are inferred from the object widths.
- Search Console query data is unavailable; Bing SERPs were broad/ambiguous and DuckDuckGo automated fetches were challenged. Noindex status remains unchanged; draft P038 was not built and sitemap remains four canonical URLs.
- Local validation passes: 169 tests, 43-page build, 42 route/link checks, zero dataset warnings. Mobile Lighthouse is 100 for performance/accessibility/best-practices on samples; noindex SEO score 66 reflects the intentional `is-crawlable` block. Keyboard QA passes.
- Commit `962b822` was deployed by workflow `37786143468`. Public checks confirmed the new content, noindex behavior and four-URL sitemap.
- GA4 remains active without a consent gate at the owner's direction. The missing privacy/cookie notice is a recorded future issue, not a resolved compliance claim.

## T028 technical SEO audit (complete)

- Canonicals, title/description/H1, noindex behavior, breadcrumb JSON-LD, `robots.txt`, redirects and the four-URL sitemap pass local validation.
- The US and UK bed-size reference pages are reciprocal `en-US`/`en-GB` hreflang alternatives with self-references, canonical targets and matching Open Graph locales. Other pages emit no hreflang; noindex pages are excluded.
- `npm run verify` passes with 170 tests, a 43-page build and 42 internal-link routes. SEO validation confirms four canonical/sitemap URLs; generated noindex pages remain excluded.
- Commit `fc6b108` was deployed by workflow `37793826349`. Live US/UK bed-reference heads return reciprocal `en-US`/`en-GB` alternates, self-canonicals and matching Open Graph locales; robots, breadcrumb JSON-LD and the four-URL sitemap remain valid.
- Search Console account/index data remains owner-unavailable; no Google/Bing/Yandex indexing guarantee is claimed. Social preview images remain an optional follow-up; no `og:image` is currently configured.
