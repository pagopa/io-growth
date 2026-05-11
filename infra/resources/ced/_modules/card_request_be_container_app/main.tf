module "container_app" {
  source  = "pagopa-dx/azure-container-app/azurerm"
  version = "~> 4.2.0"

  environment         = var.environment
  resource_group_name = var.resource_group_name
  tags                = var.tags

  container_app_environment_id = var.container_app_environment_id
  user_assigned_identity_id    = var.user_assigned_identity_id

  container_app_templates = var.container_app_templates
  target_port             = var.target_port
  public_access_enabled   = var.public_access_enabled

  secrets = var.secrets
}
