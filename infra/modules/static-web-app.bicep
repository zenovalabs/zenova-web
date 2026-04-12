targetScope = 'resourceGroup'

@description('Static Web App name.')
param name string

@description('Azure region for the Static Web App.')
param location string = 'Central US'

@description('Repository URL connected to the Static Web App.')
param repositoryUrl string

@description('Repository branch configured as the primary content branch.')
param repositoryBranch string = 'main'

@description('Staging environment policy for pull-request previews.')
@allowed([
  'Enabled'
  'Disabled'
])
param stagingEnvironmentPolicy string = 'Enabled'

@description('Static Web App SKU.')
@allowed([
  'Standard'
])
param skuName string = 'Standard'

@description('Deployment provider reference shown on the Static Web App resource.')
param provider string = 'GitHub'

@description('Allow config file updates from connected workflows.')
param allowConfigFileUpdates bool = true

@description('Enterprise-grade edge status for Azure Static Web Apps.')
@allowed([
  'Enabled'
  'Disabled'
])
param enterpriseGradeCdnStatus string = 'Disabled'

@description('Tags applied to the Static Web App.')
param tags object = {}

resource staticSite 'Microsoft.Web/staticSites@2024-11-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: skuName
    tier: skuName
  }
  properties: {
    repositoryUrl: repositoryUrl
    branch: repositoryBranch
    provider: provider
    stagingEnvironmentPolicy: stagingEnvironmentPolicy
    allowConfigFileUpdates: allowConfigFileUpdates
    enterpriseGradeCdnStatus: enterpriseGradeCdnStatus
  }
}

output id string = staticSite.id
output name string = staticSite.name
output defaultHostname string = staticSite.properties.defaultHostname
output stagingEnvironmentPolicy string = staticSite.properties.stagingEnvironmentPolicy
output enterpriseGradeCdnStatus string = staticSite.properties.enterpriseGradeCdnStatus
