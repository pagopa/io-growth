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
      name                = "FIMS_AUDIT_BLOB_URI"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-card-request-be-fims-audit-blob-uri")
    },
    {
      name                = "FIMS_CLIENT_ID"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-card-request-be-fims-client-id")
    },
    {
      name                = "FIMS_CLIENT_SECRET"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-card-request-be-fims-client-secret")
    },
    {
      name                = "FIMS_ISSUER_URL"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-card-request-be-fims-issuer-url")
    },
    {
      name                = "PAGOPA_IDP_KEYS_BASE_URL"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-card-request-be-fims-idp-keys-base-url")
    },
    {
      name                = "APPINSIGHTS_INSTRUMENTATION_KEY"
      key_vault_secret_id = module.azure_core_values.application_insights.instrumentation_key_kv_secret_id
    },
    {
      name                = "MODI_PROFILE"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-card-request-be-modi-profile")
    },
    {
      name                = "MODI_ENVIRONMENT"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-card-request-be-modi-environment")
    },
    {
      name                = "MODI_INPS_BASE_URL"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-card-request-be-modi-inps-base-url")
    },
    {
      name                = "MODI_CODICE_ENTE"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-card-request-be-modi-codice-ente")
    },
    {
      name                = "MODI_DEFAULT_CODICE_UFFICIO"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-card-request-be-modi-default-codice-ufficio")
    },
    {
      name                = "MODI_ID_TIPO_UTENTE"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-card-request-be-modi-id-tipo-utente")
    },
    {
      name                = "MODI_KEYVAULT_URL"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-card-request-be-modi-keyvault-url")
    },
    {
      name                = "MODI_HTTPS_CLIENT_CERT_SECRET_NAME"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-card-request-be-modi-https-client-cert-secret-name")
    },
    {
      name                = "MODI_HTTPS_CLIENT_KEY_SECRET_NAME"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-card-request-be-modi-https-client-key-secret-name")
    },
    {
      name                = "MODI_INPS_HTTPS_CA_SECRET_NAME"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-card-request-be-modi-inps-https-ca-secret-name")
    },
    {
      name                = "INPS_CED_BASE_URL"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-card-request-be-inps-ced-base-url")
    },
    {
      name                = "INPS_CED_AUDIENCE"
      key_vault_secret_id = format(local.secrets_id_template, "ced-p-itn-card-request-be-inps-ced-audience")
    }
  ]

  container_app_templates = [
    {
      image        = local.card_request_be.image
      app_settings = local.card_request_be.app_settings

      liveness_probe = {
        path      = local.card_request_be.startup_probe_path
        transport = "HTTP"
      }

      readiness_probe = {
        path      = local.card_request_be.readiness_probe_path
        transport = "HTTP"
      }

      startup_probe = {
        path      = local.card_request_be.startup_probe_path
        transport = "HTTP"
      }
    }
  ]
}

# Grant the shared managed identity the built-in Cosmos DB Data Contributor role
# so card_request_be can read/write CosmosDB without connection strings.
resource "azurerm_cosmosdb_sql_role_assignment" "card_request_be" {
  resource_group_name = module.cosmos_db.cosmos_db.resource_group_name
  account_name        = module.cosmos_db.cosmos_db.name
  # Built-in "Cosmos DB Built-in Data Contributor" role
  role_definition_id = "${module.cosmos_db.cosmos_db.id}/sqlRoleDefinitions/00000000-0000-0000-0000-000000000002"
  principal_id       = module.common_container_app_environment.user_assigned_identity.principal_id
  scope              = module.cosmos_db.cosmos_db.id
}
