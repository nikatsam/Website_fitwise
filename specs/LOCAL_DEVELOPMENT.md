# Local / Offline Development Specification

## 1. Goal

The complete product must be buildable, testable and previewable on a developer machine without AWS credentials or cloud resources.

## 2. Runtime prerequisites

At implementation time:

- use current Node LTS;
- use the current stable Astro version;
- use the package manager selected in T001/T002 and commit its lockfile;
- record exact versions in `WORKLOG.md` when first installed.

Do not hard-code obsolete versions in this pack.

## 3. Offline meaning

After dependencies are installed and required research data has been added to the repository:

- `dev` must not require cloud access;
- `test` must not require cloud access;
- `build` must not require cloud access;
- production preview must not require cloud access;
- normal FitCheck interactions must not require network access.

External source URLs may be stored as provenance, but builds should not scrape/fetch them automatically.

## 4. Expected commands

The agent should converge on scripts equivalent to:

```text
npm run dev
npm run typecheck
npm run lint
npm run test
npm run validate:data
npm run validate:links
npm run build
npm run preview
```

Exact naming can differ slightly if documented, but one command should exist for a full CI-like local verification.

Recommended aggregate:

```text
npm run verify
```

which should run validation, typecheck, lint, tests and production build.

## 5. Fixtures

Tests must use committed local fixtures. No unit test may depend on a remote HTTP response.

If source research is performed with browsing tools, the final normalized facts/provenance are committed locally after review.

## 6. Environment variables

MVP local operation should require no secrets and ideally no environment variables.

If build metadata requires a public site URL, provide a safe local/default configuration and document production override separately.

## 7. Reproducibility

Before the AWS gate, verify from a clean checkout/install that:

1. dependencies install from lockfile;
2. `verify` passes;
3. production static output is generated;
4. preview works without credentials.

## 8. Cloud separation

AWS IaC and deploy commands belong under `infra/` or a clearly separated deployment directory added only in the AWS phase.

The application must not import AWS SDK packages merely to render or calculate pages.

## 9. SEO offline parity (v0.2.0)

Luna must implement `npm run validate:seo` and `npm run seo:diff` as **offline** commands in T017/T018/T019. These inspect generated `dist/` files, never call webmaster APIs or require live credentials. Robots/Sitemap must use the intended production origin only for public canonical references, while development previews remain local. `seo:diff` calculates changes locally; optional IndexNow publishing occurs only after authorized successful production deploy.
