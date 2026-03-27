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

variable "maxmemory_policy" {
  type        = string
  description = "The eviction policy for the Redis Cache."
  default     = "volatile-lru"
}

variable "subnet_pep_id" {
  type        = string
  description = "The ID of the subnet used for private endpoints."
}

variable "private_dns_zone_id" {
  type        = string
  description = "The ID of the private DNS zone for Redis."
}

variable "tags" {
  type        = map(any)
  description = "A map of tags to assign to the resources."
}
