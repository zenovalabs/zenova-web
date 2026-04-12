using '../main.bicep'

param environmentName = 'test'
param resourceGroupName = 'rg-zenova-web-test'
param resourceGroupLocation = 'Sweden Central'
param staticSiteLocation = 'Central US'
param staticSiteName = 'swa-zenova-web-test'
param repositoryUrl = 'https://github.com/zenovalabs/zenova-web'
param repositoryBranch = 'main'
param enableStagingEnvironments = true
param enableDnsPlaceholders = false
param dnsZoneNames = []
param extraTags = {
  stage: 'test'
}
