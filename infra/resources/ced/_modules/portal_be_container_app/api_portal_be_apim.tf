resource "azurerm_api_management_product" "ced_portal_be" {
  product_id   = "io-ced-portal-be-public-api"
  display_name = "IO CED PORTAL BE PUBLIC API"
  description  = "Product for IO CED PORTAL BE"

  api_management_name = var.apim_platform.name
  resource_group_name = var.apim_platform.resource_group_name

  published             = true
  subscription_required = false
  approval_required     = false
}

resource "azurerm_api_management_product_policy" "ced_portal_be" {
  product_id          = azurerm_api_management_product.ced_portal_be.product_id
  api_management_name = azurerm_api_management_product.ced_portal_be.api_management_name
  resource_group_name = azurerm_api_management_product.ced_portal_be.resource_group_name

  xml_content = file("${path.module}/policies/_base_policy.xml")
}

resource "azurerm_api_management_api_version_set" "ced_portal_be" {
  name                = "ced_portal_be"
  api_management_name = azurerm_api_management_product.ced_portal_be.api_management_name
  resource_group_name = azurerm_api_management_product.ced_portal_be.resource_group_name
  display_name        = "CED Portal BE APIs"
  versioning_scheme   = "Segment"
}

resource "azurerm_api_management_api" "ced_portal_be_v1" {
  name = format("%s-%s-portal-be-public-api-v1", var.environment.prefix, var.environment.env_short)

  api_management_name = var.apim_platform.name
  resource_group_name = var.apim_platform.resource_group_name

  subscription_required = false

  version_set_id = azurerm_api_management_api_version_set.ced_portal_be.id
  version        = "v1"
  revision       = "1"

  description  = "These APIs serve the microfrontend related to the operator portal of Carta Europea della Disabilità."
  display_name = "CED Operator Portal Backend API"
  path         = "api/ced-portal"
  protocols    = ["https"]

  import {
    content_format = "openapi-link"
    content_value  = "https://raw.githubusercontent.com/pagopa/io-growth/f7565862cd6e060b74220e72e1b1ce2e7d9e472f/apps/ced-portal-be/openapi/exposed/openapi.yaml"
  }
}

resource "azurerm_api_management_api_policy" "ced_portal_be_v1" {
  api_name            = azurerm_api_management_api.ced_portal_be_v1.name
  api_management_name = azurerm_api_management_api.ced_portal_be_v1.api_management_name
  resource_group_name = azurerm_api_management_api.ced_portal_be_v1.resource_group_name

  xml_content = file("${path.module}/policies/v1/_base_policy.xml")
}

resource "azurerm_api_management_product_api" "ced_portal_be_v1" {
  api_name            = azurerm_api_management_api.ced_portal_be_v1.name
  api_management_name = azurerm_api_management_api.ced_portal_be_v1.api_management_name
  resource_group_name = azurerm_api_management_api.ced_portal_be_v1.resource_group_name
  product_id          = azurerm_api_management_product.ced_portal_be.product_id
}

resource "azurerm_api_management_named_value" "ced_portal_be_ca_url" {
  name                = "ced-portal-be-ca-url"
  api_management_name = azurerm_api_management_api.ced_portal_be_v1.api_management_name
  resource_group_name = azurerm_api_management_api.ced_portal_be_v1.resource_group_name
  display_name        = "ced-portal-be-ca-url"
  secret              = true
  value               = "https://${replace(module.container_app.url, "/--[^.]+/", "")}"
}

resource "azurerm_api_management_backend" "ced_portal_be" {
  name                = "ced-portal-backend"
  api_management_name = azurerm_api_management_api.ced_portal_be_v1.api_management_name
  resource_group_name = azurerm_api_management_api.ced_portal_be_v1.resource_group_name
  protocol            = "http"
  url                 = "https://${replace(module.container_app.url, "/--[^.]+/", "")}/api"
}

resource "azurerm_role_assignment" "apim_container_app_reader" {
  scope                = module.container_app.id
  role_definition_name = "Reader"
  principal_id         = var.apim_platform.principal_id
}
