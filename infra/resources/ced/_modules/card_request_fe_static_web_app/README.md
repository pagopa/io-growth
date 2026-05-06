# portal_fe_static_web_app

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
| [azurerm_dns_cname_record.portal](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/dns_cname_record) | resource |
| [azurerm_static_web_app.this](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/static_web_app) | resource |
| [azurerm_static_web_app_custom_domain.portal](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/static_web_app_custom_domain) | resource |

## Inputs

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | :------: |
| <a name="input_custom_domain"></a> [custom\_domain](#input\_custom\_domain) | Custom domain hostname for the Static Web App (e.g. portal.ced.pagopa.it). Set to null to skip custom domain setup. | `string` | `null` | no |
| <a name="input_dns_zone_name"></a> [dns\_zone\_name](#input\_dns\_zone\_name) | Name of the Azure DNS zone used to create the CNAME record for the custom domain. | `string` | `null` | no |
| <a name="input_dns_zone_resource_group_name"></a> [dns\_zone\_resource\_group\_name](#input\_dns\_zone\_resource\_group\_name) | Resource group name of the DNS zone. | `string` | `null` | no |
| <a name="input_environment"></a> [environment](#input\_environment) | Environment configuration for resource naming. | <pre>object({<br/>    prefix          = string<br/>    env_short       = string<br/>    location        = string<br/>    domain          = optional(string)<br/>    app_name        = string<br/>    instance_number = string<br/>  })</pre> | n/a | yes |
| <a name="input_resource_group_name"></a> [resource\_group\_name](#input\_resource\_group\_name) | The name of the resource group where the Static Web App will be deployed. | `string` | n/a | yes |
| <a name="input_tags"></a> [tags](#input\_tags) | A map of tags to assign to the resources. | `map(any)` | n/a | yes |

## Outputs

| Name | Description |
| ---- | ----------- |
| <a name="output_default_hostname"></a> [default\_hostname](#output\_default\_hostname) | The default hostname of the Azure Static Web App. |
| <a name="output_id"></a> [id](#output\_id) | The ID of the Azure Static Web App. |
| <a name="output_name"></a> [name](#output\_name) | The name of the Azure Static Web App. |
| <a name="output_resource_group_name"></a> [resource\_group\_name](#output\_resource\_group\_name) | The resource group name. |
<!-- END_TF_DOCS -->
