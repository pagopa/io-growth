variable "name" {
  type        = string
  description = "The name of the Redis Cache."
}

variable "location" {
  type        = string
  description = "The Azure region where the Redis Cache will be created."
}

variable "resource_group_name" {
  type        = string
  description = "The name of the resource group."
}

variable "capacity" {
  type        = number
  description = "The size of the Redis Cache."
  default     = 1
}

variable "family" {
  type        = string
  description = "The SKU family. Valid values are C (Basic/Standard) and P (Premium)."
  default     = "P"
}

variable "sku_name" {
  type        = string
  description = "The SKU name. Valid values are Basic, Standard, and Premium."
  default     = "Premium"
}

variable "redis_version" {
  type        = string
  description = "The version of Redis to use: 4 (deprecated) or 6."
  default     = "6"
}

variable "enable_authentication" {
  type        = bool
  description = "If set to false, the Redis instance will be accessible without authentication."
  default     = true
}

variable "custom_zones" {
  type        = list(number)
  description = "(Optional/Premium Only) Specifies a list of Availability Zones in which this Redis Cache should be located."
  default     = []
}

variable "patch_schedules" {
  type = list(object({
    day_of_week    = string
    start_hour_utc = number
  }))
  default = []
}

variable "subnet_pep_id" {
  type        = string
  description = "The ID of the subnet used for private endpoints."
}

variable "virtual_network_id" {
  type        = string
  description = "The ID of the virtual network used for the private endpoint."
}

variable "private_dns_zone_id" {
  type        = string
  description = "The ID of the private DNS zone for Redis."
}

variable "tags" {
  type        = map(any)
  description = "A map of tags to assign to the resources."
}
