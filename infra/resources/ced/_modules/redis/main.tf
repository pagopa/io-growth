module "redis_cache" {
  source = "github.com/pagopa/terraform-azurerm-v4//redis_cache?ref=v5.5.0"

  name                = var.name
  resource_group_name = var.resource_group_name
  location            = var.location

  capacity              = var.capacity
  family                = var.family
  sku_name              = var.sku_name
  redis_version         = var.redis_version
  enable_authentication = var.enable_authentication
  custom_zones          = var.custom_zones

  patch_schedules = var.patch_schedules

  private_endpoint = {
    enabled              = true
    subnet_id            = var.subnet_pep_id
    virtual_network_id   = var.virtual_network_id
    private_dns_zone_ids = [var.private_dns_zone_id]
  }

  tags = var.tags
}
