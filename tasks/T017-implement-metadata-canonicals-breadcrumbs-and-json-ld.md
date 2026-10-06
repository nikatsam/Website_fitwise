# T017 — Implement metadata, canonicals, breadcrumbs and JSON-LD

**Phase:** SEO  
**Dependencies:** T014

## Objective

Complete this task without expanding scope into later tasks.

## Steps

- Generate unique titles/descriptions and canonical URLs.
- Implement breadcrumb UI + BreadcrumbList JSON-LD.
- Add truthful WebPage metadata and social tags.
- Implement publication SEO envelope (with T004/T014 schema changes if needed) and stable publishedOn/significantlyModifiedOn data.
- Generate visible HTML breadcrumbs and matching BreadcrumbList JSON-LD from one typed hierarchy; render correctly escaped JSON-LD.
- Enforce canonical host `https://fitwise.stream`, normalized trailing slashes, hreflang only for real distinct locale pages; keep primary answer in static HTML.

## Acceptance criteria

- [x] Representative pages contain required metadata.
- [x] No duplicate launch-set titles/canonicals.
- [x] Structured data parses as valid JSON.
- [x] Each published indexable page has exactly one self-canonical, static HTML H1/content, and matching visible/JSON-LD breadcrumbs.
- [x] T017 SEO metadata checks in `specs/SEO_AUTOMATED_GATES.md` pass, including negative fixtures.

## Required close-out

- [x] Run relevant automated checks.
- [x] Update `WORKLOG.md`.
- [x] Update `WORKLOG.json`.
- [x] Update `PROJECT_STATE.json`.
- [x] No architecture change required; ADR-009 already records SEO publication envelopes as the metadata source of truth.
