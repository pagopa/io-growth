###########
# DNS Zone
###########

resource "azurerm_dns_zone" "public" {
  name                = "ced.pagopa.it"
  resource_group_name = var.resource_group_name

  tags = var.tags

  lifecycle {
    prevent_destroy = true
  }
}
