module "ced_apim" {
  source = "../_modules/api_management"

  environment = {
    prefix          = local.prefix
    env_short       = local.env_short
    location        = local.location
    app_name        = "apim"
    instance_number = "01"
  }

  resource_group_name = module.azure_core_values.common_resource_group_name
  use_case            = "high_load"

  virtual_network = {
    resource_group_name = module.azure_core_values.network_resource_group_name
    name                = module.azure_core_values.common_vnet.name
  }

  subnet_cidr   = dx_available_subnet_cidr.cidr_24.cidr_block
  subnet_pep_id = module.azure_core_values.common_pep_snet.id

  publisher_email = "todo:publisheremail"
  publisher_name  = "todo:publishername"

  tags = local.tags
}

