terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
    }
    dx = {
      source = "pagopa-dx/azure"
    }
  }
}

locals {
  blob_origin_host = trimprefix(trimsuffix(var.blob_endpoint, "/"), "https://")

  naming_config = {
    prefix          = var.environment.prefix
    environment     = var.environment.env_short
    location        = var.environment.location
    domain          = var.environment.domain
    name            = var.environment.app_name
    instance_number = tonumber(var.environment.instance_number)
  }

  hostnames = {
    for container in ["logos", "images"] :
    container => "${container}.${var.dns_zone.name}"
  }
}

# The module retains its built-in origin group for the default-domain route.
module "frontdoor" {
  source  = "pagopa-dx/azure-cdn/azurerm"
  version = "~> 2.1"

  environment         = var.environment
  resource_group_name = var.resource_group_name

  origins = {
    logos = {
      host_name = local.blob_origin_host
    }
  }

  origin_health_probe = {
    path = var.origin_health_paths.logos
  }

  waf_enabled = false
  diagnostic_settings = {
    enabled = false
  }

  tags = var.tags
}

resource "azurerm_cdn_frontdoor_origin_group" "logos" {
  name = provider::dx::resource_name(merge(local.naming_config, {
    name          = "${var.environment.app_name}-logos"
    resource_type = "cdn_frontdoor_origin_group"
  }))
  cdn_frontdoor_profile_id = module.frontdoor.id

  health_probe {
    interval_in_seconds = 100
    protocol            = "Https"
    path                = var.origin_health_paths.logos
    request_type        = "HEAD"
  }

  load_balancing {}
}

resource "azurerm_cdn_frontdoor_origin" "logos" {
  name = provider::dx::resource_name(merge(local.naming_config, {
    name          = "${var.environment.app_name}-logos"
    resource_type = "cdn_frontdoor_origin"
  }))
  cdn_frontdoor_origin_group_id  = azurerm_cdn_frontdoor_origin_group.logos.id
  enabled                        = true
  host_name                      = local.blob_origin_host
  http_port                      = 80
  https_port                     = 443
  origin_host_header             = local.blob_origin_host
  priority                       = 1
  weight                         = 1000
  certificate_name_check_enabled = true
}

resource "azurerm_cdn_frontdoor_origin_group" "images" {
  name = provider::dx::resource_name(merge(local.naming_config, {
    name          = "${var.environment.app_name}-images"
    resource_type = "cdn_frontdoor_origin_group"
  }))
  cdn_frontdoor_profile_id = module.frontdoor.id

  health_probe {
    interval_in_seconds = 100
    protocol            = "Https"
    path                = var.origin_health_paths.images
    request_type        = "HEAD"
  }

  load_balancing {}
}

resource "azurerm_cdn_frontdoor_origin" "images" {
  name = provider::dx::resource_name(merge(local.naming_config, {
    name          = "${var.environment.app_name}-images"
    resource_type = "cdn_frontdoor_origin"
  }))
  cdn_frontdoor_origin_group_id  = azurerm_cdn_frontdoor_origin_group.images.id
  enabled                        = true
  host_name                      = local.blob_origin_host
  http_port                      = 80
  https_port                     = 443
  origin_host_header             = local.blob_origin_host
  priority                       = 1
  weight                         = 1000
  certificate_name_check_enabled = true
}

resource "azurerm_cdn_frontdoor_route" "assets" {
  for_each = local.hostnames

  name = provider::dx::resource_name(merge(local.naming_config, {
    name          = "${var.environment.app_name}-${each.key}"
    resource_type = "cdn_frontdoor_route"
  }))
  cdn_frontdoor_endpoint_id       = module.frontdoor.endpoint_id
  cdn_frontdoor_origin_group_id   = each.key == "logos" ? azurerm_cdn_frontdoor_origin_group.logos.id : azurerm_cdn_frontdoor_origin_group.images.id
  cdn_frontdoor_origin_ids        = each.key == "logos" ? [azurerm_cdn_frontdoor_origin.logos.id] : [azurerm_cdn_frontdoor_origin.images.id]
  cdn_frontdoor_rule_set_ids      = [module.frontdoor.rule_set_id]
  cdn_frontdoor_custom_domain_ids = [azurerm_cdn_frontdoor_custom_domain.assets[each.key].id]
  cdn_frontdoor_origin_path       = "/${each.key}"
  enabled                         = true

  forwarding_protocol    = "HttpsOnly"
  https_redirect_enabled = true
  patterns_to_match      = ["/*"]
  supported_protocols    = ["Http", "Https"]
  link_to_default_domain = false

  depends_on = [module.frontdoor]
}

resource "azurerm_cdn_frontdoor_custom_domain" "assets" {
  for_each = local.hostnames

  name                     = replace(each.value, ".", "-")
  cdn_frontdoor_profile_id = module.frontdoor.id
  dns_zone_id              = var.dns_zone.id
  host_name                = each.value

  tls {
    certificate_type = "ManagedCertificate"
    minimum_version  = "TLS12"
  }
}

resource "azurerm_cdn_frontdoor_custom_domain_association" "assets" {
  for_each = local.hostnames

  cdn_frontdoor_custom_domain_id = azurerm_cdn_frontdoor_custom_domain.assets[each.key].id
  cdn_frontdoor_route_ids        = [azurerm_cdn_frontdoor_route.assets[each.key].id]
}

resource "azurerm_dns_txt_record" "validation" {
  for_each = local.hostnames

  name                = "_dnsauth.${each.key}"
  zone_name           = var.dns_zone.name
  resource_group_name = var.dns_zone.resource_group_name
  ttl                 = 3600

  record {
    # Front Door clears the token after validating a domain.
    value = coalesce(azurerm_cdn_frontdoor_custom_domain.assets[each.key].validation_token, "AlreadyValidated")
  }

  lifecycle {
    ignore_changes = [record]
  }

  tags = var.tags
}

resource "azurerm_dns_cname_record" "assets" {
  for_each = local.hostnames

  name                = each.key
  zone_name           = var.dns_zone.name
  resource_group_name = var.dns_zone.resource_group_name
  ttl                 = 3600
  target_resource_id  = module.frontdoor.endpoint_id

  tags = var.tags

  depends_on = [azurerm_cdn_frontdoor_custom_domain_association.assets]
}

resource "azurerm_cdn_frontdoor_rule" "disable_cache" {
  name                      = "DisableCache"
  cdn_frontdoor_rule_set_id = module.frontdoor.rule_set_id
  order                     = 1
  behavior_on_match         = "Continue"

  actions {
    route_configuration_override_action {
      cache_behavior = "Disabled"
    }

    response_header_action {
      header_action = "Overwrite"
      header_name   = "Cache-Control"
      value         = "no-store, max-age=0"
    }
  }

  depends_on = [
    module.frontdoor,
    azurerm_cdn_frontdoor_origin_group.logos,
    azurerm_cdn_frontdoor_origin.logos,
    azurerm_cdn_frontdoor_origin_group.images,
    azurerm_cdn_frontdoor_origin.images,
  ]
}

resource "azurerm_cdn_frontdoor_rule" "enforce_https" {
  name                      = "EnforceHTTPS"
  cdn_frontdoor_rule_set_id = module.frontdoor.rule_set_id
  order                     = 2
  behavior_on_match         = "Continue"

  actions {
    url_redirect_action {
      redirect_type        = "PermanentRedirect"
      redirect_protocol    = "Https"
      destination_hostname = ""
    }
  }

  conditions {
    request_scheme_condition {
      operator         = "Equal"
      match_values     = ["HTTP"]
      negate_condition = false
    }
  }

  depends_on = [
    module.frontdoor,
    azurerm_cdn_frontdoor_origin_group.logos,
    azurerm_cdn_frontdoor_origin.logos,
    azurerm_cdn_frontdoor_origin_group.images,
    azurerm_cdn_frontdoor_origin.images,
  ]
}
