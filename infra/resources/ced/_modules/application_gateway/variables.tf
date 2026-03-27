variable "prefix" {
  type        = string
  description = "IO Prefix"
}

variable "env_short" {
  type        = string
  description = "Short environment"
}

variable "project" {
  type        = string
  description = "IO prefix, short environment and short location"
}

variable "location" {
  type        = string
  description = "Azure region"
}

variable "domain" {
  type        = string
  description = "Domain"
}

variable "tags" {
  type        = map(any)
  description = "A map of tags to assign to the resources."
}

variable "azure_subscription_id" {
  type        = string
  description = "Subscription id"
  sensitive   = true
}

variable "resource_group_name" {
  type        = string
  description = "Name of the resource group where resources will be created"
}

variable "sku" {
  type = object({
    name = string
    tier = string
  })
  description = "SKU settings for the Application Gateway"
}

variable "virtual_network" {
  type = object({
    name                = string
    resource_group_name = string
  })
  description = "Virtual network to create the AGW subnet in"
}

variable "subnet_cidr" {
  type        = string
  description = "CIDR block for the Application Gateway subnet"
}

variable "key_vault_name" {
  type        = string
  description = "Key Vault name"
}

variable "apim_hostname" {
  type        = string
  description = "APIM hostname"
}

variable "api_hostname" {
  type        = string
  description = "Hostname exposed on the Application Gateway listener"
}

variable "app_gw_cert_name" {
  type        = string
  description = "Application Gateway certificate name in Key Vault"
}

variable "app_gateway_min_capacity" {
  type        = number
  description = "Minimum capacity for Application Gateway"
  default     = 1
}

variable "app_gateway_max_capacity" {
  type        = number
  description = "Maximum capacity for Application Gateway"
  default     = 1
}

variable "app_gateway_alerts_enabled" {
  type        = bool
  description = "Enable Application Gateway alerts"
  default     = false
}

variable "azurerm_monitor_action_group_id" {
  type        = string
  description = "Monitor Action Group ID for alerts"
  default     = null
}

variable "alert_sensitivity" {
  type        = string
  description = "Alert sensitivity level"
  default     = "Medium"
}
