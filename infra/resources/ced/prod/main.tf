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

resource "azurerm_resource_group" "ced_common" {
  name     = "${local.project}-common-rg-01"
  location = local.location
}

resource "azurerm_resource_group" "ced_portal" {
  name     = "${local.project}-portal-rg-01"
  location = local.location
}

resource "azurerm_resource_group" "ced_usage" {
  name     = "${local.project}-usage-rg-01"
  location = local.location
}

resource "azurerm_resource_group" "ced_request" {
  name     = "${local.project}-request-rg-01"
  location = local.location
}

module "networking" {
  source = "../_modules/networking"

  project        = local.project
  location       = local.location
  location_short = local.location_short
  domain         = local.domain
  env_short      = local.env_short

  resource_group_name = azurerm_resource_group.ced_common.name

  vnet_cidr_block = "10.26.0.0/16"
  pep_snet_cidr   = ["10.26.2.0/23"]

  tags = local.tags
}

module "vpn" {
  source = "../_modules/vpn"

  location            = local.location
  location_short      = local.location_short
  resource_group_name = azurerm_resource_group.ced_common.name
  project             = local.project
  prefix              = local.prefix
  env_short           = local.env_short

  subscription_current     = data.azurerm_subscription.current
  virtual_network          = module.networking.vnet_common
  vpn_cidr_subnet          = ["10.26.133.0/24"]
  dnsforwarder_cidr_subnet = ["10.26.252.8/29"]
  vpn_app_display_name     = "io-p-app-vpn"

  tags = local.tags
}

module "dns" {
  source = "../_modules/dns"

  resource_group_name = azurerm_resource_group.ced_common.name

  virtual_network = {
    id   = module.networking.vnet_common.id
    name = module.networking.vnet_common.name
  }

  tags = local.tags
}

module "key_vault" {
  source = "../_modules/key_vault"

  name                = "${local.project}-kv-01"
  location            = local.location
  resource_group_name = azurerm_resource_group.ced_common.name

  tenant_id           = data.azurerm_client_config.current.tenant_id
  subnet_pep_id       = module.networking.pep_snet.id
  private_dns_zone_id = module.dns.private_dns_zones["vault"].id

  tags = local.tags
}