# Ordered Backlog

Work only on the first unblocked incomplete task unless an explicit blocker requires otherwise.

| ID   | Phase          | Task                                                    | Weight | Depends on     |
| ---- | -------------- | ------------------------------------------------------- | -----: | -------------- |
| T001 | Foundation     | Scaffold Astro static project                           |     4% | —              |
| T002 | Foundation     | Configure TypeScript, formatting, linting and scripts   |     3% | T001           |
| T003 | Foundation     | Create global design tokens and base page shell         |     3% | T001           |
| T004 | Data           | Implement canonical data schemas/types                  |     5% | T002           |
| T005 | Data           | Implement build-time dataset validator                  |     5% | T004           |
| T006 | Core logic     | Implement unit conversion library                       |     4% | T004           |
| T007 | Core logic     | Implement generic fit-state engine                      |     6% | T004,T006      |
| T008 | Core logic     | Implement desk/monitor geometry                         |     6% | T007           |
| T009 | Core logic     | Implement bed/room geometry                             |     6% | T007           |
| T010 | UI             | Build result summary + assumptions components           |     4% | T003,T007      |
| T011 | UI             | Build responsive scale-diagram primitives               |     6% | T003,T007      |
| T012 | UI             | Build workspace interactive FitCheck                    |     7% | T008,T010,T011 |
| T013 | UI             | Build bedroom interactive FitCheck                      |     7% | T009,T010,T011 |
| T014 | Content engine | Build static page-family templates                      |     6% | T004,T010,T011 |
| T015 | Content engine | Populate verified seed workspace dataset                |     4% | T005           |
| T016 | Content engine | Populate verified seed bedroom dataset                  |     4% | T005           |
| T017 | SEO            | Metadata, canonicals, breadcrumbs, JSON-LD              |     3% | T014           |
| T018 | SEO            | Sitemap, robots and internal-link validation            |     2% | T014,T017      |
| T019 | QA             | Automated route/data/calculation tests                  |     4% | T012,T013,T018 |
| T020 | QA             | Accessibility/performance/manual QA pass                |     3% | T019           |
| T021 | Release        | Local production build acceptance gate                  |     2% | T020           |
| T022 | AWS            | Create IaC for S3/CloudFront/OAC/ACM                    |     3% | T021           |
| T023 | AWS            | Add deployment + cache invalidation workflow            |     2% | T022           |
| T024 | AWS            | DNS/TLS smoke test and production runbook               |     1% | T023           |
| T025 | AWS            | Add www alias and permanent apex redirect               |     1% | T024           |
| T026 | Content/SEO    | Upgrade fit guides and strengthen internal navigation   |     4% | T025           |
| T027 | Content/QA     | Resolve audit findings and add sourced furniture guides |     5% | T026           |
| T028 | SEO/QA         | Audit metadata, hreflang, sitemap and robots            |     2% | T027           |
| T029 | Product/QA     | Expand Workspace and Bedroom FitCheck planners          |     4% | T028           |

Total implementation weight: 116%.

Detailed task cards are in `tasks/`.

## v0.2.0 SEO task expansion (weights unchanged)

T004/T005/T014 implement publication-envelope fields, T017 metadata and structured data, T018 deterministic sitemap/robots/redirect & `validate:seo`, T019 negative/positive SEO tests, T021 offline SEO release gate, T024 live edge SEO smoke and engine setup runbook. T025 adds the post-release `www` hostname; T026 upgrades sourced fit answers and internal navigation; T027 adds measured furniture examples; T028 audits live SEO metadata and adds market-specific hreflang; T029 expands interactive Workspace/Bedroom planners. Search-engine query data and privacy-controller details remain owner inputs.

## Post-T029 Fit Relationship Expansion

Build interaction-quality verticals before growing page counts. Keep early tools noindex until their dimensions, assumptions, mobile UX and search demand have been reviewed. Never infer installation or safety clearances as universal standards.

| Priority | Fit relationship                       | Target                  | Status / release guardrail                                                                                                                        |
| -------: | -------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
|        1 | Objects → dining room                  | Dining FitCheck         | v1 deployed at `/dining/`; rectangular table, measured chair envelopes, user-selected circulation; no round/oval tables or generic aisle minimums |
|        2 | Appliance → opening/installation space | Appliance Fit           | Studio mode deployed; clearances are user-entered from the exact model manual, with no generic ventilation/service minimums                       |
|        3 | Object → delivery route                | RouteFit                | Studio mode deployed; checks door/hall/stair bottlenecks and a conservative turn envelope, not a motion/tilt solver                               |
|        4 | Display ↔ arm ↔ desk                   | Workspace compatibility | Studio mode deployed; user enters VESA support, load, clamp and footprint values for exact devices                                                |
|        5 | TV → wall/stand/alcove                 | TV Fit                  | Studio mode deployed; separates console and wall-mount checks, with user-supplied VESA/load specifications                                        |
|        6 | Equipment → gym room                   | Home Gym Fit            | Studio mode deployed; physical footprint separated from user/manual-selected operating zones                                                      |
|        7 | Objects → storage                      | Storage planning        | Studio mode deployed; one-layer grid capacity and aisle target only; no stacking or packing-optimality claim                                      |
|        8 | Pool/game table → room                 | Pool/game-room fit      | Studio mode deployed; entered cue-length envelope only; no angled-shot/player-stance solver                                                       |
|    Later | Vehicle → garage                       | Vehicle/Garage Fit      | Custom-measurement mode is live; authoritative vehicle specifications and driveway/maneuvering simulation remain deferred                         |

All eight current priorities, plus Garden and a custom-measured Vehicle/Garage check, now have dedicated crawlable feature URLs. They are indexable with self-canonicals, visible breadcrumbs and BreadcrumbList data, and appear in the 41-URL sitemap. Their examples use user-entered dimensions rather than unverified product catalogs. Search Console query data remains unavailable; these routes were published at the owner's explicit direction, not because a ranking or indexing outcome is guaranteed. A sourced vehicle specification catalog and precise driveway/maneuvering model remain deferred due to data/geometry cost. Do not create the whole cluster as thin pages; extend shared calculations, add regression fixtures and source exact product limits before further expansion.

## Garden Fit Vertical

`/garden/` is a separate multi-service vertical for structure-to-plot and reverse candidate sizing, gazebo post-to-post dining layout, shed storage, greenhouse staging/aisle, hot-tub service zones, outdoor kitchens and play-equipment use zones. The root and service URLs are indexable but remain custom-input tools with explicit limits. Planning permission, structural suitability, safety and environmental conditions are deliberately not inferred; play use-zones require exact manufacturer data.

## Next Product Milestone: Multi-Fit Engine

The next differentiating product should place several axis-aligned, measured rectangles in one space with fixed obstacles and explicitly selected clearances. Start with **Shed Multi-Fit**: lawn mower, bicycles, shelving and wheelbarrow in one shed, with a user-selected aisle; show one deterministic arrangement or state that none of the tested arrangements passes. Then reuse the engine for Living Room Fit, Garden Office interior planning, Laundry Room Fit and Patio/Balcony Fit. Keep the model constrained and explain tested orientations; do not call it an optimizer or CAD simulator.
