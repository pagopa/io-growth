resource "dx_available_subnet_cidr" "cidr_23_cae" {
  provider           = dx
  virtual_network_id = module.azure_core_values.common_vnet.id
  prefix_length      = 23

  depends_on = [module.ced_apim]
}

module "common_container_app_environment" {
  source = "../_modules/common_container_app_environment"

  environment = {
    prefix          = local.prefix
    env_short       = local.env_short
    location        = local.location
    app_name        = "common"
    instance_number = "01"
  }

  resource_group_name = data.azurerm_resource_group.resource_rg.name
  tags                = local.tags

  log_analytics_workspace_id = module.azure_core_values.common_log_analytics_workspace.id

  virtual_network = {
    name                = module.azure_core_values.common_vnet.name
    resource_group_name = module.azure_core_values.network_resource_group_name
  }

  subnet_cidr   = dx_available_subnet_cidr.cidr_23_cae.cidr_block
  subnet_pep_id = module.azure_core_values.common_pep_snet.id

  key_vault_name = data.azurerm_key_vault.common.name
  key_vault_resource_group_name = data.azurerm_key_vault.common.resource_group_name

  redis_cache_id = module.redis.id

  azure_subscription_id = data.azurerm_subscription.current.subscription_id
}
