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

variable "container_app_environment_id" {
  type        = string
  description = "The ID of the Azure Container App Environment where the container app will be deployed."
}

variable "user_assigned_identity_id" {
  type        = string
  description = "Id of the user-assigned managed identity created along with the Container App Environment."
}

variable "container_app_templates" {
  type = list(object({
    image        = string
    name         = optional(string, "")
    app_settings = optional(map(string), {})
    liveness_probe = object({
      failure_count_threshold = optional(number, 3)
      header = optional(object({
        name  = string
        value = string
      }))
      initial_delay    = optional(number, 30)
      interval_seconds = optional(number, 10)
      path             = string
      timeout          = optional(number, 5)
      transport        = optional(string, "HTTP")
    })
    readiness_probe = optional(object({
      failure_count_threshold = optional(number, 10)
      header = optional(object({
        name  = string
        value = string
      }))
      interval_seconds = optional(number, 10)
      path             = string
      timeout          = optional(number, 5)
      transport        = optional(string, "HTTP")
    }))
    startup_probe = optional(object({
      failure_count_threshold = optional(number, 3)
      header = optional(object({
        name  = string
        value = string
      }))
      interval_seconds = optional(number, 10)
      path             = string
      timeout          = optional(number, 5)
      transport        = optional(string, "HTTP")
    }))
  }))
  description = "List of containers to be deployed in the Container App."
}

variable "target_port" {
  type        = number
  description = "The port on which the container app will listen for incoming traffic."
  default     = 80
}

variable "public_access_enabled" {
  type        = bool
  description = "If true, the container app is accessible via a public FQDN. If false (default), the app is only accessible from within the virtual network."
  default     = false
}

variable "secrets" {
  type        = list(object({
    name = string
    key_vault_secret_id = string
  }))
  description = "List of secrets to be created in the Container App and injected as environment variables in the container. The secret name will be used as environment variable name, while the value will be injected as environment variable value."
  default     = []
}
