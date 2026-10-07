# T022 — Create IaC for S3/CloudFront/OAC/ACM

**Phase:** AWS  
**Dependencies:** T021

## Objective

Complete this task without expanding scope into later tasks.

## Steps

- Choose CDK or CloudFormation and record decision.
- Define private S3 bucket, Block Public Access, CloudFront distribution, OAC, bucket policy, TLS certificate integration and security headers.
- Do not make normal page requests depend on Lambda.

## Acceptance criteria

- [x] IaC validates locally with SAM/cfn-lint and the repository structural validator.
- [x] Least-privilege, distribution-scoped OAC read policy is visible in the template.
- [x] S3 REST origin remains private; no public website bucket is used.

## Required close-out

- [x] Run relevant automated checks and validate the deployed S3/CloudFront resources.
- [x] Update `WORKLOG.md`.
- [x] Update `WORKLOG.json`.
- [x] Update `PROJECT_STATE.json`.
- [x] Record CloudFormation/OIDC architecture in ADR-011.
