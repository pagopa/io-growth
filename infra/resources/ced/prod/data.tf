data "azurerm_client_config" "current" {}

data "azurerm_subscription" "current" {}

data "azurerm_private_dns_zone" "managed_redis" {
  name                = "privatelink.redis.azure.net"
  resource_group_name = module.azure_core_values.network_resource_group_name
}