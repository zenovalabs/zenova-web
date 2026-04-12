using '../main.bicep'

param environmentName = 'test'
param resourceGroupName = 'zenova-web-test-rg'
param resourceGroupLocation = 'West Europe'
param staticSiteLocation = 'West Europe'
param staticSiteName = 'swa-zenova-web-test'
param repositoryUrl = 'https://github.com/zenovalabs/zenova-web'
param repositoryBranch = 'main'
param enableStagingEnvironments = true
param enableEnterpriseGradeEdge = true
param enableDnsPlaceholders = false
param dnsZoneNames = []
param extraTags = {
  stage: 'test'
}
