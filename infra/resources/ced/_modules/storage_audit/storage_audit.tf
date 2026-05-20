###
# Immutable Audit Log Storage
###
module "immutable_ced_audit_logs_storage" {
  source  = "pagopa-dx/azure-storage-account/azurerm"
  version = "~> 1.0"

  environment = {
    prefix          = var.prefix
    env_short       = var.env_short
    location        = var.location
    domain          = var.domain
    app_name        = var.app_name
    instance_number = var.instance_number
  }

  resource_group_name = var.resource_group_name
  subnet_pep_id       = var.subnet_pep_id

  blob_features = {
    versioning          = true
    restore_policy_days = 0
    immutability_policy = {
      enabled                       = true
      allow_protected_append_writes = false
      period_since_creation_in_days = var.ced_storage_immutability_policy_days
    }
  }

  customer_managed_key = {
    enabled      = true
    type         = "kv"
    key_vault_id = var.key_vault_id
  }

  action_group_id = var.action_group_id

  tier = "l"

  tags = var.tags
}

# Containers
resource "azurerm_storage_container" "immutable_ced_browser_audit_logs_storage_logs" {
  depends_on = [module.immutable_ced_audit_logs_storage]

  name                  = "ced-browser-logs"
  storage_account_name  = module.immutable_ced_audit_logs_storage.name
  container_access_type = "private"
}

# Policies
resource "azurerm_storage_management_policy" "immutable_ced_browser_audit_logs_storage_management_policy" {
  depends_on = [module.immutable_ced_audit_logs_storage, azurerm_storage_container.immutable_ced_browser_audit_logs_storage_logs]

  storage_account_id = module.immutable_ced_audit_logs_storage.id

  rule {
    name    = "cedbrowserauditlogsdeletepolicy"
    enabled = true
    filters {
      prefix_match = [
        azurerm_storage_container.immutable_ced_browser_audit_logs_storage_logs.name,
      ]
      blob_types = ["blockBlob"]
    }
    actions {
      base_blob {
        delete_after_days_since_creation_greater_than = var.ced_storage_immutability_policy_days + 1
      }
      snapshot {
        delete_after_days_since_creation_greater_than = var.ced_storage_immutability_policy_days + 1
      }
      version {
        delete_after_days_since_creation = var.ced_storage_immutability_policy_days + 1
      }
    }
  }
}

resource "azurerm_storage_container" "immutable_ced_card_request_audit_logs_storage_logs" {
  depends_on = [module.immutable_ced_audit_logs_storage]

  name                  = "ced-card-request-logs"
  storage_account_name  = module.immutable_ced_audit_logs_storage.name
  container_access_type = "private"
}

# Policies
resource "azurerm_storage_management_policy" "immutable_ced_card_request_audit_logs_storage_management_policy" {
  depends_on = [module.immutable_ced_audit_logs_storage, azurerm_storage_container.immutable_ced_card_request_audit_logs_storage_logs]

  storage_account_id = module.immutable_ced_audit_logs_storage.id

  rule {
    name    = "cedcardrequestauditlogsdeletepolicy"
    enabled = true
    filters {
      prefix_match = [
        azurerm_storage_container.immutable_ced_card_request_audit_logs_storage_logs.name,
      ]
      blob_types = ["blockBlob"]
    }
    actions {
      base_blob {
        delete_after_days_since_creation_greater_than = var.ced_storage_immutability_policy_days + 1
      }
      snapshot {
        delete_after_days_since_creation_greater_than = var.ced_storage_immutability_policy_days + 1
      }
      version {
        delete_after_days_since_creation = var.ced_storage_immutability_policy_days + 1
      }
    }
  }
}


