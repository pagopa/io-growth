# redis

<!-- BEGIN_TF_DOCS -->
## Requirements

No requirements.

## Providers

No providers.

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_redis_cache"></a> [redis\_cache](#module\_redis\_cache) | github.com/pagopa/terraform-azurerm-v4//redis_cache | v5.5.0 |

## Resources

No resources.

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_capacity"></a> [capacity](#input\_capacity) | The size of the Redis Cache. | `number` | `1` | no |
| <a name="input_custom_zones"></a> [custom\_zones](#input\_custom\_zones) | (Optional/Premium Only) Specifies a list of Availability Zones in which this Redis Cache should be located. | `list(number)` | `[]` | no |
| <a name="input_enable_authentication"></a> [enable\_authentication](#input\_enable\_authentication) | If set to false, the Redis instance will be accessible without authentication. | `bool` | `true` | no |
| <a name="input_family"></a> [family](#input\_family) | The SKU family. Valid values are C (Basic/Standard) and P (Premium). | `string` | `"P"` | no |
| <a name="input_location"></a> [location](#input\_location) | The Azure region where the Redis Cache will be created. | `string` | n/a | yes |
| <a name="input_name"></a> [name](#input\_name) | The name of the Redis Cache. | `string` | n/a | yes |
| <a name="input_patch_schedules"></a> [patch\_schedules](#input\_patch\_schedules) | n/a | <pre>list(object({<br/>    day_of_week    = string<br/>    start_hour_utc = number<br/>  }))</pre> | `[]` | no |
| <a name="input_private_dns_zone_id"></a> [private\_dns\_zone\_id](#input\_private\_dns\_zone\_id) | The ID of the private DNS zone for Redis. | `string` | n/a | yes |
| <a name="input_redis_version"></a> [redis\_version](#input\_redis\_version) | The version of Redis to use: 4 (deprecated) or 6. | `string` | `"6"` | no |
| <a name="input_resource_group_name"></a> [resource\_group\_name](#input\_resource\_group\_name) | The name of the resource group. | `string` | n/a | yes |
| <a name="input_sku_name"></a> [sku\_name](#input\_sku\_name) | The SKU name. Valid values are Basic, Standard, and Premium. | `string` | `"Premium"` | no |
| <a name="input_subnet_pep_id"></a> [subnet\_pep\_id](#input\_subnet\_pep\_id) | The ID of the subnet used for private endpoints. | `string` | n/a | yes |
| <a name="input_tags"></a> [tags](#input\_tags) | A map of tags to assign to the resources. | `map(any)` | n/a | yes |
| <a name="input_virtual_network_id"></a> [virtual\_network\_id](#input\_virtual\_network\_id) | The ID of the virtual network used for the private endpoint. | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_hostname"></a> [hostname](#output\_hostname) | The hostname of the Redis Cache. |
| <a name="output_id"></a> [id](#output\_id) | The ID of the Redis Cache. |
| <a name="output_name"></a> [name](#output\_name) | The name of the Redis Cache. |
| <a name="output_primary_access_key"></a> [primary\_access\_key](#output\_primary\_access\_key) | The primary access key of the Redis Cache. |
| <a name="output_primary_connection_string"></a> [primary\_connection\_string](#output\_primary\_connection\_string) | The primary connection string of the Redis Cache. |
| <a name="output_ssl_port"></a> [ssl\_port](#output\_ssl\_port) | The SSL port of the Redis Cache. |
<!-- END_TF_DOCS -->
