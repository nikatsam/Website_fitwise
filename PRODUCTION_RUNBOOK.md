# Production Runbook (Custom Apex Live; Webmaster Setup Pending)

**Status:** T021 is signed off and the Fitwise CloudFront deployment succeeded through GitHub OIDC. S3/CloudFormation are in `eu-north-1`; CloudFront is global; the `fitwise.stream` ACM certificate is issued in `us-east-1`. Cloudflare apex CNAME is configured and `https://fitwise.stream` is live. Webmaster property verification remains an owner operation.

## Current Hosting

- IaC choice: CloudFormation JSON in `infra/fitwise-static-site.template.json` (ADR-011).
- Origin: private S3 REST endpoint; Block Public Access on, bucket-owner-enforced ownership, SSE-S3 encryption, versioning enabled, no S3 website endpoint.
- Delivery: CloudFront OAC with SigV4, least-privilege `s3:GetObject` scoped to the distribution ARN, TLS 1.2 or later, security response headers, and a CloudFront Function that maps directory/extensionless paths to `index.html`. S3 REST-origin missing-key 403 responses are translated to the `/404.html` body with actual HTTP 404, without granting `s3:ListBucket`.
- Production packaging excludes local-only `/dev/` preview routes. The local QA build still includes them; `npm run deploy:plan` identifies but omits those files. Any cleanup of dev keys in an existing bucket must be inventoried and approved separately.
- Cache policy: HTML browser revalidation with bounded shared-cache TTL; fingerprinted `/_astro/` assets immutable for one year; images one day; crawl-control and other static files short-lived.
- Certificate: ACM certificate is issued in `us-east-1`, covering `fitwise.stream`. The CloudFront distribution aliases the apex only; `www` is not configured.
- Region/price: S3 and CloudFormation stack are in `eu-north-1`; CloudFront is global and uses `PriceClass_100`.
- Tagging: taggable Fitwise resources and stacks use the exact AWS tag `project=fitwise`. CloudFront subresources whose CloudFormation schemas do not support tags use `fitwise-static-site` name prefixes; the shared account-wide OIDC provider is not retagged.

## Local Rehearsal (Safe)

1. Run `npm ci` and `npm run verify`.
2. Run `npm run infra:validate` and local `sam validate --template-file infra/fitwise-static-site.template.json --lint` plus `sam validate --template-file infra/github-oidc-deploy-role.template.json --lint`.
3. Run `npm run deploy:plan`. It reads `dist/`, reports object hashes/content types/cache-control groups and invalidation paths, and prints illustrative AWS CLI commands containing `--dryrun`. It makes no network calls and does not run the printed commands.
4. Inspect every planned deletion, cache header and CloudFront invalidation path. Fingerprinted `/_astro/` assets are not invalidated; mutable HTML/images and crawl-control objects are.
5. After a later explicit deployment authorization, run `aws s3 sync ... --dryrun` with the actual `SiteBucketName` stack output and review the output before a separate owner-authorized real sync. Do not copy the placeholder destination from the local plan into a real command.

The production workflow `.github/workflows/deploy-production.yml` deploys only from `main`, requires manual confirmation, and assumes the OIDC role through the production environment. Its trust pins GitHub's immutable owner/repository IDs as well as the names. It uses no long-lived AWS keys. After a successful deployment, it notifies IndexNow only for changed canonical URLs and can resubmit the sitemap to Search Console if the owner configures the optional Google service-account/property values.

## Live Deployment Record

- GitHub Actions run `37672593182` created the private S3/CloudFront site in account `754246170171`; a follow-up tag-only run completed. Stack status is `UPDATE_COMPLETE` in `eu-north-1`.
- S3 bucket: `fitwise-static-site-754246170171-eu-north-1`. It has Block Public Access enabled, SSE-S3, versioning, and `project=fitwise`.
- CloudFront distribution: `EY0IX2NYZEEG1`; domain `d1qzsj88vccaey.cloudfront.net`; viewer alias `fitwise.stream`; TLS minimum `TLSv1.2_2021`; tag `project=fitwise`.
- The ACM apex certificate is `ISSUED` in `us-east-1`, which is required for a CloudFront custom-domain certificate. All regional site infrastructure is in `eu-north-1`; CloudFront is global.
- The Cloudflare apex CNAME is now configured DNS-only and `fitwise.stream` resolves to CloudFront.

## Production Smoke Results

- CloudFront returned 200 for Home, both hubs, the monitor chart, the US bed chart, sitemap, robots, and the IndexNow key file. Unknown paths return 404; HTTP redirects to HTTPS.
- Direct S3 REST access returns 403. CloudFront uses OAC, TLS 1.2 or later, CSP/HSTS/nosniff/frame/referrer/permissions headers, and the static route rewrite.
- Sitemap is 200 `application/xml`; robots is 200 `text/plain`. The indexable sitemap has four URLs. IndexNow notifications ran successfully; Google Search Console API submission was skipped because no service-account/property inputs are configured.
- The GA4 tag for `G-J10W58E2ZL` is in deployed HTML and executes only on `fitwise.stream`. No consent banner/Consent Mode is implemented; consent/privacy review remains an owner action.
- T024 is complete for technical deployment checks. Google Search Console, Bing Webmaster, and Yandex property verification remain owner-operationally-pending.

## Cloudflare DNS Steps

1. The active record in Cloudflare's `fitwise.stream` zone is Type `CNAME`, Name `@`, Target `d1qzsj88vccaey.cloudfront.net`, Proxy status **DNS only** (grey cloud), TTL **Auto**. Cloudflare flattens this apex CNAME.
2. Keep the existing ACM validation CNAME. Do not add `www`; neither the certificate nor the CloudFront aliases include it.
3. `https://fitwise.stream/`, `/sitemap.xml`, `/robots.txt`, and a nonexistent path have been smoke tested after DNS propagation. If Cloudflare proxying is enabled later, use SSL/TLS **Full (strict)**.

## Search and Analytics Setup

- Google Search Console: create a Domain property `sc-domain:fitwise.stream`; add its TXT verification record in Cloudflare; verify; submit `https://fitwise.stream/sitemap.xml`. For automatic API resubmission, add a service account as a property owner and set GitHub `GSC_SERVICE_ACCOUNT_JSON` and `GSC_SITE_PROPERTY`.
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

- This runbook is not a credential store or claim that the domain is live. The T021 release audit has been signed off and `cloudDeploymentAllowed` is true.
- The one-time `fitwise-github-oidc` IAM role stack has been bootstrapped using the authorized administrator context. The shared account OIDC provider was pre-existing and was not modified. Site bucket/distribution, ACM certificate, Cloudflare DNS, GA4, and webmaster properties are still pending.
- Use the GitHub production workflows for subsequent ACM/site deployment; do not run a local S3 sync or direct site-stack deployment with the administrator profile.
- The deploy workflow sends IndexNow URL changes, not sitemap files. IndexNow key material is public by design and the site hosts its matching root key file. Google does not consume IndexNow; Google sitemap API submission is optional and remains disabled until the owner configures GSC service-account JSON/property variables.
- GA4 uses Measurement ID `G-J10W58E2ZL`; the layout emits the tag only when the browser hostname is exactly `fitwise.stream`, so localhost/CloudFront-default-domain previews do not send analytics. The CloudFront CSP permits Google tag/collection hosts. Review applicable privacy/consent requirements before launch; no consent banner or consent-mode gate exists in the site. Cloudflare DNS, Search Console verification, Bing/Yandex property ownership, and Google service-account authority remain owner-account operations.
