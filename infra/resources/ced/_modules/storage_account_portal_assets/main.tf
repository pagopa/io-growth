module "storage_account" {
  source  = "pagopa-dx/azure-storage-account/azurerm"
  version = "~> 2.0"

  environment         = var.environment
  resource_group_name = var.resource_group_name
  tags                = var.tags

  use_case      = var.use_case
  access_tier   = var.access_tier
  subnet_pep_id = var.subnet_pep_id

  force_public_network_access_enabled = var.force_public_network_access_enabled

  containers           = var.containers
  queues               = var.queues
  tables               = var.tables
  blob_features        = var.blob_features
  static_website       = var.static_website
  network_rules        = var.network_rules
  diagnostic_settings  = var.diagnostic_settings
  customer_managed_key = var.customer_managed_key
  subservices_enabled  = var.subservices_enabled

  private_dns_zone_resource_group_name = var.private_dns_zone_resource_group_name
}
