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
      version = "~> 0.9"
    }
  }
}

provider "azurerm" {
  features {}
}

provider "dx" {}

resource "azurerm_resource_group" "data_rg" {
  name     = "${local.project}-data-rg-01"
  location = local.location

  tags = local.tags
}

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

  dkim1_record = data.azurerm_key_vault_secret.dkim_record_1.value
  dkim2_record = data.azurerm_key_vault_secret.dkim_record_2.value
  dkim3_record = data.azurerm_key_vault_secret.dkim_record_3.value
  cmf_mx_1_record = data.azurerm_key_vault_secret.cmf_mx_1_record.value
  cmf_txt_1_record = data.azurerm_key_vault_secret.cmf_txt_1_record.value
  cmf_mx_2_record = data.azurerm_key_vault_secret.cmf_mx_2_record.value
  cmf_txt_2_record = data.azurerm_key_vault_secret.cmf_txt_2_record.value
  dmarc_record = data.azurerm_key_vault_secret.dmarc_record.value

  tags = local.tags
}
