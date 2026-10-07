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
- **Resolution:** The next GitHub workflow successfully requested certificate `arn:aws:acm:us-east-1:754246170171:certificate/0b912086-a718-4faf-b3d2-f3e8250a55e4`, tagged `project=fitwise`. It was initially `PENDING_VALIDATION`; the owner later added the DNS validation CNAME and ACM issued it. No site bucket or CloudFront distribution had been created at this point.
- **Status:** OIDC/ACM request issue resolved; the issued certificate was deployed with CloudFront as shown below.

## 2026-10-07 — First OIDC site stack rolled back on CloudFront tag permission

- **Severity:** High; first S3/CloudFront stack deployment did not complete.
- **Workflow:** GitHub Actions run `37667834671` (`Deploy Fitwise static site`).
- **Error:** CloudFormation could not create `DirectoryIndexFunction`: the OIDC role lacked `cloudfront:TagResource` for the required `project=fitwise` function tag.
- **Impact:** The stack entered `ROLLBACK_COMPLETE`. No distribution was created and no site files were synchronized.
- **Recovery:** Added narrowly scoped tag-on-create permissions for the Fitwise-tagged distribution/function and updated the OIDC role stack. IAM simulation now allows the exact tagged function action. Deleted the failed stack and the retained OAC/cache/header-policy artifacts by their recorded IDs; verified the stack record and S3 bucket are absent. The issued ACM certificate remains untouched.
- **Status:** The tag-on-create failure was resolved; see the second deployment event below.

## 2026-10-07 — Second OIDC site stack rolled back on CloudFront tag read

- **Workflow:** GitHub Actions run `37669968715` (`Deploy Fitwise static site`).
- **Error:** CloudFormation could not resolve the directory Function ARN because the OIDC role lacked `cloudfront:ListTagsForResource`.
- **Impact:** The stack rolled back again; CloudFront policy/OAC/function resources were retained. No distribution was created and no site files were synchronized.
- **Recovery:** Added scoped tag-read permissions and updated the OIDC role stack. IAM simulation allows the Function tag read. Deleted the failed stack and exact retained helper resources; verified no failed stack, bucket, OAC, policies, or function remain.
- **Status:** Resolved by successful GitHub deployment run `37672593182` after the subsequent IAM tag-read fix and cleanup.

## 2026-10-07 — Successful OIDC site deployment

- **Resolution:** GitHub Actions run `37672593182` created the private S3 origin and CloudFront distribution through OIDC; run `37674732291` updated resource lifecycle/status tags. Stack is `UPDATE_COMPLETE`, CloudFront `Deployed`.
- **Validation:** Live CloudFront smoke passed; direct S3 returned 403, unknown path returned 404, and routes/sitemap/robots were served with expected types/headers.
- **Remaining operational item:** `fitwise.stream` apex DNS still awaits the Cloudflare CNAME; tracked under T024, not an application deployment failure.
- **Status:** Deployment issue resolved; T024 custom-domain/owner account checks remain open.
