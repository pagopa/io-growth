resource "github_actions_environment_secret" "ced_postgres_host" {
  repository      = module.azure-PROD-CED_bootstrap.repository.name
  environment     = "app-prod-cd"
  secret_name     = "CED_POSTGRES_HOST"
  #trivy:ignore:AVD-GIT-0002
  plaintext_value = "placeholder"

  lifecycle {
    ignore_changes = [remote_updated_at]
  }
}

resource "github_actions_environment_secret" "ced_postgres_port" {
  repository      = module.azure-PROD-CED_bootstrap.repository.name
  environment     = "app-prod-cd"
  secret_name     = "CED_POSTGRES_PORT"
  #trivy:ignore:AVD-GIT-0002
  plaintext_value = "placeholder"

  lifecycle {
    ignore_changes = [remote_updated_at]
  }
}

resource "github_actions_environment_secret" "ced_postgres_user" {
  repository      = module.azure-PROD-CED_bootstrap.repository.name
  environment     = "app-prod-cd"
  secret_name     = "CED_POSTGRES_USER"
  #trivy:ignore:AVD-GIT-0002
  plaintext_value = "placeholder"

  lifecycle {
    ignore_changes = [remote_updated_at]
  }
}

resource "github_actions_environment_secret" "ced_postgres_password" {
  repository      = module.azure-PROD-CED_bootstrap.repository.name
  environment     = "app-prod-cd"
  secret_name     = "CED_POSTGRES_PASSWORD"
  #trivy:ignore:AVD-GIT-0002
  plaintext_value = "placeholder"

  lifecycle {
    ignore_changes = [remote_updated_at]
  }
}

resource "github_actions_environment_secret" "ced_postgres_db" {
  repository      = module.azure-PROD-CED_bootstrap.repository.name
  environment     = "app-prod-cd"
  secret_name     = "CED_POSTGRES_DB"
  #trivy:ignore:AVD-GIT-0002
  plaintext_value = "placeholder"

  lifecycle {
    ignore_changes = [remote_updated_at]
  }
}

resource "github_actions_environment_secret" "ced_postgres_db_test" {
  repository      = module.azure-PROD-CED_bootstrap.repository.name
  environment     = "app-prod-cd"
  secret_name     = "CED_POSTGRES_DB_TEST"
  #trivy:ignore:AVD-GIT-0002
  plaintext_value = "placeholder"

  lifecycle {
    ignore_changes = [remote_updated_at]
  }
}
