###########
# DNS Zone
###########

resource "azurerm_dns_zone" "public" {
  name                = "ced.pagopa.it"
  resource_group_name = var.resource_group_name

  tags = var.tags

  lifecycle {
    prevent_destroy = true
  }
}

####################
# DKIM CNAME Records
####################

resource "azurerm_dns_cname_record" "dkim1" {
  name                = "trwtzdool6n4argcfpo3pz3bvzpstaej._domainkey"
  record               = var.dkim1_record

  zone_name           = azurerm_dns_zone.public.name
  resource_group_name = var.resource_group_name

  ttl                 = 300

  tags = var.tags
}

resource "azurerm_dns_cname_record" "dkim2" {
  name                = "u7rskmxwm6bpsh7ukjlonmacce35ygv5._domainkey"
  record               = var.dkim2_record

  zone_name           = azurerm_dns_zone.public.name
  resource_group_name = var.resource_group_name

  ttl                 = 300

  tags = var.tags
}

resource "azurerm_dns_cname_record" "dkim3" {
  name                = "2oekew7jzmtnpendmmesp6jv37ptf2ak._domainkey"
  record               = var.dkim3_record

  zone_name           = azurerm_dns_zone.public.name
  resource_group_name = var.resource_group_name

  ttl                 = 300

  tags = var.tags
}

##########################
# Custom Mail From Records
##########################

resource "azurerm_dns_mx_record" "cmf_mx_1" {
  name                = "bounce"
  zone_name           = azurerm_dns_zone.public.name
  resource_group_name = var.resource_group_name
  ttl                 = 300

  record {
    preference = 10
    exchange   = var.cmf_mx_1_record
  }

  tags = var.tags
}

resource "azurerm_dns_txt_record" "cmf_txt_1" {
  name                = "bounce"
  zone_name           = azurerm_dns_zone.public.name
  resource_group_name = var.resource_group_name
  ttl                 = 300

  record {
    value = var.cmf_txt_1_record
  }

  tags = var.tags
}

resource "azurerm_dns_mx_record" "cmf_mx_2" {
  name                = "bounce.euc1"
  zone_name           = azurerm_dns_zone.public.name
  resource_group_name = var.resource_group_name
  ttl                 = 300

  record {
    preference = 10
    exchange   = var.cmf_mx_2_record
  }

  tags = var.tags
}

resource "azurerm_dns_txt_record" "cmf_txt_2" {
  name                = "bounce.euc1"
  zone_name           = azurerm_dns_zone.public.name
  resource_group_name = var.resource_group_name
  ttl                 = 300

  record {
    value = var.cmf_txt_2_record
  }

  tags = var.tags
}

##################
# DMARC TXT Record
##################

resource "azurerm_dns_txt_record" "dmarc" {
  name                = "_dmarc"
  zone_name           = azurerm_dns_zone.public.name
  resource_group_name = var.resource_group_name
  ttl                 = 300

  record {
    value = var.dmarc_record
  }

  tags = var.tags
}
