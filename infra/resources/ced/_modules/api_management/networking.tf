resource "azurerm_subnet" "apim_subnet" {
  name                 = "${var.environment.prefix}-${var.environment.env_short}-${var.environment.location_short}-apim-snet-01"
  resource_group_name  = var.virtual_network.resource_group_name
  virtual_network_name = var.virtual_network.name
  address_prefixes     = [var.subnet_cidr]
}
