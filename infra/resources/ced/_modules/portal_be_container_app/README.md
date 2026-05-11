# portal_be_container_app

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
| <a name="module_container_app"></a> [container\_app](#module\_container\_app) | pagopa-dx/azure-container-app/azurerm | ~> 4.2.0 |

## Resources

| Name | Type |
| ---- | ---- |
| [azurerm_api_management_api.ced_portal_be_v1](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/api_management_api) | resource |
| [azurerm_api_management_api_policy.ced_portal_be_v1](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/api_management_api_policy) | resource |
| [azurerm_api_management_api_version_set.ced_portal_be](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/api_management_api_version_set) | resource |
| [azurerm_api_management_backend.ced_portal_be](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/api_management_backend) | resource |
| [azurerm_api_management_named_value.ced_portal_be_ca_url](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/api_management_named_value) | resource |
| [azurerm_api_management_product.ced_portal_be](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/api_management_product) | resource |
| [azurerm_api_management_product_api.ced_portal_be_v1](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/api_management_product_api) | resource |
| [azurerm_api_management_product_policy.ced_portal_be](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/api_management_product_policy) | resource |
| [azurerm_role_assignment.apim_container_app_reader](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/role_assignment) | resource |

## Inputs

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | :------: |
| <a name="input_apim_platform"></a> [apim\_platform](#input\_apim\_platform) | The API Management instance to associate with the Container App. The principal\_id is used to grant the APIM managed identity access to the Container App. | <pre>object({<br/>    name                = string<br/>    resource_group_name = string<br/>    principal_id        = string<br/>  })</pre> | n/a | yes |
| <a name="input_container_app_environment_id"></a> [container\_app\_environment\_id](#input\_container\_app\_environment\_id) | The ID of the Azure Container App Environment where the container app will be deployed. | `string` | n/a | yes |
| <a name="input_container_app_templates"></a> [container\_app\_templates](#input\_container\_app\_templates) | List of containers to be deployed in the Container App. | <pre>list(object({<br/>    image        = string<br/>    name         = optional(string, "")<br/>    app_settings = optional(map(string), {})<br/>    liveness_probe = object({<br/>      failure_count_threshold = optional(number, 3)<br/>      header = optional(object({<br/>        name  = string<br/>        value = string<br/>      }))<br/>      initial_delay    = optional(number, 30)<br/>      interval_seconds = optional(number, 10)<br/>      path             = string<br/>      timeout          = optional(number, 5)<br/>      transport        = optional(string, "HTTP")<br/>    })<br/>    readiness_probe = optional(object({<br/>      failure_count_threshold = optional(number, 10)<br/>      header = optional(object({<br/>        name  = string<br/>        value = string<br/>      }))<br/>      interval_seconds = optional(number, 10)<br/>      path             = string<br/>      timeout          = optional(number, 5)<br/>      transport        = optional(string, "HTTP")<br/>    }))<br/>    startup_probe = optional(object({<br/>      failure_count_threshold = optional(number, 3)<br/>      header = optional(object({<br/>        name  = string<br/>        value = string<br/>      }))<br/>      interval_seconds = optional(number, 10)<br/>      path             = string<br/>      timeout          = optional(number, 5)<br/>      transport        = optional(string, "HTTP")<br/>    }))<br/>  }))</pre> | n/a | yes |
| <a name="input_environment"></a> [environment](#input\_environment) | Values which are used to generate resource names and location short names. | <pre>object({<br/>    prefix          = string<br/>    env_short       = string<br/>    location        = string<br/>    domain          = optional(string)<br/>    app_name        = string<br/>    instance_number = string<br/>  })</pre> | n/a | yes |
| <a name="input_public_access_enabled"></a> [public\_access\_enabled](#input\_public\_access\_enabled) | If true, the container app is accessible via a public FQDN. If false (default), the app is only accessible from within the virtual network. | `bool` | `false` | no |
| <a name="input_resource_group_name"></a> [resource\_group\_name](#input\_resource\_group\_name) | The name of the Azure Resource Group where the resources will be deployed. | `string` | n/a | yes |
| <a name="input_secrets"></a> [secrets](#input\_secrets) | List of secrets to be created in the Container App and injected as environment variables in the container. The secret name will be used as environment variable name, while the value will be injected as environment variable value. | <pre>list(object({<br/>    name                = string<br/>    key_vault_secret_id = string<br/>  }))</pre> | `[]` | no |
| <a name="input_tags"></a> [tags](#input\_tags) | A map of tags to assign to the resources. | `map(any)` | n/a | yes |
| <a name="input_target_port"></a> [target\_port](#input\_target\_port) | The port on which the container app will listen for incoming traffic. | `number` | `80` | no |
| <a name="input_user_assigned_identity_id"></a> [user\_assigned\_identity\_id](#input\_user\_assigned\_identity\_id) | Id of the user-assigned managed identity created along with the Container App Environment. | `string` | n/a | yes |

## Outputs

| Name | Description |
| ---- | ----------- |
| <a name="output_id"></a> [id](#output\_id) | The ID of the Container App resource. |
| <a name="output_name"></a> [name](#output\_name) | The name of the Container App resource. |
| <a name="output_principal_id"></a> [principal\_id](#output\_principal\_id) | The principal ID of the system-assigned managed identity associated with this Container App. |
| <a name="output_url"></a> [url](#output\_url) | The URL of the Container App. |
<!-- END_TF_DOCS -->
