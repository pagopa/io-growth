output "immutable_ced_audit_logs_storage" {
  value = {
    id                  = module.immutable_ced_audit_logs_storage.id
    name                = module.immutable_ced_audit_logs_storage.name
    resource_group_name = module.immutable_ced_audit_logs_storage.resource_group_name
    primary_web_host    = module.immutable_ced_audit_logs_storage.primary_web_host
  }
}
