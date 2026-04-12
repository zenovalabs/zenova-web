# Azure IaC Decision Record

This document explains the decision between three Infrastructure as Code options for the `zenova.sk` project:

- `Bicep`
- `Terraform`
- `ARM templates`

The goal is to make the choice public, explicit, and aligned with the future evolution of this repository as a showcase Azure web project.

## Decision Summary

For this project, the chosen direction is:

- `Bicep`

This is the preferred option because the project is:

- Azure-focused
- relatively small to medium in infrastructure scope
- intended to remain understandable in a public repository
- expected to evolve over time without unnecessary operational overhead

## Evaluated Options

### Option 1: Bicep

Bicep is the current preferred Azure-native Infrastructure as Code language for this project.

#### Pros

- Azure-native and directly aligned with Azure Resource Manager
- easier to read and maintain than raw ARM JSON
- no separate external state backend required
- good fit for public repositories where clarity matters
- integrates cleanly with Azure CLI, GitHub Actions, and OIDC
- supports modules, parameters, validation, and reusable structure
- Microsoft explicitly recommends considering Bicep for Azure infrastructure work

#### Cons

- less portable outside Azure
- less suitable if the company later standardizes on one cross-cloud IaC tool
- ecosystem is narrower than Terraform for non-Azure providers

#### Operational Risk

- low risk for this specific project
- the main limitation appears only if infrastructure scope expands beyond Azure into a multi-cloud or multi-provider delivery model

### Option 2: Terraform

Terraform is a strong general-purpose IaC tool and remains a valid option in many organizations.

#### Pros

- strong multi-cloud and multi-provider story
- wide ecosystem and strong community adoption
- good fit when one platform team manages many technologies beyond Azure
- useful if Azure resources must be managed together with non-Azure systems in the same IaC layer

#### Cons

- introduces external state management
- adds operational overhead that this project does not currently need
- less Azure-native than Bicep
- may be harder to present as a clean Azure-first showcase for a small website project

#### Operational Risk

- moderate risk of unnecessary complexity for a simple Azure web project
- state handling, locking, and provider lifecycle become additional concerns

### Option 3: ARM templates

ARM templates are the underlying Azure Resource Manager JSON format.

#### Pros

- full Azure capability coverage
- native to Azure Resource Manager
- no external state backend required
- still a valid deployment format

#### Cons

- verbose and harder to read
- significantly less maintainable than Bicep for hand-authored infrastructure
- weaker experience for a public repository where code readability matters
- not the best authoring experience for a project expected to evolve

#### Operational Risk

- low runtime risk, but higher maintenance risk
- over time, raw JSON templates are more likely to slow down iteration and increase documentation friction

## Why We Chose Bicep

`Bicep` is the best fit for this repository because it balances:

- Azure alignment
- readability
- low operational overhead
- maintainability over time

Main reasons:

- the website is deployed on Azure services
- the infrastructure scope is not large enough to justify Terraform state complexity
- the repository is public and should be understandable to readers without extra tooling context
- future infrastructure growth is still expected to remain Azure-centric
- Microsoft positions Bicep as the recommended authoring experience over raw ARM JSON

In practical terms:

- `ARM templates` are too verbose for the long-term maintainability of this repo
- `Terraform` is strong, but currently heavier than necessary
- `Bicep` gives the best ratio of clarity, capability, and simplicity

## Future-Proofing Considerations

This decision is made with future change in mind, not only with today's needs.

Why Bicep still works well for future growth:

- modules can be added incrementally
- environments such as `test` and `prod` can be parameterized cleanly
- Azure Front Door or Azure Application Gateway can be added later without changing IaC direction
- GitHub Actions can run `what-if`, validation, and deployment workflows cleanly

Possible future trigger to reconsider Terraform:

- if the project becomes part of a broader shared platform managed across Azure and non-Azure services
- if infrastructure starts depending heavily on providers outside Azure
- if the surrounding engineering organization already standardizes on Terraform for everything

Until then, `Bicep` remains the more proportionate choice.

## Why We Are Not Choosing ARM Templates

ARM templates are not rejected because they are technically weak.

They are not chosen because:

- Bicep compiles to ARM templates anyway
- Microsoft recommends looking at Bicep for new Azure IaC work
- hand-authoring JSON ARM templates would make this repository harder to read and maintain

For this project, choosing ARM directly would add verbosity without adding meaningful value.

## Why We Are Not Choosing Terraform

Terraform is not rejected as a bad tool.

It is simply not the best fit for this project today.

Main reasons:

- the project is Azure-only
- the infrastructure scope is still focused and limited
- introducing state handling would increase project complexity
- the public repository benefits more from a straightforward Azure-native model

If the project later expands into a wider platform scenario, this can be revisited.

## Risks of Choosing Bicep

No decision is risk-free.

Known trade-offs of choosing Bicep:

- tighter alignment to Azure than to multi-cloud tooling
- less portable if the infrastructure needs to be moved into a cross-cloud operating model
- some engineers may already be more familiar with Terraform

These risks are acceptable for this repository because:

- the project is intentionally Azure-centric
- public readability matters
- operational simplicity matters more than theoretical portability

## Why This Decision Is Reversible

Choosing `Bicep` today does not permanently block future changes.

If needed later:

- Bicep modules can coexist with ARM-based deployment artifacts
- a future Terraform migration is still possible
- exported or existing ARM definitions can be decompiled into Bicep as a bridge path

This means the current choice optimizes for today's best balance without locking the project forever.

## Implementation Note

The repository should therefore evolve toward:

- `infra/` for Bicep files
- `params/` for environment parameter files
- GitHub Actions for validation, `what-if`, and deployment
- public architecture documentation that explains the Azure resources being deployed

This is the most suitable path for a public Azure showcase repository built around a real production website.

## Sources

- Microsoft Learn: ARM templates overview notes that Microsoft recommends looking at Bicep if choosing an IaC option: https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/overview
- Microsoft Learn: What is Bicep and why it is a transparent abstraction over ARM templates: https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview
- Microsoft Learn: Comparing Terraform and Bicep: https://learn.microsoft.com/en-us/azure/developer/terraform/comparing-terraform-and-bicep
- Microsoft Learn: Azure resource reference explicitly recommends Bicep when deciding between Azure template languages: https://learn.microsoft.com/en-us/azure/templates/
- Microsoft Learn: ARM templates can be decompiled into Bicep, supporting future migration paths: https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/decompile
