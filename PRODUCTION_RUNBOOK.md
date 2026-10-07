# Production Runbook Draft (Not Deployed)

**Status:** T021 is signed off. The account's shared GitHub OIDC provider was pre-existing and left unchanged. The `fitwise-github-oidc` role stack is bootstrapped in `eu-north-1`, tagged `project=fitwise`; trust is restricted to `nikatsam/Website_fitwise`'s production environment on `main`. GitHub OIDC role/region variables and the `production` environment are configured. No Fitwise S3 bucket, CloudFront distribution, ACM certificate, Cloudflare DNS record, GA4 tag, or webmaster property is live yet.

## Current Hosting Draft

- IaC choice: CloudFormation JSON in `infra/fitwise-static-site.template.json` (proposed in ADR-011).
- Origin: private S3 REST endpoint; Block Public Access on, bucket-owner-enforced ownership, SSE-S3 encryption, versioning enabled, no S3 website endpoint.
- Delivery: CloudFront OAC with SigV4, least-privilege `s3:GetObject` scoped to the distribution ARN, TLS 1.2 or later, security response headers, and a CloudFront Function that maps directory/extensionless paths to `index.html`. S3 REST origins may return 403 for nonexistent private objects; the draft maps origin 403/404 to the real `/404.html` body with HTTP 404 without granting `s3:ListBucket`.
- Production packaging excludes local-only `/dev/` preview routes. The local QA build still includes them; `npm run deploy:plan` identifies but omits those files. Any cleanup of dev keys in an existing bucket must be inventoried and approved separately.
- Cache policy draft: HTML browser revalidation with a bounded shared-cache TTL; fingerprinted `/_astro/` assets immutable for one year; images one day; crawl-control and other static files short-lived. Verify emitted object metadata and CloudFront cache behavior before any apply.
- Certificate: the template requires an issued ACM certificate ARN in `us-east-1`, covering `fitwise.stream`. `.github/workflows/request-acm-certificate.yml` requests/reuses and tags the certificate, then prints the DNS validation record; it does not change Cloudflare. The site template aliases the apex only; `www` is not configured.
- Region/price assumptions: S3 stack region is selected by the owner at deploy time. CloudFront uses `PriceClass_100` in this draft; revisit geographic coverage/cost before approval.
- Tagging: taggable Fitwise resources and stacks use the exact AWS tag `project=fitwise`. CloudFront subresources whose CloudFormation schemas do not support tags use `fitwise-static-site` name prefixes; the shared account-wide OIDC provider is not retagged.

## Local Rehearsal (Safe)

1. Run `npm ci` and `npm run verify`.
2. Run `npm run infra:validate` and local `sam validate --template-file infra/fitwise-static-site.template.json --lint` plus `sam validate --template-file infra/github-oidc-deploy-role.template.json --lint`.
3. Run `npm run deploy:plan`. It reads `dist/`, reports object hashes/content types/cache-control groups and invalidation paths, and prints illustrative AWS CLI commands containing `--dryrun`. It makes no network calls and does not run the printed commands.
4. Inspect every planned deletion, cache header and CloudFront invalidation path. Fingerprinted `/_astro/` assets are not invalidated; mutable HTML/images and crawl-control objects are.
5. After a later explicit deployment authorization, run `aws s3 sync ... --dryrun` with the actual `SiteBucketName` stack output and review the output before a separate owner-authorized real sync. Do not copy the placeholder destination from the local plan into a real command.

The production workflow `.github/workflows/deploy-production.yml` deploys only from `main`, requires manual confirmation, and assumes the OIDC role through the production environment. Its trust pins GitHub's immutable owner/repository IDs as well as the names. It uses no long-lived AWS keys. After a successful deployment, it notifies IndexNow only for changed canonical URLs and can resubmit the sitemap to Search Console if the owner configures the optional Google service-account/property values.

## Authorized Deployment Sequence (Future; Not Executed)

1. Confirm `PROJECT_STATE.json` still has `cloudDeploymentAllowed: true`; review ADR-011, account `754246170171`, stack region `eu-north-1`, bucket lifecycle, `PriceClass_100`, and the apex-only certificate scope.
2. Commit/push the reviewed deployment workflows to `main`. In GitHub Actions, manually run **Request Fitwise ACM certificate** in the `production` environment. It requests/reuses a `fitwise.stream` ACM certificate in `us-east-1`, tagged `project=fitwise`, and prints the DNS validation CNAME.
3. In Cloudflare, open the `fitwise.stream` zone → **DNS** → **Records** → **Add record**. Add the exact ACM validation record: Type `CNAME`, Name from ACM (remove the `.fitwise.stream` suffix only if Cloudflare appends the zone automatically), Target the exact ACM `ResourceRecord.Value`, Proxy status **DNS only** (grey cloud), TTL **Auto**. Wait until ACM reports `ISSUED`, then set GitHub repository variable `ACM_CERTIFICATE_ARN` to its ARN. Do not store certificate credentials in source control.
4. From `main`, manually run **Deploy Fitwise static site**, set `confirm_deploy=true`, and select the `production` environment. GitHub Actions uses the repository-scoped OIDC role to apply CloudFormation, sync cache groups, and invalidate only mutable paths from the plan.
5. Review the workflow's stack outputs: bucket, CloudFront distribution ID, and distribution DNS target. Check that taggable resources show `project=fitwise`.
6. In Cloudflare DNS, add CNAME Name `@`, Target the exact CloudFront distribution domain, Proxy status **DNS only** initially, TTL **Auto**. Cloudflare flattens the apex CNAME. Do not add `www` unless its alias and certificate SAN are intentionally added to IaC. If orange-cloud proxying is considered later, configure SSL/TLS **Full (strict)** and test both TLS layers.
7. Run the production smoke matrix below and record actual live results in a signed `SEO_RELEASE_AUDIT.md` entry.

## Production Smoke Matrix (Future)

- Verify apex HTTPS and only the intended canonical host; verify certificate chain, expiry, TLS version and redirects from HTTP.
- Check `/`, `/workspace/`, `/bedroom/`, one authored workspace page, one monitor chart, one US bed chart, one UK bed chart, `/404.html`, `/sitemap.xml`, and `/robots.txt` for status, content type and expected body.
- Check `/category/page/` serves the matching `index.html` through the CloudFront Function, and a nonexistent path returns the 404 body with actual HTTP 404 (not a rewritten homepage/200). Confirm the narrow 403-to-404 mapping does not hide other origin-policy failures in logs/alarms.
- Verify S3 direct public access is blocked, CloudFront access succeeds through OAC, no blanket `noindex` or `Disallow: /` is present, and cache/security headers match the approved policy.
- Verify sitemap canonicals, stable `lastmod`, published-only routes, robots reachability, and redirects against the signed local SEO audit.
- Google Search Console: add a Domain property `sc-domain:fitwise.stream`, create its TXT verification record in Cloudflare, verify ownership, and submit `https://fitwise.stream/sitemap.xml`. The deploy workflow re-submits via the Search Console API only when `GSC_SERVICE_ACCOUNT_JSON` and `GSC_SITE_PROPERTY` are configured; the service account must be granted owner access to the property.
- Bing Webmaster: import the verified Search Console property or perform Bing's own DNS verification, then submit the sitemap. IndexNow notifications cover changed sitemap URLs for Bing and Yandex; IndexNow sends URL changes, not sitemap files, and Google does not consume IndexNow.
- Yandex Webmaster: add `https://fitwise.stream/`, verify ownership with its supplied DNS TXT or HTML meta value, and submit the sitemap. Then confirm a key file and changed-URL notifications in Yandex's IndexNow tooling.
- GA4: create a web data stream and provide its `G-...` Measurement ID. Analytics is not loaded until the measurement ID and the site's consent/privacy behavior are explicitly approved; do not collect analytics before the applicable consent decision.
- Record each console/property as completed or **operationally pending**; never commit credentials, service-account JSON, or verification secrets.

## Rollback Draft (Future)

- Stop further syncs and retain the previous deployment artifact plus S3 version history.
- Re-upload the approved previous static artifact with the same object metadata/cache groups; verify HTML, robots, sitemap, and asset keys before invalidating.
- Invalidate only the affected HTML, sitemap/robots and mutable image paths after checking them against `npm run deploy:plan` output. Leave content-hashed assets intact.
- If an infrastructure update is faulty, use the approved CloudFormation stack update rollback and inspect the resulting stack state before attempting another change. Do not delete the bucket or its retained object versions as an emergency shortcut.
- Re-run the production smoke matrix and document the incident, rollback result, and follow-up actions. DNS/certificate changes are rolled back only with owner/provider approval.

## Operational Guardrails

- This runbook is not a credential store or claim that the domain is live. The T021 release audit has been signed off and `cloudDeploymentAllowed` is true.
- The one-time `fitwise-github-oidc` IAM role stack has been bootstrapped using the authorized administrator context. The shared account OIDC provider was pre-existing and was not modified. Site bucket/distribution, ACM certificate, Cloudflare DNS, GA4, and webmaster properties are still pending.
- Use the GitHub production workflows for subsequent ACM/site deployment; do not run a local S3 sync or direct site-stack deployment with the administrator profile.
- The deploy workflow sends IndexNow URL changes, not sitemap files. IndexNow key material is public by design and the site hosts its matching root key file. Google does not consume IndexNow; Google sitemap API submission is optional and remains disabled until the owner configures GSC service-account JSON/property variables.
- GA4 uses Measurement ID `G-J10W58E2ZL`; the layout emits the tag only when the browser hostname is exactly `fitwise.stream`, so localhost/CloudFront-default-domain previews do not send analytics. The CloudFront CSP permits Google tag/collection hosts. Review applicable privacy/consent requirements before launch; no consent banner or consent-mode gate exists in the site. Cloudflare DNS, Search Console verification, Bing/Yandex property ownership, and Google service-account authority remain owner-account operations.
