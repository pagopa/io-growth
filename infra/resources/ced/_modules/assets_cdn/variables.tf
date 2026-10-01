variable "environment" {
  type = object({
    prefix          = string
    env_short       = string
    location        = string
    domain          = string
    app_name        = string
    instance_number = string
  })
  description = "CED environment and resource naming inputs"
}

variable "resource_group_name" {
  type        = string
  description = "Resource group for the Front Door profile"
}

variable "blob_endpoint" {
  type        = string
  description = "Primary HTTPS blob endpoint of the assets storage account"
}

variable "origin_health_paths" {
  type = object({
    logos  = string
    images = string
  })
  description = "Public blob paths for each origin group's HTTPS health probe"
}

variable "dns_zone" {
  type = object({
    id                  = string
    name                = string
    resource_group_name = string
  })
  description = "Existing public Azure DNS zone for the asset domains"
}

variable "tags" {
  type        = map(string)
  description = "Resource ownership and cost tags"
}
