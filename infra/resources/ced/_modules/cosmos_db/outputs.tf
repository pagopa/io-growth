output "cosmos_db" {
  value = {
    id                  = module.ced_cosmos_account.id
    name                = module.ced_cosmos_account.name
    resource_group_name = module.ced_cosmos_account.resource_group_name
    endpoint            = module.ced_cosmos_account.endpoint
  }
}
