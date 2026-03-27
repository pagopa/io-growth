output "id" {
  value       = module.cdn.id
  description = "The ID of the CDN FrontDoor Profile."
}

output "name" {
  value       = module.cdn.name
  description = "The name of the CDN FrontDoor Profile."
}

output "endpoint_hostname" {
  value       = module.cdn.endpoint_hostname
  description = "The hostname of the CDN FrontDoor Endpoint."
}

output "endpoint_id" {
  value       = module.cdn.endpoint_id
  description = "The ID of the CDN FrontDoor Endpoint."
}

output "origin_group_id" {
  value       = module.cdn.origin_group_id
  description = "The ID of the CDN FrontDoor Origin Group."
}

output "rule_set_id" {
  value       = module.cdn.rule_set_id
  description = "The ID of the CDN FrontDoor Rule Set."
}

output "principal_id" {
  value       = module.cdn.principal_id
  description = "The principal ID of the Front Door Profile's system-assigned managed identity."
}

output "resource_group_name" {
  value       = module.cdn.resource_group_name
  description = "The resource group name."
}
