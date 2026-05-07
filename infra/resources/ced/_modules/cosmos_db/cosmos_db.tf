module "ced_cosmos_account" {
  source  = "pagopa-dx/azure-cosmos-account/azurerm"
  version = "0.2.0"

  subnet_pep_id = var.subnet_pep_id

  alerts = {
    enabled         = true
    action_group_id = var.action_group_id
    thresholds = {
      provisioned_throughput_exceeded = 1000
    }
  }

  environment = var.environment

  secondary_geo_locations = [
    {
      location          = var.secondary_location
      failover_priority = 1
      zone_redundant    = false
    }
  ]

  tags = var.tags

  consistency_policy = {
    consistency_preset = "Default"
  }

  resource_group_name = var.resource_group
}

resource "azurerm_cosmosdb_sql_database" "ced_cosmos_db" {
  name                = "ced-cosmos-01"
  resource_group_name = var.resource_group
  account_name        = module.ced_cosmos_account.name
}

resource "azurerm_cosmosdb_sql_container" "card_requests" {
  name                = "request-state"
  resource_group_name = var.resource_group

  account_name        = module.ced_cosmos_account.name
  database_name       = azurerm_cosmosdb_sql_database.ced_cosmos_db.name
  partition_key_paths = ["/id"]
  autoscale_settings {
    max_throughput = 2000
  }
}
