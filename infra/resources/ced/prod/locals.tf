locals {
  prefix         = "ced"
  env_short      = "p"
  location_short = "itn"
  domain         = ""

  project = "${local.prefix}-${local.env_short}-${local.location_short}"

  location           = "italynorth"
  secondary_location = "germanywestcentral"

  core_state = {
    resource_group_name  = "ced-p-itn-tfstate-rg-01"
    storage_account_name = "cedpitntfstatest01"
    container_name       = "terraform-state"
    key                  = "ced.core.prod.tfstate"
  }

  secrets_id_template = "${data.azurerm_key_vault.common.vault_uri}secrets/%s"

  # Portal BE Container App configuration
  portal_be = {
    target_port = 8080

    image = "ghcr.io/pagopa/io-growth/ced-portal-be:latest"

    app_settings = {
      PORT            = "8080"
      POSTGRES_HOST   = "${module.postgresql.postgres.name}.postgres.database.azure.com"
      POSTGRES_PORT   = "6432"
      POSTGRES_DB     = azurerm_postgresql_flexible_server_database.ced_test.name
      REDIS_HOST      = module.redis.hostname
      REDIS_PORT      = tostring(module.redis.ssl_port)
      REDIS_TLS       = "true"
      AZURE_CLIENT_ID = module.common_container_app_environment.user_assigned_identity.client_id
    }

    health_check_path = "/api/info"
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
