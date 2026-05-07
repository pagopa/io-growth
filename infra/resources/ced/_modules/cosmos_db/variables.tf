variable "tags" {
  type        = map(string)
  description = "A map of tags to assign to the resources."
}

variable "resource_group" {
  type        = string
  description = "The name of the resource group where the Cosmos DB account is located."
}

variable "action_group_id" {
  type        = string
  description = "The ID of the action group to which the Cosmos DB account will be linked."
}

variable "subnet_pep_id" {
  type        = string
  description = "The ID of the subnet PEP to which the Cosmos DB account will be linked."
}

variable "environment" {
  type = object({
    prefix          = string
    env_short       = string
    location        = string
    app_name        = string
    instance_number = string
  })
  description = "Values which are used to generate resource names and location short names."
}

variable "secondary_location" {
  type        = string
  description = "Secondary location for Cosmos DB account. It should be different from the primary location specified in environment.location variable."
}
