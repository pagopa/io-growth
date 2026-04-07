module "api_management" {
  source  = "pagopa-dx/azure-api-management/azurerm"
  version = "~> 2.0"

  environment         = var.environment
  resource_group_name = var.resource_group_name
  tags                = var.tags

  use_case        = var.use_case
  publisher_name  = var.publisher_name
  publisher_email = var.publisher_email

  virtual_network = var.virtual_network
  subnet_id       = azurerm_subnet.apim_subnet.id
  subnet_pep_id   = var.subnet_pep_id

  key_vault_id                  = var.key_vault_id
  enable_public_network_access  = var.enable_public_network_access
  virtual_network_type_internal = var.virtual_network_type_internal

  application_insights      = var.application_insights
  monitoring                = var.monitoring
  hostname_configuration    = var.hostname_configuration
  certificate_names         = var.certificate_names
  notification_sender_email = var.notification_sender_email
  xml_content               = var.xml_content
}
