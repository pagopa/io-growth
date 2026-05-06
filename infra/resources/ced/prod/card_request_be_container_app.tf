module "card_request_be_container_app" {
  source = "../_modules/card_request_be_container_app"

  environment = {
    prefix          = local.prefix
    env_short       = local.env_short
    location        = local.location
    app_name        = "card-request-be"
    instance_number = "01"
  }

  resource_group_name = data.azurerm_resource_group.resource_rg.name
  tags                = local.tags

  container_app_environment_id = module.common_container_app_environment.id
  user_assigned_identity_id    = module.common_container_app_environment.user_assigned_identity.id

  apim_platform = {
    name                = module.ced_apim.name
    resource_group_name = module.ced_apim.resource_group_name
    principal_id        = module.ced_apim.principal_id
  }

  target_port           = local.card_request_be.target_port
  public_access_enabled = true

  secrets = [
    {
      name                = "POSTGRES_USER"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-db-psql-01-admin-user")
    },
    {
      name                = "POSTGRES_PASSWORD"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-db-psql-01-admin-password")
    }
  ]

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
