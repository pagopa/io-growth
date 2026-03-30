# cdn

<!-- BEGIN_TF_DOCS -->
## Requirements

No requirements.

## Providers

No providers.

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_cdn"></a> [cdn](#module\_cdn) | pagopa-dx/azure-cdn/azurerm | ~> 0.6 |

## Resources

No resources.

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_custom_domains"></a> [custom\_domains](#input\_custom\_domains) | List of custom domain configurations. | <pre>list(object({<br/>    host_name = string<br/>    dns = optional(object({<br/>      zone_name                = string<br/>      zone_resource_group_name = string<br/>    }), { zone_name = null, zone_resource_group_name = null })<br/>    custom_certificate = optional(object({<br/>      key_vault_certificate_versionless_id = string<br/>      key_vault_name                       = string<br/>      key_vault_resource_group_name        = string<br/>      key_vault_has_rbac_support           = optional(bool, true)<br/>    }), null)<br/>  }))</pre> | `[]` | no |
| <a name="input_diagnostic_settings"></a> [diagnostic\_settings](#input\_diagnostic\_settings) | Diagnostic settings configuration. | <pre>object({<br/>    enabled                                   = bool<br/>    log_analytics_workspace_id                = optional(string)<br/>    diagnostic_setting_destination_storage_id = optional(string)<br/>  })</pre> | <pre>{<br/>  "enabled": false<br/>}</pre> | no |
| <a name="input_environment"></a> [environment](#input\_environment) | Environment configuration for resource naming. | <pre>object({<br/>    prefix          = string<br/>    env_short       = string<br/>    location        = string<br/>    domain          = optional(string)<br/>    app_name        = string<br/>    instance_number = string<br/>  })</pre> | n/a | yes |
| <a name="input_existing_cdn_frontdoor_profile_id"></a> [existing\_cdn\_frontdoor\_profile\_id](#input\_existing\_cdn\_frontdoor\_profile\_id) | Existing CDN FrontDoor Profile ID. If provided, the module will not create a new profile. | `string` | `null` | no |
| <a name="input_origin_health_probe"></a> [origin\_health\_probe](#input\_origin\_health\_probe) | Health probe configuration of the CDN origin group. | <pre>object({<br/>    path         = optional(string, "/")<br/>    request_type = optional(string, "HEAD")<br/>  })</pre> | `{}` | no |
| <a name="input_origins"></a> [origins](#input\_origins) | Map of origin configurations. Key is the origin identifier. | <pre>map(object({<br/>    host_name            = string<br/>    priority             = optional(number, 1)<br/>    storage_account_id   = optional(string, null)<br/>    use_managed_identity = optional(bool, false)<br/>  }))</pre> | n/a | yes |
| <a name="input_resource_group_name"></a> [resource\_group\_name](#input\_resource\_group\_name) | Resource group name where the CDN profile will be created. | `string` | n/a | yes |
| <a name="input_tags"></a> [tags](#input\_tags) | A map of tags to assign to the resources. | `map(any)` | n/a | yes |
| <a name="input_waf_enabled"></a> [waf\_enabled](#input\_waf\_enabled) | Whether to enable the WAF policy. | `bool` | `false` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_endpoint_hostname"></a> [endpoint\_hostname](#output\_endpoint\_hostname) | The hostname of the CDN FrontDoor Endpoint. |
| <a name="output_endpoint_id"></a> [endpoint\_id](#output\_endpoint\_id) | The ID of the CDN FrontDoor Endpoint. |
| <a name="output_id"></a> [id](#output\_id) | The ID of the CDN FrontDoor Profile. |
| <a name="output_name"></a> [name](#output\_name) | The name of the CDN FrontDoor Profile. |
| <a name="output_origin_group_id"></a> [origin\_group\_id](#output\_origin\_group\_id) | The ID of the CDN FrontDoor Origin Group. |
| <a name="output_principal_id"></a> [principal\_id](#output\_principal\_id) | The principal ID of the Front Door Profile's system-assigned managed identity. |
| <a name="output_resource_group_name"></a> [resource\_group\_name](#output\_resource\_group\_name) | The resource group name. |
| <a name="output_rule_set_id"></a> [rule\_set\_id](#output\_rule\_set\_id) | The ID of the CDN FrontDoor Rule Set. |
<!-- END_TF_DOCS -->
