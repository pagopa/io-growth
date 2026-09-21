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
  name                = "sba3hckbiekg4l22nbzt6cmp452bj7oh._domainkey.portal.ced.pagopa.it"
  record               = var.dkim1_record

  zone_name           = azurerm_dns_zone.public.name
  resource_group_name = var.resource_group_name

  ttl                 = 300

  tags = var.tags
}

resource "azurerm_dns_cname_record" "dkim2" {
  name                = "2zb6bai5asqzbimgi3bd6xwg3takmrsz._domainkey.portal.ced.pagopa.it"
  record               = var.dkim2_record

  zone_name           = azurerm_dns_zone.public.name
  resource_group_name = var.resource_group_name

  ttl                 = 300

  tags = var.tags
}

resource "azurerm_dns_cname_record" "dkim3" {
  name                = "2mmbuqey5ihoomtyfx2et7kweknwr2h3._domainkey.portal.ced.pagopa.it"
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
  name                = "bounce.portal.ced.pagopa.it"
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
  name                = "bounce.portal.ced.pagopa.it"
  zone_name           = azurerm_dns_zone.public.name
  resource_group_name = var.resource_group_name
  ttl                 = 300

  record {
    value = var.cmf_txt_1_record
  }

  tags = var.tags
}

resource "azurerm_dns_mx_record" "cmf_mx_2" {
  name                = "bounce.euc1.portal.ced.pagopa.it"
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
  name                = "bounce.euc1.portal.ced.pagopa.it"
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
  name                = "_dmarc.portal.ced.pagopa.it"
  zone_name           = azurerm_dns_zone.public.name
  resource_group_name = var.resource_group_name
  ttl                 = 300

  record {
    value = var.dmarc_record
  }

  tags = var.tags
}
