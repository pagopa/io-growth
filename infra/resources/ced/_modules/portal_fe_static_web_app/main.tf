terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
    }
    dx = {
      source = "pagopa-dx/azure"
    }
  }
}

resource "azurerm_static_web_app" "this" {
  name = provider::dx::resource_name(merge(var.environment, {
    resource_type = "static_web_app"
  }))
  resource_group_name = var.resource_group_name
  location            = "westeurope"
  sku_size            = "Standard"

  tags = var.tags
}

resource "azurerm_dns_cname_record" "portal" {
  count = var.custom_domain != null ? 1 : 0

  name                = trimsuffix(var.custom_domain, ".${var.dns_zone_name}")
  zone_name           = var.dns_zone_name
  resource_group_name = var.dns_zone_resource_group_name
  ttl                 = 3600
  record              = azurerm_static_web_app.this.default_host_name
}

resource "azurerm_static_web_app_custom_domain" "portal" {
  count = var.custom_domain != null ? 1 : 0

  static_web_app_id = azurerm_static_web_app.this.id
  domain_name       = var.custom_domain
  validation_type   = "cname-delegation"

  depends_on = [azurerm_dns_cname_record.portal]
}
