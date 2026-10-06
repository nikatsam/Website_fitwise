# Content and SEO Specification

## 1. Search strategy

Fitwise should compete on **decision intent**, not generic dimensional facts alone.

Prefer:

- “desk size for two 27 inch monitors”
- “what monitors fit on a 140cm desk”
- “minimum room size for king bed”
- “what bed fits a 10x10 room”
- “desk depth for 32 inch monitor”

over building the site around commodity facts such as “65 inch TV dimensions”.

## 2. Page creation rule

A dedicated route must pass all of these checks:

1. It answers a distinct user decision/question.
2. It has enough unique data/visual explanation to be useful independently.
3. It is not merely a unit/spelling/number permutation of another page.
4. It can link naturally to and from related pages.
5. Its claims can be grounded in validated data.

If not, put the scenario inside a hub/matrix rather than creating a new indexable URL.

## 3. Page structure

Recommended order:

1. Breadcrumbs.
2. H1.
3. Direct answer/result summary.
4. Primary visual diagram.
5. Key measurements and assumptions.
6. Interactive FitCheck enhancement if appropriate.
7. Scenario matrix/alternatives.
8. Explanation/methodology.
9. Related pages.
10. Sources/methodology links as appropriate.

The visitor should not need to read 800 words before seeing the answer.

## 4. Metadata rules

Every indexable page requires:

- unique `<title>`;
- unique meta description;
- canonical URL;
- one H1;
- Open Graph title/description;
- appropriate social image fallback;
- breadcrumbs where nested;
- index/follow unless explicitly deferred/noindex.

Avoid keyword-stuffed title templates that only swap one number.

## 5. Structured data

Use only structured data that truthfully describes visible content.

Potential types:

- BreadcrumbList;
- WebPage;
- Article only when page is genuinely article-like;
- FAQPage only when current search policies and visible content justify it — do not rely on rich-result eligibility.

Do not fabricate ratings/reviews.

## 6. Internal linking

Generate links from actual relationships and page-intent records.

Each indexable decision page should normally have:

- parent hub;
- 2–6 highly related sibling/alternative pages;
- relevant inverse-intent page where available.

Example:

`desk-size-for-two-27-inch-monitors` links to:

- desk size guide;
- 140 cm desk configurations;
- 24 vs 27 monitor physical size;
- desk depth for monitors;
- dual monitors + laptop page.

## 7. URL conventions

Use stable lowercase kebab-case paths.

Initial route families:

```text
/workspace/...
/bedroom/...
```

Do not introduce `/calculator/`, `/blog/` or date paths for core product pages.

Country/market-specific content should be explicit when dimensions differ materially.

## 8. Canonicalization and variants

Metric and imperial views must use the same canonical URL unless there is a proven reason for distinct localized routes.

Do not create separate pages merely for:

- `140cm` vs equivalent inches;
- “27 inch” vs `27-inch`;
- singular/plural keyword variants.

## 9. Content quality

Every page should contain at least one of the following forms of differentiated utility:

- a scale diagram;
- a fit/clearance calculation;
- a decision matrix;
- a reverse-fit table;
- explicit assumptions and edge cases;
- a useful comparison based on the structured dataset.

Generic prose alone is insufficient for the core pages.

## 10. Launch indexation strategy

Launch only pages marked `published` in page-intent data.

Do not expose draft/experimental routes in sitemap.

Generate XML sitemap from published static routes.

## 11. Post-launch data-driven expansion

After Search Console data exists, use these internal planning heuristics:

- High impressions + avg position 5–20 → improve existing page before expanding.
- Repeated unexpected query pattern with independent intent → candidate new page.
- Cluster with multiple pages entering top 20 → allocate more new content to cluster.
- Indexed route with negligible impressions after sufficient observation → do not clone it into more variants.
- Cannibalizing routes → merge, redirect or reposition.

Record any dedicated page added due to search evidence in its `PageIntent.justification`.

## 12. Technical implementation authority (v0.2.0)

The earlier sections provide strategy and minimum requirements. For **normative** technical detail including sitemap `lastmod`, redirects, `robots.txt`, Yandex/Bing/Google engine setup, structured data validation, publication status transitions and offline SEO tests, read:

- `TECHNICAL_SEO_PLAYBOOK.md`
- `SEO_AUTOMATED_GATES.md`
- `SEARCH_ENGINE_OPERATIONS.md`
- `SEO_CONTENT_GROWTH.md`

These expand T017/T018/T019/T024 without adding duplicate weighted tasks.
