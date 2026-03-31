module "app_service_portal_be" {
  source = "../_modules/app_service_portal_be"

  environment = {
    prefix          = local.prefix
    env_short       = local.env_short
    location        = local.location
    app_name        = "portal-be"
    instance_number = "01"
  }

  resource_group_name = module.azure_core_values.common_resource_group_name
  tags                = local.tags

  health_check_path = "/health"

  virtual_network = {
    resource_group_name = module.azure_core_values.network_resource_group_name
    name                = module.azure_core_values.common_vnet.name
  }

  subnet_cidr   = dx_available_subnet_cidr.cidr_26.cidr_block
  subnet_pep_id = module.azure_core_values.common_pep_snet.id
}
