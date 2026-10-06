# Fitwise.stream — Agentic Development Pack

Version: 0.2.0  
Prepared: 2026-10-06  
Primary build target: local/offline static web application  
Later deployment target: AWS serverless/static edge architecture

## Purpose

This pack is the source of truth for building **Fitwise.stream**, a static-first visual reference product that answers questions such as:

- Will two 27-inch monitors fit on a 140 cm desk?
- What bed fits in a 10×12 ft room?
- How much clearance does a king bed need?
- What dining table fits a 3 m × 3.5 m room?
- Will a sofa/refrigerator/etc. fit through an opening?

The product is not an article farm and not a generic calculator directory. Its core asset is a structured dataset of physical objects, spaces, clearances and relationships that can be rendered into useful static pages and client-side interactive fit checks.

## Local development commands

Implemented in T001/T002 (Node 24 LTS line, npm):

```text
npm install        # install dependencies from lockfile
npm run dev        # start local dev server
npm run typecheck  # astro check (strict TypeScript)
npm run lint       # eslint
npm run lint:fix   # eslint --fix
npm run format     # prettier --write
npm run format:check
npm run test        # vitest run (unit tests, tests/unit)
npm run test:watch
npm run build       # static production build to dist/
npm run preview     # preview the production build locally
npm run verify       # typecheck + lint + format:check + test + build
```

`npm run verify` is the single aggregate command referenced by `specs/LOCAL_DEVELOPMENT.md` and should pass before any task is marked DONE. Data/link/SEO validators (`validate:data`, `validate:links`, `validate:seo`) are added in later tasks (T005, T017, T018) and will be folded into `verify` as they land.

## Recommended agent start sequence

1. Read `AGENT_INSTRUCTIONS.md`.
2. Read `SPEC.md`.
3. Read every file in `specs/`.
4. Read `DECISIONS.md` and `WORKLOG.md`.
5. Open `BACKLOG.md` and execute the first unblocked task only.
6. After every completed task, update `WORKLOG.md`, `WORKLOG.json`, and `PROJECT_STATE.json` before beginning another task.
7. Do not begin AWS deployment work until the local acceptance gate in `specs/ACCEPTANCE_CRITERIA.md` is satisfied.

## Pack contents

- `SPEC.md` — product and implementation master specification.
- `AGENT_INSTRUCTIONS.md` — operating rules for the coding agent.
- `BACKLOG.md` — ordered implementation backlog.
- `WORKLOG.md` — human-readable progress tracker with legend.
- `WORKLOG.json` — machine-readable progress state.
- `PROJECT_STATE.json` — minimal resumable state for a new agent session.
- `DECISIONS.md` — architecture decision record.
- `specs/ARCHITECTURE.md` — local and AWS architecture.
- `specs/DATA_MODEL.md` — canonical entities, relationships and schemas.
- `specs/CONTENT_SEO.md` — page-generation and SEO rules.
- `specs/TECHNICAL_SEO_PLAYBOOK.md` — canonical URLs, robots, sitemaps, JSON-LD, indexing and redirect lifecycle.
- `specs/SEO_AUTOMATED_GATES.md` — deterministic offline/production SEO tests for the agent.
- `specs/SEARCH_ENGINE_OPERATIONS.md` — Google/Bing/Yandex verification, submissions and IndexNow operations.
- `specs/SEO_CONTENT_GROWTH.md` — editorial briefs, SERP gaps, query-driven expansion and performance review.
- `specs/UX_UI.md` — product UX, layout and component requirements.
- `specs/TESTING_QA.md` — automated and manual quality gates.
- `specs/SECURITY_PRIVACY.md` — security and privacy requirements.
- `specs/AWS_DEPLOYMENT.md` — later AWS deployment plan.
- `specs/ACCEPTANCE_CRITERIA.md` — release gates.
- `data/INITIAL_CONTENT_MAP.csv` — initial content backlog.
- `data/sample-data.json` — sample development fixtures.
- `tasks/` — atomic implementation tasks.
- `prompts/` — copy/paste prompts for starting and handing off agent sessions.
- `templates/` — reusable log, QA, content-brief, SEO-release and search-review templates.

## Technology baseline

The implementation should stay intentionally boring:

- Astro, static output only.
- TypeScript.
- Plain CSS or scoped Astro CSS.
- Vanilla browser JavaScript/TypeScript for interactive fit checks.
- Local JSON/TypeScript data files as the system of record.
- No React/Vue/Svelte unless a later ADR explicitly proves a need.
- No database for the MVP.
- No runtime API dependency for normal page views.
- No authentication for the MVP.
- No AI calls at visitor runtime.

Use the current stable Astro release and current Node LTS at implementation time, then commit the lockfile and record exact versions in the worklog.

## AWS deployment boundary

The local app must be fully functional before AWS work begins. The intended production baseline is:

`Browser → CloudFront → private S3 bucket`

Use CloudFront Origin Access Control (OAC) so the S3 origin remains private. Lambda/API Gateway are optional future services and must not be placed in the normal HTML-rendering path.

## Definition of success for v1

A successful v1 is a locally built static site that:

- renders the initial workspace and bedroom clusters;
- computes fit results deterministically from structured dimensions/clearances;
- has scale-aware visual diagrams;
- exposes canonical static URLs;
- passes data validation and automated tests;
- generates sitemap, robots, metadata and structured data;
- achieves Lighthouse-style performance/accessibility targets defined in the QA spec;
- can be uploaded to S3 and served through CloudFront without code changes to page rendering.

## SEO publication rule (v0.2.0)

The source-of-truth publish registry must drive HTML, canonical, breadcrumb, related links and XML sitemap **automatically**. Published URLs are statically rendered; no Google/Bing/Yandex service is required for offline development. Post-launch engine submissions and IndexNow are separate operations and must not run during local builds. See `specs/TECHNICAL_SEO_PLAYBOOK.md` first.
