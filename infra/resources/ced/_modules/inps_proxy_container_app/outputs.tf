output "id" {
  description = "The ID of the Container App resource."
  value       = module.container_app.id
}

output "name" {
  description = "The name of the Container App resource."
  value       = module.container_app.name
}

output "fqdn" {
  description = "The internal FQDN of the Container App (reachable over VPN)."
  value       = module.container_app.url
}
