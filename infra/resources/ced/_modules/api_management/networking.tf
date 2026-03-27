resource "azurerm_subnet" "apim_subnet" {
  name                 = "${var.environment.prefix}-${var.environment.env_short}-apim-snet-01"
  resource_group_name  = var.virtual_network.resource_group_name
  virtual_network_name = var.virtual_network.name
  address_prefixes     = [var.subnet_cidr]

  private_endpoint_network_policies = "Enabled"

  delegation {
    name = "default"
    service_delegation {
      name    = "Microsoft.Web/serverFarms"
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
    }
  }

  service_endpoints = [
    "Microsoft.Web",
  ]
}
