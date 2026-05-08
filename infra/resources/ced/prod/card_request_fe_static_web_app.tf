module "card_request_fe_static_web_app" {
  source = "../_modules/card_request_fe_static_web_app"

  environment = {
    prefix          = local.prefix
    env_short       = local.env_short
    location        = local.static_apps_location
    domain          = local.domain
    app_name        = "card-request-fe"
    instance_number = "01"
  }

  resource_group_name = data.azurerm_resource_group.resource_rg.name
  tags                = local.tags

  custom_domain                = "card.ced.pagopa.it"
  dns_zone_name                = "ced.pagopa.it"
  dns_zone_resource_group_name = module.azure_core_values.network_resource_group_name
}
