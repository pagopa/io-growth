variable "name" {
  type        = string
  description = "The name of the Managed Redis instance."
}

variable "location" {
  type        = string
  description = "The Azure region where the Managed Redis instance will be created."
}

variable "resource_group_name" {
  type        = string
  description = "The name of the resource group."
}

variable "sku_name" {
  type        = string
  description = "The Managed Redis SKU name, for example Balanced_B10."
}

variable "high_availability_enabled" {
  type        = bool
  description = "Whether to enable high availability for the Managed Redis instance."
  default     = true
}

variable "enable_authentication" {
  type        = bool
  description = "Whether access-key authentication is enabled for the default database."
  default     = true
}

variable "client_protocol" {
  type        = string
  description = "The client protocol for the default database. Valid values are Encrypted and Plaintext."
  default     = "Encrypted"

  validation {
    condition     = contains(["Encrypted", "Plaintext"], var.client_protocol)
    error_message = "client_protocol must be either Encrypted or Plaintext."
  }
}

variable "clustering_policy" {
  type        = string
  description = "The clustering policy for the default database. Valid values are EnterpriseCluster, OSSCluster, and NoCluster."
  default     = "NoCluster"

  validation {
    condition     = contains(["EnterpriseCluster", "OSSCluster", "NoCluster"], var.clustering_policy)
    error_message = "clustering_policy must be one of EnterpriseCluster, OSSCluster, or NoCluster."
  }
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
