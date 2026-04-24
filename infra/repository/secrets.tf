resource "github_actions_environment_secret" "ced_postgres_host" {
  repository      = module.github_repository.name
  environment     = "app-prod-cd"
  secret_name     = "CED_POSTGRES_HOST"
  plaintext_value = "placeholder"

  lifecycle {
    ignore_changes = [remote_updated_at]
  }
}

resource "github_actions_environment_secret" "ced_postgres_port" {
  repository      = module.github_repository.name
  environment     = "app-prod-cd"
  secret_name     = "CED_POSTGRES_PORT"
  plaintext_value = "placeholder"

  lifecycle {
    ignore_changes = [remote_updated_at]
  }
}

resource "github_actions_environment_secret" "ced_postgres_user" {
  repository      = module.github_repository.name
  environment     = "app-prod-cd"
  secret_name     = "CED_POSTGRES_USER"
  plaintext_value = "placeholder"

  lifecycle {
    ignore_changes = [remote_updated_at]
  }
}

resource "github_actions_environment_secret" "ced_postgres_password" {
  repository      = module.github_repository.name
  environment     = "app-prod-cd"
  secret_name     = "CED_POSTGRES_PASSWORD"
  plaintext_value = "placeholder"

  lifecycle {
    ignore_changes = [remote_updated_at]
  }
}

resource "github_actions_environment_secret" "ced_postgres_db" {
  repository      = module.github_repository.name
  environment     = "app-prod-cd"
  secret_name     = "CED_POSTGRES_DB"
  plaintext_value = "placeholder"

  lifecycle {
    ignore_changes = [remote_updated_at]
  }
}
