module "role_assignments" {
  source  = "pagopa-dx/azure-role-assignments/azurerm"
  version = "~> 2.0"

  principal_id    = module.container_app_environment.user_assigned_identity.principal_id
  subscription_id = var.azure_subscription_id

  key_vault = [
    {
      name                = var.key_vault_name
      resource_group_name = var.key_vault_resource_group_name
      description         = "Allow container app environment to read configuration secrets"
      roles = {
        secrets = "reader"
      }
    }
  ]

  managed_redis = [
    {
      id          = var.redis_cache_id
      role        = "owner"
      description = "Allow container app environment to manage redis cache"
    }
  ]

  cosmos = [
    {
      account_name        = var.cosmos_db_account_name
      resource_group_name = var.cosmos_db_resource_group_name
      role                = "owner"
      description         = "Allow container app environment to access Cosmos DB with Azure identity"
    }
  ]
}
