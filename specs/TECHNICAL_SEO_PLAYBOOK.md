# Fitwise.stream — Technical SEO / Crawlability Specification

**Version:** 0.2.0 | **Status:** Mandatory build contract | **Owner:** implementation agent | **Reviewed:** 2026-10-06

Applies to Google, Bing, Yandex and standards-based search crawlers. Search engine behavior may change; recheck linked official documents during deployment and major revisions. SEO makes pages eligible and understandable; it does **not** guarantee ranking or indexing.

## 1. Canonical hostname and URL policy

- Preferred public origin: `https://fitwise.stream` (apex, HTTPS). Preferred page paths use lowercase kebab-case with a **trailing slash**: `/workspace/desk-size-for-dual-monitors/`. Home is `/`.
- Make HTTP and `www.fitwise.stream` redirect in a single permanent step to the corresponding HTTPS apex URL; never serve duplicate HTML across hosts.
- Choose a single URL for each answer. Do not create URL variants by changing only dimensions/units/wording; distinguish separate user intents and ensure useful unique content.
- `rel="canonical"` must be an **absolute self-canonical URL** for each published indexable page. It must match the sitemap URL and resolve to a 200 page after at most one redirect; no canonical chains.
- A canonical is a **hint** not an access restriction. For truly removed content, use an appropriate redirect or genuine 404/410. For visible non-indexable content, use `noindex` if appropriate.
- Query strings used for UI state (`?unit=imperial` etc.) are not new indexable URLs. Canonicalize to the clean URL. No SEO-critical answer is available only through JavaScript/query parameters.
- Build and verify path rewrites for S3 + CloudFront: `/workspace/example/` must serve `/workspace/example/index.html` with `200 text/html` and must **not** return S3 AccessDenied, homepage HTML, a 302 chain, or 200 soft-404. Keep literal asset routes (`/robots.txt`, `/sitemap-index.xml`, CSS, images, IndexNow key) unaffected. CloudFront Functions may be used if needed; do not put Lambda in regular HTML rendering.
- Real missing pages must return HTTP 404. Private S3 may return 403 for absent keys; ensure CloudFront maps missing-site-object failures to genuine 404 **without masking unrelated origin permission faults**. Test missing URLs in production separately.

## 2. Publication model — one source of truth

`PageIntent` should be extended with a **publication envelope** (implementation in T004/T014, do not break existing schema):

```ts
interface SeoPublication {
  indexable: boolean; // true only if status='published'
  title: string;
  description: string;
  h1: string;
  canonicalPath: string; // same as PageIntent.route
  publishedOn: string; // YYYY-MM-DD, editorially accurate
  significantlyModifiedOn?: string; // YYYY-MM-DD, update only on material change
  breadcrumbIds: string[]; // stable ancestor intents; not just URL segments
  relatedPageIds: string[]; // only published routes
  market?: 'US' | 'UK' | 'EU' | 'AU' | 'global';
  language?: string; // initial default 'en'; use real locale variants only
  imagePath?: string;
  sourceIds: string[];
  intentEvidence?: string; // source/research for standalone URL
}
```

- `draft`, `deferred`, and `deprecated` routes MUST NOT be built into the public publish set or appear in sitemaps.
- If a future preview page must be publicly reachable, add a crawlable `noindex` directive and never put it in a sitemap. **Prefer an access-controlled private preview**; robots.txt alone does not protect it or remove it from search.
- Publish set is built from the same validated records used for routes, sitemaps, canonical, breadcrumbs and internal links. **No manually maintained list of sitemap URLs.**
- The site should have a real HTML `<a href>` route from category hubs/navigation to every indexable decision page; don't rely only on onclick handlers or client-only rendering for crawl discovery.

## 3. Sitemap rules and automatic maintenance

- Preferred stable entry point: `/sitemap-index.xml` (if an index is emitted by Astro tooling) **or** `/sitemap.xml` (if one sitemap). Pick exactly one authoritative entry in `robots.txt`, link documentation and verification tests. A sitemap index may link multiple segmented XML sitemaps.
- Regenerate sitemaps automatically **on every successful production build**, using the published canonical URL set, not a manually edited XML file. New publishes add entries; deprecations/removals delete them; renames replace them.
- Include only HTTPS absolute canonical URLs on the same site that are published, indexable, intended to return 200, and not robots-blocked; deduplicate and XML-escape. Avoid query-state variants, redirects, noindex URLs, 404s and staging hosts.
- XML must be well-formed and UTF-8. Keep each XML sitemap <=50,000 URLs AND <=50MB uncompressed; split and index when needed. Ensure sitemap endpoint returns `200 application/xml` or compatible XML MIME type.
- `<lastmod>` is **only** `significantlyModifiedOn` or `publishedOn` from trustworthy source history (or omit when unknown), never `new Date()` at every deploy. Material changes: principal answer, dataset used, methodology, structured data or meaningful internal links. Cosmetic build changes and copyright year do not change lastmod.
- Google ignores sitemap `<priority>` and `<changefreq>`; omit them. Avoid conflicting hints even though other engines may accept them.
- Submit the same sitemap index/entry to Google Search Console, Bing Webmaster Tools and Yandex Webmaster after first deploy; robots.txt should point to it. Submitting is discovery assistance, NOT indexation guarantee.
- Keep a deploy-diff manifest `added`, `materiallyUpdated`, `removed`, `unchanged`. This drives IndexNow for Bing/Yandex and prevents spamming submissions for unchanged pages.

## 4. robots.txt and indexing rules

Production starting point (adjust sitemap filename to actual generated file):

```text
User-agent: *
Allow: /

Sitemap: https://fitwise.stream/sitemap-index.xml
```

- This is intentionally permissive. No `Disallow: /` in production. Never block static JS/CSS/image assets required to render/index pages. No unsupported `noindex` directive in robots.txt.
- `robots.txt` is **crawl control, not an access-control mechanism** and not a dependable way to deindex a page. `noindex` HTML or `X-Robots-Tag` must be visible to crawlers; don't simultaneously block the URL via robots.txt.
- If later a specific internal area is excluded from crawling, justify that change in an ADR and test Googlebot/Bingbot/Yandex access to published pages.
- Do not add bespoke per-bot directives by default; reducing exceptions avoids subtle accidental blocks. Test that `/robots.txt` is UTF-8 plaintext, status 200, and its Sitemap URL exists.
- Public staging should be avoided; if it exists, protect with authentication rather than trusting robots. Local development isn't public and does not need crawler submission.

## 5. Page head, HTML and discoverability

Every published page:

- `<html lang="en">` initially; use truthful `en-GB`/`en-US` only if page language/market warrants; geo-specific sizes need clear labels.
- Distinct descriptive `<title>` and one visible H1 matching the decision answered. Write human-focused title/snippet; no fixed character-count gaming.
- Clear meta description summarizing the concrete result/visual benefit; Google/Bing may rewrite snippets.
- Self canonical link; viewport meta; suitable favicon; Open Graph/Twitter metadata using crawlable static image where feasible.
- Meaningful information in build-time HTML: the answer, representative values, methodology, source context, headings, table/matrix, _and crawlable internal anchor links_. Browser JS enhances interactive inputs; it cannot be the only way to see SEO-significant content.
- Descriptive alt text for informative images; accessible fallback text/numeric table for scale-aware SVG. Named page images have correct sizes/alt, are not lazy-loaded when essential above the fold, and are optimized.
- Avoid generic generated introductions and superficial pagination. Every page has at least one differentiated data-backed diagram, decision matrix or fit explanation.
- Logical heading hierarchy, mobile-friendly layout, fast loading, low script weight, no intrusive overlays, no broken links, accessible navigation.

## 6. Breadcrumbs and structured data

Visible trail + JSON-LD must derive from **one typed breadcrumb tree**. Example:

```text
Home  >  Workspace  >  Desk size for two 27-inch monitors
```

- Each noncurrent visible crumb is an HTML anchor to a published, accessible, indexable ancestor.
- JSON-LD `BreadcrumbList` uses `itemListElement` ordered `ListItem` values with contiguous `position` starting at 1, human-readable `name`, and absolute canonical `item` URLs where provided. At least two entries for a rich-result-eligible trail. Do **not** claim invented sections.
- For published pages use truthful `WebPage` and `BreadcrumbList`, plus `WebSite` on homepage if valid. Do not fabricate `Organization`, `Person`, expert credentials or reviews. `Article` only if genuinely article-like. `FAQPage` only when content is visible and current eligibility warrants; not a growth hack. No fake rating/star schema or misleading `SoftwareApplication` metadata for general reference pages.
- Use a JSON serializer that safely escapes `<` so untrusted values cannot break out of a `<script type="application/ld+json">` element. Assert parsed JSON matches visible breadcrumb names/URLs.
- Verify sample pages with schema.org Validator and Google's Rich Results Test after publication, acknowledging no rich-result guarantee.

## 7. Locale/market strategy

- MVP: one English URL per distinct intent, with unit toggle on same canonical page. Do not deploy parallel URLs solely for centimetres/inches.
- Bed dimensions differ between US/UK and other markets. Clearly identify which measurement standard is being applied. For true distinct market-specific pages with substantively different answers, choose separate canonical URLs and later implement verified reciprocal `hreflang` entries. Do **not** output hreflang to non-existent translations/localizations.
- Compare `x-default`, canonical and hreflang relationships only when real locale variants exist. No invented localization for SEO coverage.

## 8. URL changes / removal lifecycle

- Editorial record changes: `draft → published` (add HTML/sitemap, fresh accurate published date); `published → revised` (only material revisions update lastmod); `published → renamed` (301 old URL to closest relevant new URL; update internal links, canonical and sitemap); `published → merged` (301 redundant page into relevant surviving answer); `published → removed` (404 or 410 when technically supported, no redirect to unrelated homepage); `published → deferred` (stop publishing, decide 301 vs 404/410).
- Store permanent redirect mapping as versioned data. Test no redirect loops, multi-hop chains, site-wide generic 200 fallback, or non-existent destinations.
- Update affected breadcrumb and related links. For site changes requiring search update: submit changed URLs through applicable webmaster tools / IndexNow **only after successful production deploy**.

## 9. Metrics and ongoing operations

- Set up GSC, Bing Webmaster Tools, Yandex Webmaster after live verification. Inspect index coverage/sitemap errors and organic queries with a 28-day window; segment by cluster, page family, market and device where available.
- Priority order: indexing/technical faults → high-impression low-ranking pages → weak CTR where ranking justifies it → new related query topics. Keep a before/after changelog for each substantive SEO change.
- No guarantee of clicks/indexation from passing tests; track actual indexing, click and conversion behavior.

## Official references

- Google sitemaps: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google canonicalization: https://developers.google.com/search/docs/crawling-indexing/canonicalization
- Google robots/noindex: https://developers.google.com/search/docs/crawling-indexing/robots/intro and https://developers.google.com/search/docs/crawling-indexing/block-indexing
- Google breadcrumbs: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- Google structured data: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google JavaScript SEO: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Bing sitemaps: https://www2.bing.com/webmasters/help/sitemaps-3b5cf6ed
- Bing robots: https://www.bing.com/webmasters/help/how-to-create-a-robots-txt-file-cb7c31ec
- Yandex sitemaps: https://yandex.com/support/webmaster/en/controlling-robot/sitemap
- Yandex robots: https://yandex.com/support/webmaster/en/controlling-robot/robots-txt
- Yandex canonical: https://yandex.com/support/webmaster/en/robot-workings/canonical
