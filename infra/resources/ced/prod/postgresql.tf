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

  storage_mb = 262144
  replica_location = local.secondary_location

  resource_group_name = module.azure_core_values.common_resource_group_name
  tags                = local.tags

  admin_username         = "pgadmin"
  admin_password         = ephemeral.random_password.db.result
  admin_password_version = 1

  key_vault_id  = module.azure_core_values.common_key_vault.id
  subnet_pep_id = module.azure_core_values.common_pep_snet.id

  private_dns_zone_resource_group_name = module.azure_core_values.network_resource_group_name
}
