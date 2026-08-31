module "portal_be_storage" {
  source = "../_modules/portal_be_storage"

  prefix          = local.prefix
  env_short       = local.env_short
  location        = local.location
  domain          = local.domain
  app_name        = "assets"
  instance_number = "01"

  resource_group_name = azurerm_resource_group.data_rg.name
  subnet_pep_id       = module.azure_core_values.common_pep_snet.id

  tags = local.tags
}

module "role_assignments_portal_be_storage" {
  source  = "pagopa-dx/azure-role-assignments/azurerm"
  version = "~> 2.0"

  principal_id    = module.common_container_app_environment.user_assigned_identity.principal_id
  subscription_id = data.azurerm_subscription.current.subscription_id

  storage_blob = [
    {
      storage_account_name = module.portal_be_storage.storage_account.name
      resource_group_name  = module.portal_be_storage.storage_account.resource_group_name
      container_name       = module.portal_be_storage.containers.logos
      role                 = "writer"
      description          = "Allow portal-be container app to write logos blobs"
    },
    {
      storage_account_name = module.portal_be_storage.storage_account.name
      resource_group_name  = module.portal_be_storage.storage_account.resource_group_name
      container_name       = module.portal_be_storage.containers.images
      role                 = "writer"
      description          = "Allow portal-be container app to write images blobs"
    }
  ]
}
