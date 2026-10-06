# Search Engine Registration, Submission and Monitoring Runbook

**Status:** Post-deploy operational checklist, with offline preparation possible. **Never request or require Google/Bing/Yandex credentials for local build or tests.**

## Pre-launch / local rehearsal

1. Confirm canonical origin `https://fitwise.stream` and one sitemap entry URL.
2. Generate a complete static `dist/` artifact and run offline SEO audit (`specs/SEO_AUTOMATED_GATES.md`).
3. Save a deterministic published-page manifest and deploy-change manifest locally. IndexNow API calls remain disabled.
4. Verify AWS IaC will route all trailing-slash HTML pages correctly and preserve raw `.xml`, `.txt`, key-file and asset endpoints.
5. Plan free account setup and domain DNS verification. No search-console API keys go into frontend bundles.

## First live launch: ordered sequence

1. Deploy and verify TLS and canonical hostname. `GET /robots.txt`, `/sitemap-index.xml` (or selected sitemap), at least one leaf page and a true missing page; confirm 200/404 and content types. Confirm no `noindex` nor `Disallow: /` on live indexable routes.
2. **Google Search Console**: verify domain property using DNS if possible, submit generated sitemap URL, inspect sample indexable pages with URL Inspection; watch indexing/Pages/Crawl Stats and Search results performance. Domain verification is a human/account step. Ordinary Fitwise pages must **not** use Google's restricted Indexing API. Google does not accept IndexNow as a normal sitemap alternative.
3. **Bing Webmaster Tools**: add and verify property (Google import option when appropriate), submit sitemap, inspect crawl/indexing reports and SEO diagnostics. Configure IndexNow as described below.
4. **Yandex Webmaster**: add/verify site, submit sitemap or rely on robots Sitemap directive, inspect indexation/robot errors. Yandex supports IndexNow; do not assume instant inclusion.
5. Record sitemap acceptance status, verification dates, notable errors and owner in `WORKLOG.md`. Keep actual credentials outside repo.

## IndexNow (Bing + Yandex / participating engines)

- Intended purpose: notification that a **public canonical URL** was added, materially updated or removed after a successful deploy. Not a ranking signal and not guaranteed indexation.
- Generate a domain-ownership key in the supported format and host the exact matching UTF-8 text key file at a stable **publicly reachable** path on `https://fitwise.stream/` (commonly root). The key file is publicly retrievable by design; do not confuse it with a secret. Do not embed private webmaster account tokens in build output.
- Build an optional **post-deploy-only** script using IndexNow protocol: read committed deploy-diff manifest, filter to our canonical HTTPS host, deduplicate, batch responsibly, submit to an IndexNow-capable endpoint, handle response codes and retries, log aggregate results without credentials.
- Never submit local/staging URLs, unpublished pages, routine unchanged pages or huge artificial URL permutations. Suppress repeated no-op submissions.
- Do not send Google normal pages through IndexNow or the Google Indexing API.
- If automatic submission can't be configured at first launch, manually submit sitemaps and record the IndexNow task as a non-blocking operations follow-up; core static product must not depend on external indexing endpoints.

## New publish / revision / redirect cycle

1. Agent changes `PageIntent` and factual data with provenance.
2. Validate status and uniqueness; regenerate HTML, breadcrumb hierarchy, canonical URL, related links and sitemap automatically.
3. Material change? Update `significantlyModifiedOn` with an accurate date and reason. No material change? Keep original.
4. For renames, update redirect registry and test old URL → new canonical. For removals, remove from sitemap and links; choose 301 or honest 404/410.
5. `npm run verify` must run entirely offline and detect violations; publication review approves release.
6. Deploy static artifact. Verify live URLs, then optionally notify IndexNow of changed URLs and check engines' webmaster diagnostics.
7. Record affected IDs, before/after URL, status, date, sources, deployed commit and validation result in worklog.

## Routine 28-day review

Use `templates/SEARCH_PERFORMANCE_REVIEW.md` to capture:

- Google/Bing/Yandex organic clicks, impressions and CTR **per engine** where available (not combined as if identical definitions), query and page changes.
- indexed/submitted counts, excluded reason categories, fetch/crawl issues, unexpected canonicals and soft 404s.
- best performing workspace/bedroom clusters, queries in roughly positions 5–20, unexpected intent families, missing user answers.
- competing pages / SERP feature changes, whether the SERP provides an immediate zero-click answer, actual opportunities versus estimated traffic.
- top 3 content improvements and any content that should merge instead of spawning a near-duplicate.

**Decision rules are heuristics, not engine instructions**: 1,000 impressions and position 5–20 → optimize before new route; significant impressions on distinct intent → research a dedicated page; two competing canonical pages for same intent → consolidate; many URLs not indexed → investigate quality/indexability before mass-publishing. Small samples require longer observation.

## Official references

- GSC sitemap submission: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Bing Webmaster sitemaps: https://www2.bing.com/webmasters/help/sitemaps-3b5cf6ed
- Bing IndexNow: https://www2.bing.com/indexnow/getstarted
- Bing URL submit/IndexNow priority: https://www.bing.com/webmasters/help/url-submission-62f2860b
- Yandex Webmaster sitemap: https://yandex.com/support/webmaster/en/indexing-options/sitemap
- Yandex IndexNow: https://yandex.com/support/webmaster/en/indexing-options/index-now
