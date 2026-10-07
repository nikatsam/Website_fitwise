# Ordered Backlog

Work only on the first unblocked incomplete task unless an explicit blocker requires otherwise.

| ID   | Phase          | Task                                                  | Weight | Depends on     |
| ---- | -------------- | ----------------------------------------------------- | -----: | -------------- |
| T001 | Foundation     | Scaffold Astro static project                         |     4% | —              |
| T002 | Foundation     | Configure TypeScript, formatting, linting and scripts |     3% | T001           |
| T003 | Foundation     | Create global design tokens and base page shell       |     3% | T001           |
| T004 | Data           | Implement canonical data schemas/types                |     5% | T002           |
| T005 | Data           | Implement build-time dataset validator                |     5% | T004           |
| T006 | Core logic     | Implement unit conversion library                     |     4% | T004           |
| T007 | Core logic     | Implement generic fit-state engine                    |     6% | T004,T006      |
| T008 | Core logic     | Implement desk/monitor geometry                       |     6% | T007           |
| T009 | Core logic     | Implement bed/room geometry                           |     6% | T007           |
| T010 | UI             | Build result summary + assumptions components         |     4% | T003,T007      |
| T011 | UI             | Build responsive scale-diagram primitives             |     6% | T003,T007      |
| T012 | UI             | Build workspace interactive FitCheck                  |     7% | T008,T010,T011 |
| T013 | UI             | Build bedroom interactive FitCheck                    |     7% | T009,T010,T011 |
| T014 | Content engine | Build static page-family templates                    |     6% | T004,T010,T011 |
| T015 | Content engine | Populate verified seed workspace dataset              |     4% | T005           |
| T016 | Content engine | Populate verified seed bedroom dataset                |     4% | T005           |
| T017 | SEO            | Metadata, canonicals, breadcrumbs, JSON-LD            |     3% | T014           |
| T018 | SEO            | Sitemap, robots and internal-link validation          |     2% | T014,T017      |
| T019 | QA             | Automated route/data/calculation tests                |     4% | T012,T013,T018 |
| T020 | QA             | Accessibility/performance/manual QA pass              |     3% | T019           |
| T021 | Release        | Local production build acceptance gate                |     2% | T020           |
| T022 | AWS            | Create IaC for S3/CloudFront/OAC/ACM                  |     3% | T021           |
| T023 | AWS            | Add deployment + cache invalidation workflow          |     2% | T022           |
| T024 | AWS            | DNS/TLS smoke test and production runbook             |     1% | T023           |
| T025 | AWS            | Add www alias and permanent apex redirect             |     1% | T024           |

Total implementation weight: 101%.

Detailed task cards are in `tasks/`.

## v0.2.0 SEO task expansion (weights unchanged)

T004/T005/T014 implement publication-envelope fields, T017 metadata and structured data, T018 deterministic sitemap/robots/redirect & `validate:seo`, T019 negative/positive SEO tests, T021 offline SEO release gate, T024 live edge SEO smoke and engine setup runbook. T025 adds the post-release `www` hostname. Engine account verification is a manual post-deploy operational step that may remain pending without blocking a completed local build.
