# cosmos_db

<!-- BEGIN_TF_DOCS -->
## Requirements

No requirements.

## Providers

| Name | Version |
|------|---------|
| <a name="provider_azurerm"></a> [azurerm](#provider\_azurerm) | n/a |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_cdc_cosmos_account"></a> [cdc\_cosmos\_account](#module\_cdc\_cosmos\_account) | pagopa-dx/azure-cosmos-account/azurerm | 0.2.0 |

## Resources

| Name | Type |
|------|------|
| [azurerm_cosmosdb_sql_container.card_requests](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/cosmosdb_sql_container) | resource |
| [azurerm_cosmosdb_sql_container.requests-audit](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/cosmosdb_sql_container) | resource |
| [azurerm_cosmosdb_sql_database.cdc_cosmos_db](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/cosmosdb_sql_database) | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_action_group_id"></a> [action\_group\_id](#input\_action\_group\_id) | n/a | `string` | n/a | yes |
| <a name="input_environment"></a> [environment](#input\_environment) | n/a | <pre>object({<br/>    prefix          = string<br/>    env_short       = string<br/>    location        = string<br/>    app_name        = string<br/>    instance_number = string<br/>  })</pre> | n/a | yes |
| <a name="input_resource_group"></a> [resource\_group](#input\_resource\_group) | n/a | `string` | n/a | yes |
| <a name="input_subnet_pep_id"></a> [subnet\_pep\_id](#input\_subnet\_pep\_id) | n/a | `string` | n/a | yes |
| <a name="input_tags"></a> [tags](#input\_tags) | n/a | `map(string)` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_cosmos_db"></a> [cosmos\_db](#output\_cosmos\_db) | n/a |
<!-- END_TF_DOCS -->
