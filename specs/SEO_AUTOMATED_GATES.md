# SEO Automation and Acceptance Test Matrix

**Goal:** Luna can run these checks against a generated local `dist/` WITHOUT internet, cloud credentials or search console access. Tests that inherently need public HTTP are explicitly production-only.

## Offline scripts in package.json

- `npm run validate:seo` — offline, fail on metadata/route/structured-data/sitemap issues (implemented in T018).
- `npm run validate:links` — offline HTML anchor href resolution and indexable-route reachability (implemented in T018).
- `npm run validate:routes` — static smoke checks for Home, workspace/bedroom hubs, representative dedicated pages, 404, sitemap, and robots (implemented in T019).
- `npm run validate:content` — verify production dataset, generated-route envelopes, source references, and indexable metadata quality (implemented for T021).
- `npm run verify` — type/lint/format/tests, then static build, `validate:seo`, `validate:links`, `validate:routes`, and `validate:content` against the production dataset/build.
- `npm run seo:diff` — compare the current published output with the local baseline and report `added`, `materiallyUpdated`, `removed`, and `unchanged` URLs. `npm run seo:diff -- --record` stores/refreshes the ignored local baseline under `.seo/`; no network calls are made.

Avoid exact unmaintained npm dependency assumptions; use Node tests/standard parser and current Astro build tools where sensible. Commit fixtures.

The build writes `dist/sitemap.xml` and `dist/robots.txt` from indexable publication envelopes. Retired/renamed paths belong in `data/redirects.json` as `{ "from": "/old/", "to": "/current/", "statusCode": 301 }`; keep sources out of generated routes and sitemap, and ensure targets exist with no redirect chains. The initial registry is intentionally empty.

## Release-blocking offline assertions

| Gate              | Assertion                                                                                                        | Failing example                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Route inventory   | All `published && indexable` intents have exactly one built HTML route                                           | missing `dist/workspace/.../index.html`              |
| Exclusions        | Draft/deferred/deprecated URLs excluded from generated public route and sitemap                                  | `/draft/example/` present                            |
| Canonical         | Each indexable page has one absolute HTTPS self canonical on `fitwise.stream`, matching generated output URL     | canonical points at `www` or misses slash            |
| Hreflang          | Market/language alternates are published/indexable, reciprocal, self-referencing and canonical                   | UK page links to draft or nonreciprocal US alternate |
| Titles            | Unique meaningful title and 1 H1 per page; no empty/placeholder descriptions                                     | `TODO`, repeated title                               |
| Sitemap           | XML parses; URLs unique/absolute/canonical/published; none redirect/noindex/404; entrypoint correct              | deleted page still listed                            |
| Sitemap scale     | <=50k URLs and <=50MB uncompressed per sitemap                                                                   | huge single sitemap                                  |
| lastmod           | Valid ISO date, not in future; dates tied to material editorial changes, stable across no-op builds              | every page set to build date                         |
| robots            | Production robots is plaintext, includes a reachable generated Sitemap directive and lacks blanket `Disallow: /` | blocking all bots                                    |
| Breadcrumbs       | Visible HTML trail and JSON-LD agree; each ancestor resolves; JSON-LD has ordered positions                      | Schema refers to unpublished crumb                   |
| JSON-LD           | Each `application/ld+json` script parses; content truthful/visible and `<` escaped in serialization              | invalid nested JSON                                  |
| Links             | No internal `href` to missing/redirected/unpublished route; every leaf reachable from crawlable hub nav          | orphan detail URL                                    |
| Source integrity  | Critical physical measurements cited/derived; market and assumptions visible                                     | 'exact' number no source                             |
| No-JS             | Server-built HTML includes key answer/measurements and related `<a>` elements                                    | blank app shell                                      |
| Meta robots       | Indexable pages are not `noindex`; removed/public preview pages not inadvertently indexed                        | `noindex` on hub                                     |
| Content integrity | No generated numeric permutation without separate justification; no duplicate primary-answer slugs               | 100 thin near-copies                                 |
| Redirect registry | No loops/missing targets/chains, retired URL absent from sitemap                                                 | `/old/` → `/missing/`                                |

Make validators diagnostic: print route + offending field + expected value, nonzero exit code. Require tests for at least one workspace and one bedroom leaf, a hub, homepage and deliberate negative fixture for each important gate.

## Minimal deterministic fixtures

- A published leaf route, a published hub, a draft page, a deprecated page, a renamed route with 301 mapping, and a cross-market bed size example.
- A valid sitemap & robots sample, malformed sitemap, fake `lastmod` no-op update case, deliberate duplicate canonical, dangling breadcrumb parent, broken related anchor, and JSON-LD escaping sample.
- Run the tests twice without data changes: output routes and `<lastmod>` values must remain unchanged and checks pass.

## Live-only release checks (after AWS gate)

- DNS + TLS for apex and (if configured) www; redirect correctness and exactly one public host.
- HTTP status/content-type: root, sample pages, sitemap, robots, asset, `IndexNow` key if configured, deliberately missing page (must be real 404), old renamed URL (301 then 200).
- Confirm `GET /workspace/example/` returns correct HTML content, not raw XML, origin `AccessDenied` or home page masquerading as a 200.
- Check headers do not issue `noindex` and cache behavior does not serve stale HTML after new deploy; cloud response behavior matches local output.
- Google URL Inspection on a representative indexable leaf; Bing and Yandex Webmaster sitemap status. Rich Results Test for breadcrumb sample. Check logs for unusual crawler 403/429 spikes without recording user PII.
- Run mobile performance/a11y check with production conditions. Set initial **field CWV targets**: LCP <=2.5s, INP <=200ms, CLS <=0.1 at p75, as goals, not indexing guarantees.

## Local command sequence

```sh
npm run validate:data
npm run build
npm run validate:seo
npm run validate:links
npm run verify
```

`validate:seo`, `validate:links`, and `seo:diff` are implemented by T018. `validate:content` is implemented by T021. Broader live release/a11y checks remain gated for later tasks.

## Authority

See `specs/TECHNICAL_SEO_PLAYBOOK.md` and official docs linked therein.
