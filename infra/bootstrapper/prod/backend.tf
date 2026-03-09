terraform {
  backend "azurerm" {
    resource_group_name  = "ced-p-itn-tfstate-rg-01"
    storage_account_name = "cedpitntfstatest01"
    container_name       = "terraform-state"
    key                  = "io-growth.bootstrapper.prod.tfstate"
    subscription_id      = "0f1c9857-d58b-47d2-874e-c905c5276dda"
    use_azuread_auth     = true
  }
}