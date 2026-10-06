# Agent Instructions — Fitwise.stream

These rules are mandatory for GPT-6 Luna or any replacement coding agent.

## 1. Mission

Build Fitwise.stream as a **static-first, data-driven spatial-fit reference application**. Optimize for correctness, maintainability, page speed and scalable content generation — not framework novelty.

## 2. Source-of-truth order

When files conflict, use this precedence:

1. `DECISIONS.md` accepted ADRs.
2. `SPEC.md`.
3. Files in `specs/`.
4. Current task file in `tasks/`.
5. `BACKLOG.md`.
6. Existing implementation.

Do not silently reinterpret requirements. If a necessary change is discovered, add an ADR to `DECISIONS.md`, explain the trade-off, and update dependent specs.

## 3. Work discipline

- Work on **one task at a time**.
- Before coding, mark exactly one task `IN PROGRESS` in both worklogs.
- Keep changes narrowly scoped to the active task.
- Run the task's required tests before marking it done.
- Do not mark a task done if its acceptance criteria are only partially satisfied.
- After every task, update:
  - `WORKLOG.md`
  - `WORKLOG.json`
  - `PROJECT_STATE.json`
- Record meaningful implementation decisions in `DECISIONS.md`.
- If blocked, mark the task `BLOCKED`, document the reason and continue only with another task explicitly marked as not dependent on it.

## 4. Static-first constraints

The following require an ADR before being introduced:

- server-side page rendering;
- database;
- runtime AI API calls;
- authentication;
- server session state;
- React/Vue/Svelte;
- large UI frameworks;
- hosted search service;
- third-party analytics requiring visitor cookies;
- Lambda/API Gateway in the normal page request path.

Interactive fit calculations must run in the browser from data embedded in or loaded as static assets.

## 5. Dependency policy

Prefer platform capabilities and small dependencies.

For each new npm dependency:

1. State why native Astro/TypeScript/browser APIs are insufficient.
2. Check that it is maintained.
3. Avoid dependencies that bring an entire framework for one feature.
4. Add/update automated tests.
5. Record major architectural dependencies in `DECISIONS.md`.

## 6. Data integrity rules

Never invent dimensions or standards in production data.

Every non-derived physical measurement must have provenance fields defined by `specs/DATA_MODEL.md`. Derived values must declare their formula or derivation type.

A page must not publish if required measurements fail validation.

Conversion calculations must use one canonical internal unit system and deterministic rounding rules.

## 7. Content rules

- No mass-generated thin pages.
- A URL exists only when its page has independent user value.
- Never create every mathematical permutation of object × space.
- Prefer one strong matrix/hub page until Search Console or explicit research justifies a dedicated page.
- Content text supports the visual/data answer; it is not the core product.
- Never create fabricated reviews, experience claims or pseudo-expert quotes.

## 8. UI rules

- Mobile-first.
- Answer the user's fit question above the fold when possible.
- Use real numeric dimensions next to every important diagram.
- Diagrams must remain comprehensible without color alone.
- Keyboard operability and accessible labels are mandatory.
- No animation is required for core comprehension.

## 9. Testing rules

For any calculation logic:

- create unit tests before or alongside implementation;
- cover boundary equality (`object == available space`);
- cover unit conversion;
- cover invalid/negative/zero values;
- cover clearance calculations;
- add regression fixtures for bugs.

For generated pages:

- validate unique canonical URLs;
- validate no duplicate titles/descriptions within the initial set;
- validate internal links;
- validate structured data serialization;
- validate sitemap entries.

## 10. No cloud until gate

Do not create AWS resources or add required cloud credentials until every pre-deployment acceptance criterion is marked complete.

Infrastructure code may be drafted locally only in the deployment phase specified by the backlog.

## 11. Definition of a finished task

A task is `DONE` only when:

- implementation exists;
- tests pass;
- formatter/linter/type checks pass;
- acceptance criteria are demonstrated;
- worklogs are updated;
- docs changed by the implementation are updated.

## 12. Handoff protocol

Before ending an agent session:

1. Ensure no uncommitted conceptual state exists only in chat.
2. Update `PROJECT_STATE.json` with current task, blockers, last test command and next task.
3. Add a concise worklog entry.
4. Use `prompts/HANDOFF_PROMPT.md` as the next-session bootstrap if needed.

## 13. SEO requirements for every content/route change (v0.2.0)

Mandatory reading: `specs/TECHNICAL_SEO_PLAYBOOK.md`, `specs/SEO_AUTOMATED_GATES.md`, `specs/SEARCH_ENGINE_OPERATIONS.md`, `specs/SEO_CONTENT_GROWTH.md`.

- Never hand edit production XML sitemap after the build; publish registry drives HTML, canonical, breadcrumb and sitemap together.
- When adding/updating/renaming/removing an indexable route, maintain editorial significant-modification data, redirect registry when applicable, related links and sitemap membership.
- Use human-truthful visible content and valid structured data; do not promise rich results or fake reviews.
- `npm run validate:seo` and `npm run verify` are mandatory before marking SEO tasks completed. Offline builds/tests must never call Search Console, Bing/Yandex or IndexNow.
- Real engine property registration and IndexNow occur only after authorized production deployment, and their status is tracked separately from local readiness.
- T017/T018/T019/T024 task cards and applicable phase gates carry the precise tests.
