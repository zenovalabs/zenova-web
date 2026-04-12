# Azure Edge Decision Record

This document explains the decision between three Azure delivery variants for `zenova.sk`:

- `SWA only`
- `SWA + Azure Front Door`
- `SWA + Azure Application Gateway`

The goal is to keep the decision public, understandable, and reusable as part of the repository showcase.

## Decision Summary

For the current stage of `zenova.sk`, the chosen direction is:

- `Azure Static Web Apps Standard`
- `zenova.sk` configured as the default domain
- additional custom domains redirected to the default domain by SWA
- English content served under `/en/`
- lightweight browser-based locale redirect only on the root entry

This was chosen because the site is currently:

- a simple static website
- relatively small in scope
- not dependent on complex edge routing
- cost-sensitive

For this level of complexity, adding a dedicated Azure edge layer would be technically possible but economically disproportionate.

Commercially, the evaluated staging path was:

- consider `SWA Free` only as an early low-cost option
- choose `SWA Standard` once real production posture and multi-domain behavior matter
- add enterprise-grade edge later only if routing or public architecture needs justify it

Final current choice:

- `SWA Standard`

Reason:

- the intended domain inventory includes `zenova.sk` plus multiple `zenovalabs.*` domains
- `SWA Free` is too constrained for that target domain model

## Evaluated Options

### Option 1: SWA only

Target model:

- `https://zenova.sk/` for Slovak
- `https://zenova.sk/en/` for English
- browser locale logic only on root
- no separate edge layer

Within this option, there are actually two practical sub-variants:

- `SWA Free`
- `SWA Standard`

#### SWA Free

Why it is attractive:

- zero hosting cost
- enough for a very small public site
- supports custom domains and SSL

Important current limits from Microsoft docs:

- Free supports `2 custom domains per app`
- Free has `no SLA`

What this means for `zenova.sk`:

- `zenova.sk` can be one custom domain
- one `zenovalabs.*` domain can be the second custom domain
- all non-default custom domains can be redirected to one chosen default domain

But this also means:

- `SWA Free` is not enough if we want `zenova.sk` and both `zenovalabs.eu` and `zenovalabs.cloud` connected to the same app at the same time
- `www` aliases would make the domain count problem even tighter

So `SWA Free` is viable only if we accept one of these simplifications:

- use only `zenova.sk` plus one `zenovalabs.*` domain
- keep the second `zenovalabs.*` domain parked or redirected outside SWA
- postpone full multi-domain rollout until Standard

#### SWA Standard

Why it matters as the next step:

- intended for production workloads
- includes SLA
- supports more custom domains
- supports optional enterprise-grade edge add-on
- supports the current preferred model with `zenova.sk` as default domain and `zenovalabs.*` redirected to it

Important note:

- Microsoft pricing and quota pages are not fully consistent on the exact custom domain count for Standard
- the pricing page shows `5 custom domains per app`
- the quotas page shows `6 custom domains per app`

For planning purposes, the safe assumption is:

- Standard clearly supports more than Free
- Standard is the natural upgrade path once we need `zenova.sk` plus multiple `zenovalabs.*` domains and production posture

#### Pros

- lowest cost
- simplest architecture
- lowest operational overhead
- easiest to document and maintain
- very suitable for a static presentation website
- still compatible with future Azure edge expansion
- gives a clean staged path from `Free` to `Standard` without replacing the hosting model
- works with a clean default-domain model where `zenova.sk` is canonical

#### Cons

- no host-based routing layer outside the app
- no domain-level language routing after redirect to the default domain
- locale behavior must be handled in app logic
- fewer options for advanced redirect behavior and domain consolidation
- `SWA Free` may be too limited for all intended domains

#### SEO Impact

This model is still SEO-safe if language versions use stable path-based URLs:

- `/` for Slovak
- `/en/` for English

Important rule:

- browser-based locale detection must not become the primary SEO mechanism
- canonical URLs and language discovery must rely on real crawlable URLs, not only runtime detection
- the default-domain redirect should consolidate domains to `zenova.sk`, while language discovery should rely on `/` and `/en/`

#### Operational Risk

- multilingual behavior depends more on frontend logic
- domain-level routing stays limited until an edge layer is added
- future redirect requirements may outgrow the simplicity of this setup
- Free plan may need to be replaced early once all target domains are attached

### Option 2: SWA + Azure Front Door

Target model:

- `zenova.sk` as canonical domain
- `zenova.sk/en/...` for English
- `zenovalabs.*` redirected at edge with more granular host and path behavior if needed
- edge-level redirect and host logic

#### Pros

- cleanest edge architecture
- host-based and path-based redirects
- strong support for canonical routing across multiple domains
- very good fit for public Azure architecture showcase
- Azure-native and well-aligned with Static Web Apps integration guidance

#### Cons

- higher cost
- more moving parts
- more infrastructure to document and maintain
- overkill for a very small static site if advanced routing is not truly needed yet

#### SEO Impact

- strongest option for multi-domain canonical discipline
- easiest way to centralize domain behavior outside the app

#### Operational Risk

- higher cost for a relatively simple site
- more complexity in CI/CD and infrastructure lifecycle

### Option 3: SWA + Azure Application Gateway

Target model:

- Static Web Apps as origin
- Application Gateway used for host-based ingress and redirect logic

#### Pros

- Layer 7 routing and redirect capability
- can support host-based ingress logic
- can be expanded later for more advanced regional web traffic handling

#### Cons

- more complex than SWA only
- less natural fit than Front Door for this specific public static website scenario
- regional rather than edge-native
- requires more networking setup
- less attractive as a cost optimization if the website remains simple

#### SEO Impact

- can support domain-level logic
- but does not provide enough practical benefit over simpler options for this specific website stage

#### Operational Risk

- added complexity without enough current business value
- risk of over-engineering for a site that does not yet need this level of ingress control

## Why We Chose SWA Only

The decision for `SWA only` was made because it matches the current shape of the project better than the edge-based alternatives.

Main reasons:

- this is currently a simple static regional website
- keeping the architecture lean is more valuable than adding infrastructure for future hypotheticals
- cost matters more than advanced ingress elegance at this stage
- the path-based bilingual structure `/` and `/en/` is enough for SEO and for user navigation
- the repository should showcase good engineering judgment, not unnecessary Azure complexity
- the hosting model gives us a low-friction upgrade path from `Free` to `Standard`, and later from `Standard` to `Standard + enterprise-grade edge`
- the default-domain behavior in SWA already gives enough canonical-domain consolidation for this phase

In other words:

- `Azure Front Door` is technically strong, but too expensive for the current size and needs of the site
- `Azure Application Gateway` is technically possible, but not compelling enough for this use case
- `Azure Static Web Apps only` is the best current balance of cost, simplicity, and maintainability

More specifically:

- `SWA Free` was attractive for the earliest phase, but not sufficient for the intended domain inventory
- `SWA Standard` is the current chosen plan because it fits the target domain setup and production posture
- optional enterprise-grade edge can be introduced later without replatforming the site

## Known Risks of SWA Only

This decision is intentionally pragmatic, but it comes with trade-offs.

Known risks:

- language selection is less elegant at the domain level
- future multi-domain routing requirements may require architectural expansion
- browser-based locale logic must be implemented carefully to avoid SEO issues
- redirect behavior across `zenovalabs.*` domains will remain simple and domain-only, not language-aware
- `SWA Free` may not fit the final desired domain inventory

To keep the risk controlled:

- stable crawlable URLs must exist for every language version
- `hreflang`, canonical URLs, and sitemap entries must be implemented correctly
- locale redirect should happen only on root entry, not on every page request
- manual language switching must always be available
- if all `zenovalabs.*` domains must be attached directly to the app, plan the move to `SWA Standard`
- after SWA redirects to the default domain, locale selection should depend on browser preference or explicit user choice, not on the source domain

Important implementation consequence:

- once SWA redirects a custom domain to the default domain, the app should no longer assume that the original hostname is available as a reliable language signal

## Why This Decision Is Reversible

This choice does not block future Azure evolution.

The website will still be built on `Azure Static Web Apps`, which means:

- `SWA Free` can be upgraded to `SWA Standard`
- Azure Front Door can be added later
- Azure Application Gateway can be added later
- enterprise-grade edge can be added later on the Standard plan
- redirect logic can be moved from app layer to edge layer later
- the CI/CD and IaC design can evolve without replacing the website hosting model

This is important for the repository story:

- we are not rejecting `AFD` or `AAG`
- we are simply not paying for them yet
- the project remains ready for that next step

## Upgrade Path

If the site later needs stronger domain routing or a more advanced public Azure architecture, the recommended progression is:

1. keep `SWA only` while the site remains simple and regional
2. add `Azure Front Door` if multi-domain canonical routing becomes operationally important
3. consider `Azure Application Gateway` only if there is a specific regional ingress use case that justifies it

## Implementation Note

The current planned app model should therefore assume:

- one `Azure Static Web App`
- `zenova.sk` as the default domain
- additional custom domains redirected by SWA to `zenova.sk`
- Slovak on `/`
- English on `/en/`
- browser locale redirect only on root
- no edge dependency in the first delivery phase
- no domain-based language routing in the first delivery phase

Current commercial staging assumption:

- start as lean as possible
- use `SWA Free` only if the real domain count fits
- current target production choice is `SWA Standard`
- keep the app structure ready for future `AFD` or `AAG` without redesigning the site

This keeps the implementation simple while preserving a clean migration path to `AFD` or `AAG` later.

## Sources

- Microsoft Learn: Azure Static Web Apps hosting plans, including Free vs Standard, custom domains, and SLA: https://learn.microsoft.com/en-us/azure/static-web-apps/plans
- Microsoft Learn: Azure Static Web Apps quotas, including custom domain counts: https://learn.microsoft.com/en-us/azure/static-web-apps/quotas
- Microsoft Learn: default domain behavior in Azure Static Web Apps, including redirecting other configured domains to one default domain: https://learn.microsoft.com/en-us/azure/static-web-apps/custom-domain-default
- Microsoft Learn: enterprise-grade edge in Azure Static Web Apps: https://learn.microsoft.com/en-us/azure/static-web-apps/enterprise-edge
- Azure Pricing: Azure Static Web Apps pricing, including Free, Standard, and enterprise-grade edge availability: https://azure.microsoft.com/en-us/pricing/details/app-service/static/
