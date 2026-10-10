# Accessibility and Performance QA

**Date:** 2026-10-06  
**Scope:** T020 local production-preview QA; no deployment or cloud services used.

## Results

- Mobile Chrome/Lighthouse on Home, Workspace FitCheck, Bedroom FitCheck, monitor-size chart, and US bed-size chart. Desktop Chrome/Lighthouse on Workspace FitCheck.
- Every audited page scored **100 Accessibility**, **100 Performance**, and **100 Best Practices**. Home and the indexable measurement charts scored **100 SEO**.
- Workspace and Bedroom FitCheck landing routes scored **66 SEO** because they intentionally emit `noindex` while the corresponding `/workspace/fitcheck/` and `/bedroom/fitcheck/` generic intent pages remain content-light. Noindex is the expected result for those pages; it is not a crawlability defect. Their indexability remains governed by the publication envelopes.
- Workspace mobile Lighthouse metrics: FCP 1.0 s, LCP 1.2 s, TBT 0 ms, CLS 0. Bedroom mobile: FCP 1.0 s, LCP 1.2 s, TBT 0 ms, CLS 0. Workspace desktop: FCP 0.3 s, LCP 0.3 s, TBT 0 ms, CLS 0. These are local preview lab measurements, not field Core Web Vitals.
- Verified actual missing-route response is HTTP 404. Homepage, both hubs, measurement pages, `404.html`, sitemap, and robots all load successfully in the local production preview.
- Headless Chrome keyboard QA sent real Tab, Enter, and Space events on both FitCheck hubs. Skip link, sequential tab navigation, theme and unit toggles, disclosure expansion/collapse, and invalid-number error association all passed.
- Visually reviewed Lighthouse mobile workspace/bedroom captures and desktop workspace capture. The room and desk SVGs initially appeared as black blocks because their generated markup bypassed the styled Astro primitives. Moved their shared styles into `ScaleDiagram.astro`; repeated captures show object outlines, labels, clearance, and dimensions correctly.
- Added a polite atomic live region for dynamic fit details, connected form fields to inline error messages with `aria-describedby`, and corrected assumption heading levels. Lighthouse then reported no color-contrast or heading-order failures.
- Manual screen-reader testing was not available in this environment. Automated Lighthouse accessibility checks and keyboard-event tests passed.

## Verification

- `npm run verify`: 130/130 unit tests passed; type, lint, format checks passed; 20 static pages built; production data validation reported zero errors/warnings; SEO, internal-link, and route smoke checks passed.
- `npm run qa:keyboard -- http://127.0.0.1:4322`: passed on workspace and bedroom FitCheck pages.
- Lighthouse JSON reports and screenshots were kept under the local temp directory `C:\Users\Nikatsam\AppData\Local\Temp\kilo\`; they are not repository artifacts.
- One pre-existing, non-blocking TypeScript ESLint config deprecation hint remains in `eslint.config.js` (`tseslint.config`).

## Page-Family QA Addendum

- The offline page-family expansion now builds 38 HTML files (including system/dev pages); 29 PageIntents are generated, 6 are explicitly deferred, and 6 remain drafts. New calculation-family answers remain `noindex`; the sitemap still contains four intentional indexable URLs.
- Lighthouse mobile on `/workspace/what-fits-on-a-120cm-desk/` and `/bedroom/what-bed-fits-in-10x10-room/`, plus desktop on Workspace, scored 100 Accessibility, 100 Performance, and 100 Best Practices. SEO scores are 66 because these pages are intentionally noindex pending editorial sign-off.
- Mobile screenshots were visually checked after replacing narrow key/value tables with stacked definition-list rows. Values and labels are now readable without two-column compression. Production preview returned 200 for generated sample routes and 404 for the explicitly deferred laptop route.
- The 49-inch display's cited 1195.8 mm field is now modeled/rendered as active panel width, not outer device width. Fit calculations use derived screen-only width with an explicit bezel/stand caveat; the pages stay noindex.
- `npm run verify` passes with 149 tests, dataset validation at zero errors/warnings, SEO/link/content/route/infra checks, and the 38-page build. Screen-reader testing remains unavailable; Lighthouse/keyboard QA is not a substitute for a human screen-reader review.

## Production Site Audit - 2026-10-08

### Scope and Evidence

- Audited the live apex and `www`, representative workspace/bedroom hubs, the 140 cm desk guide, market-specific bed references, Queen/King fit pages, the King-vs-Queen comparison, `robots.txt`, `sitemap.xml`, and a true missing route.
- `npm run verify` passes with 161 tests; 38 HTML pages build, dataset validation reports zero errors/warnings, and SEO, internal-link, route, content and infrastructure validators pass.
- `npm run qa:keyboard -- https://fitwise.stream` passes on the live Workspace and Bedroom FitCheck flows.
- Live HTTP checks: apex and sampled pages 200; sitemap 200 `application/xml`; robots 200 `text/plain`; an unknown route 404; `www` 301 to apex with path/query preserved.
- Live metadata checks found one H1 per sampled page. Indexable samples have one canonical and breadcrumb schema; noindex samples have no canonical or breadcrumb JSON-LD. The sitemap has four indexable URLs; noindex guides are absent as intended.
- Public DNS returns the `www` CloudFront CNAME and the Google verification TXT. The TXT's presence does not prove that the Search Console property is verified in the owner's account.
- Citation spot checks: IKEA desk listings, John Lewis Samsung M7 specs, IKEA UK double/king listings, Sleep Foundation mattress/clearance guidance, Samsung 49-inch and LG 34-inch references responded successfully (LG redirects to its current product path). The OSHA monitor page returned HTTP 403 to this audit environment; this may be access filtering rather than a dead page.

### Findings and Fixes to Track

- **F-01 - High, privacy/analytics owner decision:** GA4 loads unconditionally on the apex hostname; the site footer has no privacy/cookie notice or consent control. This is a potential consent/compliance gap for EU/UK visitors, not a legal determination. Obtain owner/legal requirements, then add the appropriate notice/consent behavior and document analytics handling. No tracking behavior was changed during this audit.
- **F-02 - Medium, misleading Double-bed title:** `/bedroom/minimum-room-size-for-double-bed/` still titles itself “Minimum Room Size For Double Bed” while its body says its calculated clear-space dimensions are planning estimates, not code minimums, and compares US Full with UK Standard Double. Change title/H1/description to explicitly name both markets and frame the values as recommended planning space. The page is currently noindex.
- **F-03 - Medium, ambiguous comparison title:** `/bedroom/double-vs-queen-room-space/` is headed “Double vs queen room size” but compares US Full (sometimes called Double) with US Queen only. Make the US market explicit in the H1/title and retain the distinction from UK Double. The page is currently noindex.
- **F-04 - Medium, source accessibility:** the OSHA monitor-distance citation at `src-osha-monitor-viewing-distance` returned 403 from this audit network. Verify it in a normal browser; if readers are also blocked, replace it with an accessible official source while retaining the same sourced range.
- **F-05 - Low, clearance provenance:** the 24-inch foot-of-bed planning value is extrapolated from the Sleep Foundation's general “around each side” clearance wording. Keep it explicitly labeled as a Fitwise modeling assumption or add a source that specifically supports foot clearance.
- **F-06 - Low, stale operations documentation (resolved):** the runbook still described the www Cloudflare record as pending. `PRODUCTION_RUNBOOK.md` and `ERROR_LOG.md` now record the live dual-host state and its resolution.

### SEO and Coverage Limits

- Technical crawl signals pass for the sampled pages. Only four URLs are intentionally indexable; the upgraded desk/bed-fit guides remain `noindex` pending the project's search-demand/SERP evidence gate. This is a deliberate publication limit, not a robots/sitemap defect.
- No current Google Search Console, Bing Webmaster or Yandex index coverage/performance data was available. IndexNow delivery succeeded, but it does not guarantee crawling or indexing.
- A fresh Lighthouse run was unavailable because the CLI is not installed. The Lighthouse figures above are dated local-preview measurements from 2026-10-06 and do not measure the latest content; field Core Web Vitals and a human screen-reader pass remain unverified.

### Content Opportunities

- First resolve F-02/F-03 so the existing Double comparison content is accurately titled before any future indexability review.
- Develop the deferred chair/desk-clearance guide (`P018`) only after sourcing actual chair footprints, desk height, stand/seat geometry and a defensible behind-chair movement allowance.
- Add bed-frame, nightstand, wardrobe-door and dresser-drawer interactions (`P034`-`P037`) using specific measured examples; current Queen/King recommendations intentionally exclude those dimensions.
- Extend monitor-fit content with model-specific stand depth, cable/arm placement and viewing-distance scenarios. Avoid turning screen-only estimates into full-device claims.
- Use verified Search Console queries and SERP observations before adding the draft 9x10 room, 49-inch-only or other near-duplicate URLs; do not expand the sitemap solely to increase URL count.

## T027 Follow-Up Audit — 2026-10-08 (local verification)

- `npm run verify` passes with 169 tests. The build now has 43 HTML pages, 42 HTML routes pass the internal-link validator, dataset validation has zero errors/warnings, and the sitemap/canonical set remains four URLs.
- New static noindex guides cover a measured Aeron chair footprint with no invented pull-back standard; Samsung M7 stand/body depth with CCOHS viewing guidance; IKEA PAX/GRIMO hinged-door sweep; HEMNES dresser drawer extension; and two bedside-table footprint sums. P038 and other draft room-size intents remain unbuilt.
- The wardrobe page uses one US-market PAX/GRIMO product example and asks readers to compare its sweep with their measured bed; it does not present products from different markets as a matched set. Fractional-inch product dimensions are converted and rounded to whole millimeters.
- Double-bed page titles now distinguish US Full from UK Standard Double; the Double-vs-Queen title identifies the US market. UK MALM frame dimensions are derived from sourced frame/mattress dimensions. Foot clearance is now explicitly a FitWise assumption, separate from sourced side clearance.
- The blocked OSHA citation was replaced with accessible CCOHS guidance that does not claim a universal distance. Manufacturer references support the product dimensions; the Herman Miller specs page contains an unrelated placeholder line, but its published dimension table was readable.
- Lighthouse mobile lab samples (local production preview): Home and an indexable US bed reference scored 100 in performance/accessibility/best-practices/SEO. Desk, chair, and wardrobe pages scored 100 for performance/accessibility/best-practices; their SEO category scored 66 because the pages are deliberately noindex (`is-crawlable`), not because of missing canonical/sitemap configuration. LCP was about 0.9 s and CLS 0 in these runs. These are lab scores, not field Core Web Vitals.
- Keyboard QA passed on both FitCheck clusters. Manual screen-reader testing remains outstanding.
- F-02, F-03, F-04 and F-05 are corrected in the local build. F-01 remains open by owner decision: GA4 stays active, and the missing privacy notice/consent control is recorded as a future defect. No consent or GA4 behavior was changed; the owner explicitly deferred this item.
- Search Console credentials/query data are unavailable. Bing result checks were ambiguous or broad and provided no volume evidence; DuckDuckGo automated searches were challenged. No noindex page was promoted and no draft room-size URL was added to the sitemap.
- Commit `962b822` was deployed by workflow `37786143468`. Public page checks confirmed the new chair, monitor-depth, wardrobe-door, dresser-drawer and nightstand examples; Double-market titles and fit estimates; and the unchanged four-URL sitemap.
- Live noindex pages remain absent from the sitemap and expose visible cluster navigation without canonical or breadcrumb JSON-LD. The 301 www/apex configuration remains deployed and live.

## T028 SEO Tag and Crawl Audit — 2026-10-08

- Reviewed live-generated HTML paths and the SEO publication source of truth. Indexable pages have absolute apex self-canonicals, unique titles/descriptions, one H1, WebPage/BreadcrumbList JSON-LD and matching visible breadcrumbs. Noindex guides have no canonical, hreflang, Open Graph or breadcrumb JSON-LD and remain absent from the sitemap.
- Added reciprocal `en-US`/`en-GB` hreflang for the market-specific US/UK bed-dimension reference pair. Each page emits its own canonical-language alternate, the other market alternate, and matching `og:locale` values. No x-default or hreflang was added to unrelated/noindex pages.
- `robots.txt` is HTTP 200 plain text, allows public pages and points to `https://fitwise.stream/sitemap.xml`; sitemap is HTTP 200 XML with four unique HTTPS apex canonicals. Apex/HTTPS/www redirects and true 404 behavior are verified.
- Search Console/Bing/Yandex account and index-coverage status cannot be checked because owner credentials are unavailable. A public DNS TXT record or IndexNow notification does not prove account verification or indexation.
- T028 hreflang code/validators pass with `npm run verify` (170 tests, 43-page build, 42 internal-link routes, zero dataset warnings). Deployment run `37793826349` completed. Live US/UK page heads confirm `en-US`/`en-GB`, self-canonicals, reciprocal hreflang, matching Open Graph locales and matching WebPage/BreadcrumbList data; the sitemap remains four URLs.
- Optional social enhancement: indexable pages have Open Graph/Twitter title and description but no dedicated `og:image`/`twitter:image`. This is not a crawl/indexing defect; add a crawlable 1200x630 social card if richer share previews are desired.

## T029 FitCheck Expansion — 2026-10-08 (production verified)

- Workspace planner supports up to four side-by-side monitors, 16:9/21:9/32:9 screen-width derivation, exact overall-width override, and a separate desk-depth envelope for stand, user-entered cable/vent space and user-selected keyboard/mouse space. Eye-to-screen viewing distance is not incorrectly added to the desk-surface depth.
- Bedroom planner supports mattress-only and sourced UK MALM frame presets, bed/table footprints, optional PAX door-sweep and HEMNES drawer-pullout collision checks, and orientation-correct side/foot clearance and diagram axes.
- Fit summaries now list all failing dimensions. Dynamic interaction rows appear only when enabled and require an actual measured obstacle gap.
- `npm run verify` passes with 189 tests, a 43-page build, 42 validated internal-link routes and the four-URL sitemap. Headless mobile keyboard QA exercises monitor count/aspect/depth, bed orientation, bedside tables, wardrobe/drawer checks, and confirms dynamic rows stay in the mobile card layout without page overflow. Mobile Lighthouse scores 100 for performance/accessibility/best-practices; SEO score 66 is expected for the intentional noindex.
- Final local Lighthouse LCP was 1.2 s (Workspace) and 1.1 s (Bedroom), CLS 0. Replaced far-offscreen skip-link positioning with a transform-based focus reveal after the mobile keyboard check exposed first-Tab focus loss.
- Commit `623d8bd` was deployed by workflow `37838761910`. Live keyboard QA passed on both planners; indexability and sitemap membership remain unchanged.

## Feature Indexing Release — 2026-10-10

- Owner-authorized feature-indexing release: commit `a9f10fe` deployed by workflow `38039995713`. The sitemap now lists 41 canonical URLs covering the root tools, Garden and Fit Services hubs, and dedicated appliance, delivery-route, workspace-compatibility, TV, gym, storage, pool/game-room and vehicle/garage landings.
- All 41 live sitemap URLs were visited in headless Chrome at mobile width. Checks confirmed HTTP 200, a matching self-canonical, no `noindex`, a visible breadcrumb with BreadcrumbList JSON-LD, no horizontal overflow, and no long floating-point values in visible text.
- `npm run verify` passes with 219 tests, a 73-page build, 72 internal routes, SEO/content/route/infrastructure validation and zero dataset warnings. The updated fit summaries distinguish physical margin from margin after the selected target.
- Live `robots.txt` and `sitemap.xml` return HTTP 200; robots points to the apex sitemap. IndexNow notification succeeded. Optional Google Search Console authentication/sitemap submission was skipped because owner credentials are not configured; actual search indexing is not confirmed or guaranteed.
- Feature pages rely on user-entered dimensions and clearly labeled examples. Manufacturer-specific installation/weight/VESA/play-use limits must be checked against current model manuals; the pages do not assert universal safety or code clearances.
