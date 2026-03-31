module "application_gateway" {
  source = "../_modules/application_gateway"

  prefix    = local.prefix
  env_short = local.env_short
  project   = local.project
  location  = local.location
  domain    = local.domain

  azure_subscription_id = data.azurerm_subscription.current.subscription_id
  resource_group_name   = module.azure_core_values.common_resource_group_name

  sku = {
    name = "WAF_v2"
    tier = "WAF_v2"
  }

  virtual_network = {
    resource_group_name = module.azure_core_values.network_resource_group_name
    name                = module.azure_core_values.common_vnet.name
  }

  subnet_cidr = dx_available_subnet_cidr.cidr_24.cidr_block

  key_vault_name = module.azure_core_values.common_key_vault.name

  apim_hostname            = module.ced_apim.gateway_hostname
  api_hostname             = "api.ced.pagopa.it"
  app_gw_cert_name         = "api-ced-pagopa-it"
  app_gateway_min_capacity = 0
  app_gateway_max_capacity = 2

  app_gateway_alerts_enabled      = true
  azurerm_monitor_action_group_id = azurerm_monitor_action_group.ced_error_action_group.id

  alert_sensitivity = "Medium"

  tags = local.tags
}
