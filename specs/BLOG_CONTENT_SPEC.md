# FitWise Blog Content Specification

**Status:** Pilot specification

**Initial preview:** Five noindex articles on the local test server

**Audience:** People making a real room, delivery, workspace or appliance fit decision

## Purpose

The blog supports the FitWise tools with original, useful stories about where a fit problem arises, which measurements resolve the uncertainty, and how a FitWise check can help. It is not a general home-decor publication, an affiliate catalogue, or a way to multiply near-duplicate SEO pages.

The initial pilot contains five distinct tool-linked stories:

| Article                                              | Primary tool link                                            | Image theme                              |
| ---------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------- |
| A rug that fit the room but not the furniture        | `/rug-fit/`                                                  | Rug and sofa in a living room            |
| The sofa that reached the doorway but not the turn   | `/access/furniture-route-fit/`                               | Movers carrying a sofa through a doorway |
| Two monitors, one measured desk                      | `/workspace/desk-size-for-two-27-inch-monitors/`             | Dual-monitor desk setup                  |
| The bed that fit until the wardrobe opened           | `/bedroom/`                                                  | Bed and wardrobe in one room             |
| The refrigerator that fit the opening, not the route | `/appliances/fridge-fit/` and `/access/furniture-route-fit/` | Refrigerator in a kitchen                |

## Article Requirements

Each article must:

- Tell a compact, engaging scenario that starts with a concrete fit problem and leads naturally into measurement and a tool-based check.
- Label invented examples as **illustrative scenarios**, not real FitWise users, testimonials, customer quotes, or measured outcomes.
- Distinguish the physical object, room/opening, user-selected margin, and delivery route. Do not claim a fit result is a guarantee of safe installation, comfort, code compliance, or professional handling.
- Explain which real dimensions the reader should measure, where each measurement begins/ends, and what to do when a tool does not model a needed feature such as a turn, tilt, door removal, product-specific clearance, irregular shape, or structural load.
- Link to one primary FitWise tool and at least one relevant secondary tool, methodology page, or measurement reference. Links must point to one canonical destination rather than room-specific duplicates.
- Include verifiable sources for nontrivial factual or numeric claims. Product-specific values must link to a current manufacturer manual/specification. If no source is available, present an input as user-provided or remove the claim.
- Provide a direct, useful takeaway. Do not pad the story to a word-count target or repeat the calculator's labels without context.
- Use a unique title, meta description, H1, intent and article body. Avoid programmatic room-size, object-size or country permutations without independent evidence.

## Scenario and Editorial Integrity

- Composite or hypothetical stories must be identified near the beginning of the article with copy such as: “Illustrative scenario; not a real FitWise customer story.”
- Never invent a customer identity, quote, review, product purchase, measured outcome, endorsement or before/after result.
- Example measurements must be visibly labelled illustrative and must be internally reproducible by the linked tool. Avoid generalizing one example into a recommendation.
- Explain when a scenario's outcome depends on product-specific documentation or a person verifying the actual site.
- Use the terms `Fits`, `Tight`, `Does not fit` and `Needs information` consistently with the tool result semantics. Do not turn a dimensional check into a safety or design guarantee.
- State when a result uses an assumption, user-selected margin or estimate. Never present a style preference as an industry standard.

## Image and License Requirements

- Use a relevant image that clarifies the real-world context; do not insert decorative or unrelated stock imagery merely to make a page appear complete.
- Before use, verify the exact image page, named creator, current license/usage terms, and that the image is appropriate for the scenario. Record the image URL, creator, license URL, verification date and intended article in the content data.
- The initial pilot uses Pexels photos verified against the [Pexels License](https://www.pexels.com/license/), which permits free website/blog use and does not require attribution. FitWise will still show a visible creator/source/license credit.
- Do not imply a photographer, person, retailer, manufacturer or brand endorses FitWise. Do not depict identifiable people in a misleading, disparaging or sensitive context. Captions must say the image is illustrative and is not a FitWise calculation result.
- Provide meaningful alt text for informative images; use empty alt only for genuinely decorative media. Do not put license text in alt text.
- Pilot pages may load the selected source from the Pexels image CDN. This causes the reader's browser to contact Pexels. Before production release, review this third-party request against privacy/CSP policy and prefer an optimized, locally hosted copy where licensing and repository workflow permit. Do not silently hotlink a new source or add tracking.
- Keep image dimensions/aspect ratios stable, use responsive sizing, and lazy-load below-the-fold imagery. Avoid oversized original images.

## Local Review and Indexability

- The local Astro development server exposes six `noindex` preview routes: `/blog/` and five articles. The static production build emits only a noindex `/blog/` placeholder and omits the five article routes. None is in the sitemap. This task does not authorize a production deployment.
- The five article PageIntents and route dispositions remain drafts and are not approved for search indexation. A generated development preview route is not approval to publish, index, or deploy it.
- The blog index must clearly mark pilot posts as drafts for review. Article pages must not appear in the global navigation or an indexable hub before approval.
- Each page still receives a `PageIntent`, `SeoPublication`, route disposition, unique canonical path in its publication record, proper breadcrumb, and internal tool links so local testing exercises the production architecture. The rendered noindex page must not emit an indexable canonical or appear in the sitemap.
- Before indexation, complete `templates/SEO_PAGE_BRIEF.md` for each article, record a dated SERP gap/source, demonstrate distinct search intent and original utility, complete editorial/factual review, and satisfy the existing gates in `specs/SEO_CONTENT_GROWTH.md`.
- Do not claim search demand, traffic, ranking speed or search performance without Search Console or a documented keyword dataset.

## Google and Advertising Policy Safeguards

- The local pilot contains no ad units, affiliate links, sponsored placements, newsletter popups, or calls to click an advertisement.
- If monetization is later considered, review Google's current AdSense Program Policies and Required Content requirements for the whole site. Add a compliant privacy policy and consent mechanism before serving applicable advertising; noindex alone does not satisfy those requirements.
- Ads, if approved later, must remain visually distinct from article text, tool links, calculator controls, results and navigation. Never place ads so they may be mistaken for a FitWise button, image credit or result.
- A helpful tool-linked story is not automatically eligible for AdSense. Avoid thin, substantially duplicated, automatically generated, misleading, or image-only articles; retain the original measurement explanation and clear reader value.

## Verified Worked Examples

The values below are hypothetical user inputs, not a product specification or recommendation. `tests/unit/blog-worked-examples.test.ts` runs each case through the same geometry/service functions used by the linked tool and verifies the state and key margins.

| Article       | Illustrative inputs                                                                                                                                                                                  | Tool output           | Verified interpretation                                                                                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rug/furniture | Room 4,200 × 5,000 mm; rug 2,500 × 3,000 mm; 100 mm wall border; use zone 2,100 × 2,000 mm; 100 mm furniture border                                                                                  | **Fits**              | Room target envelope is 2,700 × 3,200 mm; furniture target is 2,300 × 2,200 mm. Both fit the entered room/rug respectively.                                                                                 |
| Sofa route    | Item 850 × 900 × 900 mm; door 920 × 2,050 mm; hall 1,000 mm; turn landing 1,200 × 1,500 mm; stairs 920 mm wide/2,200 mm headroom; destination door 920 × 2,050 mm                                    | **Does not fit**      | The conservative turn envelope is approximately 1,238 mm, wider than the entered 1,200 mm turn. It does not prove a trained mover could not maneuver the sofa; tilt/pivot is not simulated.                 |
| Dual monitors | Desk 1,400 × 700 mm; two measured 615 mm monitor widths; 40 mm gap; 50 mm selected side margin; stand 250 mm + rear zone 50 mm + keyboard zone 300 mm                                                | **Fits**              | Configuration width 1,270 mm; selected target 1,370 mm, leaving 30 mm. Depth target 600 mm leaves 100 mm in the 700 mm desk. The 615 mm width is a hypothetical manual measurement, not a 27-inch standard. |
| Bed/wardrobe  | Room 3,500 × 4,000 mm; measured mattress 1,520 × 2,030 mm plus frame allowances; two 400 × 450 mm nightstands; selected 200 mm side/300 mm foot targets; 600 mm door at 90° with 700 mm measured gap | **Fits**              | The generated bed/nightstand envelope and 600 mm door sweep fit the user-entered room/gap checks. The side/foot targets are user choices, not standards.                                                    |
| Refrigerator  | Appliance 900 × 700 × 1,800 mm; opening 1,000 × 800 × 1,900 mm; model clearance source left unknown                                                                                                  | **Needs information** | Physical dimensions fit the entered opening, but installation is not confirmed because the exact model/manual clearances have not been verified.                                                            |

## Compliance Review — 2026-10-13

**Article-only assessment:** No prohibited topic, false customer testimonial, product endorsement, affiliate offer, ad unit or AdSense script was found. The posts are clearly labelled illustrative composites, link to the relevant FitWise tool, disclose their limits and cite/credit the stock images. They remain `noindex` and outside the sitemap. This is a local content review, not a Google or AdSense approval.

**Outstanding before production or AdSense:**

- The site has no Privacy Policy route/footer link. `BaseLayout.astro` loads GA4 on the production hostname, and no consent UI/Consent Mode is implemented. Google's [Required content policy](https://support.google.com/adsense/answer/1348695) requires disclosures about advertising cookies, third-party vendors and user choices before AdSense serving.
- For personalized ads to users in the EEA, UK or Switzerland, Google requires a certified CMP integrated with the IAB TCF ([Google consent requirements](https://support.google.com/adsense/answer/13554116)). No CMP is present. This is a site-wide readiness issue; there are no active AdSense ads today.
- The Pexels images load from `images.pexels.com`. The production CloudFront CSP now allows that exact host under `img-src` only; `infra:validate` tests that it is not added to script or connection sources. The static production build emits only a noindex `/blog/` placeholder and omits the five article routes, so no Pexels blog images are currently served in production. Before enabling the posts, review the third-party request in the privacy disclosure; locally hosted optimized copies remain an option.
- Each story now includes a hypothetical input/output block computed by the same FitWise geometry/service code as its linked tool. Unit tests check every displayed state and key dimensions. Google has no fixed word-count requirement; these examples improve reproducibility but do not guarantee AdSense acceptance or remove the need for editorial review.
- `/ads.txt` is absent, but no AdSense publisher ID or ad inventory is configured. Google calls `ads.txt` optional but strongly recommended ([guide](https://support.google.com/adsense/answer/7532444)); the current 404 is not a violation without a seller record. Do not add a placeholder; add Google's exact authorized-seller line after an account assigns the publisher ID.

**Current disposition:** suitable for owner review on the local dev-only noindex preview; **not ready for production AdSense use** until the privacy/CMP issues are resolved. The Pexels image host is narrowly allowlisted for a future release, but article routes remain omitted from the production build. No ad units are present and no production deployment has occurred.

## Pilot Release Checklist

**Local browser/screenshot check:** 2026-10-13 at `http://127.0.0.1:4328/blog/`. Headless Chrome checked the noindex blog index and five dev-only article routes, including tool links, noindex/canonical state, keyboard reachability, computed worked-example outputs and Pexels image loads; desktop/mobile screenshots were reviewed. The dev server has no generated sitemap, so its route-crawl count is zero; the separate production build/SEO/route validators confirmed the 43-URL sitemap. Captures are under `%TEMP%\kilo\fitwise-blog-worked-examples-2026-10-13`.

- [x] Five scenarios are visibly illustrative, not represented as real customers.
- [x] Each article links to the correct FitWise tool and explains its limits accurately.
- [x] No unsupported numeric/product claims are used; scenarios are explicitly illustrative.
- [x] Each photo's exact Pexels page, creator, license and verification date are recorded; visible credit and alt text are present.
- [x] All six local-review routes return correctly with `noindex` and are absent from the generated sitemap.
- [x] Internal links, breadcrumbs, metadata, mobile layout, image loading, keyboard use and accessibility pass local QA.
- [ ] Owner reviews/approves the articles and explicitly approves any production release/indexing change.
