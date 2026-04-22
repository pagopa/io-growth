module "redis" {
  source = "../_modules/redis"

  name                = "${local.project}-redis-common-01"
  resource_group_name = azurerm_resource_group.data_rg.name
  location            = local.location

  sku_name                  = "Balanced_B5"
  high_availability_enabled = true
  enable_authentication     = false
  client_protocol           = "Encrypted"
  clustering_policy         = "NoCluster"

  subnet_pep_id       = module.azure_core_values.common_pep_snet.id
  private_dns_zone_id = data.azurerm_private_dns_zone.managed_redis.id

  tags = local.tags
}
