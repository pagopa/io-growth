module "redis" {
  source = "../_modules/redis"

  name                = "${local.project}-redis-common-01"
  resource_group_name = azurerm_resource_group.data_rg.name
  location            = local.location

  sku_name                  = "Balanced_B5"
  high_availability_enabled = true
  enable_authentication     = false
  client_protocol           = "Encrypted"
  clustering_policy         = "NoCluster"

  subnet_pep_id       = module.azure_core_values.common_pep_snet.id
  private_dns_zone_id = data.azurerm_private_dns_zone.managed_redis.id

  tags = local.tags
}

# New Redis instance via the DX module. Running alongside the existing instance
# for testing purposes. Once validated, the old module "redis" above and the
# _modules/redis/ local module will be removed in a follow-up PR.
module "redis_dx" {
  source = "../_modules/managed_redis"

  environment = {
    prefix          = local.prefix
    env_short       = local.env_short
    location        = local.location
    domain          = local.domain
    app_name        = "common"
    instance_number = "01"
  }

  resource_group_name = azurerm_resource_group.data_rg.name

  sku_name_override = "Balanced_B5"

  virtual_network_id         = module.azure_core_values.common_vnet.id
  log_analytics_workspace_id = module.azure_core_values.common_log_analytics_workspace.id

  alerts = {
    action_group_id = azurerm_monitor_action_group.ced_error_action_group.id
  }

  tags = local.tags
}
