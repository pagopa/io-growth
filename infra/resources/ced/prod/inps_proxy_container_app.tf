module "inps_proxy_container_app" {
  source = "../_modules/inps_proxy_container_app"

  environment = {
    prefix          = local.prefix
    env_short       = local.env_short
    location        = local.location
    app_name        = "inps-proxy"
    instance_number = "01"
  }

  resource_group_name = data.azurerm_resource_group.resource_rg.name
  tags                = local.tags

  container_app_environment_id = module.common_container_app_environment.id
  user_assigned_identity_id    = module.common_container_app_environment.user_assigned_identity.id

  target_port           = local.inps_proxy.target_port
  public_access_enabled = true

  secrets = [
    {
      name                = "INPS_CLIENT_CERT"
      key_vault_secret_id = format(local.secrets_id_template, "inps-ced-modi-https-client-cert")
    },
    {
      name                = "INPS_CLIENT_KEY"
      key_vault_secret_id = format(local.secrets_id_template, "inps-ced-modi-https-client-key")
    },
    {
      name                = "INPS_CLIENT_CA"
      key_vault_secret_id = format(local.secrets_id_template, "inps-ced-modi-inps-https-ca")
    },
  ]

  container_app_templates = [
    {
      image = local.inps_proxy.image

      app_settings = {
        INPS_UPSTREAM = local.inps_proxy.upstream_host
      }

      liveness_probe = {
        path      = local.inps_proxy.health_path
        transport = "HTTP"
      }

      readiness_probe = {
        path      = local.inps_proxy.health_path
        transport = "HTTP"
      }

      startup_probe = {
        path      = local.inps_proxy.health_path
        transport = "HTTP"
      }
    }
  ]
}

output "inps_proxy_fqdn" {
  description = "Internal FQDN of the INPS reverse proxy (reachable over VPN). Use as MODI_INPS_BASE_URL and INPS_CED_BASE_URL in local .env."
  value       = module.inps_proxy_container_app.fqdn
}
