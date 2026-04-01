module "postgres_server" {
  source  = "pagopa-dx/azure-postgres-server/azurerm"
  version = "~> 3.0"

  environment         = var.environment
  resource_group_name = var.resource_group_name
  tags                = var.tags

  admin_username         = var.admin_username
  admin_password         = var.admin_password
  admin_password_version = var.admin_password_version

  key_vault_id  = var.key_vault_id
  subnet_pep_id = var.subnet_pep_id

  db_version        = var.db_version
  storage_mb        = var.storage_mb
  pgbouncer_enabled = var.pgbouncer_enabled

  create_replica   = var.create_replica
  replica_location = var.replica_location

  backup_retention_days                = var.backup_retention_days
  high_availability_override           = var.high_availability_override
  delegated_subnet_id                  = var.delegated_subnet_id
  diagnostic_settings                  = var.diagnostic_settings
  private_dns_zone_resource_group_name = var.private_dns_zone_resource_group_name
}
