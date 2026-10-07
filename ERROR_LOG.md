# Error Log

## 2026-10-06 — `npm ci` fails on locked Astro native binding

- **Severity:** Medium; clean-install verification blocked.
- **Command:** `npm ci`
- **Error:** Windows returned `EPERM` (`unlink`) for `node_modules/@astrojs/compiler-binding-win32-x64-msvc/astro.win32-x64-msvc.node` because the native file was in use.
- **Impact:** The lockfile-based clean install could not complete, so T019's clean-install acceptance criterion remains unverified. No user process was terminated.
- **Recovery:** After re-verifying and stopping the user-authorized Astro CLI process (PID 42356), `npm ci` completed successfully (389 packages, 0 vulnerabilities). A subsequent `npm run verify` passed: 130/130 tests, static build, dataset validation, SEO, internal-link, and route smoke checks.
- **Status:** Resolved 2026-10-06.

## 2026-10-06 — GitHub Actions OIDC assume-role rejected

- **Severity:** Medium; certificate workflow did not progress to ACM creation.
- **Symptom:** Two dispatches of `Request Fitwise ACM certificate` failed at `AssumeRoleWithWebIdentity`; those runs created no certificate or site resources.
- **Cause:** GitHub's emitted subject included immutable owner/repository IDs (`nikatsam@22520540/Website_fitwise@1407694634:environment:production`), while the first IAM trust policy matched only the name-based subject.
- **Recovery:** The workflow diagnostic confirmed GitHub's immutable repository-ID subject. Updated the role trust and bootstrap stack. A later OIDC assumption succeeded but initially exposed an ACM multi-valued domain-condition mismatch; changed the policy to `ForAllValues:StringEquals`. `aws iam simulate-principal-policy` now allows the tagged `fitwise.stream` request.
- **Resolution:** The next GitHub workflow successfully requested certificate `arn:aws:acm:us-east-1:754246170171:certificate/0b912086-a718-4faf-b3d2-f3e8250a55e4`, tagged `project=fitwise`. It is `PENDING_VALIDATION` until the owner adds its DNS CNAME. No site bucket or CloudFront distribution was created.
- **Status:** OIDC/ACM permission issue resolved; ACM DNS validation pending.
