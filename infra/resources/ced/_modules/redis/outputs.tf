output "id" {
  value       = module.redis_cache.id
  description = "The ID of the Redis Cache."
}

output "name" {
  value       = module.redis_cache.name
  description = "The name of the Redis Cache."
}

output "hostname" {
  value       = module.redis_cache.hostname
  description = "The hostname of the Redis Cache."
}

output "ssl_port" {
  value       = module.redis_cache.ssl_port
  description = "The SSL port of the Redis Cache."
}

output "primary_connection_string" {
  value       = module.redis_cache.primary_connection_string
  description = "The primary connection string of the Redis Cache."
  sensitive   = true
}

output "primary_access_key" {
  value       = module.redis_cache.primary_access_key
  description = "The primary access key of the Redis Cache."
  sensitive   = true
}
