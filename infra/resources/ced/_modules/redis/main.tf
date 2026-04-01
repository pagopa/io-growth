resource "azurerm_managed_redis" "this" {
  name                = var.name
  location            = var.location
  resource_group_name = var.resource_group_name
  sku_name            = var.sku_name

  high_availability_enabled = var.high_availability_enabled
  public_network_access     = "Disabled"

  default_database {
    access_keys_authentication_enabled = var.enable_authentication
    client_protocol                    = var.client_protocol
    clustering_policy                  = var.clustering_policy
  }

  tags = var.tags
}

resource "azurerm_private_endpoint" "this" {
  name                = "${azurerm_managed_redis.this.name}-private-endpoint"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.subnet_pep_id

  private_dns_zone_group {
    name                 = "${azurerm_managed_redis.this.name}-private-dns-zone-group"
    private_dns_zone_ids = [var.private_dns_zone_id]
  }

  private_service_connection {
    name                           = "${azurerm_managed_redis.this.name}-private-service-connection"
    private_connection_resource_id = azurerm_managed_redis.this.id
    is_manual_connection           = false
    subresource_names              = ["redisEnterprise"]
  }

  tags = var.tags
}
