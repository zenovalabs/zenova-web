# Azure Environments and Delivery Model

This document explains the public-safe environment model for `zenova.sk`.

The goal is to make it clear:

- what exists locally
- what is automated in GitHub Actions
- what is a preview versus a stable environment
- what still requires environment configuration outside the repository

## Environment Summary

The target delivery model now has four layers:

1. `local`
2. `PR preview`
3. `test`
4. `prod`

All four layers use the same website source, but they differ in domain behavior, automation level, and audience.

## 1. Local

Purpose:

- day-to-day content and frontend work
- local validation of SEO, links, and routing
- manual review inside the dev container

How it runs:

- `npm ci`
- `npm start`
- local URL `http://localhost:8000`

Domain behavior:

- no real custom domains
- routing is simulated through `/` and `/en/`

Automation level:

- manual

## 2. PR Preview

Purpose:

- review changes before merge
- check responsive layout, content, and static routing
- provide a safe temporary preview URL without touching stable environments

How it runs:

- workflow: `.github/workflows/preview-pr.yml`
- backed by Azure Static Web Apps preview environments

Domain behavior:

- preview URLs use Azure-managed preview hostnames
- no production custom-domain behavior is expected here

Automation level:

- automatic for pull requests when the SWA deployment token is configured
- if the token is not configured, the workflow exits cleanly and CI validation still runs

Practical note:

- preview environments are useful for UI review
- they are not a substitute for stable `test` or `prod`
- they stay intentionally inactive until `deploy-test.yml` phase 2 has run at least once with a valid SWA token

## 3. Test

Purpose:

- stable non-production environment
- validate the public Bicep foundation and app deployment flow
- provide a presentable environment for internal review or safe demonstrations

How it runs:

- infrastructure entrypoint: `infra/main.bicep`
- parameters: `infra/params/test.bicepparam`
- workflows:
  - `.github/workflows/infra-whatif.yml`
  - `.github/workflows/deploy-test.yml`

Domain behavior:

- expected primary hostname is the Azure Static Web Apps default hostname
- enterprise-grade edge is enabled as part of the SWA direction, but custom test DNS is not required for the first working iteration
- custom domains are optional and not required for the first public foundation

Automation level:

- `infra-whatif` can run on pull requests or manually
- `deploy-test` runs on `main` pushes and `workflow_dispatch`
- `deploy-test` phase 1 creates RG + SWA + edge-ready foundation with OIDC only
- `deploy-test` phase 2 uploads the built site after the SWA token is configured

Required GitHub Environment `test` values:

- variable `AZURE_CLIENT_ID`
- variable `AZURE_TENANT_ID`
- variable `AZURE_SUBSCRIPTION_ID`
- variable `AZURE_DEPLOYMENT_LOCATION`

Phase 1 requires:

- variable `AZURE_CLIENT_ID`
- variable `AZURE_TENANT_ID`
- variable `AZURE_SUBSCRIPTION_ID`
- variable `AZURE_DEPLOYMENT_LOCATION`

Phase 2 additionally requires:

- secret `AZURE_STATIC_WEB_APPS_API_TOKEN`

## 4. Production

Purpose:

- canonical public website
- final deployment target for `zenova.sk`
- stable production delivery path for the showcase repository

How it runs:

- infrastructure entrypoint: `infra/main.bicep`
- parameters: `infra/params/prod.bicepparam`
- workflow: `.github/workflows/deploy-prod.yml`

Domain behavior:

- `zenova.sk` remains the canonical domain
- `/` serves Slovak
- `/en/` serves English
- additional domains are expected to redirect to the default domain through SWA

Automation level:

- manual `workflow_dispatch`
- Azure deployment happens only if GitHub Environment `prod` is configured

Required GitHub Environment `prod` values:

- variable `AZURE_CLIENT_ID`
- variable `AZURE_TENANT_ID`
- variable `AZURE_SUBSCRIPTION_ID`
- variable `AZURE_DEPLOYMENT_LOCATION`
- secret `AZURE_STATIC_WEB_APPS_API_TOKEN`

## Workflow and Release Hygiene

The public workflow set is intentionally small and explicit:

- `ci-validation.yml`
- `preview-pr.yml`
- `infra-whatif.yml`
- `deploy-test.yml`
- `deploy-prod.yml`

The repository should not keep the default Azure-generated Static Web Apps workflow once the curated workflow set exists.

Release path:

1. Open a pull request and let `ci-validation.yml` run.
2. Merge to `main` only after CI is green and the change is coherent for a public repo.
3. Let `deploy-test.yml` create the test infrastructure foundation from `main`.
4. Add the SWA deployment token to GitHub Environment `test` and rerun `deploy-test.yml` for phase 2.
5. Use `preview-pr.yml` for temporary UI review after the token-backed deploy path is active.
6. Run `deploy-prod.yml` manually from `main` after the test path is acceptable.

Hygiene rules:

- production deploys must remain manual
- test and production deploys must only run from `main`
- pull request workflows must not use `pull_request_target`
- missing Azure environment configuration should lead to a clean skip, not a broken run
- workflow validation should fail if a legacy Azure-generated workflow is added back

## Manual vs Automated Responsibilities

Automated in repo:

- static build
- source-level validation
- built-output link validation
- public Bicep validation
- workflow YAML validation
- optional Azure what-if
- staged test bootstrap and deployment
- optional production deployment

Manual outside repo:

- GitHub Environment creation
- OIDC federation setup in Azure
- Azure subscription and tenant wiring
- SWA deployment token creation after phase 1 has created the app
- final custom-domain onboarding and verification

## Public-Safe Delivery Story

The repository is intentionally structured so that the public parts are reproducible without exposing secrets.

That means:

- workflows are committed
- Bicep foundation is committed
- parameter files are committed as placeholders
- environment variables and secrets stay outside the repo
- first-time bootstrap is staged rather than one-shot

This is the key difference between:

- a public showcase repository
- and a private operations repository with live credentials or tenant-specific notes
