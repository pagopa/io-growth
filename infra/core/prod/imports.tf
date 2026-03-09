data "azurerm_resource_group" "azure-PROD-CED_common" {
  provider = azurerm.PROD-CED
  name = provider::dx::resource_name(merge(local.environment, {
    resource_type   = "resource_group",
    name            = "common"
    instance_number = 1
  }, local.azure_accounts.PROD-CED))
}

import {
  to = module.azure-PROD-CED_core.azurerm_resource_group.common
  id = data.azurerm_resource_group.azure-PROD-CED_common.id
}

data "azurerm_key_vault" "azure-PROD-CED_common" {
  provider = azurerm.PROD-CED
  name = provider::dx::resource_name(merge(local.environment, {
    resource_type   = "key_vault"
    name            = "common"
    instance_number = 1
  }, local.azure_accounts.PROD-CED))
  resource_group_name = data.azurerm_resource_group.azure-PROD-CED_common.name
}

import {
  to = module.azure-PROD-CED_core.module.key_vault.azurerm_key_vault.common
  id = data.azurerm_key_vault.azure-PROD-CED_common.id
}