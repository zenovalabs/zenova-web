# Baseline Import

Place current exported or hand-written infrastructure files here before refactoring them.
This folder is for local-only baseline imports and is intentionally gitignored.

Purpose:

- preserve the current Azure state as input material
- compare the old model with the new target architecture
- keep raw imports separated from the final public showcase modules

Suggested placement:

- `infra/baseline/rg/` for current resource group files
- `infra/baseline/swa/` for current Static Web Apps files
- `infra/baseline/afd/` for current Front Door files

Suggested local naming:

- `rg-current-prod.bicep`
- `rg-current-prod.parameters.json`
- `swa-current-prod.bicep`
- `swa-current-prod.parameters.json`
- `afd-current-prod.bicep`
- `afd-current-prod.parameters.json`

If needed, keep environment-specific variants explicit:

- `rg-current-test.bicep`
- `rg-current-test.parameters.json`
- `swa-current-test.bicep`
- `swa-current-test.parameters.json`
- `afd-current-test.bicep`
- `afd-current-test.parameters.json`

Practical note:

- if Azure gives you only the exported `Bicep` file, that is enough for the baseline import
- if you also have parameters, keep them as `*.parameters.json`
- convert to `.bicepparam` only later if it helps the cleaned public IaC structure

Once reviewed, the reusable and cleaned version should move into:

- `infra/modules/`
- `infra/params/`
