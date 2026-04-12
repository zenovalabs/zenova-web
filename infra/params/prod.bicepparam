using '../main.bicep'

param environmentName = 'prod'
param resourceGroupName = 'rg-zenova-web-prod'
param resourceGroupLocation = 'Sweden Central'
param staticSiteLocation = 'Central US'
param staticSiteName = 'swa-zenova-web-prod'
param repositoryUrl = 'https://github.com/zenovalabs/zenova-web'
param repositoryBranch = 'main'
param enableStagingEnvironments = true
param enableDnsPlaceholders = false
param dnsZoneNames = []
param extraTags = {
  stage: 'prod'
  enterprise: 'zenova'
}
