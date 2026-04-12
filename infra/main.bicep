targetScope = 'subscription'

@description('Short environment identifier used in tags and deployment names.')
param environmentName string

@description('Resource group name for the website environment.')
param resourceGroupName string

@description('Azure region for the resource group metadata.')
param resourceGroupLocation string

@description('Azure region used by Azure Static Web Apps.')
param staticSiteLocation string = 'Central US'

@description('Static Web App resource name.')
param staticSiteName string

@description('Public repository URL connected to the website deployment.')
param repositoryUrl string

@description('Repository branch used as the default content branch.')
param repositoryBranch string = 'main'

@description('Enable Azure Static Web Apps staging environments for preview URLs.')
param enableStagingEnvironments bool = true

@description('Enable enterprise-grade edge on the Static Web App resource.')
param enableEnterpriseGradeEdge bool = true

@description('When true, optional placeholder DNS zones are deployed into the same resource group.')
param enableDnsPlaceholders bool = false

@description('Optional list of public DNS zones to create as placeholders under IaC.')
param dnsZoneNames array = []

@description('Additional tags merged into the default showcase tag set.')
param extraTags object = {}

var defaultTags = {
  application: 'zenova.sk'
  environment: environmentName
  managedBy: 'bicep'
  stack: enableEnterpriseGradeEdge ? 'azure-static-web-apps-standard-enterprise-edge' : 'azure-static-web-apps-standard'
  project: 'zenova-web'
}

var tags = union(defaultTags, extraTags)

module resourceGroupModule 'modules/resource-group.bicep' = {
  name: 'resource-group-${environmentName}'
  params: {
    name: resourceGroupName
    location: resourceGroupLocation
    tags: tags
  }
}

module staticWebApp 'modules/static-web-app.bicep' = {
  name: 'static-web-app-${environmentName}'
  scope: resourceGroup(resourceGroupName)
  params: {
    name: staticSiteName
    location: staticSiteLocation
    repositoryUrl: repositoryUrl
    repositoryBranch: repositoryBranch
    stagingEnvironmentPolicy: enableStagingEnvironments ? 'Enabled' : 'Disabled'
    enterpriseGradeCdnStatus: enableEnterpriseGradeEdge ? 'Enabled' : 'Disabled'
    tags: tags
  }
  dependsOn: [
    resourceGroupModule
  ]
}

module dnsZones 'modules/dns-zone-placeholder.bicep' = if (enableDnsPlaceholders && !empty(dnsZoneNames)) {
  name: 'dns-placeholder-${environmentName}'
  scope: resourceGroup(resourceGroupName)
  params: {
    zoneNames: dnsZoneNames
    tags: tags
  }
  dependsOn: [
    resourceGroupModule
  ]
}

output environmentName string = environmentName
output resourceGroupName string = resourceGroupName
output staticSiteName string = staticWebApp.outputs.name
output staticSiteDefaultHostname string = staticWebApp.outputs.defaultHostname
output stagingEnvironmentPolicy string = staticWebApp.outputs.stagingEnvironmentPolicy
output enterpriseGradeEdgeEnabled bool = enableEnterpriseGradeEdge
output enterpriseGradeEdgeStatus string = staticWebApp.outputs.enterpriseGradeCdnStatus
output bootstrapPhaseTwoReady bool = !empty(staticWebApp.outputs.defaultHostname)
output dnsPlaceholdersEnabled bool = enableDnsPlaceholders
output dnsZoneNames array = enableDnsPlaceholders ? dnsZoneNames : []
