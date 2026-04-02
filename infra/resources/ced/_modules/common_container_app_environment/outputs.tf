output "id" {
  description = "The ID of the Container App Environment resource."
  value       = module.container_app_environment.id
}

output "name" {
  description = "The name of the Container App Environment resource."
  value       = module.container_app_environment.name
}

output "user_assigned_identity" {
  description = "Details about the user-assigned managed identity created to manage roles of the Container Apps of this Environment."
  value       = module.container_app_environment.user_assigned_identity
}
