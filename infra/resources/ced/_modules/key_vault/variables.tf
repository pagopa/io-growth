variable "name" {
  type        = string
  description = "The name of the Key Vault."
}

variable "location" {
  type        = string
  description = "The Azure region where the Key Vault will be created."
}

variable "resource_group_name" {
  type        = string
  description = "The name of the resource group."
}

variable "tenant_id" {
  type        = string
  description = "The Azure Active Directory tenant ID for the Key Vault."
}

variable "sku_name" {
  type        = string
  description = "The SKU name for the Key Vault."
  default     = "standard"
}

variable "subnet_pep_id" {
  type        = string
  description = "The ID of the subnet used for private endpoints."
}

variable "private_dns_zone_id" {
  type        = string
  description = "The ID of the private DNS zone for Key Vault."
}

variable "tags" {
  type        = map(any)
  description = "A map of tags to assign to the resources."
}
