# Testing and QA Specification

## 1. Required automated layers

### Unit tests

Cover:

- unit conversions;
- rounding/display formatting;
- fit-state engine;
- monitor geometry;
- bedroom geometry;
- data validation;
- route/page-intent validation.

### Build validation

The production build must fail when:

- data schemas fail;
- duplicate canonical routes exist;
- required source references are missing;
- internal generated links point to unpublished/missing pages;
- required SEO fields are missing.

### Smoke tests

At minimum verify:

- homepage renders;
- one workspace hub;
- one workspace dedicated page;
- one bedroom hub;
- one bedroom dedicated page;
- 404 page;
- sitemap and robots.

## 2. Calculation boundary cases

Every fit algorithm must test:

- object exactly equals available dimension;
- object 1 mm larger;
- object 1 mm smaller;
- recommended clearance exactly met;
- hard fit passes but recommendation fails → `tight`;
- invalid zero/negative input;
- very large inputs;
- metric/imperial equivalent input produces same canonical result.

## 3. Geometry-specific tests

### Workspace

- one monitor;
- two equal monitors flat;
- gap handling;
- margins;
- screen-only derived width vs sourced overall width distinction;
- angled configuration if enabled.

### Bedroom

- orientation swap;
- frame allowance;
- side clearances;
- foot clearance;
- optional nightstands;
- geography-specific bed dimensions.

## 4. Content/SEO validation

Automated checks should assert:

- one H1/page;
- title non-empty and unique within generated launch set;
- canonical absolute path mapping unique;
- meta description non-empty;
- indexable page in sitemap;
- draft page absent from sitemap;
- breadcrumb hierarchy valid;
- internal related links resolve.

## 5. Accessibility QA

At minimum:

- run an automated accessibility checker if the chosen local tooling can do so without bloating runtime product dependencies;
- manually keyboard-test forms and toggles;
- confirm text equivalents for diagrams;
- verify result states do not depend on color.

## 6. Performance QA

Targets are goals, not excuses to game audits:

- no unnecessary hydration framework;
- core content visible without JS;
- no render-blocking third-party scripts;
- compressed assets;
- route-specific JS;
- avoid large unoptimized images.

Suggested acceptance targets on representative pages under local production preview:

- Performance >= 95 where environment permits;
- Accessibility >= 95;
- Best Practices >= 95;
- SEO >= 95.

If the local audit environment is unstable, document raw issues rather than falsely marking pass.

## 7. Manual content QA checklist

For every page family before launch:

- Is the direct answer correct?
- Are geography/standard assumptions explicit?
- Does the diagram match the numbers?
- Are units consistent?
- Does the page explain `tight` vs `fits`?
- Are related links genuinely useful?
- Is there any statement that looks sourced but lacks provenance?
- Does the page remain useful with JS disabled?

## 8. Full SEO release testing (v0.2.0)

In addition to the basic validations above, implement every blocking assertion in `SEO_AUTOMATED_GATES.md`. T019 must test valid/invalid sitemap XML, `robots.txt`, stable `lastmod`, deliberate duplicate canonical, breadcrumb JSON-LD, no-JS main answer, published-only output, removed/renamed URL rules and URL rewrite assumptions. Deploy-only HTTP/engine checks are performed at Gate F, not locally.

## 9. Browser QA commands

- Build and serve production output with `npm run build` and `npm run preview -- --host 127.0.0.1 --port 4322`.
- Run the real-keyboard-event smoke in headless Chrome with `npm run qa:keyboard -- http://127.0.0.1:4322`. Set `CHROME_PATH` if Chrome is installed outside its default Windows path.
- Run Lighthouse against mobile and desktop preview URLs where Chrome is available. Treat noindex SEO scores on intentionally non-indexable FitCheck landing pages separately from indexable pages; record publication-policy deviations rather than making thin routes indexable to inflate scores.
- Visually review at mobile and desktop viewport widths. Record the viewport and indexability of each audited route; lab performance metrics are not field Core Web Vitals.
