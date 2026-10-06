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
