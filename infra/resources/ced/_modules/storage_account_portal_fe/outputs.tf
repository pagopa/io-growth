output "id" {
  value       = module.storage_account.id
  description = "The ID of the Azure Storage Account."
}

output "name" {
  value       = module.storage_account.name
  description = "The name of the Azure Storage Account."
}

output "primary_blob_endpoint" {
  value       = module.storage_account.primary_blob_endpoint
  description = "The primary blob endpoint."
}

output "primary_web_host" {
  value       = module.storage_account.primary_web_host
  description = "The primary web host URL for static website hosting."
}

output "primary_connection_string" {
  value       = module.storage_account.primary_connection_string
  description = "The primary connection string."
  sensitive   = true
}

output "principal_id" {
  value       = module.storage_account.principal_id
  description = "The principal ID of the managed identity."
}

output "resource_group_name" {
  value       = module.storage_account.resource_group_name
  description = "The resource group name."
}
