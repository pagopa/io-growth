module "container_app_environment" {
  source  = "pagopa-dx/azure-container-app-environment/azurerm"
  version = "~> 1.2.0"

  environment         = var.environment
  resource_group_name = var.resource_group_name
  tags                = var.tags

  log_analytics_workspace_id = var.log_analytics_workspace_id

  public_network_access_enabled = var.public_network_access_enabled

  virtual_network = var.virtual_network
  subnet_cidr     = var.subnet_cidr
  subnet_pep_id   = var.subnet_pep_id
}
