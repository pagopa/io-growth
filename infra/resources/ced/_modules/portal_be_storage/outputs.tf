output "storage_account" {
  value = {
    id                    = module.portal_be_storage.id
    name                  = module.portal_be_storage.name
    resource_group_name   = module.portal_be_storage.resource_group_name
    primary_blob_endpoint = "https://${module.portal_be_storage.name}.blob.core.windows.net/"
  }
}

output "containers" {
  value = {
    logos  = azurerm_storage_container.logos.name
    images = azurerm_storage_container.images.name
  }
}
