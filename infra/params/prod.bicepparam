using '../main.bicep'

param environmentName = 'prod'
param resourceGroupName = 'zenova-web-prod-rg'
param resourceGroupLocation = 'West Europe'
param staticSiteLocation = 'West Europe'
param staticSiteName = 'swa-zenova-web-prod'
param repositoryUrl = 'https://github.com/zenovalabs/zenova-web'
param repositoryBranch = 'main'
param enableStagingEnvironments = true
param enableEnterpriseGradeEdge = true
param enableDnsPlaceholders = false
param dnsZoneNames = []
param extraTags = {
  stage: 'prod'
  enterprise: 'zenova'
}
