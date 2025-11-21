module "image_hosting" {
  source = "../../modules/image-hosting"

  environment           = "dev"
  namespace             = "image-hosting-dev"
  app_version           = var.app_version
  service_replica_count = 1
}
