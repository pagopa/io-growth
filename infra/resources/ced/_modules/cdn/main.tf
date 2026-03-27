module "cdn" {
  source  = "pagopa-dx/azure-cdn/azurerm"
  version = "~> 0.6"

  environment         = var.environment
  resource_group_name = var.resource_group_name
  tags                = var.tags

  origins             = var.origins
  custom_domains      = var.custom_domains
  waf_enabled         = var.waf_enabled
  origin_health_probe = var.origin_health_probe
  diagnostic_settings = var.diagnostic_settings

  existing_cdn_frontdoor_profile_id = var.existing_cdn_frontdoor_profile_id
}
