# cosmos_db

<!-- BEGIN_TF_DOCS -->
## Requirements

No requirements.

## Providers

| Name | Version |
| ---- | ------- |
| <a name="provider_azurerm"></a> [azurerm](#provider\_azurerm) | n/a |

## Modules

| Name | Source | Version |
| ---- | ------ | ------- |
| <a name="module_ced_cosmos_account"></a> [ced\_cosmos\_account](#module\_ced\_cosmos\_account) | pagopa-dx/azure-cosmos-account/azurerm | 0.2.0 |

## Resources

| Name | Type |
| ---- | ---- |
| [azurerm_cosmosdb_sql_container.card_requests](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/cosmosdb_sql_container) | resource |
| [azurerm_cosmosdb_sql_database.ced_cosmos_db](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/cosmosdb_sql_database) | resource |

## Inputs

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | :------: |
| <a name="input_action_group_id"></a> [action\_group\_id](#input\_action\_group\_id) | The ID of the action group to which the Cosmos DB account will be linked. | `string` | n/a | yes |
| <a name="input_environment"></a> [environment](#input\_environment) | Values which are used to generate resource names and location short names. | <pre>object({<br/>    prefix          = string<br/>    env_short       = string<br/>    location        = string<br/>    app_name        = string<br/>    instance_number = string<br/>  })</pre> | n/a | yes |
| <a name="input_resource_group"></a> [resource\_group](#input\_resource\_group) | The name of the resource group where the Cosmos DB account is located. | `string` | n/a | yes |
| <a name="input_secondary_location"></a> [secondary\_location](#input\_secondary\_location) | Secondary location for Cosmos DB account. It should be different from the primary location specified in environment.location variable. | `string` | n/a | yes |
| <a name="input_subnet_pep_id"></a> [subnet\_pep\_id](#input\_subnet\_pep\_id) | The ID of the subnet PEP to which the Cosmos DB account will be linked. | `string` | n/a | yes |
| <a name="input_tags"></a> [tags](#input\_tags) | A map of tags to assign to the resources. | `map(string)` | n/a | yes |

## Outputs

| Name | Description |
| ---- | ----------- |
| <a name="output_cosmos_db"></a> [cosmos\_db](#output\_cosmos\_db) | n/a |
<!-- END_TF_DOCS -->
