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
