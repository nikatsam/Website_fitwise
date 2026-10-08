# T026 — Upgrade fit content and internal SEO

**Phase:** Content/SEO
**Dependencies:** T025

## Objective

Improve the existing desk and market-specific bed-fit answers with sourced,
transparent calculations and stronger internal navigation. Preserve current
indexability gates until documented search-demand and SERP-gap evidence supports
promotion.

## Steps

- [x] Rebuild the 140 cm desk comparison from desk/display entities and geometry rules; separate screen-only estimates from sourced outer widths.
- [x] Add physical footprint, recommended side-margin, source, and limitation context to the desk matrix.
- [x] Replace generic Queen/King room-fit introductions with market-specific calculated planning dimensions and a clear non-code-minimum caveat.
- [x] Add curated links from Home, workspace/bedroom hubs, and related family pages; show cluster breadcrumbs only as visible navigation on noindex pages.
- [x] Cross-link the indexable US/UK bed references and update their editorial sitemap `lastmod` dates.
- [x] Keep generated desk/bed pages `noindex`; ensure they stay out of the sitemap and do not receive canonical or breadcrumb JSON-LD metadata.
- [x] Run `npm run verify` and inspect route, SEO, sitemap, and internal-link outputs.
- [ ] Commit and push the comparison-copy correction.
- [ ] Deploy through GitHub OIDC and verify live pages, internal links, canonical/robots output, and sitemap.

## Acceptance criteria

- [x] Desk and bed-fit copy uses sourced or derived model data, explicit units, and precise assumptions; it does not present planning recommendations as legal minimums.
- [x] Related links resolve to published routes; US and UK mattress references remain explicitly market-specific.
- [x] Sitemap contains only the four currently indexable routes; material changes to indexable reference pages advance `lastmod`.
- [ ] Published deployment passes direct page, metadata, sitemap and link smoke checks for the final comparison-copy correction.

## Guardrails

- Do not index the desk/room-fit guides until the documented search-demand, SERP-gap, source and cross-link gates are satisfied.
- Keep chair-clearance and bed-to-wardrobe/dresser content deferred until reliable measurements and use assumptions are sourced.
- Do not claim Google, Bing or Yandex indexing or ranking as a result of deployment; verify only technical outputs and submission status.
