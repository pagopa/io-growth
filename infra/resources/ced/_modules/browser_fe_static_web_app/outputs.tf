output "id" {
  value       = azurerm_static_web_app.this.id
  description = "The ID of the Azure Static Web App."
}

output "name" {
  value       = azurerm_static_web_app.this.name
  description = "The name of the Azure Static Web App."
}

output "default_hostname" {
  value       = azurerm_static_web_app.this.default_host_name
  description = "The default hostname of the Azure Static Web App."
}

output "resource_group_name" {
  value       = var.resource_group_name
  description = "The resource group name."
}
