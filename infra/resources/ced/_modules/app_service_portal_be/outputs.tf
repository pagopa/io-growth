output "app_service" {
  value       = module.app_service.app_service
  description = "Details of the App Service, including resource group, plan, and slot information."
}

output "subnet" {
  value       = module.app_service.subnet
  description = "Details of the subnet used, including its ID and name."
}

output "diagnostic_settings" {
  value       = module.app_service.diagnostic_settings
  description = "Details of the diagnostic settings configured for the App Service."
}
