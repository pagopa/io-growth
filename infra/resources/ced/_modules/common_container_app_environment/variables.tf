variable "environment" {
  type = object({
    prefix          = string
    env_short       = string
    location        = string
    domain          = optional(string)
    app_name        = string
    instance_number = string
  })
  description = "Values which are used to generate resource names and location short names."
}

variable "resource_group_name" {
  type        = string
  description = "The name of the Azure Resource Group where the resources will be deployed."
}

variable "tags" {
  type        = map(any)
  description = "A map of tags to assign to the resources."
}

variable "log_analytics_workspace_id" {
  type        = string
  description = "The ID of the Log Analytics workspace to use for the container app environment."
}

variable "public_network_access_enabled" {
  type        = bool
  description = "If true, the Container App Environment exposes a public endpoint. If false (default), ingress is restricted to the VNet."
  default     = false
}

variable "virtual_network" {
  type = object({
    name                = string
    resource_group_name = string
  })
  description = "The virtual network where the subnet will be created."
  default = {
    name                = null
    resource_group_name = null
  }
}

variable "subnet_cidr" {
  type        = string
  description = "The CIDR block for the subnet used for Container App Environment connectivity."
  default     = null
}

variable "subnet_pep_id" {
  type        = string
  description = "The ID of the subnet designated for hosting private endpoints. Required when public_network_access_enabled is false."
  default     = null
}
