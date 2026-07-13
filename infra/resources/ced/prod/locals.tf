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
      ADMIN_FISCAL_CODES     = "516984510c575da00a39bcfcbc7e31ca4295384940dad4d2fd39f6e402f660b4,c76485950c65824bfece422678533d27eb3df4802220aa2f75580401964875b9"
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

      PORT = "8080"

      POSTGRES_HOST = "${module.postgresql.postgres.name}.postgres.database.azure.com"
      POSTGRES_PORT = "6432"
      POSTGRES_DB   = azurerm_postgresql_flexible_server_database.ced_test.name
      POSTGRES_SSL  = "true"

      REDIS_ENDPOINT  = module.redis_dx.endpoint
      REDIS_TLS       = "true"
      AZURE_CLIENT_ID = module.common_container_app_environment.user_assigned_identity.client_id

      # FIMS SSO settings
      BASE_URL             = "https://browser.ced.pagopa.it"
      FIMS_AUDIT_CONTAINER = "ced-browser-logs"
      FIMS_REDIRECT_URL    = "https://api.ced.pagopa.it/api/ced-browser/v1/fcb"
      FIMS_SCOPE           = "openid profile lollipop"
      TEST_USERS           = ""
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

      PORT = "8080"

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
      TEST_USERS           = ""
    }

    startup_probe_path   = "/api/info/startup"
    readiness_probe_path = "/api/info/readiness"
  }

  # INPS ModI reverse proxy — allows local devcontainers connected to the VPN to reach
  # INPS APIs through the whitelisted NAT gateway outbound IP of the Container App Environment.
  # Replace upstream_host with the actual INPS collaudo hostname once confirmed.
  inps_proxy = {
    target_port = 8080

    image = "ghcr.io/pagopa/io-growth/inps-proxy:latest"

    # Hostname only (no scheme, no trailing slash).
    # Local .env: set MODI_INPS_BASE_URL and INPS_CED_BASE_URL to https://<proxy-fqdn>
    # (keeping the same path prefix used in the real INPS base URLs).
    upstream_host = "api.collaudo.inps.it" # TODO: replace with the confirmed INPS collaudo hostname

    health_path = "/healthz"
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
