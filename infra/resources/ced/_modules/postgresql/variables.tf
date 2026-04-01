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
  description = "The name of the resource group."
}

variable "tags" {
  type        = map(any)
  description = "A map of tags to assign to the resources."
}

variable "admin_username" {
  type        = string
  description = "The administrator username for the PostgreSQL Flexible Server."
}

variable "admin_password" {
  type        = string
  description = "The administrator password for the PostgreSQL Flexible Server."
  ephemeral   = true
  sensitive   = true
}

variable "admin_password_version" {
  type        = number
  description = "Version counter for the administrator password. Increment on every rotation."
}

variable "key_vault_id" {
  type        = string
  description = "Key Vault ID for storing the admin password secret."
  default     = null
}

variable "subnet_pep_id" {
  type        = string
  description = "The ID of the subnet used for private endpoints."
  default     = null
}

variable "db_version" {
  type        = string
  description = "PostgreSQL version. Supported: 11, 12, 13, 14, 15, 16."
  default     = "16"
}

variable "storage_mb" {
  type        = number
  description = "Maximum storage allowed in MB."
  default     = 32768
}

variable "pgbouncer_enabled" {
  type        = bool
  description = "Whether PgBouncer connection pooling is enabled."
  default     = true
}

variable "create_replica" {
  type        = bool
  description = "Whether to create a replica PostgreSQL Flexible Server."
  default     = true
}

variable "replica_location" {
  type        = string
  description = "Location for the replica server."
}

variable "backup_retention_days" {
  type        = number
  description = "Number of days to retain backups. Valid: 7 to 35."
  default     = 7
}

variable "high_availability_override" {
  type        = bool
  description = "Override if high availability should be enabled."
  default     = false
}

variable "delegated_subnet_id" {
  type        = string
  description = "The ID of the subnet delegated to PostgreSQL Flexible Server."
  default     = null
}

variable "diagnostic_settings" {
  type = object({
    enabled                                   = bool
    log_analytics_workspace_id                = string
    diagnostic_setting_destination_storage_id = string
  })
  description = "Diagnostic settings configuration."
  default = {
    enabled                                   = false
    log_analytics_workspace_id                = null
    diagnostic_setting_destination_storage_id = null
  }
}

variable "private_dns_zone_resource_group_name" {
  type        = string
  description = "The name of the resource group containing the private DNS zone."
}
