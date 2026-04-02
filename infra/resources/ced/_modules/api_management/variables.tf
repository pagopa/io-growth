variable "environment" {
  type = object({
    prefix          = string
    env_short       = string
    location        = string
    location_short  = string
    domain          = optional(string)
    app_name        = string
    instance_number = string
  })
  description = "Environment configuration for resource naming."
}

variable "resource_group_name" {
  type        = string
  description = "The name of the resource group where the resources will be deployed."
}

variable "tags" {
  type        = map(any)
  description = "A map of tags to assign to the resources."
}

variable "use_case" {
  type        = string
  description = "Specifies the use case. Allowed values: 'cost_optimized', 'high_load', 'development'."
  default     = "cost_optimized"
}

variable "publisher_name" {
  type        = string
  description = "The name of the publisher or company."
}

variable "publisher_email" {
  type        = string
  description = "The email address of the publisher or company."
}

variable "virtual_network" {
  type = object({
    name                = string
    resource_group_name = string
  })
  description = "Virtual network in which to create the subnet."
}

variable "subnet_cidr" {
  type        = string
  description = "CIDR block for the APIM subnet."
}

variable "subnet_pep_id" {
  type        = string
  description = "ID of the subnet hosting private endpoints."
  default     = null
}

variable "key_vault_id" {
  type        = string
  description = "The ID of the Key Vault."
  default     = null
}

variable "enable_public_network_access" {
  type        = bool
  description = "Specifies whether public network access is enabled."
  default     = true
}

variable "virtual_network_type_internal" {
  type        = bool
  description = "Specifies if VNet type is Internal (requires subnet_id)."
  default     = null
}

variable "application_insights" {
  type = object({
    enabled             = bool
    connection_string   = string
    id                  = optional(string, null)
    sampling_percentage = number
    verbosity           = string
  })
  description = "Application Insights integration."
  default = {
    connection_string   = null
    enabled             = false
    id                  = null
    sampling_percentage = 0
    verbosity           = "error"
  }
}

variable "monitoring" {
  type = object({
    enabled                    = bool
    log_analytics_workspace_id = string
    logs = optional(object({
      enabled    = bool
      groups     = optional(list(string), [])
      categories = optional(list(string), [])
    }), { enabled = false, groups = [], categories = [] })
    metrics = optional(object({
      enabled = bool
    }), { enabled = false })
  })
  description = "Monitoring configuration."
  default = {
    enabled                    = false
    log_analytics_workspace_id = null
  }
}

variable "hostname_configuration" {
  type = object({
    proxy = optional(list(object({
      host_name           = string
      key_vault_id        = string
      default_ssl_binding = optional(bool, false)
    })), [])
    management = optional(list(object({
      host_name    = string
      key_vault_id = string
    })), [])
    portal = optional(list(object({
      host_name    = string
      key_vault_id = string
    })), [])
    developer_portal = optional(list(object({
      host_name    = string
      key_vault_id = string
    })), [])
    scm = optional(list(object({
      host_name    = string
      key_vault_id = string
    })), [])
  })
  description = "Custom domain configurations."
  default     = {}
}

variable "certificate_names" {
  type        = list(string)
  description = "A list of Key Vault certificate names."
  default     = []
}

variable "notification_sender_email" {
  type        = string
  description = "The email address from which notifications will be sent."
  default     = null
}

variable "xml_content" {
  type        = string
  description = "XML content for all API policies."
  default     = null
}
