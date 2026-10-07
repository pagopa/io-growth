module "assets_cdn" {
  source = "../_modules/assets_cdn"

  environment = {
    prefix          = local.prefix
    env_short       = local.env_short
    location        = local.location
    domain          = local.domain
    app_name        = "assets-cdn"
    instance_number = "01"
  }

  resource_group_name = azurerm_resource_group.data_rg.name
  blob_endpoint       = module.portal_be_storage.storage_account.primary_blob_endpoint
  origin_health_paths = module.portal_be_storage.cdn_health_paths
  dns_zone            = module.dns.public_zone

  cors_allowed_origins = [
    "https://portal.${module.dns.public_zone.name}",
    "https://browser.${module.dns.public_zone.name}",
  ]

  tags = local.tags
}
