# Public Issue Seeds

These are ready-to-publish public issue drafts for the next showcase iteration.

They are kept in the repository because the current workspace does not have authenticated GitHub issue-creation access.

## 1. Public Bicep Foundation Follow-Up

Template:

- `Infrastructure or platform task`

Suggested title:

- `[Infra] Expand public SWA Standard Bicep foundation`

Suggested body:

- Objective: extend the current public Bicep foundation beyond the initial SWA Standard, resource group, and optional DNS placeholder modules
- Area:
  - Bicep or IaC
  - Azure Static Web Apps
- Proposed change: add next-step modules or outputs that improve the public Azure delivery story without exposing tenant-specific details
- Risks or constraints: keep the repo public-safe and avoid coupling to private subscription values
- Validation plan: `npm run validate:infra`, Bicep build, and a safe Azure what-if if environment config is available

## 2. Environment and Delivery Docs Refinement

Template:

- `Infrastructure or platform task`

Suggested title:

- `[Infra] Refine test and production environment delivery docs`

Suggested body:

- Objective: make the delivery model easier to follow for external readers and future contributors
- Area:
  - GitHub Actions
  - Monitoring or validation
- Proposed change: expand environment docs with screenshots, example URLs, and a clearer onboarding checklist for GitHub Environments and OIDC
- Risks or constraints: keep the documentation public-safe and avoid sharing secrets, tenant IDs, or internal runbooks
- Validation plan: review docs for consistency against README, Azure showcase page, and workflow names

## 3. Azure Showcase Page Alignment

Template:

- `Feature or showcase improvement`

Suggested title:

- `[Feature] Align the internal Azure showcase case with the delivery model`

Suggested body:

- Goal: strengthen the public Azure website case so it better explains local, preview, test, and production layers
- Why it matters:
  - Azure delivery quality
  - public showcase quality
- Proposed direction: add a richer architecture or delivery strip, stronger links to decision records, and tighter consistency with the public IaC foundation
- Scope:
  - Website UX
  - Documentation
  - Azure architecture
- Notes: keep the case specific enough to feel real, but general enough to stay public-safe
