# SEO Release Audit — Build / Deploy

Release ID / commit: __________ | Date: __________ | Reviewer: __________

## Offline checks

- [ ] `npm run verify` and `npm run validate:seo` pass, with exact commands/results recorded.
- [ ] Build outputs static indexable HTML with principal answer and anchor links pre-rendered.
- [ ] Published route list == sitemap canonical list (including homepage where intended).
- [ ] Draft/deferred/deprecated routes absent; no duplicate/cross-host canonical.
- [ ] `lastmod` reflects substantive edit history, not build date; no-op build leaves it stable.
- [ ] robots points to existing sitemap entry and does not block published routes/resources.
- [ ] Breadcrumb HTML/JSON-LD hierarchy agrees; structured-data syntax validates.
- [ ] No broken related anchors/orphan leaf routes; redirect map has no loops/soft-404 mappings.
- [ ] Titles/H1/meta are unique and content is genuinely useful for target intent.
- [ ] Measurement sources, assumptions, market labels and accessibility diagrams reviewed.
- [ ] Change manifest identifies `added`, `materiallyUpdated`, `removed`, `unchanged`.

## Production-only checks (after authorized AWS deployment)

- [ ] Apex HTTPS redirects canonical; `www`/HTTP versions redirect as expected.
- [ ] Root + 2 workspace + 2 bedroom + sitemap + robots return correct status/MIME.
- [ ] Path `/category/page/` resolves correct `index.html` via CloudFront.
- [ ] Nonexistent URL returns real 404; renamed URL redirects exactly to valid canonical.
- [ ] No deployment-wide `noindex`, `Disallow: /`, accidental WAF blocking or unexpected 403.
- [ ] GSC/Bing/Yandex property verification and sitemap submission statuses recorded.
- [ ] IndexNow optional publisher only sends changed _live_ URLs to participating engines.
- [ ] Rich Results Test checked on one public breadcrumb page where possible.
- [ ] Page performance and crawl errors monitored after rollout.

Outcome: `PASS / FAIL / BLOCKED` | Evidence: __________ | Remaining issues: __________
