output "public_zone" {
  description = "Public CED DNS zone for application and asset domains"
  value = {
    id                  = azurerm_dns_zone.public.id
    name                = azurerm_dns_zone.public.name
    resource_group_name = azurerm_dns_zone.public.resource_group_name
  }
}
