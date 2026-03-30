module "app_service" {
  source  = "pagopa-dx/azure-app-service/azurerm"
  version = "~> 3.0"

  environment         = var.environment
  resource_group_name = var.resource_group_name
  tags                = var.tags

  use_case          = var.use_case
  health_check_path = var.health_check_path
  app_settings      = local.app_settings

  virtual_network = var.virtual_network
  subnet_pep_id   = var.subnet_pep_id
  subnet_cidr     = var.subnet_cidr
  subnet_id       = var.subnet_id

  stack        = var.stack
  node_version = var.node_version
  java_version = var.java_version

  app_service_plan_id      = var.app_service_plan_id
  slot_app_settings        = var.slot_app_settings
  sticky_app_setting_names = var.sticky_app_setting_names
  diagnostic_settings      = var.diagnostic_settings

  application_insights_connection_string   = var.application_insights_connection_string
  application_insights_sampling_percentage = var.application_insights_sampling_percentage

  private_dns_zone_resource_group_name = var.private_dns_zone_resource_group_name
}
