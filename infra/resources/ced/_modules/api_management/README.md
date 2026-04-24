# api_management

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
| <a name="module_api_management"></a> [api\_management](#module\_api\_management) | pagopa-dx/azure-api-management/azurerm | ~> 2.0 |

## Resources

| Name | Type |
| ---- | ---- |
| [azurerm_subnet.apim_subnet](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/subnet) | resource |

## Inputs

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | :------: |
| <a name="input_application_insights"></a> [application\_insights](#input\_application\_insights) | Application Insights integration. | <pre>object({<br/>    enabled             = bool<br/>    connection_string   = string<br/>    id                  = optional(string, null)<br/>    sampling_percentage = number<br/>    verbosity           = string<br/>  })</pre> | <pre>{<br/>  "connection_string": null,<br/>  "enabled": false,<br/>  "id": null,<br/>  "sampling_percentage": 0,<br/>  "verbosity": "error"<br/>}</pre> | no |
| <a name="input_certificate_names"></a> [certificate\_names](#input\_certificate\_names) | A list of Key Vault certificate names. | `list(string)` | `[]` | no |
| <a name="input_enable_public_network_access"></a> [enable\_public\_network\_access](#input\_enable\_public\_network\_access) | Specifies whether public network access is enabled. | `bool` | `true` | no |
| <a name="input_environment"></a> [environment](#input\_environment) | Environment configuration for resource naming. | <pre>object({<br/>    prefix          = string<br/>    env_short       = string<br/>    location        = string<br/>    location_short  = string<br/>    domain          = optional(string)<br/>    app_name        = string<br/>    instance_number = string<br/>  })</pre> | n/a | yes |
| <a name="input_hostname_configuration"></a> [hostname\_configuration](#input\_hostname\_configuration) | Custom domain configurations. | <pre>object({<br/>    proxy = optional(list(object({<br/>      host_name           = string<br/>      key_vault_id        = string<br/>      default_ssl_binding = optional(bool, false)<br/>    })), [])<br/>    management = optional(list(object({<br/>      host_name    = string<br/>      key_vault_id = string<br/>    })), [])<br/>    portal = optional(list(object({<br/>      host_name    = string<br/>      key_vault_id = string<br/>    })), [])<br/>    developer_portal = optional(list(object({<br/>      host_name    = string<br/>      key_vault_id = string<br/>    })), [])<br/>    scm = optional(list(object({<br/>      host_name    = string<br/>      key_vault_id = string<br/>    })), [])<br/>  })</pre> | `{}` | no |
| <a name="input_key_vault_id"></a> [key\_vault\_id](#input\_key\_vault\_id) | The ID of the Key Vault. | `string` | `null` | no |
| <a name="input_monitoring"></a> [monitoring](#input\_monitoring) | Monitoring configuration. | <pre>object({<br/>    enabled                    = bool<br/>    log_analytics_workspace_id = string<br/>    logs = optional(object({<br/>      enabled    = bool<br/>      groups     = optional(list(string), [])<br/>      categories = optional(list(string), [])<br/>    }), { enabled = false, groups = [], categories = [] })<br/>    metrics = optional(object({<br/>      enabled = bool<br/>    }), { enabled = false })<br/>  })</pre> | <pre>{<br/>  "enabled": false,<br/>  "log_analytics_workspace_id": null<br/>}</pre> | no |
| <a name="input_notification_sender_email"></a> [notification\_sender\_email](#input\_notification\_sender\_email) | The email address from which notifications will be sent. | `string` | `null` | no |
| <a name="input_publisher_email"></a> [publisher\_email](#input\_publisher\_email) | The email address of the publisher or company. | `string` | n/a | yes |
| <a name="input_publisher_name"></a> [publisher\_name](#input\_publisher\_name) | The name of the publisher or company. | `string` | n/a | yes |
| <a name="input_resource_group_name"></a> [resource\_group\_name](#input\_resource\_group\_name) | The name of the resource group where the resources will be deployed. | `string` | n/a | yes |
| <a name="input_subnet_cidr"></a> [subnet\_cidr](#input\_subnet\_cidr) | CIDR block for the APIM subnet. | `string` | n/a | yes |
| <a name="input_subnet_pep_id"></a> [subnet\_pep\_id](#input\_subnet\_pep\_id) | ID of the subnet hosting private endpoints. | `string` | `null` | no |
| <a name="input_tags"></a> [tags](#input\_tags) | A map of tags to assign to the resources. | `map(any)` | n/a | yes |
| <a name="input_use_case"></a> [use\_case](#input\_use\_case) | Specifies the use case. Allowed values: 'cost\_optimized', 'high\_load', 'development'. | `string` | `"cost_optimized"` | no |
| <a name="input_virtual_network"></a> [virtual\_network](#input\_virtual\_network) | Virtual network in which to create the subnet. | <pre>object({<br/>    name                = string<br/>    resource_group_name = string<br/>  })</pre> | n/a | yes |
| <a name="input_virtual_network_type_internal"></a> [virtual\_network\_type\_internal](#input\_virtual\_network\_type\_internal) | Specifies if VNet type is Internal (requires subnet\_id). | `bool` | `null` | no |
| <a name="input_xml_content"></a> [xml\_content](#input\_xml\_content) | XML content for all API policies. | `string` | `null` | no |

## Outputs

| Name | Description |
| ---- | ----------- |
| <a name="output_gateway_hostname"></a> [gateway\_hostname](#output\_gateway\_hostname) | The hostname of the API Management gateway. |
| <a name="output_gateway_url"></a> [gateway\_url](#output\_gateway\_url) | The URL of the API Management gateway. |
| <a name="output_id"></a> [id](#output\_id) | The resource ID of the API Management instance. |
| <a name="output_logger_id"></a> [logger\_id](#output\_logger\_id) | The ID of the Application Insights logger. |
| <a name="output_name"></a> [name](#output\_name) | The name of the API Management instance. |
| <a name="output_principal_id"></a> [principal\_id](#output\_principal\_id) | The principal ID of the API Management instance. |
| <a name="output_private_ip_addresses"></a> [private\_ip\_addresses](#output\_private\_ip\_addresses) | The private IP addresses of the API Management instance. |
| <a name="output_public_ip_addresses"></a> [public\_ip\_addresses](#output\_public\_ip\_addresses) | The public IP addresses of the API Management instance. |
| <a name="output_resource_group_name"></a> [resource\_group\_name](#output\_resource\_group\_name) | The resource group name. |
<!-- END_TF_DOCS -->
