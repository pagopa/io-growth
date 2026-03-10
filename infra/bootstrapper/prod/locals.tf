locals {
  environment = {
    prefix          = "ced"
    env_short       = "p"
    domain          = ""
    instance_number = "01"
  }

  azure_accounts = {
    PROD-CED = {
      location = "italynorth"
    }
  }

  tags = {
    CreatedBy      = "Terraform"
    Environment    = "prod"
    CostCenter     = "TS000"
    BusinessUnit   = "App IO"
    ManagementTeam = "IO Growth"
  }
}