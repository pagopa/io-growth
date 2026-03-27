variable "environment" {
  type = object({
    prefix          = string
    env_short       = string
    location        = string
    domain          = optional(string)
    app_name        = string
    instance_number = string
  })
  description = "Environment configuration for resource naming."
}

variable "resource_group_name" {
  type        = string
  description = "The name of the resource group where the storage account will be deployed."
}

variable "tags" {
  type        = map(any)
  description = "A map of tags to assign to the resources."
}

variable "use_case" {
  type        = string
  description = "Storage account use case. Allowed values: 'default', 'audit', 'delegated_access', 'development', 'archive'."
  default     = "default"
}

variable "access_tier" {
  type        = string
  description = "Access tier for the storage account. Options: 'Hot', 'Cool', 'Cold', 'Premium'."
  default     = "Hot"
}

variable "subnet_pep_id" {
  type        = string
  description = "The ID of the subnet used for private endpoints."
  default     = null
}

variable "force_public_network_access_enabled" {
  type        = bool
  description = "Allows public network access."
  default     = false
}

variable "containers" {
  type = list(object({
    name        = string
    access_type = optional(string, "private")
    immutability_policy = optional(object({
      period_in_days = number
      locked         = optional(bool, false)
    }), null)
  }))
  description = "Containers to be created."
  default     = []
}

variable "queues" {
  type        = list(string)
  description = "Queues to be created."
  default     = []
}

variable "tables" {
  type        = list(string)
  description = "Tables to be created."
  default     = []
}

variable "blob_features" {
  type = object({
    restore_policy_days   = optional(number, 0)
    delete_retention_days = optional(number, 0)
    last_access_time      = optional(bool, false)
    versioning            = optional(bool, false)
    change_feed = optional(object({
      enabled           = optional(bool, false)
      retention_in_days = optional(number, 0)
    }), { enabled = false })
    immutability_policy = optional(object({
      enabled                       = optional(bool, false)
      allow_protected_append_writes = optional(bool, false)
      period_since_creation_in_days = optional(number, 730)
      state                         = optional(string, null)
    }), { enabled = false })
  })
  description = "Advanced blob features."
  default = {
    change_feed           = { enabled = false, retention_in_days = 0 }
    delete_retention_days = 0
    immutability_policy   = { enabled = false }
    last_access_time      = false
    restore_policy_days   = 0
    versioning            = false
  }
}

variable "static_website" {
  type = object({
    enabled            = optional(bool, false)
    index_document     = optional(string, null)
    error_404_document = optional(string, null)
  })
  description = "Configures static website hosting."
  default = {
    enabled = false
  }
}

variable "network_rules" {
  type = object({
    default_action             = string
    bypass                     = list(string)
    ip_rules                   = list(string)
    virtual_network_subnet_ids = list(string)
  })
  description = "Defines network rules for the storage account."
  default = {
    bypass                     = []
    default_action             = "Deny"
    ip_rules                   = []
    virtual_network_subnet_ids = []
  }
}

variable "diagnostic_settings" {
  type = object({
    enabled                    = bool
    log_analytics_workspace_id = optional(string, null)
    storage_account_id         = optional(string, null)
  })
  description = "Diagnostic settings configuration."
  default = {
    enabled = false
  }
}

variable "customer_managed_key" {
  type = object({
    enabled                   = optional(bool, false)
    type                      = optional(string, null)
    key_name                  = optional(string, null)
    user_assigned_identity_id = optional(string, null)
    key_vault_id              = optional(string, null)
  })
  description = "Customer-managed key configuration."
  default = {
    enabled = false
  }
}

variable "subservices_enabled" {
  type = object({
    blob  = optional(bool, true)
    file  = optional(bool, false)
    queue = optional(bool, false)
    table = optional(bool, false)
  })
  description = "Enables subservices (blob, file, queue, table)."
  default     = {}
}

variable "private_dns_zone_resource_group_name" {
  type        = string
  description = "Resource group for the private DNS zone."
  default     = null
}
