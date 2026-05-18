# common_container_app_environment

<!-- BEGIN_TF_DOCS -->
## Requirements

No requirements.

## Providers

No providers.

## Modules

| Name | Source | Version |
| ---- | ------ | ------- |
| <a name="module_container_app_environment"></a> [container\_app\_environment](#module\_container\_app\_environment) | pagopa-dx/azure-container-app-environment/azurerm | ~> 1.2.0 |
| <a name="module_role_assignments"></a> [role\_assignments](#module\_role\_assignments) | pagopa-dx/azure-role-assignments/azurerm | ~> 2.0 |

## Resources

No resources.

## Inputs

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | :------: |
| <a name="input_azure_subscription_id"></a> [azure\_subscription\_id](#input\_azure\_subscription\_id) | The ID of the Azure subscription where the resources will be deployed. | `string` | n/a | yes |
| <a name="input_cosmos_db_account_name"></a> [cosmos\_db\_account\_name](#input\_cosmos\_db\_account\_name) | The name of the Cosmos DB account to which the container app environment will be granted access. | `string` | n/a | yes |
| <a name="input_cosmos_db_resource_group_name"></a> [cosmos\_db\_resource\_group\_name](#input\_cosmos\_db\_resource\_group\_name) | The name of the resource group where the Cosmos DB account is located. | `string` | n/a | yes |
| <a name="input_environment"></a> [environment](#input\_environment) | Values which are used to generate resource names and location short names. | <pre>object({<br/>    prefix          = string<br/>    env_short       = string<br/>    location        = string<br/>    domain          = optional(string)<br/>    app_name        = string<br/>    instance_number = string<br/>  })</pre> | n/a | yes |
| <a name="input_key_vault_name"></a> [key\_vault\_name](#input\_key\_vault\_name) | The name of the Key Vault to which the container app environment will be granted access. | `string` | n/a | yes |
| <a name="input_key_vault_resource_group_name"></a> [key\_vault\_resource\_group\_name](#input\_key\_vault\_resource\_group\_name) | The name of the resource group where the Key Vault is located. | `string` | n/a | yes |
| <a name="input_log_analytics_workspace_id"></a> [log\_analytics\_workspace\_id](#input\_log\_analytics\_workspace\_id) | The ID of the Log Analytics workspace to use for the container app environment. | `string` | n/a | yes |
| <a name="input_public_network_access_enabled"></a> [public\_network\_access\_enabled](#input\_public\_network\_access\_enabled) | If true, the Container App Environment exposes a public endpoint. If false (default), ingress is restricted to the VNet. | `bool` | `false` | no |
| <a name="input_redis_cache_id"></a> [redis\_cache\_id](#input\_redis\_cache\_id) | The ID of the Redis cache to which the container app environment will be granted access. | `string` | n/a | yes |
| <a name="input_redis_id"></a> [redis\_id](#input\_redis\_id) | The ID of the DX Redis cache to which the container app environment will be granted access. | `string` | n/a | yes |
| <a name="input_resource_group_name"></a> [resource\_group\_name](#input\_resource\_group\_name) | The name of the Azure Resource Group where the resources will be deployed. | `string` | n/a | yes |
| <a name="input_subnet_cidr"></a> [subnet\_cidr](#input\_subnet\_cidr) | The CIDR block for the subnet used for Container App Environment connectivity. | `string` | `null` | no |
| <a name="input_subnet_pep_id"></a> [subnet\_pep\_id](#input\_subnet\_pep\_id) | The ID of the subnet designated for hosting private endpoints. Required when public\_network\_access\_enabled is false. | `string` | `null` | no |
| <a name="input_tags"></a> [tags](#input\_tags) | A map of tags to assign to the resources. | `map(any)` | n/a | yes |
| <a name="input_virtual_network"></a> [virtual\_network](#input\_virtual\_network) | The virtual network where the subnet will be created. | <pre>object({<br/>    name                = string<br/>    resource_group_name = string<br/>  })</pre> | <pre>{<br/>  "name": null,<br/>  "resource_group_name": null<br/>}</pre> | no |

## Outputs

| Name | Description |
| ---- | ----------- |
| <a name="output_id"></a> [id](#output\_id) | The ID of the Container App Environment resource. |
| <a name="output_name"></a> [name](#output\_name) | The name of the Container App Environment resource. |
| <a name="output_user_assigned_identity"></a> [user\_assigned\_identity](#output\_user\_assigned\_identity) | Details about the user-assigned managed identity created to manage roles of the Container Apps of this Environment. |
<!-- END_TF_DOCS -->
