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
| <a name="provider_azurerm"></a> [azurerm](#provider\_azurerm) | 4.67.0 |
| <a name="provider_dx"></a> [dx](#provider\_dx) | ~> 0.0 |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_application_gateway"></a> [application\_gateway](#module\_application\_gateway) | ../_modules/application_gateway | n/a |
| <a name="module_azure_core_values"></a> [azure\_core\_values](#module\_azure\_core\_values) | pagopa-dx/azure-core-values-exporter/azurerm | ~> 0.0 |
| <a name="module_ced_apim"></a> [ced\_apim](#module\_ced\_apim) | ../_modules/api_management | n/a |
| <a name="module_common_container_app_environment"></a> [common\_container\_app\_environment](#module\_common\_container\_app\_environment) | ../_modules/common_container_app_environment | n/a |
| <a name="module_dns"></a> [dns](#module\_dns) | ../_modules/dns | n/a |
| <a name="module_portal_be_container_app"></a> [portal\_be\_container\_app](#module\_portal\_be\_container\_app) | ../_modules/portal_be_container_app | n/a |
| <a name="module_portal_fe_static_web_app"></a> [portal\_fe\_static\_web\_app](#module\_portal\_fe\_static\_web\_app) | ../_modules/portal_fe_static_web_app | n/a |
| <a name="module_postgresql"></a> [postgresql](#module\_postgresql) | ../_modules/postgresql | n/a |
| <a name="module_redis"></a> [redis](#module\_redis) | ../_modules/redis | n/a |

## Resources

| Name | Type |
|------|------|
| [azurerm_dns_a_record.api](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/dns_a_record) | resource |
| [azurerm_monitor_action_group.ced_error_action_group](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/monitor_action_group) | resource |
| [azurerm_resource_group.data_rg](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/resource_group) | resource |
| [dx_available_subnet_cidr.cidr_23_apim](https://registry.terraform.io/providers/pagopa-dx/azure/latest/docs/resources/available_subnet_cidr) | resource |
| [dx_available_subnet_cidr.cidr_23_cae](https://registry.terraform.io/providers/pagopa-dx/azure/latest/docs/resources/available_subnet_cidr) | resource |
| [dx_available_subnet_cidr.cidr_24_agw](https://registry.terraform.io/providers/pagopa-dx/azure/latest/docs/resources/available_subnet_cidr) | resource |
| [azurerm_client_config.current](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/client_config) | data source |
| [azurerm_dns_zone.ced](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/dns_zone) | data source |
| [azurerm_key_vault.common](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/key_vault) | data source |
| [azurerm_key_vault_secret.action_group_email](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/key_vault_secret) | data source |
| [azurerm_key_vault_secret.action_group_slack](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/key_vault_secret) | data source |
| [azurerm_private_dns_zone.managed_redis](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/private_dns_zone) | data source |
| [azurerm_resource_group.resource_rg](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/resource_group) | data source |
| [azurerm_subscription.current](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/subscription) | data source |

## Inputs

No inputs.

## Outputs

No outputs.
<!-- END_TF_DOCS -->
