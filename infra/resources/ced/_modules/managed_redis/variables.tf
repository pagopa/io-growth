variable "environment" {
  type = object({
    prefix          = string
    env_short       = string
    location        = string
    domain          = optional(string)
    app_name        = string
    instance_number = string
  })
  description = "Values used to generate resource names and derive short location names."
}

variable "resource_group_name" {
  type        = string
  description = "The name of the resource group where resources will be deployed."
}

variable "tags" {
  type        = map(any)
  description = "A map of tags to assign to the resources."
}

variable "virtual_network_id" {
  type        = string
  description = "The resource ID of the virtual network hosting the private endpoint. Required when use_case is 'default'."
}

variable "private_dns_zone_resource_group_name" {
  type        = string
  description = "The resource group name containing the 'privatelink.redis.azure.net' private DNS zone. Defaults to the virtual network resource group."
  default     = null
}

variable "use_case" {
  type        = string
  description = "DX preset for Azure Managed Redis. Allowed values are 'default' and 'development'."
  default     = "default"
}

variable "sku_name_override" {
  type        = string
  description = "Optional explicit SKU name override. Only Balanced_* SKUs (B0-B250) are supported."
  default     = null
}

variable "log_analytics_workspace_id" {
  type        = string
  description = "The ID of the Log Analytics workspace to send diagnostics to. Required when use_case is 'default'."
}

variable "alerts" {
  description = "Metric alert configuration. Alerts are enabled by default for the 'default' use case with sensible thresholds."
  type = object({
    action_group_id = optional(string, null)
    thresholds = optional(object({
      used_memory_percentage          = optional(number, 75)
      used_memory_percentage_critical = optional(number, 90)
      server_load                     = optional(number, 80)
      server_load_critical            = optional(number, 90)
      evicted_keys                    = optional(number, 0)
      connected_clients               = optional(number, null)
    }), {})
  })
  default = {}
}
