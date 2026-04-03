output "id" {
  value       = azurerm_managed_redis.this.id
  description = "The ID of the Managed Redis instance."
}

output "name" {
  value       = azurerm_managed_redis.this.name
  description = "The name of the Managed Redis instance."
}

output "hostname" {
  value       = azurerm_managed_redis.this.hostname
  description = "The hostname of the Managed Redis instance."
}

output "ssl_port" {
  value       = azurerm_managed_redis.this.default_database[0].port
  description = "The TLS port of the Managed Redis default database."
}

output "primary_connection_string" {
  value = var.enable_authentication ? format(
    "%s://:%s@%s:%d",
    var.client_protocol == "Plaintext" ? "redis" : "rediss",
    azurerm_managed_redis.this.default_database[0].primary_access_key,
    azurerm_managed_redis.this.hostname,
    azurerm_managed_redis.this.default_database[0].port,
  ) : null
  description = "The primary connection string of the Managed Redis default database."
  sensitive   = true
}

output "primary_access_key" {
  value       = try(azurerm_managed_redis.this.default_database[0].primary_access_key, null)
  description = "The primary access key of the Managed Redis default database."
  sensitive   = true
}
