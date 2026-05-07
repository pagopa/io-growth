resource "azurerm_api_management_product" "ced_browser_be" {
  product_id   = "io-ced-browser-be-public-api"
  display_name = "IO CED BROWSER BE PUBLIC API"
  description  = "Product for IO CED BROWSER BE"

  api_management_name = var.apim_platform.name
  resource_group_name = var.apim_platform.resource_group_name

  published             = true
  subscription_required = false
  approval_required     = false
}

resource "azurerm_api_management_product_policy" "ced_browser_be" {
  product_id          = azurerm_api_management_product.ced_browser_be.product_id
  api_management_name = azurerm_api_management_product.ced_browser_be.api_management_name
  resource_group_name = azurerm_api_management_product.ced_browser_be.resource_group_name

  xml_content = file("${path.module}/policies/_base_policy.xml")
}

resource "azurerm_api_management_api_version_set" "ced_browser_be" {
  name                = "ced_browser_be"
  api_management_name = azurerm_api_management_product.ced_browser_be.api_management_name
  resource_group_name = azurerm_api_management_product.ced_browser_be.resource_group_name
  display_name        = "CED Browser BE APIs"
  versioning_scheme   = "Segment"
}

resource "azurerm_api_management_api" "ced_browser_be_v1" {
  name = format("%s-%s-browser-be-public-api-v1", var.environment.prefix, var.environment.env_short)

  api_management_name = var.apim_platform.name
  resource_group_name = var.apim_platform.resource_group_name

  subscription_required = false

  version_set_id = azurerm_api_management_api_version_set.ced_browser_be.id
  version        = "v1"
  revision       = "1"

  description  = "These APIs serve the microfrontend related to the browser of Carta Europea della Disabilità."
  display_name = "CED Browser Backend API"
  path         = "api/ced-browser"
  protocols    = ["https"]

  import {
    content_format = "openapi-link"
    content_value  = "https://raw.githubusercontent.com/pagopa/io-growth/refs/heads/main/apps/ced-browser-be/openapi/exposed/openapi.yaml"
  }
}

resource "azurerm_api_management_api_policy" "ced_browser_be_v1" {
  api_name            = azurerm_api_management_api.ced_browser_be_v1.name
  api_management_name = azurerm_api_management_api.ced_browser_be_v1.api_management_name
  resource_group_name = azurerm_api_management_api.ced_browser_be_v1.resource_group_name

  xml_content = file("${path.module}/policies/v1/_base_policy.xml")
}

resource "azurerm_api_management_product_api" "ced_browser_be_v1" {
  api_name            = azurerm_api_management_api.ced_browser_be_v1.name
  api_management_name = azurerm_api_management_api.ced_browser_be_v1.api_management_name
  resource_group_name = azurerm_api_management_api.ced_browser_be_v1.resource_group_name
  product_id          = azurerm_api_management_product.ced_browser_be.product_id
}

resource "azurerm_api_management_backend" "ced_browser_be" {
  name                = "ced-browser-backend"
  api_management_name = azurerm_api_management_api.ced_browser_be_v1.api_management_name
  resource_group_name = azurerm_api_management_api.ced_browser_be_v1.resource_group_name
  protocol            = "http"
  url                 = "https://${replace(module.container_app.url, "/--[^.]+/", "/api")}"
}

resource "azurerm_role_assignment" "apim_container_app_reader" {
  scope                = module.container_app.id
  role_definition_name = "Reader"
  principal_id         = var.apim_platform.principal_id
}
