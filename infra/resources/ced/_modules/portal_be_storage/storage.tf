###
# Portal BE general-purpose blob storage
###
module "portal_be_storage" {
  source  = "pagopa-dx/azure-storage-account/azurerm"
  version = "~> 1.0"

  environment = {
    prefix          = var.prefix
    env_short       = var.env_short
    location        = var.location
    domain          = var.domain
    app_name        = var.app_name
    instance_number = var.instance_number
  }

  resource_group_name = var.resource_group_name
  subnet_pep_id       = var.subnet_pep_id

  tier = "s"

  tags = var.tags
}

# Containers
resource "azurerm_storage_container" "logos" {
  depends_on = [module.portal_be_storage]

  name                  = "logos"
  storage_account_id    = module.portal_be_storage.id
  container_access_type = "private"
}

resource "azurerm_storage_container" "images" {
  depends_on = [module.portal_be_storage]

  name                  = "images"
  storage_account_id    = module.portal_be_storage.id
  container_access_type = "private"
}
