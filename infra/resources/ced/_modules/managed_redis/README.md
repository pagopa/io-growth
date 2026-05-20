# managed_redis

Thin wrapper around [`pagopa-dx/azure-managed-redis/azurerm`](https://registry.terraform.io/modules/pagopa-dx/azure-managed-redis/azurerm/latest) that follows the DX-module-wrapper convention used across `_modules/`.

<!-- BEGIN_TF_DOCS -->
## Requirements

No requirements.

## Providers

No providers.

## Modules

| Name | Source | Version |
| ---- | ------ | ------- |
| <a name="module_azure_managed_redis"></a> [azure\_managed\_redis](#module\_azure\_managed\_redis) | pagopa-dx/azure-managed-redis/azurerm | ~> 0.1 |

## Resources

No resources.

## Inputs

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | :------: |
| <a name="input_alerts"></a> [alerts](#input\_alerts) | Metric alert configuration. Alerts are enabled by default for the 'default' use case with sensible thresholds. | <pre>object({<br/>    action_group_id = optional(string, null)<br/>    thresholds = optional(object({<br/>      used_memory_percentage          = optional(number, 75)<br/>      used_memory_percentage_critical = optional(number, 90)<br/>      server_load                     = optional(number, 80)<br/>      server_load_critical            = optional(number, 90)<br/>      evicted_keys                    = optional(number, 0)<br/>      connected_clients               = optional(number, null)<br/>    }), {})<br/>  })</pre> | `{}` | no |
| <a name="input_environment"></a> [environment](#input\_environment) | Values used to generate resource names and derive short location names. | <pre>object({<br/>    prefix          = string<br/>    env_short       = string<br/>    location        = string<br/>    domain          = optional(string)<br/>    app_name        = string<br/>    instance_number = string<br/>  })</pre> | n/a | yes |
| <a name="input_log_analytics_workspace_id"></a> [log\_analytics\_workspace\_id](#input\_log\_analytics\_workspace\_id) | The ID of the Log Analytics workspace to send diagnostics to. Required when use\_case is 'default'. | `string` | n/a | yes |
| <a name="input_private_dns_zone_resource_group_name"></a> [private\_dns\_zone\_resource\_group\_name](#input\_private\_dns\_zone\_resource\_group\_name) | The resource group name containing the 'privatelink.redis.azure.net' private DNS zone. Defaults to the virtual network resource group. | `string` | `null` | no |
| <a name="input_resource_group_name"></a> [resource\_group\_name](#input\_resource\_group\_name) | The name of the resource group where resources will be deployed. | `string` | n/a | yes |
| <a name="input_sku_name_override"></a> [sku\_name\_override](#input\_sku\_name\_override) | Optional explicit SKU name override. Only Balanced\_* SKUs (B0-B250) are supported. | `string` | `null` | no |
| <a name="input_tags"></a> [tags](#input\_tags) | A map of tags to assign to the resources. | `map(any)` | n/a | yes |
| <a name="input_use_case"></a> [use\_case](#input\_use\_case) | DX preset for Azure Managed Redis. Allowed values are 'default' and 'development'. | `string` | `"default"` | no |
| <a name="input_virtual_network_id"></a> [virtual\_network\_id](#input\_virtual\_network\_id) | The resource ID of the virtual network hosting the private endpoint. Required when use\_case is 'default'. | `string` | n/a | yes |

## Outputs

| Name | Description |
| ---- | ----------- |
| <a name="output_endpoint"></a> [endpoint](#output\_endpoint) | The full endpoint (hostname:port) of the Azure Managed Redis instance. |
| <a name="output_id"></a> [id](#output\_id) | The ID of the Azure Managed Redis instance. |
| <a name="output_name"></a> [name](#output\_name) | The name of the Azure Managed Redis instance. |
| <a name="output_principal_id"></a> [principal\_id](#output\_principal\_id) | The principal ID of the system-assigned identity of the Azure Managed Redis instance. |
| <a name="output_private_endpoint_ip_address"></a> [private\_endpoint\_ip\_address](#output\_private\_endpoint\_ip\_address) | The private IP address assigned to the Managed Redis private endpoint. |
| <a name="output_resource_group_name"></a> [resource\_group\_name](#output\_resource\_group\_name) | The name of the resource group containing the Azure Managed Redis instance. |
<!-- END_TF_DOCS -->
