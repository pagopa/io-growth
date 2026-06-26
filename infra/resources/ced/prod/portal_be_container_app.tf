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

  apim_platform = {
    name                = module.ced_apim.name
    resource_group_name = module.ced_apim.resource_group_name
    principal_id        = module.ced_apim.principal_id
  }

  target_port           = local.portal_be.target_port
  public_access_enabled = true

  secrets = [
    {
      name                = "POSTGRES_USER"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-db-psql-01-admin-user")
    },
    {
      name                = "POSTGRES_PASSWORD"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-db-psql-01-admin-password")
    },
    {
      name                = "AR_API_KEY"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-portal-be-ar-client-api-key")
    },
    {
      name                = "AR_ENDPOINT"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-portal-be-ar-client-endpoint")
    },
    {
      name                = "AR_API_KEY_TEST"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-portal-be-ar-client-api-key-test")
    },
    {
      name                = "AR_ENDPOINT_TEST"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-portal-be-ar-client-endpoint-test")
    },
    {
      name                = "APPINSIGHTS_INSTRUMENTATION_KEY"
      key_vault_secret_id = module.azure_core_values.application_insights.instrumentation_key_kv_secret_id
    }
  ]

  container_app_templates = [
    {
      image        = local.portal_be.image
      app_settings = local.portal_be.app_settings

      liveness_probe = {
        path      = local.portal_be.startup_probe_path
        transport = "HTTP"
      }

      readiness_probe = {
        path      = local.portal_be.readiness_probe_path
        transport = "HTTP"
      }

      startup_probe = {
        path      = local.portal_be.startup_probe_path
        transport = "HTTP"
      }
    }
  ]
}
