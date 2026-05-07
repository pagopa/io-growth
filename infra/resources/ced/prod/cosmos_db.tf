module "cosmos_db" {
  source = "../_modules/cosmos_db"

  environment = {
    prefix          = local.prefix
    env_short       = local.env_short
    location        = local.location
    app_name        = "card"
    instance_number = "01"
  }

  secondary_location = local.secondary_location

  resource_group  = azurerm_resource_group.data_rg.name
  action_group_id = azurerm_monitor_action_group.ced_error_action_group.id
  subnet_pep_id   = module.azure_core_values.common_pep_snet.id

  tags = local.tags
}
