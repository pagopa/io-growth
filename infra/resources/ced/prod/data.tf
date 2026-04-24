data "azurerm_client_config" "current" {}

data "azurerm_subscription" "current" {}

data "azurerm_key_vault" "common" {
  name                = module.azure_core_values.common_key_vault.name
  resource_group_name = module.azure_core_values.common_resource_group_name
}

data "azurerm_key_vault_secret" "action_group_email" {
  name         = "action-group-email"
  key_vault_id = data.azurerm_key_vault.common.id
}

data "azurerm_key_vault_secret" "action_group_slack" {
  name         = "action-group-slack"
  key_vault_id = data.azurerm_key_vault.common.id
}

data "azurerm_key_vault_secret" "db_backend_user" {
  name         = "ced-p-itn-db-psql-01-backend-user"
  key_vault_id = data.azurerm_key_vault.common.id
}

data "azurerm_key_vault_secret" "db_backend_password" {
  name         = "ced-p-itn-db-psql-01-backend-password"
  key_vault_id = data.azurerm_key_vault.common.id
}

data "azurerm_private_dns_zone" "managed_redis" {
  name                = "privatelink.redis.azure.net"
  resource_group_name = module.azure_core_values.network_resource_group_name
}

data "azurerm_resource_group" "resource_rg" {
  name = "ced-p-itn-rg-01"
}
