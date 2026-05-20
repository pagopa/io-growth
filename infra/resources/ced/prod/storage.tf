module "storage_audit" {
  source = "../_modules/storage_audit"

  prefix          = local.prefix
  env_short       = local.env_short
  location        = local.location
  project         = local.project
  domain          = local.domain
  app_name        = "ssoaudit"
  instance_number = "01"

  resource_group_name                  = azurerm_resource_group.data_rg.name
  subnet_pep_id                        = module.azure_core_values.common_pep_snet.id
  privatelink_blob_core_windows_net_id = data.azurerm_private_dns_zone.privatelink_blob_core_windows_net.id
  tenant_id                            = data.azurerm_subscription.current.tenant_id
  key_vault_id                         = module.azure_core_values.common_key_vault.id
  action_group_id                      = azurerm_monitor_action_group.ced_error_action_group.id

  tags = local.tags
}
