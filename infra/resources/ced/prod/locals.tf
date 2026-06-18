locals {
  prefix         = "ced"
  env_short      = "p"
  location_short = "itn"
  domain         = ""

  project = "${local.prefix}-${local.env_short}-${local.location_short}"

  location             = "italynorth"
  secondary_location   = "germanywestcentral"
  static_apps_location = "westeurope"

  core_state = {
    resource_group_name  = "ced-p-itn-tfstate-rg-01"
    storage_account_name = "cedpitntfstatest01"
    container_name       = "terraform-state"
    key                  = "ced.core.prod.tfstate"
  }

  secrets_id_template = "${data.azurerm_key_vault.common.vault_uri}secrets/%s"

  portal_be_container_app_name = provider::dx::resource_name({
    prefix          = local.prefix
    environment     = local.env_short
    location        = local.location
    domain          = local.domain
    name            = "portal-be"
    instance_number = 1
    resource_type   = "container_app"
  })

  # Portal BE Container App configuration
  portal_be = {
    target_port = 8080

    image = "ghcr.io/pagopa/io-growth/ced-portal-be:latest"

    app_settings = {
      APPLICATIONINSIGHTS_ENTRA_ID_AUTH_ENABLED = "false"
      APPINSIGHTS_SAMPLING_PERCENTAGE           = "100"
      TELEMETRY_SERVICE_NAME                    = local.portal_be_container_app_name

      AZURE_LOG_LEVEL = "error"

      PORT            = "8080"
      POSTGRES_HOST   = "${module.postgresql.postgres.name}.postgres.database.azure.com"
      POSTGRES_PORT   = "6432"
      POSTGRES_DB     = azurerm_postgresql_flexible_server_database.ced_test.name
      POSTGRES_SSL    = "true"
      REDIS_ENDPOINT  = module.redis_dx.endpoint
      REDIS_TLS       = "true"
      AZURE_CLIENT_ID = module.common_container_app_environment.user_assigned_identity.client_id

      CED_PORTAL_FE_BASE_URL = "https://${module.portal_fe_static_web_app.custom_domain}"
      CED_PRODUCT_ID         = "prod-ced"
      ADMIN_FISCAL_CODES     = "516984510c575da00a39bcfcbc7e31ca4295384940dad4d2fd39f6e402f660b4"
    }

    startup_probe_path   = "/api/info/startup"
    readiness_probe_path = "/api/info/readiness"
  }

  browser_be_container_app_name = provider::dx::resource_name({
    prefix          = local.prefix
    environment     = local.env_short
    location        = local.location
    domain          = local.domain
    name            = "browser-be"
    instance_number = 1
    resource_type   = "container_app"
  })

  # Browser BE Container App configuration
  browser_be = {
    target_port = 8080

    image = "ghcr.io/pagopa/io-growth/ced-browser-be:latest"

    app_settings = {
      APPLICATIONINSIGHTS_ENTRA_ID_AUTH_ENABLED = "false"
      APPINSIGHTS_SAMPLING_PERCENTAGE           = "100"
      TELEMETRY_SERVICE_NAME                    = local.browser_be_container_app_name

      PORT            = "8080"

      POSTGRES_HOST   = "${module.postgresql.postgres.name}.postgres.database.azure.com"
      POSTGRES_PORT   = "6432"
      POSTGRES_DB     = azurerm_postgresql_flexible_server_database.ced_test.name
      POSTGRES_SSL    = "true"

      REDIS_ENDPOINT  = module.redis_dx.endpoint
      REDIS_TLS       = "true"
      AZURE_CLIENT_ID = module.common_container_app_environment.user_assigned_identity.client_id

      # FIMS SSO settings
      BASE_URL             = "https://browser.ced.pagopa.it"
      FIMS_AUDIT_CONTAINER = "ced-browser-logs"
      FIMS_REDIRECT_URL    = "https://api.ced.pagopa.it/api/ced-browser/v1/fcb"
      FIMS_SCOPE           = "openid profile lollipop"
      TEST_USERS           = "6960f673e4bf8cc073a32b3b4579bfdb97b50b8df29964bdea6fcd1576d16f82.c90f3d3d5f1c149eeb7e89360b3d7954fdff5d20ef276e63b42c839640fd06d0.2ac948451a778dc6a727927e947f5d29d4576eb49076b35834827c63948544f7.d1288381a4678fe3ce773ce5a255e7ecbf954f7d66c51126bcd3fd781d65fe27.12701c046897f8b03e4c4504152639d04a0f60c1c2ab499cfa557aac7170c35b.d3aedbfcf6dcc14227bb16bc766dc1b511dcef7784a18551d65e5e3399b902db.a8ed5e5884b81d744e8177f9740769d0af32afc0b63055d0caba4bcf2d174d41.bca66061a401f6d58a779aa470407a499fc6d2416cc8e6e3686fb5aaa7871110"
    }

    startup_probe_path   = "/api/info/startup"
    readiness_probe_path = "/api/info/readiness"
  }

  card_request_be_container_app_name = provider::dx::resource_name({
    prefix          = local.prefix
    environment     = local.env_short
    location        = local.location
    domain          = local.domain
    name            = "card-request-be"
    instance_number = 1
    resource_type   = "container_app"
  })

  # Card Request BE Container App configuration
  card_request_be = {
    target_port = 8080

    image = "ghcr.io/pagopa/io-growth/ced-card-request-be:latest"

    app_settings = {
      APPLICATIONINSIGHTS_ENTRA_ID_AUTH_ENABLED = "false"
      APPINSIGHTS_SAMPLING_PERCENTAGE           = "100"
      TELEMETRY_SERVICE_NAME                    = local.card_request_be_container_app_name

      PORT            = "8080"

      REDIS_ENDPOINT  = module.redis_dx.endpoint
      REDIS_TLS       = "true"
      AZURE_CLIENT_ID = module.common_container_app_environment.user_assigned_identity.client_id

      # CosmosDB — accessed via RBAC (managed identity)
      COSMOS_ENDPOINT = module.cosmos_db.cosmos_db.endpoint

      # FIMS SSO settings
      BASE_URL             = "https://card.ced.pagopa.it"
      FIMS_AUDIT_CONTAINER = "ced-card-request-logs"
      FIMS_REDIRECT_URL    = "https://api.ced.pagopa.it/api/ced-card/v1/fcb"
      FIMS_SCOPE           = "openid profile lollipop"
      TEST_USERS           = "6960f673e4bf8cc073a32b3b4579bfdb97b50b8df29964bdea6fcd1576d16f82.c90f3d3d5f1c149eeb7e89360b3d7954fdff5d20ef276e63b42c839640fd06d0.2ac948451a778dc6a727927e947f5d29d4576eb49076b35834827c63948544f7.d1288381a4678fe3ce773ce5a255e7ecbf954f7d66c51126bcd3fd781d65fe27.12701c046897f8b03e4c4504152639d04a0f60c1c2ab499cfa557aac7170c35b.d3aedbfcf6dcc14227bb16bc766dc1b511dcef7784a18551d65e5e3399b902db.a8ed5e5884b81d744e8177f9740769d0af32afc0b63055d0caba4bcf2d174d41.bca66061a401f6d58a779aa470407a499fc6d2416cc8e6e3686fb5aaa7871110"
    }

    startup_probe_path   = "/api/info/startup"
    readiness_probe_path = "/api/info/readiness"
  }

  tags = {
    CostCenter     = "TS000 - Tecnologia e Servizi"
    CreatedBy      = "Terraform"
    Environment    = "Prod"
    BusinessUnit   = "CED"
    ManagementTeam = "IO ECOSYSTEM GROWTH"
    Source         = "https://github.com/pagopa/io-growth/blob/main/infra/resources/ced/prod"
  }
}
