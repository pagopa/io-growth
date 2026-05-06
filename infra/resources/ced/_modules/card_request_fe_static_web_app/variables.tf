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
  description = "The name of the resource group where the Static Web App will be deployed."
}

variable "tags" {
  type        = map(any)
  description = "A map of tags to assign to the resources."
}

variable "custom_domain" {
  type        = string
  description = "Custom domain hostname for the Static Web App (e.g. portal.ced.pagopa.it). Set to null to skip custom domain setup."
  default     = null
}

variable "dns_zone_name" {
  type        = string
  description = "Name of the Azure DNS zone used to create the CNAME record for the custom domain."
  default     = null
}

variable "dns_zone_resource_group_name" {
  type        = string
  description = "Resource group name of the DNS zone."
  default     = null
}
