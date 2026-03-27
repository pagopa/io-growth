data "azuread_application" "vpn_app" {
  display_name = var.vpn_app_display_name
}
