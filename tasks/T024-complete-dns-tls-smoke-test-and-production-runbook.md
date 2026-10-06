# T024 — Complete DNS/TLS smoke test and production runbook

**Phase:** AWS  
**Dependencies:** T023

## Objective

Complete this task without expanding scope into later tasks.

## Steps

- Attach fitwise.stream custom domain.
- Verify HTTPS, redirects, representative routes, error behavior, sitemap/robots and blocked direct S3 access.
- Write concise production runbook/rollback notes.
- Verify CloudFront trailing-slash route mapping, real 404, redirect behavior, crawler access, production XML/robots content types and correct live canonical URLs.
- Prepare Google Search Console, Bing Webmaster Tools and Yandex Webmaster onboarding/submission checklist (owner action, no credentials in repo).
- Include optional post-deploy-only IndexNow notification flow for Bing/Yandex; do NOT send IndexNow to Google.

## Acceptance criteria

- [ ] All Gate F criteria pass.
- [ ] Worklog reaches 100% implementation.
- [ ] Production SEO smoke report saved using `templates/SEO_RELEASE_AUDIT.md`.
- [ ] Search-engine account/property/sitemap status recorded as completed or operationally pending, never assumed.

## Required close-out

- [ ] Run relevant automated checks.
- [ ] Update `WORKLOG.md`.
- [ ] Update `WORKLOG.json`.
- [ ] Update `PROJECT_STATE.json`.
- [ ] Record any architecture change in `DECISIONS.md`.
