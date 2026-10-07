# T024 — Complete DNS/TLS smoke test and production runbook

**Phase:** AWS  
**Dependencies:** T023

## Objective

Complete this task without expanding scope into later tasks.

## Steps

- [x] Add the Cloudflare apex CNAME for `fitwise.stream` to the deployed distribution and verify public DNS/TLS.
- [x] Verify apex and CloudFront HTTPS redirects, representative routes, real 404, sitemap/robots responses, and blocked direct S3 access.
- [x] Write production deployment/rollback runbook and DNS/TLS/search onboarding steps.
- [x] Verify trailing-slash routing, HTTP 404 translation, crawler access, production XML/robots content types, and canonical HTML through `https://fitwise.stream/`.
- [x] Prepare Google Search Console, Bing Webmaster Tools, and Yandex onboarding/submission checklists; record properties operationally pending and store no account credentials.
- [x] Deploy an optional post-deploy IndexNow notification flow for changed published URLs to Bing/Yandex; it does not submit to Google.

## Acceptance criteria

- [x] All technical Gate F checks pass; webmaster properties are explicitly recorded as operationally pending owner access.
- [x] Worklog reaches 100% implementation.
- [x] Production smoke findings are recorded in `SEO_RELEASE_AUDIT.md`.
- [x] Search-engine account/property/sitemap status recorded as completed or operationally pending, never assumed.

## Required close-out

- [x] Run relevant automated and live custom-apex CloudFront smoke checks.
- [x] Update `WORKLOG.md`.
- [x] Update `WORKLOG.json`.
- [x] Update `PROJECT_STATE.json` to reflect the live custom domain and operationally pending owner properties.
- [x] No architecture change required.
