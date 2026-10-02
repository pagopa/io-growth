###
# Portal BE general-purpose blob storage
###
module "portal_be_storage" {
  source  = "pagopa-dx/azure-storage-account/azurerm"
  version = "~> 4.1"

  environment = {
    prefix          = var.prefix
    env_short       = var.env_short
    location        = var.location
    domain          = var.domain
    app_name        = var.app_name
    instance_number = var.instance_number
  }

  resource_group_name                  = var.resource_group_name
  subnet_pep_id                        = var.subnet_pep_id
  private_dns_zone_resource_group_name = var.private_dns_zone_resource_group_name

  use_case        = "default"
  action_group_id = var.action_group_id

  # Front Door Standard needs the public blob endpoint.
  force_public_network_access_enabled = true

  tags = var.tags
}

# Containers
resource "azurerm_storage_container" "logos" {
  depends_on = [module.portal_be_storage]

  name                  = "logos"
  storage_account_id    = module.portal_be_storage.id
  container_access_type = "blob"
}

resource "azurerm_storage_container" "images" {
  depends_on = [module.portal_be_storage]

  name                  = "images"
  storage_account_id    = module.portal_be_storage.id
  container_access_type = "blob"
}

resource "azurerm_storage_blob" "cdn_health" {
  for_each = {
    logos  = azurerm_storage_container.logos.id
    images = azurerm_storage_container.images.id
  }

  name                 = ".frontdoor-health"
  storage_container_id = each.value
  type                 = "Block"
  source_content       = "ok"
  content_type         = "text/plain"
  cache_control        = "no-store, max-age=0"
}
