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
  description = "Resource group name where the CDN profile will be created."
}

variable "tags" {
  type        = map(any)
  description = "A map of tags to assign to the resources."
}

variable "origins" {
  type = map(object({
    host_name            = string
    priority             = optional(number, 1)
    storage_account_id   = optional(string, null)
    use_managed_identity = optional(bool, false)
  }))
  description = "Map of origin configurations. Key is the origin identifier."
}

variable "custom_domains" {
  type = list(object({
    host_name = string
    dns = optional(object({
      zone_name                = string
      zone_resource_group_name = string
    }), { zone_name = null, zone_resource_group_name = null })
    custom_certificate = optional(object({
      key_vault_certificate_versionless_id = string
      key_vault_name                       = string
      key_vault_resource_group_name        = string
      key_vault_has_rbac_support           = optional(bool, true)
    }), null)
  }))
  description = "List of custom domain configurations."
  default     = []
}

variable "waf_enabled" {
  type        = bool
  description = "Whether to enable the WAF policy."
  default     = false
}

variable "origin_health_probe" {
  type = object({
    path         = optional(string, "/")
    request_type = optional(string, "HEAD")
  })
  description = "Health probe configuration of the CDN origin group."
  default     = {}
}

variable "diagnostic_settings" {
  type = object({
    enabled                                   = bool
    log_analytics_workspace_id                = optional(string)
    diagnostic_setting_destination_storage_id = optional(string)
  })
  description = "Diagnostic settings configuration."
  default = {
    enabled = false
  }
}

variable "existing_cdn_frontdoor_profile_id" {
  type        = string
  description = "Existing CDN FrontDoor Profile ID. If provided, the module will not create a new profile."
  default     = null
}
