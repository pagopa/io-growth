output "id" {
  value       = module.api_management.id
  description = "The resource ID of the API Management instance."
}

output "name" {
  value       = module.api_management.name
  description = "The name of the API Management instance."
}

output "gateway_url" {
  value       = module.api_management.gateway_url
  description = "The URL of the API Management gateway."
}

output "gateway_hostname" {
  value       = module.api_management.gateway_hostname
  description = "The hostname of the API Management gateway."
}

output "principal_id" {
  value       = module.api_management.principal_id
  description = "The principal ID of the API Management instance."
}

output "private_ip_addresses" {
  value       = module.api_management.private_ip_addresses
  description = "The private IP addresses of the API Management instance."
}

output "public_ip_addresses" {
  value       = module.api_management.public_ip_addresses
  description = "The public IP addresses of the API Management instance."
}

output "resource_group_name" {
  value       = module.api_management.resource_group_name
  description = "The resource group name."
}

output "logger_id" {
  value       = module.api_management.logger_id
  description = "The ID of the Application Insights logger."
}
