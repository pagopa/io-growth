module "portal_be_container_app" {
  source = "../_modules/portal_be_container_app"

  environment = {
    prefix          = local.prefix
    env_short       = local.env_short
    location        = local.location
    app_name        = "portal-be"
    instance_number = "01"
  }

  resource_group_name = data.azurerm_resource_group.resource_rg.name
  tags                = local.tags

  container_app_environment_id = module.common_container_app_environment.id
  user_assigned_identity_id    = module.common_container_app_environment.user_assigned_identity.id

  target_port = 80

  container_app_templates = [
    {
      image = "docker.io/traefik/whoami:latest"
      liveness_probe = {
        path      = "/health"
        transport = "HTTP"
      }
    }
  ]
}
