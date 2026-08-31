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

      PORT = "8080"

      POSTGRES_HOST    = "${module.postgresql.postgres.name}.postgres.database.azure.com"
      POSTGRES_PORT    = "6432"
      POSTGRES_DB      = azurerm_postgresql_flexible_server_database.ced_prod.name
      POSTGRES_DB_TEST = azurerm_postgresql_flexible_server_database.ced_test.name
      POSTGRES_SSL     = "true"

      REDIS_ENDPOINT = module.redis_dx.endpoint
      REDIS_TLS      = "true"

      AZURE_CLIENT_ID = module.common_container_app_environment.user_assigned_identity.client_id

      # Assets blob storage — accessed via RBAC (managed identity)
      ASSETS_STORAGE_ACCOUNT_NAME     = module.portal_be_storage.storage_account.name
      ASSETS_STORAGE_BLOB_ENDPOINT    = module.portal_be_storage.storage_account.primary_blob_endpoint
      ASSETS_STORAGE_CONTAINER_LOGOS  = module.portal_be_storage.containers.logos
      ASSETS_STORAGE_CONTAINER_IMAGES = module.portal_be_storage.containers.images

      CED_PORTAL_FE_BASE_URL = "https://${module.portal_fe_static_web_app.custom_domain}"
      CED_PRODUCT_ID         = "prod-ced"

      # Production admin fiscal codes (comma-separated list of fiscal codes hashes)
      # These define the fiscal codes that can access the admin endpoints of the portal BE application
      ADMIN_FISCAL_CODES = "516984510c575da00a39bcfcbc7e31ca4295384940dad4d2fd39f6e402f660b4,c76485950c65824bfece422678533d27eb3df4802220aa2f75580401964875b9"

      # Test actor fiscal codes (comma-separated list of fiscal codes hashes)
      # These define the fiscal codes that can the portal BE application as test actors
      ADMIN_FISCAL_CODES_TEST     = ""
      OPERATORS_FISCAL_CODES_TEST = ""
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
      COSMOS_ENDPOINT       = module.cosmos_db.cosmos_db.endpoint
      COSMOS_DATABASE_NAME  = module.cosmos_db.cosmos_db.database_name
      COSMOS_CONTAINER_NAME = module.cosmos_db.cosmos_db.container_name

      # FIMS SSO settings
      BASE_URL             = "https://card.ced.pagopa.it"
      FIMS_AUDIT_CONTAINER = "ced-card-request-logs"
      FIMS_REDIRECT_URL    = "https://api.ced.pagopa.it/api/ced-card/v1/fcb"
      FIMS_SCOPE           = "openid profile lollipop"
      TEST_USERS           = "a8ed5e5884b81d744e8177f9740769d0af32afc0b63055d0caba4bcf2d174d41,072b5457f7799888e760ecd1c8b0fef27b1931ce9c828a039fbc0dfafacb59d0,48d42cdf45de7da33027a6e68f88d11ba3f41cbbbd17f0839733e0a1c6dafb0c,32dd18f371a7cb7e002f2967736dfbe96e100c13c67dfa0d765bae0022b2e963,116a907f160995d357d9d15c733fea34703bed5c23556e7b7850ddd833adb60c,f0cb19e99dff37ab245b7248da0b5d6d144c3e89a2d3f9250c7bb1ccb0d54887,953bde862345324e348b0dc3826b14ca47a9096e8d90aa6dc62b40cb7326db60,74fe880fddae2e45a5de192c5884b91bf406b82b84d0fae93282f29a083d9028,aff25692050e47993fa4f8eda031aa430087e8da8315e021c58a73f5b2186fbb,9fd15fb5322067065fad2b81b8ea61af3c70553cc33f01ccdf5105f9889e2eef,12701c046897f8b03e4c4504152639d04a0f60c1c2ab499cfa557aac7170c35b,bca66061a401f6d58a779aa470407a499fc6d2416cc8e6e3686fb5aaa7871110,fcbfef84c4ee205d78e7aa5ed1958a8118739ca704065afbf234b82f5cc1633d,d3aedbfcf6dcc14227bb16bc766dc1b511dcef7784a18551d65e5e3399b902db,63d9f44b603c8446148b106261ecc9360b9cb3f62c54aafc42c0d54cc9b63f23,6960f673e4bf8cc073a32b3b4579bfdb97b50b8df29964bdea6fcd1576d16f82,3ffcf2b4d7630bcb759a95d0b02d5bddaec55d18ae9327c3acfc88690d4d1ca3,75d1f82833b9a146de82e158beeb550d45d1e7ac7f7f9a6deec977914ac54d42,263408618ceea7aa442814432b4e6afe854c84ae91128cd3abe1f94890730e12"
    }

    startup_probe_path   = "/api/info/startup"
    readiness_probe_path = "/api/info/readiness"
  }

  # INPS ModI reverse proxy — allows local devcontainers connected to the VPN to reach
  # INPS APIs through the whitelisted NAT gateway outbound IP of the Container App Environment.
  inps_proxy = {
    target_port = 8080

    image = "ghcr.io/pagopa/inps-proxy:latest"

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
