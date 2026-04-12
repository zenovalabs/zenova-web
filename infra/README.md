# Infrastructure Workspace

This directory is the public Infrastructure as Code workspace for `zenova.sk`.

The public foundation now has two layers:

1. local-only baseline imports in `infra/baseline/`
2. cleaned public modules and parameter files under `infra/`

Recommended placement for current private baseline files:

- `infra/baseline/rg/` for current resource group Bicep files
- `infra/baseline/swa/` for current Azure Static Web Apps Bicep files
- `infra/baseline/afd/` for current Azure Front Door Bicep files

Suggested local-only naming:

- `rg-current-prod.bicep`
- `rg-current-prod.parameters.json`
- `swa-current-prod.bicep`
- `swa-current-prod.parameters.json`
- `afd-current-prod.bicep`
- `afd-current-prod.parameters.json`

If there is also a test environment export, use the same pattern:

- `rg-current-test.bicep`
- `rg-current-test.parameters.json`
- `swa-current-test.bicep`
- `swa-current-test.parameters.json`
- `afd-current-test.bicep`
- `afd-current-test.parameters.json`

Notes:

- exported baseline inputs often exist only as a `Bicep` file, without a separate parameters file
- if you export deployment history or ARM artifacts, the parameters file is typically JSON, not `.bicepparam`
- `.bicepparam` is still valid later for the cleaned showcase IaC, but it should not be treated as a required export artifact

Important public-repo rule:

- do not commit secrets
- do not commit private environment notes
- avoid committing tenant-specific or subscription-specific values unless they are intentionally public
- prefer placeholders or sanitized parameter files for committed examples
- baseline imports in `infra/baseline/` are intentionally gitignored and should stay local-only unless manually sanitized

Current public structure:

```text
infra/
  README.md
  main.bicep
  baseline/
    rg/
    swa/
    afd/
  modules/
    resource-group.bicep
    static-web-app.bicep
    dns-zone-placeholder.bicep
  params/
    test.bicepparam
    prod.bicepparam
```

Current public scope:

- subscription-level orchestration via `infra/main.bicep`
- resource group creation
- Azure Static Web Apps Standard deployment
- optional DNS zone placeholders
- public-safe parameter files for `test` and `prod`

Validation entrypoints:

- `npm run validate:infra`
- `az bicep build --file infra/main.bicep`
- `az bicep build-params --file infra/params/test.bicepparam`
