output "postgres" {
  value       = module.postgres_server.postgres
  description = "Details of the PostgreSQL Flexible Server (name, ID, resource group name)."
}

output "postgres_replica" {
  value       = module.postgres_server.postgres_replica
  description = "Details of the PostgreSQL Flexible Server Replica."
}

output "private_endpoint" {
  value       = module.postgres_server.private_endpoint
  description = "The resource ID of the Private Endpoint."
}

output "admin_password_secret" {
  value       = module.postgres_server.admin_password_secret
  description = "Details of the Key Vault secret storing the admin password."
}
