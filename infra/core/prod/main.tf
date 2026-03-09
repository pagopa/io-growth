module "azure-PROD-CED_core" {
  source  = "pagopa-dx/azure-core-infra/azurerm"
  version = "~> 2.0"

  providers = {
    azurerm = azurerm.PROD-CED
  }

  environment = merge(local.environment, local.azure_accounts.PROD-CED, {
    app_name = "core"
  })

  tags = local.tags
}