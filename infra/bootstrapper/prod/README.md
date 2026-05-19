# prod

<!-- BEGIN_TF_DOCS -->
## Requirements

| Name | Version |
| ---- | ------- |
| <a name="requirement_azuread"></a> [azuread](#requirement\_azuread) | ~> 2.0 |
| <a name="requirement_azurerm"></a> [azurerm](#requirement\_azurerm) | ~> 4.0 |
| <a name="requirement_github"></a> [github](#requirement\_github) | ~> 6.0 |

## Providers

| Name | Version |
| ---- | ------- |
| <a name="provider_azuread"></a> [azuread](#provider\_azuread) | 2.53.1 |
| <a name="provider_azurerm.PROD-CED"></a> [azurerm.PROD-CED](#provider\_azurerm.PROD-CED) | 4.63.0 |
| <a name="provider_github"></a> [github](#provider\_github) | 6.11.1 |

## Modules

| Name | Source | Version |
| ---- | ------ | ------- |
| <a name="module_azure-PROD-CED_bootstrap"></a> [azure-PROD-CED\_bootstrap](#module\_azure-PROD-CED\_bootstrap) | pagopa-dx/azure-github-environment-bootstrap/azurerm | ~> 4.0 |
| <a name="module_azure-PROD-CED_core_values"></a> [azure-PROD-CED\_core\_values](#module\_azure-PROD-CED\_core\_values) | pagopa-dx/azure-core-values-exporter/azurerm | ~> 0.0 |

## Resources

| Name | Type |
| ---- | ---- |
| [azurerm_role_assignment.static_web_apps_list_secrets](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/role_assignment) | resource |
| [github_actions_environment_secret.ced_postgres_db](https://registry.terraform.io/providers/integrations/github/latest/docs/resources/actions_environment_secret) | resource |
| [github_actions_environment_secret.ced_postgres_host](https://registry.terraform.io/providers/integrations/github/latest/docs/resources/actions_environment_secret) | resource |
| [github_actions_environment_secret.ced_postgres_password](https://registry.terraform.io/providers/integrations/github/latest/docs/resources/actions_environment_secret) | resource |
| [github_actions_environment_secret.ced_postgres_port](https://registry.terraform.io/providers/integrations/github/latest/docs/resources/actions_environment_secret) | resource |
| [github_actions_environment_secret.ced_postgres_user](https://registry.terraform.io/providers/integrations/github/latest/docs/resources/actions_environment_secret) | resource |
| [azuread_group.admins](https://registry.terraform.io/providers/hashicorp/azuread/latest/docs/data-sources/group) | data source |
| [azuread_group.developers](https://registry.terraform.io/providers/hashicorp/azuread/latest/docs/data-sources/group) | data source |
| [azuread_group.externals](https://registry.terraform.io/providers/hashicorp/azuread/latest/docs/data-sources/group) | data source |
| [azurerm_api_management.ced_apim](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/api_management) | data source |
| [azurerm_resource_group.common](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/resource_group) | data source |
| [azurerm_resource_group.data_rg](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/resource_group) | data source |

## Inputs

No inputs.

## Outputs

No outputs.
<!-- END_TF_DOCS -->
