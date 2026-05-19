output "id" {
  value       = module.azure_managed_redis.id
  description = "The ID of the Azure Managed Redis instance."
}

output "name" {
  value       = module.azure_managed_redis.name
  description = "The name of the Azure Managed Redis instance."
}

output "resource_group_name" {
  value       = module.azure_managed_redis.resource_group_name
  description = "The name of the resource group containing the Azure Managed Redis instance."
}

output "principal_id" {
  value       = module.azure_managed_redis.principal_id
  description = "The principal ID of the system-assigned identity of the Azure Managed Redis instance."
}

output "private_endpoint_ip_address" {
  value       = module.azure_managed_redis.private_endpoint_ip_address
  description = "The private IP address assigned to the Managed Redis private endpoint."
}

output "endpoint" {
  value       = module.azure_managed_redis.endpoint
  description = "The full endpoint (hostname:port) of the Azure Managed Redis instance."
}
