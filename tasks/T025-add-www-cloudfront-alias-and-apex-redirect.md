# T025 — Add www CloudFront alias and apex redirect

**Phase:** AWS
**Dependencies:** T024

## Objective

Serve `www.fitwise.stream` over HTTPS and permanently redirect every request to
`https://fitwise.stream`, preserving its path and query string. Keep the apex as
the only canonical hostname.

## Steps

- [ ] Update the ACM OIDC workflow to request/reuse a `us-east-1` certificate covering both apex and `www`, and report DNS validation CNAMEs for both names.
- [ ] Add both aliases to CloudFront and redirect `www` requests at viewer-request before directory-index rewriting.
- [ ] Run offline infrastructure and regression checks for apex rewrites, permanent `www` redirects, and query preservation.
- [ ] Publish the workflow/template changes, request the certificate, and add its validation CNAMEs in Cloudflare as DNS-only records.
- [ ] After ACM issuance, set GitHub `ACM_CERTIFICATE_ARN` and deploy through the production workflow.
- [ ] Add Cloudflare `www` CNAME to the CloudFront hostname (DNS only, TTL Auto) after the distribution deployment.
- [ ] Verify live apex content/canonical metadata and `www` 301 responses for root, nested paths, and queries.

## Acceptance criteria

- [ ] ACM certificate is `ISSUED` in `us-east-1` and includes `fitwise.stream` and `www.fitwise.stream`.
- [ ] CloudFront aliases include both names and the deployed viewer function returns 301 from `www` to the apex.
- [ ] Redirects preserve path and query; apex routes, canonical metadata, sitemap and HTTP-to-HTTPS behavior remain unchanged.
- [ ] Production verification and the owner-managed Cloudflare DNS records are recorded in the runbook and release audit.

## Guardrails

- Use GitHub OIDC workflows for AWS changes; do not use local administrator credentials or add Cloudflare credentials to the repository.
- Cloudflare DNS edits are owner operations and must remain DNS-only with TTL Auto.
- Do not claim live `www` support until certificate issuance, CloudFront deployment, DNS propagation and HTTPS smoke checks pass.
