locals {
  prefix         = "ced"
  env_short      = "p"
  location_short = "itn"
  domain          = ""

  project = "${local.prefix}-${local.env_short}-${local.location_short}"

  location           = "italynorth"
  secondary_location = "germanywestcentral"

  core_state = {
    resource_group_name  = "ced-p-itn-tfstate-rg-01"
    storage_account_name = "cedpitntfstatest01"
    container_name       = "terraform-state"
    key                  = "ced.core.prod.tfstate"
  }

  tags = {
    CostCenter     = "TS310 - PAGAMENTI & SERVIZI"
    CreatedBy      = "Terraform"
    Environment    = "Prod"
    Owner          = "IO"
    ManagementTeam = "IO GROWTH"
    Source         = "https://github.com/pagopa/io-growth/blob/main/infra/resources/ced/prod"
  }
}
