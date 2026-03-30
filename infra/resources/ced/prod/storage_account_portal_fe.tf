module "storage_account_portal_fe" {
  source = "../_modules/storage_account_portal_fe"

  environment = {
    prefix          = local.prefix
    env_short       = local.env_short
    location        = local.location
    app_name        = "portalfe"
    instance_number = "01"
  }

  resource_group_name = module.azure_core_values.common_resource_group_name
  tags                = local.tags

  subnet_pep_id = module.azure_core_values.common_pep_snet.id

  force_public_network_access_enabled = true

  static_website = {
    enabled            = true
    index_document     = "index.html"
    error_404_document = "index.html"
  }

  network_rules = {
    default_action             = "Allow"
    bypass                     = ["AzureServices"]
    ip_rules                   = []
    virtual_network_subnet_ids = []
  }

  private_dns_zone_resource_group_name = module.azure_core_values.network_resource_group_name
}
