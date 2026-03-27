output "id" {
  value       = azurerm_redis_cache.this.id
  description = "The ID of the Redis Cache."
}

output "name" {
  value       = azurerm_redis_cache.this.name
  description = "The name of the Redis Cache."
}

output "hostname" {
  value       = azurerm_redis_cache.this.hostname
  description = "The hostname of the Redis Cache."
}

output "ssl_port" {
  value       = azurerm_redis_cache.this.ssl_port
  description = "The SSL port of the Redis Cache."
}

output "primary_connection_string" {
  value       = azurerm_redis_cache.this.primary_connection_string
  description = "The primary connection string of the Redis Cache."
  sensitive   = true
}

output "primary_access_key" {
  value       = azurerm_redis_cache.this.primary_access_key
  description = "The primary access key of the Redis Cache."
  sensitive   = true
}
