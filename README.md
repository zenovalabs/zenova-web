# zenova.sk

Public source repository for the `zenova.sk` website and its Azure delivery model.

This repository is being shaped as both:

- the production website for ZENOVA Labs
- a public showcase project that demonstrates website architecture, SEO thinking, Azure hosting, and CI/CD structure

## What This Project Covers

The target repository story is broader than a simple static site:

- public website implementation
- SEO-driven content structure
- bilingual routing model with `zenova.sk` as the canonical domain
- Azure Static Web Apps hosting
- Azure Static Web Apps bilingual path strategy with enterprise-grade edge direction
- Infrastructure as Code with Bicep
- GitHub-based CI/CD for staged test and production environments

## Service Direction

The current target positioning of the website is built around three public-facing pillars:

- Microsoft 365, cloud migration, and AI productivity
- networking and security
- IoT solutions

Automation and observability are treated as cross-cutting capabilities rather than standalone top-level themes.

## Public Repo Principles

This repository is intentionally public.

It should contain:

- public architecture documentation
- reproducible delivery patterns
- public-facing content and assets
- GitHub workflow and Infrastructure as Code examples

It should not contain:

- secrets
- internal-only planning
- customer-confidential details
- environment credentials

See [CONTRIBUTING.md](./CONTRIBUTING.md) for working rules.

## Key Documentation

- [SEO rebase plan](./docs/seo-rebase-plan.md)
- [Azure infra and CI/CD plan](./docs/azure-infra-cicd-plan.md)
- [Azure environments and delivery model](./docs/azure-environments-delivery-model.md)
- [Azure edge decision record](./docs/azure-edge-decision.md)
- [Azure IaC decision record](./docs/azure-iac-decision.md)
- [Project roadmap](./docs/project-roadmap.md)
- [Public task backlog](./docs/public-task-backlog.md)
- [Public issue seeds](./docs/public-issue-seeds.md)
- [Repository operating model](./docs/repository-operating-model.md)
- [Use case page templates](./docs/showcase/README.md)

## Current Stack

- Frontend: Vanilla HTML, CSS, and JavaScript
- Hosting: Azure Static Web Apps Standard
- Edge direction: enterprise-grade edge on the Standard plan
- Domain strategy: Azure-managed hostname first, with in-app locale routing on `/` and `/en/`
- Build: Node.js
- Local development: dev container compatible

## Repository Workflow

Recommended working model for this repo:

- keep `main` production-ready
- use short-lived branches for feature, infra, content, docs, and fixes
- use Pull Requests for meaningful changes
- use GitHub Issues for public work tracking
- preserve the pre-rebase site as a baseline tag or archive branch

This is part of the showcase value of the repository, not just team process.

## Quick Start

```bash
npm ci
npm start
```

Default local URL:

```text
http://localhost:8000
```

Production build:

```bash
npm run build
npm run validate:site
npm run validate:dist
npm run validate:infra
npm run validate:workflows
```

Current CI quality gates cover:

- source-level website validation for SEO and bilingual routing
- use-case cross-linking between homepage, listings, and detail pages
- built output link validation against generated `dist/`
- public infra structure validation, ready for future public Bicep files
- workflow YAML validation for the public GitHub Actions layer

Delivery-ready workflow foundation now includes:

- `ci-validation.yml` for build, content, infra, and workflow validation
- `preview-pr.yml` for Azure Static Web Apps preview environments
- `infra-whatif.yml` for safe Azure what-if checks
- `deploy-test.yml` for a staged test bootstrap and stable test environment
- `deploy-prod.yml` for staged production bootstrap and controlled production deploys

Current bootstrap story:

- phase 1 creates or reconciles the resource group and Static Web App foundation
- phase 1 does not require `AZURE_STATIC_WEB_APPS_API_TOKEN`
- phase 2 publishes `dist/` into the existing Static Web App after the token is added
- the same staged pattern applies to both `test` and `prod`
- PR previews become deploy-capable after phase 2 has completed at least once
- production domain onboarding is intentionally separate from the first infra bootstrap:
  - attach `zenova.sk` and `zenovalabs.*` as SWA custom domains
  - set `zenova.sk` as the default domain
  - let SWA redirect the remaining domains to that canonical host

## Project Structure

```text
src/                website source
docs/               public project and architecture docs
.github/workflows/  deployment and CI workflows
.devcontainer/      local development container setup
```

## Current State

The repository is currently transitioning from a single-page static site into a more complete public project with:

- clearer public documentation
- Azure infrastructure planning and staged bootstrap delivery
- GitHub collaboration scaffolding
- future test and production environment separation

## License

© ZENOVA Labs, s.r.o.
