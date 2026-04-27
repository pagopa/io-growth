# redis

<!-- BEGIN_TF_DOCS -->
## Requirements

No requirements.

## Providers

| Name | Version |
| ---- | ------- |
| <a name="provider_azurerm"></a> [azurerm](#provider\_azurerm) | n/a |

## Modules

No modules.

## Resources

| Name | Type |
| ---- | ---- |
| [azurerm_managed_redis.this](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/managed_redis) | resource |
| [azurerm_private_endpoint.this](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/private_endpoint) | resource |

## Inputs

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | :------: |
| <a name="input_client_protocol"></a> [client\_protocol](#input\_client\_protocol) | The client protocol for the default database. Valid values are Encrypted and Plaintext. | `string` | `"Encrypted"` | no |
| <a name="input_clustering_policy"></a> [clustering\_policy](#input\_clustering\_policy) | The clustering policy for the default database. Valid values are EnterpriseCluster, OSSCluster, and NoCluster. | `string` | `"NoCluster"` | no |
| <a name="input_enable_authentication"></a> [enable\_authentication](#input\_enable\_authentication) | Whether access-key authentication is enabled for the default database. | `bool` | `true` | no |
| <a name="input_high_availability_enabled"></a> [high\_availability\_enabled](#input\_high\_availability\_enabled) | Whether to enable high availability for the Managed Redis instance. | `bool` | `true` | no |
| <a name="input_location"></a> [location](#input\_location) | The Azure region where the Managed Redis instance will be created. | `string` | n/a | yes |
| <a name="input_name"></a> [name](#input\_name) | The name of the Managed Redis instance. | `string` | n/a | yes |
| <a name="input_private_dns_zone_id"></a> [private\_dns\_zone\_id](#input\_private\_dns\_zone\_id) | The ID of the private DNS zone for Redis. | `string` | n/a | yes |
| <a name="input_resource_group_name"></a> [resource\_group\_name](#input\_resource\_group\_name) | The name of the resource group. | `string` | n/a | yes |
| <a name="input_sku_name"></a> [sku\_name](#input\_sku\_name) | The Managed Redis SKU name, for example Balanced\_B10. | `string` | n/a | yes |
| <a name="input_subnet_pep_id"></a> [subnet\_pep\_id](#input\_subnet\_pep\_id) | The ID of the subnet used for private endpoints. | `string` | n/a | yes |
| <a name="input_tags"></a> [tags](#input\_tags) | A map of tags to assign to the resources. | `map(any)` | n/a | yes |

## Outputs

| Name | Description |
| ---- | ----------- |
| <a name="output_hostname"></a> [hostname](#output\_hostname) | The hostname of the Managed Redis instance. |
| <a name="output_id"></a> [id](#output\_id) | The ID of the Managed Redis instance. |
| <a name="output_name"></a> [name](#output\_name) | The name of the Managed Redis instance. |
| <a name="output_primary_access_key"></a> [primary\_access\_key](#output\_primary\_access\_key) | The primary access key of the Managed Redis default database. |
| <a name="output_primary_connection_string"></a> [primary\_connection\_string](#output\_primary\_connection\_string) | The primary connection string of the Managed Redis default database. |
| <a name="output_ssl_port"></a> [ssl\_port](#output\_ssl\_port) | The TLS port of the Managed Redis default database. |
<!-- END_TF_DOCS -->
