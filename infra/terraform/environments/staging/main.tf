module "image_hosting" {
  source = "../../modules/image-hosting"

  environment           = "staging"
  namespace             = "image-hosting-staging"
  app_version           = var.app_version
  service_replica_count = 2
}
