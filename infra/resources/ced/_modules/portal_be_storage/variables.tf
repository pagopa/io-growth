variable "prefix" {
  type        = string
  description = "IO Prefix"
}

variable "env_short" {
  type        = string
  description = "Short environment"
}

variable "location" {
  type        = string
  description = "Azure region"
}

variable "domain" {
  type        = string
  description = "Domain"
}

variable "app_name" {
  type        = string
  description = "App name"
}

variable "instance_number" {
  type        = string
  description = "The istance number to create"
}

variable "resource_group_name" {
  type        = string
  description = "Name of the resource group where resources will be created"
}

variable "subnet_pep_id" {
  type        = string
  description = "ID of the subnet for private endpoints"
}

variable "private_dns_zone_resource_group_name" {
  type        = string
  description = "Name of the resource group containing the storage private DNS zone"
}

variable "action_group_id" {
  type        = string
  description = "ID of the action group receiving storage availability alerts"
}

variable "tags" {
  type        = map(any)
  description = "Resource tags"
}
