# storage_audit

<!-- BEGIN_TF_DOCS -->

## Requirements

No requirements.

## Providers

| Name                                                         | Version |
| ------------------------------------------------------------ | ------- |
| <a name="provider_azurerm"></a> [azurerm](#provider_azurerm) | n/a     |

## Modules

| Name                                                                                                                                | Source                                  | Version |
| ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------- |
| <a name="module_immutable_ced_audit_logs_storage"></a> [immutable_ced_audit_logs_storage](#module_immutable_ced_audit_logs_storage) | pagopa-dx/azure-storage-account/azurerm | ~> 1.0  |

## Resources

| Name                                                                                                                                                                                              | Type     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| [azurerm_storage_container.immutable_ced_audit_logs_storage_logs](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/storage_container)                              | resource |
| [azurerm_storage_management_policy.immutable_ced_audit_logs_storage_management_policy](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/storage_management_policy) | resource |

## Inputs

| Name                                                                                                                                          | Description                                                | Type       | Default | Required |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------- | ------- | :------: |
| <a name="input_action_group_id"></a> [action_group_id](#input_action_group_id)                                                                | The action group id for alerts                             | `string`   | n/a     |   yes    |
| <a name="input_app_name"></a> [app_name](#input_app_name)                                                                                     | App name                                                   | `string`   | n/a     |   yes    |
| <a name="input_ced_storage_immutability_policy_days"></a> [ced_storage_immutability_policy_days](#input_ced_storage_immutability_policy_days) | Number of days for the immutability policy                 | `number`   | `730`   |    no    |
| <a name="input_domain"></a> [domain](#input_domain)                                                                                           | Domain                                                     | `string`   | n/a     |   yes    |
| <a name="input_env_short"></a> [env_short](#input_env_short)                                                                                  | Short environment                                          | `string`   | n/a     |   yes    |
| <a name="input_instance_number"></a> [instance_number](#input_instance_number)                                                                | The istance number to create                               | `string`   | n/a     |   yes    |
| <a name="input_key_vault_id"></a> [key_vault_id](#input_key_vault_id)                                                                         | ID of the Key Vault for storing secrets                    | `string`   | n/a     |   yes    |
| <a name="input_location"></a> [location](#input_location)                                                                                     | Azure region                                               | `string`   | n/a     |   yes    |
| <a name="input_prefix"></a> [prefix](#input_prefix)                                                                                           | IO Prefix                                                  | `string`   | n/a     |   yes    |
| <a name="input_privatelink_blob_core_windows_net_id"></a> [privatelink_blob_core_windows_net_id](#input_privatelink_blob_core_windows_net_id) | Blob private link                                          | `string`   | n/a     |   yes    |
| <a name="input_project"></a> [project](#input_project)                                                                                        | IO prefix and short environment                            | `string`   | n/a     |   yes    |
| <a name="input_resource_group_name"></a> [resource_group_name](#input_resource_group_name)                                                    | Name of the resource group where resources will be created | `string`   | n/a     |   yes    |
| <a name="input_subnet_pep_id"></a> [subnet_pep_id](#input_subnet_pep_id)                                                                      | ID of the subnet for private endpoints                     | `string`   | n/a     |   yes    |
| <a name="input_tags"></a> [tags](#input_tags)                                                                                                 | Resource tags                                              | `map(any)` | n/a     |   yes    |
| <a name="input_tenant_id"></a> [tenant_id](#input_tenant_id)                                                                                  | Tenant ID for the Azure subscription                       | `string`   | n/a     |   yes    |

## Outputs

| Name                                                                                                                                | Description |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| <a name="output_immutable_ced_audit_logs_storage"></a> [immutable_ced_audit_logs_storage](#output_immutable_ced_audit_logs_storage) | n/a         |

<!-- END_TF_DOCS -->
