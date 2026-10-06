# AWS Deployment Specification

**Phase gate:** Do not execute this phase until T021 (local production acceptance) is DONE.

## 1. Baseline architecture

```text
fitwise.stream
    ↓ DNS
CloudFront distribution
    ↓ Origin Access Control
Private S3 bucket
    ↓
Astro `dist/` static files
```

AWS currently recommends CloudFront Origin Access Control (OAC) for restricting access to S3 origins. The S3 origin should be a regular bucket origin, not a public S3 website endpoint, when using OAC.

Primary references:

- https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html
- https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/getting-started-secure-static-website-cloudformation-template.html
- https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-management.html

## 2. Infrastructure as code

Use one IaC system consistently. Preferred options in order:

1. AWS CDK if the implementing agent/team is already TypeScript-centric and can keep constructs simple.
2. CloudFormation/SAM if minimizing abstraction is more important.

Do not add Terraform unless intentionally chosen and recorded in an ADR.

IaC must provision or configure:

- S3 site-content bucket, private;
- S3 Block Public Access;
- CloudFront distribution;
- OAC;
- bucket policy limited to the CloudFront distribution;
- HTTPS redirect;
- ACM certificate for required hostnames;
- custom domain aliases;
- optional response headers policy;
- sensible cache behaviors;
- optional Route 53 records if DNS is moved to Route 53.

## 3. DNS assumption

`fitwise.stream` is already controlled by the project owner. DNS provider is not assumed.

Two supported paths:

### External DNS remains

- create/validate ACM certificate via DNS;
- create CloudFront alias;
- point relevant DNS records to CloudFront per provider capabilities.

### Route 53

- hosted zone in Route 53;
- alias record to CloudFront.

Do not transfer the domain unless explicitly requested.

## 4. Certificate

CloudFront custom domain HTTPS requires an appropriate ACM certificate. Deployment automation must account for CloudFront certificate region requirements current at deployment time and verify them against AWS docs rather than hard-coding assumptions from memory.

## 5. Deployment workflow

Conceptual steps:

1. Run full local QA.
2. `astro build`.
3. Sync `dist/` to private S3 bucket.
4. Use cache-control metadata appropriate to HTML vs hashed assets.
5. Invalidate only paths that require it, or use versioned/immutable assets.
6. Smoke-test CloudFront URL.
7. Smoke-test custom domain/TLS.
8. Verify origin is inaccessible directly.
9. Verify 404/error behavior.
10. Record deployment in worklog.

## 6. Clean URLs / directory indexes

Astro should emit directory-style routes with `index.html` where possible so CloudFront/S3 object paths map naturally to trailing-slash URLs.

If a CloudFront Function is required solely to normalize extensionless paths, document and test it; avoid Lambda@Edge for simple URL rewriting.

## 7. Dynamic features later

If future features need server execution, keep them separate from static page delivery.

Possible future architecture:

```text
Browser
  ├─ static pages → CloudFront/S3
  └─ optional API → API Gateway/HTTP endpoint → Lambda
```

Examples that may justify an API later:

- feedback submission;
- abuse-protected contact form;
- user accounts/saved layouts;
- server-side data ingestion/admin workflows.

Runtime calculations that can stay in-browser should stay in-browser.

## 8. Cost controls

Before enabling any dynamic AWS service:

- estimate request volume;
- set budgets/alerts where appropriate;
- avoid high-cardinality logs by default;
- choose retention periods intentionally;
- ensure no dynamic endpoint is accidentally called on every page view.

## 9. Deployment acceptance

Production deployment is not complete until:

- custom domain resolves;
- TLS valid;
- HTTP redirects to HTTPS;
- representative pages return 200;
- missing route returns correct error behavior;
- S3 objects cannot be read anonymously outside CloudFront;
- sitemap/robots work from custom domain;
- asset cache headers verified;
- no runtime API is required to view core pages.

## 10. SEO at the CloudFront edge (v0.2.0)

The deployment is incomplete if a nested trailing-slash URL fails. CloudFront's default root object does not automatically solve every directory-style `/path/` route; implement and test an origin-request mapping or lightweight CloudFront Function if required so `/workspace/example/` reaches `workspace/example/index.html`. Preserve `sitemap.xml`/`sitemap-index.xml`, `robots.txt`, image/CSS/JS assets and IndexNow key files unchanged. Test actual `404` for unknown paths and permanent host/path redirects without loops; do not use a fallback returning the homepage with status 200.

Follow `SEARCH_ENGINE_OPERATIONS.md` on first live launch. AWS static edge services and transfer/requests **can incur charges** even when there is no application server; budgets and alerts are recommended. The user requested local-first development: do not provision infrastructure early.
