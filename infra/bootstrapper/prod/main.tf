module "azure-PROD-CED_core_values" {
  source  = "pagopa-dx/azure-core-values-exporter/azurerm"
  version = "~> 0.0"

  providers = {
    azurerm = azurerm.PROD-CED
  }

  core_state = {
    resource_group_name  = "ced-p-itn-tfstate-rg-01"
    storage_account_name = "cedpitntfstatest01"
    subscription_id      = "0f1c9857-d58b-47d2-874e-c905c5276dda"
    container_name       = "terraform-state"
    key                  = "ced.core.prod.tfstate"
  }
}

module "azure-PROD-CED_bootstrap" {
  source  = "pagopa-dx/azure-github-environment-bootstrap/azurerm"
  version = "~> 3.0"

  providers = {
    azurerm = azurerm.PROD-CED
  }

  environment = merge(local.environment, local.azure_accounts.PROD-CED)

  subscription_id = module.azure-PROD-CED_core_values.subscription_id
  tenant_id       = module.azure-PROD-CED_core_values.tenant_id

  entraid_groups = {
    admins_object_id    = data.azuread_group.admins.object_id
    devs_object_id      = data.azuread_group.developers.object_id
    externals_object_id = data.azuread_group.externals.object_id
  }

  terraform_storage_account = {
    name                = "cedpitntfstatest01"
    resource_group_name = "ced-p-itn-tfstate-rg-01"
  }

  repository = {
    owner = "pagopa"
    name  = "io-growth"
  }

  github_private_runner = {
    container_app_environment_id       = module.azure-PROD-CED_core_values.github_runner.environment_id
    container_app_environment_location = local.azure_accounts.PROD-CED.location
    labels = [
      "prod"
    ]
    key_vault = {
      name                = module.azure-PROD-CED_core_values.common_key_vault.name
      resource_group_name = module.azure-PROD-CED_core_values.common_key_vault.resource_group_name
      use_rbac            = true
    }
    use_github_app = true
  }

  apim_id = data.azurerm_api_management.ced_apim.id

  additional_resource_group_ids = [data.azurerm_resource_group.common.id]

  pep_vnet_id                        = module.azure-PROD-CED_core_values.common_vnet.id
  private_dns_zone_resource_group_id = module.azure-PROD-CED_core_values.network_resource_group_id
  opex_resource_group_id             = module.azure-PROD-CED_core_values.opex_resource_group_id

  tags = local.tags
}

resource "azurerm_role_definition" "infra_ci_stapp_list_secrets" {
  provider    = azurerm.PROD-CED
  name        = "PagoPA Static Web App List Secrets"
  scope       = module.azure-PROD-CED_core_values.subscription_id
  description = "Allow listing secrets for Azure Static Web Apps, required by the Terraform azurerm provider"

  permissions {
    actions = ["Microsoft.Web/staticSites/listSecrets/action"]
  }

  assignable_scopes = [
    module.azure-PROD-CED_core_values.subscription_id
  ]
}

resource "azurerm_role_assignment" "infra_ci_stapp_list_secrets" {
  provider           = azurerm.PROD-CED
  scope              = data.azurerm_static_web_app.portal_fe.id
  role_definition_id = azurerm_role_definition.infra_ci_stapp_list_secrets.role_definition_resource_id
  principal_id       = module.azure-PROD-CED_bootstrap.identities.infra.ci.principal_id
  description        = "Allow io-growth Infra CI identity to list secrets for the portal frontend Static Web App"
}
