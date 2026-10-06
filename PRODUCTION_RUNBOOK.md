# Production Runbook Draft (Not Deployed)

**Status:** Offline preparation only. No AWS resources, DNS records, certificates, or search-engine properties have been created. T021 is blocked pending the human signature on `SEO_RELEASE_AUDIT.md`; keep `cloudDeploymentAllowed` false.

## Current Hosting Draft

- IaC choice: CloudFormation JSON in `infra/fitwise-static-site.template.json` (proposed in ADR-011).
- Origin: private S3 REST endpoint; Block Public Access on, bucket-owner-enforced ownership, SSE-S3 encryption, versioning enabled, no S3 website endpoint.
- Delivery: CloudFront OAC with SigV4, least-privilege `s3:GetObject` scoped to the distribution ARN, TLS 1.2 or later, security response headers, and a CloudFront Function that maps directory/extensionless paths to `index.html`. S3 REST origins may return 403 for nonexistent private objects; the draft maps origin 403/404 to the real `/404.html` body with HTTP 404 without granting `s3:ListBucket`.
- Production packaging excludes local-only `/dev/` preview routes. The local QA build still includes them; `npm run deploy:plan` identifies but omits those files. Any cleanup of dev keys in an existing bucket must be inventoried and approved separately.
- Cache policy draft: HTML browser revalidation with a bounded shared-cache TTL; fingerprinted `/_astro/` assets immutable for one year; images one day; crawl-control and other static files short-lived. Verify emitted object metadata and CloudFront cache behavior before any apply.
- Certificate: the template requires an already-issued ACM certificate ARN in `us-east-1`, covering `fitwise.stream`. The template does not create or validate certificates and only aliases the apex domain. `www` is not configured.
- Region/price assumptions: S3 stack region is selected by the owner at deploy time. CloudFront uses `PriceClass_100` in this draft; revisit geographic coverage/cost before approval.

## Local Rehearsal (Safe)

1. Run `npm ci` and `npm run verify`.
2. Run `npm run infra:validate` and `sam validate --template-file infra/fitwise-static-site.template.json --lint`. These are local checks; do not run `aws cloudformation deploy`, `sam deploy`, or any AWS API command as part of this rehearsal.
3. Run `npm run deploy:plan`. It reads `dist/`, reports object hashes/content types/cache-control groups and invalidation paths, and prints illustrative AWS CLI commands containing `--dryrun`. It makes no network calls and does not run the printed commands.
4. Inspect every planned deletion, cache header and CloudFront invalidation path. Fingerprinted `/_astro/` assets are not invalidated; mutable HTML/images and crawl-control objects are.
5. After a later explicit deployment authorization, run `aws s3 sync ... --dryrun` with the actual `SiteBucketName` stack output and review the output before a separate owner-authorized real sync. Do not copy the placeholder destination from the local plan into a real command.

The checked-in GitHub Actions workflow `.github/workflows/validate-and-package.yml` runs `npm ci`, `npm run verify`, and uploads the static artifact without local-only `/dev/` previews. It has read-only repository permissions and no AWS credentials, deploy step, sync, or invalidation.

## Authorized Deployment Sequence (Future; Not Executed)

1. Obtain and record the signed T021 local SEO release audit. Confirm `cloudDeploymentAllowed` was explicitly enabled after that approval.
2. Review ADR-011, CloudFormation resource changes, account/region, budget, bucket lifecycle, `PriceClass_100`, and certificate/domain coverage. Confirm required AWS identity and change-management approvals outside the repository.
3. Obtain/validate the ACM certificate in `us-east-1` for `fitwise.stream`; preserve its ARN in the approved deployment system, not in source control.
4. Review and deploy the CloudFormation stack through the approved AWS identity. The future command shape is:

   ```sh
   aws cloudformation deploy \
     --template-file infra/fitwise-static-site.template.json \
     --stack-name fitwise-static-site \
     --region <owner-selected-stack-region> \
     --parameter-overrides \
       ApexDomainName=fitwise.stream \
       AcmCertificateArn=<issued-us-east-1-certificate-arn>
   ```

   This command was not executed. Record stack ID, region, bucket name, distribution ID, and domain output in the release record without credentials.

5. Check the generated distribution configuration and private bucket policy. Do not enable S3 website hosting or public bucket access.
6. Run the `npm run deploy:plan` review. Execute the sync only after a separate human approval of the actual S3 destination and `--delete` effects. Keep versioning/lifecycle protection and preserve old fingerprinted objects until their cache-retention window expires.
7. Invalidate only changed mutable object keys shown in the approved plan. Do not invalidate immutable fingerprinted assets; do not execute invalidation from the offline planning script.
8. Configure DNS with the CloudFront distribution output after verifying apex alias support at the DNS provider. Configure `www` only after adding an alias and a certificate SAN intentionally.
9. Run the production smoke matrix below and save output in a signed `SEO_RELEASE_AUDIT.md` record. Update worklog/project status only from observed live results.

## Production Smoke Matrix (Future)

- Verify apex HTTPS and only the intended canonical host; verify certificate chain, expiry, TLS version and redirects from HTTP.
- Check `/`, `/workspace/`, `/bedroom/`, one authored workspace page, one monitor chart, one US bed chart, one UK bed chart, `/404.html`, `/sitemap.xml`, and `/robots.txt` for status, content type and expected body.
- Check `/category/page/` serves the matching `index.html` through the CloudFront Function, and a nonexistent path returns the 404 body with actual HTTP 404 (not a rewritten homepage/200). Confirm the narrow 403-to-404 mapping does not hide other origin-policy failures in logs/alarms.
- Verify S3 direct public access is blocked, CloudFront access succeeds through OAC, no blanket `noindex` or `Disallow: /` is present, and cache/security headers match the approved policy.
- Verify sitemap canonicals, stable `lastmod`, published-only routes, robots reachability, and redirects against the signed local SEO audit.
- Search Console, Bing Webmaster, and Yandex property/sitemap status are owner operations. Record each as completed or **operationally pending**; never include credentials or verification tokens in git.

## Rollback Draft (Future)

- Stop further syncs and retain the previous deployment artifact plus S3 version history.
- Re-upload the approved previous static artifact with the same object metadata/cache groups; verify HTML, robots, sitemap, and asset keys before invalidating.
- Invalidate only the affected HTML, sitemap/robots and mutable image paths after checking them against `npm run deploy:plan` output. Leave content-hashed assets intact.
- If an infrastructure update is faulty, use the approved CloudFormation stack update rollback and inspect the resulting stack state before attempting another change. Do not delete the bucket or its retained object versions as an emergency shortcut.
- Re-run the production smoke matrix and document the incident, rollback result, and follow-up actions. DNS/certificate changes are rolled back only with owner/provider approval.

## Operational Guardrails

- This draft is not an AWS authorization, deployment approval, credential store, or claim that the domain is live.
- No AWS account, DNS provider, certificate, CloudFront distribution, or search-engine console has been accessed.
- Public cloud work remains prohibited while the T021 reviewer signature is outstanding and `cloudDeploymentAllowed` is false.
