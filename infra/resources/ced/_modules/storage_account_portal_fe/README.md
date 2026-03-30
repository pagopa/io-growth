# storage_account_portal_fe

<!-- BEGIN_TF_DOCS -->
## Requirements

No requirements.

## Providers

No providers.

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_storage_account"></a> [storage\_account](#module\_storage\_account) | pagopa-dx/azure-storage-account/azurerm | ~> 2.0 |

## Resources

No resources.

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_access_tier"></a> [access\_tier](#input\_access\_tier) | Access tier for the storage account. Options: 'Hot', 'Cool', 'Cold', 'Premium'. | `string` | `"Hot"` | no |
| <a name="input_blob_features"></a> [blob\_features](#input\_blob\_features) | Advanced blob features. | <pre>object({<br/>    restore_policy_days   = optional(number, 0)<br/>    delete_retention_days = optional(number, 0)<br/>    last_access_time      = optional(bool, false)<br/>    versioning            = optional(bool, false)<br/>    change_feed = optional(object({<br/>      enabled           = optional(bool, false)<br/>      retention_in_days = optional(number, 0)<br/>    }), { enabled = false })<br/>    immutability_policy = optional(object({<br/>      enabled                       = optional(bool, false)<br/>      allow_protected_append_writes = optional(bool, false)<br/>      period_since_creation_in_days = optional(number, 730)<br/>      state                         = optional(string, null)<br/>    }), { enabled = false })<br/>  })</pre> | <pre>{<br/>  "change_feed": {<br/>    "enabled": false,<br/>    "retention_in_days": 0<br/>  },<br/>  "delete_retention_days": 0,<br/>  "immutability_policy": {<br/>    "enabled": false<br/>  },<br/>  "last_access_time": false,<br/>  "restore_policy_days": 0,<br/>  "versioning": false<br/>}</pre> | no |
| <a name="input_containers"></a> [containers](#input\_containers) | Containers to be created. | <pre>list(object({<br/>    name        = string<br/>    access_type = optional(string, "private")<br/>    immutability_policy = optional(object({<br/>      period_in_days = number<br/>      locked         = optional(bool, false)<br/>    }), null)<br/>  }))</pre> | `[]` | no |
| <a name="input_customer_managed_key"></a> [customer\_managed\_key](#input\_customer\_managed\_key) | Customer-managed key configuration. | <pre>object({<br/>    enabled                   = optional(bool, false)<br/>    type                      = optional(string, null)<br/>    key_name                  = optional(string, null)<br/>    user_assigned_identity_id = optional(string, null)<br/>    key_vault_id              = optional(string, null)<br/>  })</pre> | <pre>{<br/>  "enabled": false<br/>}</pre> | no |
| <a name="input_diagnostic_settings"></a> [diagnostic\_settings](#input\_diagnostic\_settings) | Diagnostic settings configuration. | <pre>object({<br/>    enabled                    = bool<br/>    log_analytics_workspace_id = optional(string, null)<br/>    storage_account_id         = optional(string, null)<br/>  })</pre> | <pre>{<br/>  "enabled": false<br/>}</pre> | no |
| <a name="input_environment"></a> [environment](#input\_environment) | Environment configuration for resource naming. | <pre>object({<br/>    prefix          = string<br/>    env_short       = string<br/>    location        = string<br/>    domain          = optional(string)<br/>    app_name        = string<br/>    instance_number = string<br/>  })</pre> | n/a | yes |
| <a name="input_force_public_network_access_enabled"></a> [force\_public\_network\_access\_enabled](#input\_force\_public\_network\_access\_enabled) | Allows public network access. | `bool` | `false` | no |
| <a name="input_network_rules"></a> [network\_rules](#input\_network\_rules) | Defines network rules for the storage account. | <pre>object({<br/>    default_action             = string<br/>    bypass                     = list(string)<br/>    ip_rules                   = list(string)<br/>    virtual_network_subnet_ids = list(string)<br/>  })</pre> | <pre>{<br/>  "bypass": [],<br/>  "default_action": "Deny",<br/>  "ip_rules": [],<br/>  "virtual_network_subnet_ids": []<br/>}</pre> | no |
| <a name="input_private_dns_zone_resource_group_name"></a> [private\_dns\_zone\_resource\_group\_name](#input\_private\_dns\_zone\_resource\_group\_name) | Resource group for the private DNS zone. | `string` | `null` | no |
| <a name="input_queues"></a> [queues](#input\_queues) | Queues to be created. | `list(string)` | `[]` | no |
| <a name="input_resource_group_name"></a> [resource\_group\_name](#input\_resource\_group\_name) | The name of the resource group where the storage account will be deployed. | `string` | n/a | yes |
| <a name="input_static_website"></a> [static\_website](#input\_static\_website) | Configures static website hosting. | <pre>object({<br/>    enabled            = optional(bool, false)<br/>    index_document     = optional(string, null)<br/>    error_404_document = optional(string, null)<br/>  })</pre> | <pre>{<br/>  "enabled": false<br/>}</pre> | no |
| <a name="input_subnet_pep_id"></a> [subnet\_pep\_id](#input\_subnet\_pep\_id) | The ID of the subnet used for private endpoints. | `string` | `null` | no |
| <a name="input_subservices_enabled"></a> [subservices\_enabled](#input\_subservices\_enabled) | Enables subservices (blob, file, queue, table). | <pre>object({<br/>    blob  = optional(bool, true)<br/>    file  = optional(bool, false)<br/>    queue = optional(bool, false)<br/>    table = optional(bool, false)<br/>  })</pre> | `{}` | no |
| <a name="input_tables"></a> [tables](#input\_tables) | Tables to be created. | `list(string)` | `[]` | no |
| <a name="input_tags"></a> [tags](#input\_tags) | A map of tags to assign to the resources. | `map(any)` | n/a | yes |
| <a name="input_use_case"></a> [use\_case](#input\_use\_case) | Storage account use case. Allowed values: 'default', 'audit', 'delegated\_access', 'development', 'archive'. | `string` | `"default"` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_id"></a> [id](#output\_id) | The ID of the Azure Storage Account. |
| <a name="output_name"></a> [name](#output\_name) | The name of the Azure Storage Account. |
| <a name="output_primary_blob_endpoint"></a> [primary\_blob\_endpoint](#output\_primary\_blob\_endpoint) | The primary blob endpoint. |
| <a name="output_primary_connection_string"></a> [primary\_connection\_string](#output\_primary\_connection\_string) | The primary connection string. |
| <a name="output_primary_web_host"></a> [primary\_web\_host](#output\_primary\_web\_host) | The primary web host URL for static website hosting. |
| <a name="output_principal_id"></a> [principal\_id](#output\_principal\_id) | The principal ID of the managed identity. |
| <a name="output_resource_group_name"></a> [resource\_group\_name](#output\_resource\_group\_name) | The resource group name. |
<!-- END_TF_DOCS -->
