# postgresql

<!-- BEGIN_TF_DOCS -->
## Requirements

No requirements.

## Providers

No providers.

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_postgres_server"></a> [postgres\_server](#module\_postgres\_server) | pagopa-dx/azure-postgres-server/azurerm | ~> 3.0 |

## Resources

No resources.

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_admin_password"></a> [admin\_password](#input\_admin\_password) | The administrator password for the PostgreSQL Flexible Server. | `string` | n/a | yes |
| <a name="input_admin_password_version"></a> [admin\_password\_version](#input\_admin\_password\_version) | Version counter for the administrator password. Increment on every rotation. | `number` | n/a | yes |
| <a name="input_admin_username"></a> [admin\_username](#input\_admin\_username) | The administrator username for the PostgreSQL Flexible Server. | `string` | n/a | yes |
| <a name="input_backup_retention_days"></a> [backup\_retention\_days](#input\_backup\_retention\_days) | Number of days to retain backups. Valid: 7 to 35. | `number` | `7` | no |
| <a name="input_create_replica"></a> [create\_replica](#input\_create\_replica) | Whether to create a replica PostgreSQL Flexible Server. | `bool` | `true` | no |
| <a name="input_db_version"></a> [db\_version](#input\_db\_version) | PostgreSQL version. Supported: 11, 12, 13, 14, 15, 16. | `string` | `"16"` | no |
| <a name="input_delegated_subnet_id"></a> [delegated\_subnet\_id](#input\_delegated\_subnet\_id) | The ID of the subnet delegated to PostgreSQL Flexible Server. | `string` | `null` | no |
| <a name="input_diagnostic_settings"></a> [diagnostic\_settings](#input\_diagnostic\_settings) | Diagnostic settings configuration. | <pre>object({<br/>    enabled                                   = bool<br/>    log_analytics_workspace_id                = string<br/>    diagnostic_setting_destination_storage_id = string<br/>  })</pre> | <pre>{<br/>  "diagnostic_setting_destination_storage_id": null,<br/>  "enabled": false,<br/>  "log_analytics_workspace_id": null<br/>}</pre> | no |
| <a name="input_environment"></a> [environment](#input\_environment) | Environment configuration for resource naming. | <pre>object({<br/>    prefix          = string<br/>    env_short       = string<br/>    location        = string<br/>    domain          = optional(string)<br/>    app_name        = string<br/>    instance_number = string<br/>  })</pre> | n/a | yes |
| <a name="input_high_availability_override"></a> [high\_availability\_override](#input\_high\_availability\_override) | Override if high availability should be enabled. | `bool` | `false` | no |
| <a name="input_key_vault_id"></a> [key\_vault\_id](#input\_key\_vault\_id) | Key Vault ID for storing the admin password secret. | `string` | `null` | no |
| <a name="input_pgbouncer_enabled"></a> [pgbouncer\_enabled](#input\_pgbouncer\_enabled) | Whether PgBouncer connection pooling is enabled. | `bool` | `true` | no |
| <a name="input_private_dns_zone_resource_group_name"></a> [private\_dns\_zone\_resource\_group\_name](#input\_private\_dns\_zone\_resource\_group\_name) | The name of the resource group containing the private DNS zone. | `string` | n/a | yes |
| <a name="input_replica_location"></a> [replica\_location](#input\_replica\_location) | Location for the replica server. | `string` | n/a | yes |
| <a name="input_resource_group_name"></a> [resource\_group\_name](#input\_resource\_group\_name) | The name of the resource group. | `string` | n/a | yes |
| <a name="input_storage_mb"></a> [storage\_mb](#input\_storage\_mb) | Maximum storage allowed in MB. | `number` | `32768` | no |
| <a name="input_subnet_pep_id"></a> [subnet\_pep\_id](#input\_subnet\_pep\_id) | The ID of the subnet used for private endpoints. | `string` | `null` | no |
| <a name="input_tags"></a> [tags](#input\_tags) | A map of tags to assign to the resources. | `map(any)` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_admin_password_secret"></a> [admin\_password\_secret](#output\_admin\_password\_secret) | Details of the Key Vault secret storing the admin password. |
| <a name="output_postgres"></a> [postgres](#output\_postgres) | Details of the PostgreSQL Flexible Server (name, ID, resource group name). |
| <a name="output_postgres_replica"></a> [postgres\_replica](#output\_postgres\_replica) | Details of the PostgreSQL Flexible Server Replica. |
| <a name="output_private_endpoint"></a> [private\_endpoint](#output\_private\_endpoint) | The resource ID of the Private Endpoint. |
<!-- END_TF_DOCS -->
