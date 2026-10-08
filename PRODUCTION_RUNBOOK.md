# Production Runbook (Apex and WWW Live; Webmaster Setup Pending)

**Status:** T021 is signed off; apex and `www` are live through CloudFront. S3/CloudFormation are in `eu-north-1`; CloudFront is global; the dual-name ACM certificate is issued in `us-east-1`. Cloudflare apex and `www` CNAMEs are DNS-only. Webmaster property verification remains an owner operation.

## Current Hosting

- IaC choice: CloudFormation JSON in `infra/fitwise-static-site.template.json` (ADR-011).
- Origin: private S3 REST endpoint; Block Public Access on, bucket-owner-enforced ownership, SSE-S3 encryption, versioning enabled, no S3 website endpoint.
- Delivery: CloudFront OAC with SigV4, least-privilege `s3:GetObject` scoped to the distribution ARN, TLS 1.2 or later, security response headers, and a CloudFront Function that redirects `www` to the apex before mapping directory/extensionless paths to `index.html`. S3 REST-origin missing-key 403 responses are translated to the `/404.html` body with actual HTTP 404, without granting `s3:ListBucket`.
- Production packaging excludes local-only `/dev/` preview routes. The local QA build still includes them; `npm run deploy:plan` identifies but omits those files. Any cleanup of dev keys in an existing bucket must be inventoried and approved separately.
- Cache policy: HTML browser revalidation with bounded shared-cache TTL; fingerprinted `/_astro/` assets immutable for one year; images one day; crawl-control and other static files short-lived.
- Certificate: The deployed ACM certificate is issued in `us-east-1` and covers both `fitwise.stream` and `www.fitwise.stream`. CloudFront has both aliases; both Cloudflare traffic CNAMEs are configured DNS-only.
- Region/price: S3 and CloudFormation stack are in `eu-north-1`; CloudFront is global and uses `PriceClass_100`.
- Tagging: taggable Fitwise resources and stacks carry both `project=fitwise` and `Project=FitWise`. CloudFront OAC/cache/response-policy subresources rejected tag operations and use the `fitwise-static-site` name prefix; the pre-existing shared OIDC provider is not retagged.

## Local Rehearsal (Safe)

1. Run `npm ci` and `npm run verify`.
2. Run `npm run infra:validate` and local `sam validate --template-file infra/fitwise-static-site.template.json --lint` plus `sam validate --template-file infra/github-oidc-deploy-role.template.json --lint`.
3. Run `npm run deploy:plan`. It reads `dist/`, reports object hashes/content types/cache-control groups and invalidation paths, and prints illustrative AWS CLI commands containing `--dryrun`. It makes no network calls and does not run the printed commands.
4. Inspect every planned deletion, cache header and CloudFront invalidation path. Fingerprinted `/_astro/` assets are not invalidated; mutable HTML/images and crawl-control objects are.
5. After a later explicit deployment authorization, run `aws s3 sync ... --dryrun` with the actual `SiteBucketName` stack output and review the output before a separate owner-authorized real sync. Do not copy the placeholder destination from the local plan into a real command.

The production workflow `.github/workflows/deploy-production.yml` deploys only from `main`, requires manual confirmation, and assumes the OIDC role through the production environment. Its trust pins GitHub's immutable owner/repository IDs as well as the names. It uses no long-lived AWS keys. After a successful deployment, it notifies IndexNow only for changed canonical URLs and can resubmit the sitemap to Search Console if the owner configures the optional Google service-account/property values.

## Live Deployment Record

- GitHub Actions run `37672593182` created the private S3/CloudFront site in account `754246170171`; a follow-up tag-only run completed. Stack status is `UPDATE_COMPLETE` in `eu-north-1`.
- T025 dual-host certificate/alias deployment completed in workflow `37744144860`; T026 content upgrade deployment completed in `37757168827`, with comparison-copy follow-up in `37758357733`.
- S3 bucket: `fitwise-static-site-754246170171-eu-north-1`. It has Block Public Access enabled, SSE-S3, versioning, and both project tags.
- CloudFront distribution: `EY0IX2NYZEEG1`; domain `d1qzsj88vccaey.cloudfront.net`; viewer aliases `fitwise.stream` and `www.fitwise.stream`; TLS minimum `TLSv1.2_2021`.
- The ACM certificate `d8916f6d-31f8-4696-b3fb-b6594c4b8df5` is `ISSUED` in `us-east-1` for both hostnames. All regional site infrastructure is in `eu-north-1`; CloudFront is global.
- Cloudflare apex (`fitwise.stream`) and `www` CNAMEs are configured DNS-only and resolve to CloudFront.

## Production Smoke Results

- CloudFront returned 200 for Home, both hubs, the monitor chart, the US bed chart, sitemap, robots, and the IndexNow key file. Unknown paths return 404; HTTP redirects to HTTPS.
- DNS-resolved HTTPS tests confirm `www.fitwise.stream/` and nested paths return 301 to the apex, preserving path/query. Apex returns 200.
- Direct S3 REST access returns 403. CloudFront uses OAC, TLS 1.2 or later, CSP/HSTS/nosniff/frame/referrer/permissions headers, and the static route rewrite.
- Sitemap is 200 `application/xml`; robots is 200 `text/plain`. The indexable sitemap has four URLs. IndexNow notifications ran successfully; Google Search Console API submission was skipped because no service-account/property inputs are configured.
- The GA4 tag for `G-J10W58E2ZL` is in deployed HTML and executes only on `fitwise.stream`. No consent banner/Consent Mode is implemented; consent/privacy review remains an owner action.
- T025/T026 production smoke checks are complete. Google Search Console, Bing Webmaster, and Yandex property verification remain owner-operationally-pending; this audit can confirm public DNS records but not account verification or indexing.

## Cloudflare DNS Record Check

1. The active record in Cloudflare's `fitwise.stream` zone is Type `CNAME`, Name `@`, Target `d1qzsj88vccaey.cloudfront.net`, Proxy status **DNS only** (grey cloud), TTL **Auto**. Cloudflare flattens this apex CNAME.
2. Keep both ACM validation CNAMEs. They now validate the apex and `www`; do not remove them while the certificate is in use.
3. The active `www` record is Type `CNAME`, Name `www`, Target `d1qzsj88vccaey.cloudfront.net`, Proxy status **DNS only**, TTL **Auto**. If it must be recreated, edit an existing `www` record rather than creating a duplicate.
4. Most recently verified: `https://www.fitwise.stream/` and a nested route return 301 to the matching apex URL with path/query preserved; apex returns 200. Recheck `/sitemap.xml`, `/robots.txt`, and a nonexistent path after future DNS/deployment changes. If Cloudflare proxying is enabled later, use SSL/TLS **Full (strict)**.

## Search and Analytics Setup

- Google Search Console: the DNS TXT verification record is publicly present; confirm the Domain property `sc-domain:fitwise.stream` is verified in the owner's account and submit `https://fitwise.stream/sitemap.xml`. For automatic API resubmission, add a service account as a property owner and set GitHub `GSC_SERVICE_ACCOUNT_JSON` and `GSC_SITE_PROPERTY`.
- Bing Webmaster: import the verified Google property or verify through Bing; submit the sitemap. IndexNow sends changed canonical URLs to Bing/Yandex, not sitemap files; Google does not consume IndexNow.
- Yandex Webmaster: add and verify `https://fitwise.stream/` using its DNS TXT or HTML meta value, then submit the sitemap and confirm IndexNow notifications.
- GA4 uses `G-J10W58E2ZL`. Review privacy/consent obligations before collecting analytics; the current tag fires only on the apex hostname, but no consent UI exists yet.
- Record each provider as complete or **operationally pending**. Do not put service-account JSON, credentials, or verification secrets in Git.

## Rollback Draft (Future)

- Stop further syncs and retain the previous deployment artifact plus S3 version history.
- Re-upload the approved previous static artifact with the same object metadata/cache groups; verify HTML, robots, sitemap, and asset keys before invalidating.
- Invalidate only the affected HTML, sitemap/robots and mutable image paths after checking them against `npm run deploy:plan` output. Leave content-hashed assets intact.
- If an infrastructure update is faulty, use the approved CloudFormation stack update rollback and inspect the resulting stack state before attempting another change. Do not delete the bucket or its retained object versions as an emergency shortcut.
- Re-run the production smoke matrix and document the incident, rollback result, and follow-up actions. DNS/certificate changes are rolled back only with owner/provider approval.

## Operational Guardrails

- This runbook is not a credential store or a claim about search-engine indexation. The T021 release audit has been signed off and `cloudDeploymentAllowed` is true. T025/T026 are deployed and both apex and `www` are live.
- The one-time `fitwise-github-oidc` IAM role stack was bootstrapped with the authorized administrator context and later updated through CloudFormation. The shared account OIDC provider was pre-existing and was not modified. Future ACM/site deployments use GitHub OIDC.
- Use the GitHub production workflows for subsequent ACM/site deployment; do not run a local S3 sync or direct site-stack deployment with the administrator profile.
- The deploy workflow sends IndexNow URL changes, not sitemap files. IndexNow key material is public by design and the site hosts its matching root key file. Google does not consume IndexNow; Google sitemap API submission is optional and remains disabled until the owner configures GSC service-account JSON/property variables.
- GA4 uses Measurement ID `G-J10W58E2ZL`; the layout emits the tag only when the browser hostname is exactly `fitwise.stream`, so localhost/CloudFront-default-domain previews do not send analytics. The CloudFront CSP permits Google tag/collection hosts. Review applicable privacy/consent requirements before launch; no consent banner or consent-mode gate exists in the site. Cloudflare DNS, Search Console verification, Bing/Yandex property ownership, and Google service-account authority remain owner-account operations.
