output "id" {
  description = "The ID of the Container App resource."
  value       = module.container_app.id
}

output "name" {
  description = "The name of the Container App resource."
  value       = module.container_app.name
}

output "url" {
  description = "The URL of the Container App."
  value       = module.container_app.url
}

output "principal_id" {
  description = "The principal ID of the system-assigned managed identity associated with this Container App."
  value       = module.container_app.principal_id
}
