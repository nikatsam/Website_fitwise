# Security and Privacy Specification

## 1. Threat model for v1

V1 has no authentication, database or user-generated content. The primary risks are:

- supply-chain dependencies;
- accidental public cloud origin exposure;
- cross-site scripting introduced through data/content rendering;
- malicious query/input values causing client-side errors;
- unsafe third-party scripts;
- deployment credential leakage.

## 2. Application rules

- Treat all URL/query/form inputs as untrusted.
- Prefer text rendering to raw HTML injection.
- Do not use `set:html`/equivalent with untrusted or externally sourced strings without sanitization and explicit justification.
- Validate numeric inputs and clamp only when UX explicitly explains it; do not silently alter measurements.
- No secrets in browser bundle.
- No secrets in repository.
- Do not require cookies for core functionality.

## 3. Dependency hygiene

- Keep dependency count low.
- Commit lockfile.
- Review dependency additions.
- Run available package audit tooling as part of release QA, while evaluating actual exploitability rather than blindly changing versions.

## 4. AWS rules

- S3 content bucket remains private.
- CloudFront uses OAC to access S3.
- Keep S3 Block Public Access enabled.
- Use least-privilege deployment credentials/role.
- Do not embed long-lived AWS keys in CI config or repository.
- TLS for public site.
- Optional security headers through CloudFront response headers policy or equivalent IaC.

Suggested headers:

- `Strict-Transport-Security` after HTTPS is confirmed;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy`;
- a conservative `Content-Security-Policy` once actual asset/script needs are known;
- `Permissions-Policy` disabling unused capabilities.

## 5. Analytics/privacy

If analytics is added:

- prefer privacy-minimal collection;
- do not collect precise user room dimensions as personal profiles;
- do not send FitCheck measurements to a server unless a later feature explicitly requires it and privacy docs are updated;
- local unit preference may use browser storage.
