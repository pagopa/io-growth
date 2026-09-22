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

variable "dkim1_record" {
  type        = string
  description = "DKIM1 record value"
  sensitive   = true
}

variable "dkim2_record" {
  type        = string
  description = "DKIM2 record value"
  sensitive   = true
}

variable "dkim3_record" {
  type        = string
  description = "DKIM3 record value"
  sensitive   = true
}

variable "cmf_mx_1_record" {
  type        = string
  description = "Custom Mail From MX 1 record value"
  sensitive   = true
}

variable "cmf_txt_1_record" {
  type        = string
  description = "Custom Mail From TXT 1 record value"
  sensitive   = true
}

variable "cmf_mx_2_record" {
  type        = string
  description = "Custom Mail From MX 2 record value"
  sensitive   = true
}

variable "cmf_txt_2_record" {
  type        = string
  description = "Custom Mail From TXT 2 record value"
  sensitive   = true
}

variable "dmarc_record" {
  type        = string
  description = "DMARC record value"
  sensitive   = true
}
