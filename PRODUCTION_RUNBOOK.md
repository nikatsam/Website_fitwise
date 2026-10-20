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
3. Run `npm run deploy:plan`. It reads `dist/`, reports object hashes/content types/cache-control groups and one CloudFront invalidation path (`/*`), and prints illustrative AWS CLI commands containing `--dryrun`. It makes no network calls and does not run the printed commands.
4. Inspect planned deletions, cache headers and the wildcard scope. The single `/*` path clears all cached distribution objects, including fingerprinted `/_astro/` assets; expect cache misses while they refill.
5. After a later explicit deployment authorization, run `aws s3 sync ... --dryrun` with the actual `SiteBucketName` stack output and review the output before a separate owner-authorized real sync. Do not copy the placeholder destination from the local plan into a real command.

The production workflow `.github/workflows/deploy-production.yml` deploys only from `main`, requires manual confirmation, and assumes the OIDC role through the production environment. Its trust pins GitHub's immutable owner/repository IDs as well as the names. It uses no long-lived AWS keys. After a successful deployment, it notifies IndexNow only for changed canonical URLs and can resubmit the sitemap to Search Console if the owner configures the optional Google service-account/property values.

## CloudFront Invalidation Cost Control

- The production workflow now submits one CloudFront invalidation path, `/*`, after every HTML, fingerprinted-asset, image and crawl-control upload step has succeeded. It validates that the local deployment plan contains exactly this one path before calling AWS. The job is manually dispatched, has one invalidation step, and uses a concurrency group to prevent overlapping production deploys.
- AWS documents the first 1,000 invalidation paths per account per month as free, then `$0.005` per path; `/*` counts as **one path regardless of how many cached objects it matches** ([AWS billing guidance](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/PayingForInvalidation.html)). The October 7–17, 2026 audit reported 26 invalidation batches and approximately 327 paths beyond the free allowance, an estimated `$1.64` pending billing reconciliation. Actual account billing is shared across distributions and depends on the account's remaining monthly allowance.
- The production workflow now submits exactly one `/*` path after all uploads succeed. The deployment plan returns `invalidationPaths: ["/*"]`, the workflow rejects any plan with more than that one path, and `tests/unit/offline-release-prep.test.mjs` checks that invalidation follows all upload steps and remains a single wildcard.
- This one-path policy was deployed in commit `595379c` by production workflow run [`39065978579`](https://github.com/nikatsam/Website_fitwise/actions/runs/39065978579) on 2026-10-17. That run completed the step named `Invalidate distribution with one wildcard path` successfully. Subsequent deployments use one invalidation path instead of dozens of individual paths.
- Trade-off: `/*` evicts all cached objects, including one-year immutable hashed assets. This may temporarily increase S3 origin requests and reduce cache hits while the distribution warms. Astro `/_astro/` filenames are already content-fingerprinted and uploaded with immutable cache headers, but the wildcard still clears them.
- Longer-term cache optimization: replace `/*` only after the release workflow records object hashes for the last successful deployment and can invalidate the changed HTML routes plus changed crawl-control files. Keep unchanged fingerprinted `/_astro/` assets out of invalidations. This targeted-path strategy is not implemented; do not claim selective invalidation until the workflow has a verified previous-object manifest and tests for generated paths.
- The workflow remains manual, so avoid dispatching a second deployment for a SHA that already deployed successfully unless a re-publication is intended. A content-hash/no-op deploy guard is a possible later optimization; it is not included in the current one-path policy.

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
- Sitemap is 200 `application/xml`; robots is 200 `text/plain`. The initial T021 indexable sitemap had four URLs; feature indexing later expanded it to 41. IndexNow notifications ran successfully; Google Search Console API submission was skipped because no service-account/property inputs are configured.
- The GA4 tag for `G-J10W58E2ZL` is in deployed HTML and executes only on `fitwise.stream`. No consent banner/Consent Mode is implemented; consent/privacy review remains an owner action.
- T025/T026 production smoke checks are complete. Google Search Console, Bing Webmaster, and Yandex property verification remain owner-operationally-pending; this audit can confirm public DNS records but not account verification or indexing.

## Cloudflare DNS Record Check

1. The active record in Cloudflare's `fitwise.stream` zone is Type `CNAME`, Name `@`, Target `d1qzsj88vccaey.cloudfront.net`, Proxy status **DNS only** (grey cloud), TTL **Auto**. Cloudflare flattens this apex CNAME.
2. Keep both ACM validation CNAMEs. They now validate the apex and `www`; do not remove them while the certificate is in use.
3. The active `www` record is Type `CNAME`, Name `www`, Target `d1qzsj88vccaey.cloudfront.net`, Proxy status **DNS only**, TTL **Auto**. If it must be recreated, edit an existing `www` record rather than creating a duplicate.
4. Most recently verified: `https://www.fitwise.stream/` and a nested route return 301 to the matching apex URL with path/query preserved; apex returns 200. Recheck `/sitemap.xml`, `/robots.txt`, and a nonexistent path after future DNS/deployment changes. If Cloudflare proxying is enabled later, use SSL/TLS **Full (strict)**.

## Latest Application Release

- UX11-001–UX11-019 remediation commit `9583af19700f5204b0d71f8211497f916ba62881` was deployed on 2026-10-11 by [production workflow run `38167436772`](https://github.com/nikatsam/Website_fitwise/actions/runs/38167436772). Verification/build, OIDC, S3 publication and CloudFront invalidation request `IUPDCJ6EF63A92FY2OTUXR8G2` (78 paths) succeeded; IndexNow submitted 42 URLs (HTTP 200).
- `npm run verify` passed locally and in the workflow: 285 unit tests, typecheck, lint, formatting, 74 generated pages, 68 generated PageIntents, 42 canonical sitemap URLs, route/SEO/accessibility/content/infrastructure validation.
- Live browser QA: `npm run qa:keyboard -- https://fitwise.stream` passed in headless Chrome across 42 sitemap routes, including core/specialist progressive steps, unit modes, exact-fit boundaries, example/user transitions, SVG/text plans and breadcrumb/JSON-LD checks. This is automated evidence only; no human UX or screen-reader verification is claimed.
- Live route/security smoke: apex, `/fit-checks/`, and `/fit-services/` return 200; HTTPS `www` redirects directly to the corresponding apex URL preserving path/query; HTTP `www` redirects to HTTPS `www` and then apex (two hops). Unknown routes return 404. CSP, HSTS, nosniff, frame, referrer and permissions headers are present.
- Cache/CloudFront audit: HTML, sitemap and robots use `public, max-age=0, s-maxage=300, must-revalidate` and returned CloudFront cache hits after warming. Fingerprinted CSS uses `public, max-age=31536000, immutable`; logo SVG uses `public, max-age=86400`; both returned CloudFront hits. The initial post-invalidation requests missed as expected; subsequent responses had `Age` headers and hit the new objects.
- Sitemap/robots audit: sitemap returns 200 XML with 42 canonical apex URLs, including the new directory and preserved advanced route; robots returns 200 text with `Allow: /` and the sitemap location. No previously published URLs were removed.
- Ads/analytics audit: GA4 ID `G-J10W58E2ZL` was found in all 42 page documents and the GTM loader is present on the homepage. No ad-network scripts were found and `/ads.txt` returns 404 (no ad inventory is configured). No consent UI/Consent Mode exists; GA4 privacy/consent remains an owner decision. Search Console API submission was skipped because optional credentials/property configuration are unset.
- AdSense readiness: Google's [ads.txt guide](https://support.google.com/adsense/answer/7532444) says `ads.txt` is optional but strongly recommended. The current 404 is expected while there is no AdSense account, publisher ID or ad inventory; do not publish a placeholder. After AdSense assigns the publisher ID, copy its exact authorized-seller line into `/ads.txt` and verify the deployed file. Privacy-policy and consent requirements must also be addressed before serving ads.
- Breadcrumb audit: exactly one visible breadcrumb per non-home route and matching ordered `BreadcrumbList` names/URLs were confirmed for all generated routes, including noindex planning pages.
- The release workflow completed successfully, but its invalidation step emitted three non-fatal shell quoting errors while formatting the GitHub step summary. The operations-only follow-up corrects the `printf` formatting; it changes summary output only, not deployed assets or the successful invalidation.
- Fit-state/manual-data correction commit `d0f6b0a` was deployed by workflow `38055492924` on 2026-10-10. The workflow completed successfully, including verification/build, S3 sync, CloudFront invalidation and IndexNow notification.
- Production build validation: 221 tests, 73 generated pages, 72 internal routes and 41 canonical sitemap URLs. Live headless keyboard QA passed on the primary tool flows and crawled all 41 indexable routes.
- Manual/source-dependent appliance, monitor-arm, TV-mount and play-equipment results now require explicit user-entered provenance before claiming a complete fit/compatibility result. This does not validate the truth of entered source data; users remain responsible for checking exact current model instructions.
- Search Console API submission remains skipped until owner credentials/property configuration are available. Successful deployment and IndexNow delivery do not prove search-engine indexing.

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
