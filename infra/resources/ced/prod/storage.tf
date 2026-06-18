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

module "role_assignments_audit_storage" {
  source  = "pagopa-dx/azure-role-assignments/azurerm"
  version = "~> 2.0"

  principal_id    = module.common_container_app_environment.user_assigned_identity.principal_id
  subscription_id = data.azurerm_subscription.current.subscription_id

  storage_blob = [
    {
      storage_account_name = module.storage_audit.immutable_ced_audit_logs_storage.name
      resource_group_name  = module.storage_audit.immutable_ced_audit_logs_storage.resource_group_name
      container_name       = "ced-browser-logs"
      role                 = "writer"
      description          = "Allow container app environment to write FIMS audit logs for browser-be"
    },
    {
      storage_account_name = module.storage_audit.immutable_ced_audit_logs_storage.name
      resource_group_name  = module.storage_audit.immutable_ced_audit_logs_storage.resource_group_name
      container_name       = "ced-card-request-logs"
      role                 = "writer"
      description          = "Allow container app environment to write FIMS audit logs for card-request-be"
    }
  ]
}
