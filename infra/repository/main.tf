module "github_repository" {
  source  = "pagopa-dx/github-environment-bootstrap/github"
  version = "~> 1.0"

  repository = {
    name                   = "io-growth"
    description            = ""
    topics                 = []
    reviewers_teams        = ["io-ecosystem-growth-contributors"]
    pull_request_bypassers = ["/michaeldisaro"]
    jira_boards_ids        = ["IEG"]
    app_cd_policy_tags     = ["main", "*"]
  }
}
