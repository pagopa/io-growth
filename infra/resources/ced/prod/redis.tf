module "redis" {
  source = "../_modules/redis"

  name                = "${local.project}-redis-01"
  resource_group_name = module.azure_core_values.common_resource_group_name
  location            = local.location

  capacity              = 1
  family                = "P"
  sku_name              = "Premium"
  redis_version         = "6"
  enable_authentication = true
  custom_zones          = [1, 2, 3]

  patch_schedules = [
    {
      day_of_week    = "Sunday"
      start_hour_utc = 23
    },
    {
      day_of_week    = "Monday"
      start_hour_utc = 23
    },
    {
      day_of_week    = "Tuesday"
      start_hour_utc = 23
    },
    {
      day_of_week    = "Wednesday"
      start_hour_utc = 23
    },
    {
      day_of_week    = "Thursday"
      start_hour_utc = 23
    },
  ]

  subnet_pep_id       = module.azure_core_values.common_pep_snet.id
  virtual_network_id  = module.azure_core_values.common_vnet.id
  private_dns_zone_id = module.azure_core_values.private_dns_zones["redis"].id

  tags = local.tags
}
