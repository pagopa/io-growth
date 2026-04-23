ephemeral "random_password" "db" {
  length  = 32
  special = true
}

module "postgresql" {
  source = "../_modules/postgresql"

  environment = {
    prefix          = local.prefix
    env_short       = local.env_short
    location        = local.location
    app_name        = "db"
    instance_number = "01"
  }

  storage_mb       = 262144
  replica_location = local.secondary_location

  resource_group_name = azurerm_resource_group.data_rg.name
  tags                = local.tags

  admin_username         = "pgadmin"
  admin_password         = ephemeral.random_password.db.result
  admin_password_version = 1

  key_vault_id  = module.azure_core_values.common_key_vault.id
  subnet_pep_id = module.azure_core_values.common_pep_snet.id

  private_dns_zone_resource_group_name = module.azure_core_values.network_resource_group_name
}

# Entra ID administrator for CI/CD (app_cd managed identity)
resource "azurerm_postgresql_flexible_server_active_directory_administrator" "app_cd" {
  server_name         = module.postgresql.postgres.name
  resource_group_name = azurerm_resource_group.data_rg.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  object_id           = data.azurerm_user_assigned_identity.app_cd.principal_id
  principal_name      = data.azurerm_user_assigned_identity.app_cd.name
  principal_type      = "ServicePrincipal"
}

# Entra ID administrator for Container App runtime (CAE user-assigned identity)
resource "azurerm_postgresql_flexible_server_active_directory_administrator" "cae_identity" {
  server_name         = module.postgresql.postgres.name
  resource_group_name = azurerm_resource_group.data_rg.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  object_id           = module.common_container_app_environment.user_assigned_identity.principal_id
  principal_name      = module.common_container_app_environment.user_assigned_identity.name
  principal_type      = "ServicePrincipal"
}

# Application database
resource "azurerm_postgresql_flexible_server_database" "ced_portal" {
  name      = "ced_portal"
  server_id = module.postgresql.postgres.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}
