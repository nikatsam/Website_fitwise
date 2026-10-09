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
|        2 | Appliance → opening/installation space | Appliance Fit           | Next; use exact model specifications or user-entered ventilation/service allowances                                                               |
|        3 | Object → delivery route                | RouteFit                | Door, hall, turn and stair bottlenecks; do not claim diagonal/tilt fit until geometry is validated                                                |
|        4 | Display ↔ arm ↔ desk                   | Workspace compatibility | Verify VESA, weight, clamp thickness, desk edge and wall clearance from exact model data                                                          |
|        5 | TV → wall/stand/alcove                 | TV Fit                  | Separate diagonal marketing size from measured outside dimensions; source VESA and stand dimensions                                               |
|        6 | Equipment → gym room                   | Home Gym Fit            | Distinguish equipment footprint from user-selected operating and safety zones                                                                     |
|        7 | Objects → storage                      | Storage planning        | Include usable dimensions and aisles; avoid packing-optimality claims without a validated solver                                                  |
|        8 | Pool/game table → room                 | Pool/game-room fit      | Later due to cue-length geometry and competitive calculator density                                                                               |

Vehicle/garage fit remains later due to high data cost. Do not create the whole cluster as thin SEO pages; start each priority with a reusable calculator, regression fixtures, sourced limits and a human SERP review.
