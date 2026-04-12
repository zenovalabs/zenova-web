targetScope = 'resourceGroup'

@description('Public DNS zone names that should exist as placeholders under IaC.')
param zoneNames array

@description('Tags applied to every DNS zone placeholder.')
param tags object = {}

resource dnsZones 'Microsoft.Network/dnszones@2023-07-01-preview' = [for zoneName in zoneNames: {
  name: zoneName
  location: 'global'
  tags: tags
  properties: {
    zoneType: 'Public'
  }
}]

output zoneNames array = [for zoneName in zoneNames: zoneName]
