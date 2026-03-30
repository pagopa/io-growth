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
  description = "Name of the resource group."
}

variable "tags" {
  type        = map(any)
  description = "A map of tags to assign to the resources."
}

variable "use_case" {
  type        = string
  description = "App Service use case. Allowed values: 'default', 'high_load'."
  default     = "default"
}

variable "health_check_path" {
  type        = string
  description = "Path of the endpoint where health probe is exposed."
}

variable "virtual_network" {
  type = object({
    name                = string
    resource_group_name = string
  })
  description = "Virtual network where the subnet will be created."
}

variable "subnet_pep_id" {
  type        = string
  description = "ID of the subnet hosting private endpoints."
}

variable "subnet_cidr" {
  type        = string
  description = "CIDR block for the subnet used by the AppService for outbound connectivity."
  default     = null
}

variable "subnet_id" {
  type        = string
  description = "ID of the subnet where the application will be hosted."
  default     = null
}

variable "stack" {
  type        = string
  description = "Technology stack. Allowed values: 'node', 'java'."
  default     = "node"
}

variable "node_version" {
  type        = number
  description = "Node.js version to use."
  default     = 22
}

variable "java_version" {
  type        = string
  description = "Java version to use."
  default     = "17"
}

variable "app_service_plan_id" {
  type        = string
  description = "ID of the AppService plan."
  default     = null
}

variable "slot_app_settings" {
  type        = map(string)
  description = "Application settings for the staging slot."
  default     = {}
}

variable "sticky_app_setting_names" {
  type        = list(string)
  description = "List of application setting names not swapped between slots."
  default     = []
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

variable "application_insights_connection_string" {
  type        = string
  description = "Application Insights connection string."
  default     = null
}

variable "application_insights_sampling_percentage" {
  type        = number
  description = "Sampling percentage for Application Insights."
  default     = 5
}

variable "private_dns_zone_resource_group_name" {
  type        = string
  description = "Name of the resource group containing the private DNS zone."
  default     = null
}
