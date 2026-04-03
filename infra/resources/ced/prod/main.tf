terraform {

  backend "azurerm" {
    resource_group_name  = "ced-p-itn-tfstate-rg-01"
    storage_account_name = "cedpitntfstatest01"
    container_name       = "terraform-state"
    key                  = "ced.resources.prod.tfstate"
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }

    dx = {
      source  = "pagopa-dx/azure"
      version = "~> 0.0"
    }
  }
}

provider "azurerm" {
  features {}
}

provider "dx" {}

module "azure_core_values" {
  source  = "pagopa-dx/azure-core-values-exporter/azurerm"
  version = "~> 0.0"

  core_state = local.core_state
}

module "dns" {
  source = "../_modules/dns"

  resource_group_name = module.azure_core_values.network_resource_group_name

  virtual_network = {
    id   = module.azure_core_values.common_vnet.id
    name = module.azure_core_values.common_vnet.name
  }

  tags = local.tags
}
