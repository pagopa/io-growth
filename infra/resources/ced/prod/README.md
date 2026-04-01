# prod

<!-- BEGIN_TF_DOCS -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_azurerm"></a> [azurerm](#requirement\_azurerm) | ~> 4.0 |
| <a name="requirement_dx"></a> [dx](#requirement\_dx) | ~> 0.0 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_azurerm"></a> [azurerm](#provider\_azurerm) | 4.66.0 |
| <a name="provider_dx"></a> [dx](#provider\_dx) | ~> 0.0 |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_app_service_portal_be"></a> [app\_service\_portal\_be](#module\_app\_service\_portal\_be) | ../_modules/app_service_portal_be | n/a |
| <a name="module_application_gateway"></a> [application\_gateway](#module\_application\_gateway) | ../_modules/application_gateway | n/a |
| <a name="module_azure_core_values"></a> [azure\_core\_values](#module\_azure\_core\_values) | pagopa-dx/azure-core-values-exporter/azurerm | ~> 0.0 |
| <a name="module_ced_apim"></a> [ced\_apim](#module\_ced\_apim) | ../_modules/api_management | n/a |
| <a name="module_dns"></a> [dns](#module\_dns) | ../_modules/dns | n/a |
| <a name="module_postgresql"></a> [postgresql](#module\_postgresql) | ../_modules/postgresql | n/a |
| <a name="module_redis"></a> [redis](#module\_redis) | ../_modules/redis | n/a |
| <a name="module_storage_account_portal_fe"></a> [storage\_account\_portal\_fe](#module\_storage\_account\_portal\_fe) | ../_modules/storage_account_portal_fe | n/a |

## Resources

| Name | Type |
|------|------|
| [azurerm_monitor_action_group.ced_error_action_group](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/monitor_action_group) | resource |
| [dx_available_subnet_cidr.cidr_24](https://registry.terraform.io/providers/pagopa-dx/azure/latest/docs/resources/available_subnet_cidr) | resource |
| [dx_available_subnet_cidr.cidr_26](https://registry.terraform.io/providers/pagopa-dx/azure/latest/docs/resources/available_subnet_cidr) | resource |
| [azurerm_client_config.current](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/client_config) | data source |
| [azurerm_subscription.current](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/subscription) | data source |

## Inputs

No inputs.

## Outputs

No outputs.
<!-- END_TF_DOCS -->
