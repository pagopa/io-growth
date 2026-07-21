resource "azurerm_public_ip" "app_gw_public_ip" {
  name                = "${var.project}-agw-pip-01"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "Standard"
  allocation_method   = "Static"

  tags = var.tags
}

resource "azurerm_user_assigned_identity" "app_gw_identity" {
  resource_group_name = var.resource_group_name
  location            = var.location
  name                = "${var.project}-agw-user-identity"

  tags = var.tags
}

resource "azurerm_subnet" "app_gw" {
  name                 = "${var.project}-agw-snet-01"
  resource_group_name  = var.virtual_network.resource_group_name
  virtual_network_name = var.virtual_network.name
  address_prefixes     = [var.subnet_cidr]
}

module "agw_identity_roles" {
  source  = "pagopa-dx/azure-role-assignments/azurerm"
  version = "~> 1.0"

  principal_id    = azurerm_user_assigned_identity.app_gw_identity.principal_id
  subscription_id = var.azure_subscription_id

  key_vault = [
    {
      name                = var.key_vault_name
      resource_group_name = var.resource_group_name
      has_rbac_support    = true
      roles = {
        secrets = "reader"
      }
      description = "Allow AGW to access TLS certificates"
    }
  ]
}

resource "azurerm_web_application_firewall_policy" "this" {
  name                = "${var.project}-agw-waf-policy-01"
  resource_group_name = var.resource_group_name
  location            = var.location

  policy_settings {
    enabled                     = true
    mode                        = "Prevention"
    request_body_check          = true
    file_upload_limit_in_mb     = 100
    max_request_body_size_in_kb = 128
  }

  managed_rules {
    managed_rule_set {
      type    = "OWASP"
      version = "3.2"

      rule_group_override {
        rule_group_name = "REQUEST-920-PROTOCOL-ENFORCEMENT"
        rule {
          id      = "920300"
          enabled = false
        }
      }

      rule_group_override {
        rule_group_name = "REQUEST-931-APPLICATION-ATTACK-RFI"
        rule {
          id      = "931130"
          enabled = false
        }
      }

      rule_group_override {
        rule_group_name = "REQUEST-932-APPLICATION-ATTACK-RCE"
        rule {
          id      = "932140"
          enabled = false
        }
      }

      rule_group_override {
        rule_group_name = "REQUEST-941-APPLICATION-ATTACK-XSS"
        rule {
          id      = "941130"
          enabled = false
        }
        rule {
          id      = "941170"
          enabled = false
        }
      }

      rule_group_override {
        rule_group_name = "REQUEST-942-APPLICATION-ATTACK-SQLI"
        rule {
          id      = "942340"
          enabled = false
        }
        rule {
          id      = "942450"
          enabled = false
        }
      }
    }
  }

  tags = var.tags
}

resource "azurerm_application_gateway" "this" {
  name                = "${var.project}-agw-01"
  resource_group_name = var.resource_group_name
  location            = var.location

  sku {
    name = var.sku.name
    tier = var.sku.tier
  }

  autoscale_configuration {
    min_capacity = var.app_gateway_min_capacity
    max_capacity = var.app_gateway_max_capacity
  }

  firewall_policy_id = azurerm_web_application_firewall_policy.this.id

  gateway_ip_configuration {
    name      = "gateway-ip-config"
    subnet_id = azurerm_subnet.app_gw.id
  }

  frontend_port {
    name = "https"
    port = 443
  }

  frontend_ip_configuration {
    name                 = "frontend-ip-config"
    public_ip_address_id = azurerm_public_ip.app_gw_public_ip.id
  }

  backend_address_pool {
    name  = "apim"
    fqdns = [var.apim_hostname]
  }

  backend_http_settings {
    name                  = "apim"
    cookie_based_affinity = "Disabled"
    protocol              = "Https"
    port                  = 443
    request_timeout       = 2
    host_name             = var.apim_hostname
    probe_name            = "probe-apim"
  }

  probe {
    name                                      = "probe-apim"
    protocol                                  = "Https"
    path                                      = "/status-0123456789abcdef"
    interval                                  = 30
    timeout                                   = 30
    unhealthy_threshold                       = 3
    pick_host_name_from_backend_http_settings = false
    host                                      = var.apim_hostname
  }

  ssl_certificate {
    name = var.app_gw_cert_name
    key_vault_secret_id = replace(
      data.azurerm_key_vault_certificate.app_gw_platform.secret_id,
      "/${data.azurerm_key_vault_certificate.app_gw_platform.version}",
      ""
    )
  }

  ssl_policy {
    policy_type          = "Custom"
    min_protocol_version = "TLSv1_2"
    cipher_suites = [
      "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
      "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
      "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA",
      "TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA"
    ]
  }

  ssl_profile {
    name = "${var.project}-ssl-profile"

    ssl_policy {
      policy_type          = "Custom"
      min_protocol_version = "TLSv1_2"
      cipher_suites = [
        "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
        "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
        "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA",
        "TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA"
      ]
    }
  }

  http_listener {
    name                           = "api"
    frontend_ip_configuration_name = "frontend-ip-config"
    frontend_port_name             = "https"
    protocol                       = "Https"
    host_name                      = var.api_hostname
    ssl_certificate_name           = var.app_gw_cert_name
    ssl_profile_name               = "${var.project}-ssl-profile"
    firewall_policy_id             = azurerm_web_application_firewall_policy.this.id
  }

  request_routing_rule {
    name                       = "api"
    rule_type                  = "Basic"
    http_listener_name         = "api"
    backend_address_pool_name  = "apim"
    backend_http_settings_name = "apim"
    priority                   = 1
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.app_gw_identity.id]
  }

  depends_on = [module.agw_identity_roles]
  tags       = var.tags
}

################################################################################
# Metric Alerts
################################################################################

resource "azurerm_monitor_metric_alert" "compute_units_usage" {
  count = var.app_gateway_alerts_enabled ? 1 : 0

  name                = "${var.project}-agw-compute-units-alert"
  resource_group_name = var.resource_group_name
  scopes              = [azurerm_application_gateway.this.id]
  description         = "Abnormal compute units usage, probably an high traffic peak"
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT5M"
  auto_mitigate       = true

  dynamic_criteria {
    aggregation              = "Average"
    metric_namespace         = "Microsoft.Network/applicationGateways"
    metric_name              = "ComputeUnits"
    operator                 = "GreaterOrLessThan"
    alert_sensitivity        = var.alert_sensitivity
    evaluation_total_count   = 2
    evaluation_failure_count = 2
  }

  action {
    action_group_id = var.azurerm_monitor_action_group_id
  }
}

resource "azurerm_monitor_metric_alert" "backend_pools_status" {
  count = var.app_gateway_alerts_enabled ? 1 : 0

  name                = "${var.project}-agw-backend-pools-status-alert"
  resource_group_name = var.resource_group_name
  scopes              = [azurerm_application_gateway.this.id]
  description         = "One or more backend pools are down, check Backend Health on Azure portal"
  severity            = 0
  frequency           = "PT5M"
  window_size         = "PT5M"
  auto_mitigate       = true

  criteria {
    aggregation      = "Average"
    metric_namespace = "Microsoft.Network/applicationGateways"
    metric_name      = "UnhealthyHostCount"
    operator         = "GreaterThan"
    threshold        = 0
  }

  action {
    action_group_id = var.azurerm_monitor_action_group_id
  }
}

resource "azurerm_monitor_metric_alert" "response_time" {
  count = var.app_gateway_alerts_enabled ? 1 : 0

  name                = "${var.project}-agw-response-time-alert"
  resource_group_name = var.resource_group_name
  scopes              = [azurerm_application_gateway.this.id]
  description         = "Backends response time is too high"
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT5M"
  auto_mitigate       = true

  dynamic_criteria {
    aggregation              = "Average"
    metric_namespace         = "Microsoft.Network/applicationGateways"
    metric_name              = "BackendLastByteResponseTime"
    operator                 = "GreaterThan"
    alert_sensitivity        = var.alert_sensitivity
    evaluation_total_count   = 2
    evaluation_failure_count = 2
  }

  action {
    action_group_id = var.azurerm_monitor_action_group_id
  }
}

resource "azurerm_monitor_metric_alert" "total_requests" {
  count = var.app_gateway_alerts_enabled ? 1 : 0

  name                = "${var.project}-agw-total-requests-alert"
  resource_group_name = var.resource_group_name
  scopes              = [azurerm_application_gateway.this.id]
  description         = "Traffic is raising"
  severity            = 3
  frequency           = "PT5M"
  window_size         = "PT15M"
  auto_mitigate       = true

  dynamic_criteria {
    aggregation              = "Total"
    metric_namespace         = "Microsoft.Network/applicationGateways"
    metric_name              = "TotalRequests"
    operator                 = "GreaterThan"
    alert_sensitivity        = var.alert_sensitivity
    evaluation_total_count   = 1
    evaluation_failure_count = 1
  }

  action {
    action_group_id = var.azurerm_monitor_action_group_id
  }
}

resource "azurerm_monitor_metric_alert" "failed_requests" {
  count = var.app_gateway_alerts_enabled ? 1 : 0

  name                = "${var.project}-agw-failed-requests-alert"
  resource_group_name = var.resource_group_name
  scopes              = [azurerm_application_gateway.this.id]
  description         = "Abnormal failed requests"
  severity            = 1
  frequency           = "PT5M"
  window_size         = "PT5M"
  auto_mitigate       = true

  dynamic_criteria {
    aggregation              = "Total"
    metric_namespace         = "Microsoft.Network/applicationGateways"
    metric_name              = "FailedRequests"
    operator                 = "GreaterThan"
    alert_sensitivity        = var.alert_sensitivity
    evaluation_total_count   = 2
    evaluation_failure_count = 2
  }

  action {
    action_group_id = var.azurerm_monitor_action_group_id
  }
}
