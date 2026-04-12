# Contributing to zenova.sk

This repository is intentionally public and serves two roles at once:

- the production website for `zenova.sk`
- a showcase repository that demonstrates how the site is designed, documented, built, and deployed on Azure

## Public Repo Rules

The repository may contain:

- public architecture and delivery documentation
- Infrastructure as Code structure and deployment workflows
- public-facing website code and assets
- generic examples of process, templates, and automation

The repository must not contain:

- secrets, tokens, keys, passwords, or certificates
- internal business plans or private rollout notes
- customer-confidential details
- unpublished tenant, subscription, or environment details that do not belong in a public showcase

## Working Model

Recommended operating model:

- keep `main` as the production-ready branch
- use short-lived feature branches for all substantial work
- open pull requests even for owner-driven changes when the change affects architecture, SEO, infrastructure, or public documentation
- use GitHub Issues to track public-facing work and keep the change history understandable for readers of the repo

Recommended branch naming:

- `feature/...` for product or UX work
- `infra/...` for Azure, CI/CD, or deployment work
- `content/...` for SEO, copy, and use-case content
- `docs/...` for documentation work
- `fix/...` for bug fixes

## Baseline Strategy

Before the site rebase becomes large, keep a reference to the current website state.

Recommended approach:

- create a tag such as `baseline-original-site`
- if the old site may need maintenance during the rebase, also create an archival branch such as `archive/original-site`

Use a tag if you only need a stable snapshot.
Use an archive branch only if you expect more changes on the old version.

## Pull Requests

Use pull requests for:

- new public architecture or delivery decisions
- SEO structure changes
- GitHub workflow or Azure pipeline updates
- infrastructure code
- new service pages or use cases

A pull request should explain:

- what changed
- why it changed
- how it was validated
- whether production behavior, SEO, or deployment flow is affected

## Issues

Use GitHub Issues for public and reusable work:

- feature proposals
- infrastructure work
- SEO tasks
- content or use-case additions
- bugs and regressions

Keep internal planning outside the repository if it should not be public.

## Validation Expectations

Before opening a pull request:

- run the local build
- validate changed configuration where practical
- verify responsive behavior if UI changed
- mention any skipped validation in the PR

Recommended baseline validation for this repo:

- `npm run build`
- `npm run validate:site`
- `npm run validate:dist`
- `npm run validate:infra`
- `npm run validate:workflows`

## Local Commit Strategy

Because this repository is public, it is acceptable and recommended to keep work in progress local until it is ready for public review.

Recommended working sequence:

- do active work locally on a feature branch
- make small, topic-based local commits as soon as a logical unit is stable
- avoid pushing exploratory or half-finished public-facing changes
- push only when the branch is coherent enough to be reviewed as a public artifact

Recommended local commit grouping:

- one commit for dev environment or tooling fixes
- one commit for content and UX changes
- one commit for SEO, metadata, or indexing updates
- one commit for infrastructure or workflow changes

This makes it easier to review, reorder, or drop changes before the first public push.

## Public Push Checklist

Before the first push of a branch, review the staged changes with the assumption that the repository reader is external.

Check for:

- secrets, tokens, credentials, private certificates, or environment-specific values
- internal-only notes, rollout plans, or private business context
- customer-identifying or confidential information
- links that should not be public, including private dashboards, internal documents, or temporary scheduling URLs
- wording that sounds like an internal draft when the page or document is meant to be public-facing

If the repository needs private working notes, keep them outside tracked files.
One practical option is to use a local ignored folder such as `.local/`.

## Documentation First

Because this repo is also a showcase, architecture and delivery changes should usually update docs in the same pull request.

Relevant docs:

- [README.md](./README.md)
- [docs/seo-rebase-plan.md](./docs/seo-rebase-plan.md)
- [docs/azure-infra-cicd-plan.md](./docs/azure-infra-cicd-plan.md)
- [docs/repository-operating-model.md](./docs/repository-operating-model.md)
