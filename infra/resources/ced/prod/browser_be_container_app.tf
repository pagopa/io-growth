module "browser_be_container_app" {
  source = "../_modules/browser_be_container_app"

  environment = {
    prefix          = local.prefix
    env_short       = local.env_short
    location        = local.location
    app_name        = "browser-be"
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

  target_port           = local.browser_be.target_port
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
      name                = "FIMS_AUDIT_BLOB_URI"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-browser-be-fims-audit-blob-uri")
    },
    {
      name                = "FIMS_CLIENT_ID"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-browser-be-fims-client-id")
    },
    {
      name                = "FIMS_CLIENT_SECRET"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-browser-be-fims-client-secret")
    },
    {
      name                = "FIMS_ISSUER_URL"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-browser-be-fims-issuer-url")
    },
    {
      name                = "PAGOPA_IDP_KEYS_BASE_URL"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-browser-be-fims-idp-keys-base-url")
    },
    {
      name                = "APPINSIGHTS_INSTRUMENTATION_KEY"
      key_vault_secret_id = module.azure_core_values.application_insights.instrumentation_key_kv_secret_id
    }
  ]

  container_app_templates = [
    {
      image        = local.browser_be.image
      app_settings = local.browser_be.app_settings

      liveness_probe = {
        path      = local.browser_be.startup_probe_path
        transport = "HTTP"
      }

      readiness_probe = {
        path      = local.browser_be.readiness_probe_path
        transport = "HTTP"
      }

      startup_probe = {
        path      = local.browser_be.startup_probe_path
        transport = "HTTP"
      }
    }
  ]
}
