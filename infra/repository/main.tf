module "github_repository" {
  source  = "pagopa-dx/github-environment-bootstrap/github"
  version = "~> 1.0"

  repository = {
    name                   = "io-growth"
    description            = ""
    topics                 = []
    reviewers_teams        = []
  }
}
