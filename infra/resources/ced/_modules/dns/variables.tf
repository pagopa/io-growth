variable "resource_group_name" {
  type        = string
  description = "Resource group name"
}

variable "tags" {
  type        = map(any)
  description = "Resources tags"
}

variable "virtual_network" {
  type = object({
    id   = string
    name = string
  })
  description = "Virtual network where to attach private dns zones"
}

variable "override_link_names" {
  type        = map(string)
  description = "Override link names"
  default     = {}
}
