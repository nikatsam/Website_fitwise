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

- [ ] IaC synthesizes/validates locally.
- [ ] Least-privilege origin policy is visible in generated plan/template.
- [ ] No public website bucket required.

## Required close-out

- [ ] Run relevant automated checks.
- [ ] Update `WORKLOG.md`.
- [ ] Update `WORKLOG.json`.
- [ ] Update `PROJECT_STATE.json`.
- [ ] Record any architecture change in `DECISIONS.md`.
