module "redis" {
  source = "../_modules/redis"

  name                = "${local.project}-redis-01"
  resource_group_name = module.azure_core_values.common_resource_group_name
  location            = local.location

  sku_name                  = "Balanced_B10"
  high_availability_enabled = true
  enable_authentication     = true
  client_protocol           = "Encrypted"
  clustering_policy         = "NoCluster"

  subnet_pep_id       = module.azure_core_values.common_pep_snet.id
  private_dns_zone_id = module.azure_core_values.private_dns_zones["redis"].id

  tags = local.tags
}
