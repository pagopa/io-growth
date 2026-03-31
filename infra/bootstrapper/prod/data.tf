data "azurerm_resource_group" "common" {
  provider = azurerm.PROD-CED
  name     = "ced-p-itn-common-rg-01"
}

data "azuread_group" "admins" {
  display_name = "ced-p-adgroup-admin"
}

data "azuread_group" "developers" {
  display_name = "ced-p-adgroup-developers"
}

data "azuread_group" "externals" {
  display_name = "ced-p-adgroup-externals"
}
