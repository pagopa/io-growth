locals {
  prefix         = "io"
  env_short      = "p"
  location_short = "itn"
  domain         = "ced"

  project = "${local.prefix}-${local.env_short}-${local.location_short}-${local.domain}"

  location           = "italynorth"
  secondary_location = "germanywestcentral"

  tags = {
    CostCenter     = "TS310 - PAGAMENTI & SERVIZI"
    CreatedBy      = "Terraform"
    Environment    = "Prod"
    Owner          = "IO"
    ManagementTeam = "IO GROWTH"
    Source         = "https://github.com/pagopa/io-growth/blob/main/infra/resources/ced/prod"
  }
}
