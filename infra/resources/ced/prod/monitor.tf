resource "azurerm_monitor_action_group" "ced_error_action_group" {
  resource_group_name = module.azure_core_values.common_resource_group_name
  name                = "${local.project}-error-ag-01"
  short_name          = "cederrorag01"

  email_receiver {
    name                    = "email"
    email_address           = data.azurerm_key_vault_secret.action_group_email.value
    use_common_alert_schema = true
  }

  email_receiver {
    name                    = "slack"
    email_address           = data.azurerm_key_vault_secret.action_group_slack.value
    use_common_alert_schema = true
  }

  tags = local.tags
}
