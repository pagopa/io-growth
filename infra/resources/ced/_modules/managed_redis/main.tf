module "azure_managed_redis" {
  source  = "pagopa-dx/azure-managed-redis/azurerm"
  version = "~> 0.1"

  environment         = var.environment
  resource_group_name = var.resource_group_name
  tags                = var.tags

  virtual_network_id                   = var.virtual_network_id
  private_dns_zone_resource_group_name = var.private_dns_zone_resource_group_name

  use_case          = var.use_case
  sku_name_override = var.sku_name_override

  log_analytics_workspace_id = var.log_analytics_workspace_id

  alerts = var.alerts
}
