# Repository Operating Model

This document defines how `zenovalabs/zenova-web` should function as a public showcase repository and as the source of truth for the production website `zenova.sk`.

## Purpose

The repository should demonstrate:

- a real production website
- a clear information architecture and SEO strategy
- an Azure-native hosting and delivery model
- a documented engineering workflow

The repository should not look like a private working folder accidentally pushed to GitHub.

## Repo Positioning

The target state is:

- `zenova.sk` is the production website
- the same codebase is used as a public reference project
- documentation explains architecture, SEO, deployment, and operating model
- changes are discoverable through Issues and Pull Requests

This makes the repo useful both for:

- visitors evaluating Zenova technical quality
- future use cases and portfolio references
- internal delivery reuse for similar Azure web projects

## Recommended Git Strategy

### Main branch

Use `main` as:

- the production-ready branch
- the branch that represents what can be safely deployed
- the branch used for the public repository view

### Baseline of the old site

It is worth preserving the current site before the rebase grows.

Recommended approach:

- create a tag `baseline-original-site`
- optionally create `archive/original-site` if the old version may still need changes

Recommendation:

- prefer a tag as the default
- use an archive branch only if the old site remains active long enough to justify maintenance

Why this helps:

- the repo keeps a clean historical checkpoint
- the showcase narrative becomes easier to explain
- the rebase can move forward without fear of losing the original version

### Feature branches

Use short-lived branches for real work.

Recommended prefixes:

- `feature/`
- `infra/`
- `content/`
- `docs/`
- `fix/`

Examples:

- `feature/homepage-rebase`
- `infra/frontdoor-bicep-foundation`
- `content/first-use-cases`
- `docs/public-repo-setup`

## Should the Project Use PRs and Issues?

Yes.

For this repository, PRs and Issues are not overhead. They are part of the product.

### Why PRs matter here

Pull requests make the repository more credible as a showcase because they reveal:

- architecture decisions
- reviewable changes
- validation steps
- evolution of the solution over time

Even if the repo is maintained by a small team or one owner, PRs are still valuable for:

- larger refactors
- infrastructure changes
- SEO or routing changes
- public documentation work

### Why Issues matter here

Issues help structure the public narrative of the project.

They are useful for:

- roadmap items
- bugs
- infrastructure tasks
- content and use-case additions
- documentation gaps

Use Issues for public work.
Keep private planning outside the repository.

## Public vs Private Information Boundary

Safe to keep in the repo:

- Bicep templates and workflow definitions
- architectural decisions
- public domain routing model
- CI/CD structure
- public content strategy

Do not keep in the repo:

- secrets
- environment credentials
- internal business planning
- customer-specific data
- sensitive implementation notes that do not belong in a public case study

## Recommended Repository Shape

Suggested public-facing structure:

```text
src/                     website source
docs/                    public architecture and delivery docs
infra/                   Bicep templates for Azure resources
scripts/                 validation and smoke test scripts
.github/
  workflows/             CI/CD workflows
  ISSUE_TEMPLATE/        public issue templates
  pull_request_template.md
README.md                primary entrypoint for repository visitors
CONTRIBUTING.md          public contribution and workflow rules
```

## Recommended Initial Milestones

1. Preserve the baseline of the old site with a tag.
2. Rework README so the repo immediately presents itself as a showcase.
3. Add contribution flow, issue templates, and PR template.
4. Add IaC foundation for Azure resources.
5. Add CI, infra validation, and environment-aware deployment workflows.
6. Rebuild website structure and use-case pages.

## Definition of Done for the Showcase Repo

The repo is in a good public state when:

- the README explains what the project is in under a minute
- architecture and deployment choices are documented
- branch, issue, and PR workflow is clear
- Azure setup is represented through IaC
- production and test flows are understandable
- no secrets or internal plans are stored in the repository
