# Acceptance Criteria and Phase Gates

## Gate A — Foundation complete

Required before content engine work:

- [ ] Astro static project builds locally.
- [ ] TypeScript strictness/settings agreed and passing.
- [ ] formatter/lint/typecheck scripts work.
- [ ] base layout and global styles exist.
- [ ] no frontend framework runtime added.

## Gate B — Data/core complete

- [ ] data schemas implemented.
- [ ] build-time validator rejects invalid samples.
- [ ] source/provenance model implemented.
- [ ] unit conversion tests pass.
- [ ] generic fit-state engine tests pass.
- [ ] workspace geometry tests pass.
- [ ] bedroom geometry tests pass.

## Gate C — Product UI complete

- [ ] workspace FitCheck functional.
- [ ] bedroom FitCheck functional.
- [ ] scale-aware diagrams render on mobile/desktop.
- [ ] assumptions visible.
- [ ] result states accessible without relying on color.
- [ ] metric/imperial toggle produces equivalent canonical results.

## Gate D — Static content/SEO complete

- [ ] initial launch page intents populated.
- [ ] published pages statically generated.
- [ ] unique titles/H1/canonicals validated.
- [ ] related links generated and valid.
- [ ] sitemap includes published routes only.
- [ ] robots correct.
- [ ] representative pages remain useful with JavaScript disabled.

## Gate E — Local production release gate (T021)

All of these are mandatory before AWS resource creation:

- [x] clean dependency install succeeds.
- [x] unit tests pass.
- [x] typecheck passes.
- [x] lint/format checks pass.
- [x] production build passes.
- [x] link/SEO/data validators pass.
- [x] smoke tests pass against production preview.
- [x] manual mobile/desktop QA completed.
- [x] accessibility issues at critical/serious level resolved.
- [x] no secrets required for local site operation.
- [x] worklog implementation progress reflects all completed tasks.

## Gate F — AWS deployment complete

- [ ] IaC reviewed.
- [ ] private S3 origin created.
- [ ] CloudFront OAC configured.
- [ ] custom domain and TLS valid.
- [ ] deployment workflow documented/repeatable.
- [ ] direct public S3 access blocked.
- [ ] post-deploy smoke tests pass.

## Mandatory SEO clarifications for Gates D, E and F (v0.2.0)

**Gate D/E (offline, prior to AWS)**: All offline blocking gates in `SEO_AUTOMATED_GATES.md` must pass against built `dist/` including lastmod stability, XML parsing, published-only sitemap, crawlable HTML and breadcrumbs/schema agreement. A signed review of `templates/SEO_RELEASE_AUDIT.md` is required. `npm run validate:seo` and its integration into `npm run verify` are mandatory.

**Gate F (live after deployment)**: Validate canonical HTTPS redirects, sitemap/robots URLs, real HTTP 404, correct CloudFront directory-index rewrites and lack of production `noindex`/blanket disallow. Engine property verification and sitemap submission require owner access and are tracked in `SEARCH_ENGINE_OPERATIONS.md`; if not available at initial live technical acceptance, flag **operationally pending** explicitly and do not falsely mark them complete. IndexNow is optional and post-deploy only.

**Important:** Pass does not mean Google, Bing or Yandex has indexed or ranked the site.
