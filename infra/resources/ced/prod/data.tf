data "azurerm_client_config" "current" {}

data "azurerm_subscription" "current" {}

data "azurerm_key_vault" "common" {
  name                = module.azure_core_values.common_key_vault.name
  resource_group_name = module.azure_core_values.common_resource_group_name
}

data "azurerm_key_vault_secret" "action_group_email" {
  name         = "action-group-email"
  key_vault_id = data.azurerm_key_vault.common.id
}

data "azurerm_key_vault_secret" "action_group_slack" {
  name         = "action-group-slack"
  key_vault_id = data.azurerm_key_vault.common.id
}

data "azurerm_resource_group" "resource_rg" {
  name = "ced-p-itn-rg-01"
}

data "azurerm_private_dns_zone" "privatelink_blob_core_windows_net" {
  name                = "privatelink.blob.core.windows.net"
  resource_group_name = module.azure_core_values.network_resource_group_name
}

data "azurerm_key_vault_secret" "dkim_record_1" {
  name         = "ced-one-mail-dkim-1"
  key_vault_id = data.azurerm_key_vault.common.id
}

data "azurerm_key_vault_secret" "dkim_record_2" {
  name         = "ced-one-mail-dkim-2"
  key_vault_id = data.azurerm_key_vault.common.id
}

data "azurerm_key_vault_secret" "dkim_record_3" {
  name         = "ced-one-mail-dkim-3"
  key_vault_id = data.azurerm_key_vault.common.id
}

data "azurerm_key_vault_secret" "cmf_mx_1_record" {
  name         = "ced-one-mail-cmf-mx-1"
  key_vault_id = data.azurerm_key_vault.common.id
}

data "azurerm_key_vault_secret" "cmf_txt_1_record" {
  name         = "ced-one-mail-cmf-txt-1"
  key_vault_id = data.azurerm_key_vault.common.id
}

data "azurerm_key_vault_secret" "cmf_mx_2_record" {
  name         = "ced-one-mail-cmf-mx-2"
  key_vault_id = data.azurerm_key_vault.common.id
}

data "azurerm_key_vault_secret" "cmf_txt_2_record" {
  name         = "ced-one-mail-cmf-txt-2"
  key_vault_id = data.azurerm_key_vault.common.id
}

data "azurerm_key_vault_secret" "dmarc_record" {
  name         = "ced-one-mail-dmarc"
  key_vault_id = data.azurerm_key_vault.common.id
}
