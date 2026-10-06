# T018 — Implement sitemap, robots and internal-link validation

**Phase:** SEO  
**Dependencies:** T014, T017

## Objective

Complete this task without expanding scope into later tasks.

## Steps

- Generate sitemap from published page intents.
- Ensure draft/deferred pages are excluded.
- Add robots policy.
- Implement internal related-link validator.
- Implement production `robots.txt` with absolute sitemap reference; sitemap generated from published canonical PageIntent registry on every build.
- Apply stable truthful sitemap lastmod (no build-time timestamp), exclude draft/deferred/deprecated/noindex/redirect URLs; verify XML sizing & escaping.
- Add optional local-only URL deploy diff manifest (`added/materiallyUpdated/removed/unchanged`) and documented redirect registry for renamed/merged routes.
- Implement offline `npm run validate:seo` and `npm run seo:diff` (no network calls) per `specs/SEO_AUTOMATED_GATES.md`.

## Acceptance criteria

- [x] Published indexable routes appear once in sitemap.
- [x] Draft/noindex routes are absent.
- [x] No broken generated internal links; sitemap routes are reachable from Home.
- [x] No-op rebuild leaves sitemap lastmod and output URLs unchanged.
- [x] Published canonical/sitemap/robots/head/meta rules align.
- [x] Invalid fixtures fail offline SEO/link validation, including noindex/draft in sitemap, duplicate canonical, dangling breadcrumb and missing link.

## Required close-out

- [x] Run relevant automated checks.
- [x] Update `WORKLOG.md`.
- [x] Update `WORKLOG.json`.
- [x] Update `PROJECT_STATE.json`.
- [x] No architecture change required; build-time outputs follow existing ADR-009 static publication design.
