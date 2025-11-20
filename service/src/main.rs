use aws_sdk_s3::{primitives::ByteStream, Client as S3Client};
use image::ImageFormat;
use std::env;
use std::io::Cursor;
use std::sync::Arc;
use tonic::{transport::Server, Request, Response, Status};

// Include the generated gRPC code
pub mod thumbnail_service {
    tonic::include_proto!("thumbnail_service");
}

use thumbnail_service::{
    thumbnail_service_server::{ThumbnailService, ThumbnailServiceServer},
    GenerateThumbnailRequest, GenerateThumbnailResponse,
};

// The gRPC service implementation
#[derive(Clone)]
pub struct MyThumbnailService {
    s3_client: Arc<S3Client>,
}

#[tonic::async_trait]
impl ThumbnailService for MyThumbnailService {
    async fn generate_thumbnail(
        &self,
        request: Request<GenerateThumbnailRequest>,
    ) -> Result<Response<GenerateThumbnailResponse>, Status> {
        let req = request.into_inner();
        println!("gRPC request received: object_name={}", req.object_name);

        // Process the thumbnail generation
        match self.process_thumbnail(req.object_name).await {
            Ok(thumbnail_url) => {
                let reply = GenerateThumbnailResponse { thumbnail_url };
                Ok(Response::new(reply))
            }
            Err(e) => {
                eprintln!("Failed to process thumbnail: {}", e);
                Err(Status::internal(format!(
                    "Failed to process thumbnail: {}",
                    e
                )))
            }
        }
    }
}

impl MyThumbnailService {
    async fn process_thumbnail(
        &self,
        object_name: String,
    ) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
        println!("Processing thumbnail for object: {}", object_name);
        let bucket_name = env::var("MINIO_BUCKET_NAME")?;

        // 1. Download image from Minio
        let mut object = self
            .s3_client
            .get_object()
            .bucket(&bucket_name)
            .key(&object_name)
            .send()
            .await?;

        let mut image_data = Vec::new();
        while let Some(bytes) = object.body.try_next().await? {
            image_data.extend_from_slice(&bytes);
        }
        println!("Downloaded image: {}", object_name);

        // 2. Generate thumbnail
        let image = image::load_from_memory(&image_data)?;
        let thumbnail = image.thumbnail(100, 100);
        let mut thumbnail_bytes = Cursor::new(Vec::new());
        thumbnail.write_to(&mut thumbnail_bytes, ImageFormat::Png)?;
        println!("Generated thumbnail for: {}", object_name);

        // 3. Upload thumbnail to Minio
        let thumbnail_object_name = format!(
            "thumb_{}",
            object_name.split('/').last().unwrap_or_default()
        );
        let user_id = object_name.split('/').next().unwrap_or_default();
        let full_thumbnail_object_name = format!("{}/{}", user_id, thumbnail_object_name);

        self.s3_client
            .put_object()
            .bucket(&bucket_name)
            .key(&full_thumbnail_object_name)
            .body(ByteStream::from(thumbnail_bytes.into_inner()))
            .content_type("image/png")
            .send()
            .await?;
        println!("Uploaded thumbnail: {}", full_thumbnail_object_name);

        // 4. Construct the public URL
        let minio_endpoint = env::var("MINIO_ENDPOINT")?;
        let minio_port = env::var("MINIO_PORT")?;
        let thumbnail_url = format!(
            "http://{}:{}/{}/{}",
            minio_endpoint, minio_port, bucket_name, full_thumbnail_object_name
        );

        Ok(thumbnail_url)
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv::dotenv().ok();
    println!("Starting thumbnail gRPC service...");

    // --- Client Setup ---
    let s3_client = Arc::new(create_s3_client().await);

    // --- Start gRPC Server ---
    let addr = "0.0.0.0:50051".parse()?;
    let thumbnailer = MyThumbnailService { s3_client };

    println!("gRPC server listening on {}", addr);
    Server::builder()
        .add_service(ThumbnailServiceServer::new(thumbnailer))
        .serve(addr)
        .await?;

    Ok(())
}

async fn create_s3_client() -> S3Client {
    let endpoint_uri = format!(
        "http://{}:{}",
        env::var("MINIO_ENDPOINT").unwrap_or_else(|_| "localhost".to_string()),
        env::var("MINIO_PORT").unwrap_or_else(|_| "9000".to_string())
    );

    let access_key = env::var("MINIO_ACCESS_KEY").expect("MINIO_ACCESS_KEY must be set");
    let secret_key = env::var("MINIO_SECRET_KEY").expect("MINIO_SECRET_KEY must be set");

    let credentials =
        aws_sdk_s3::config::Credentials::new(access_key, secret_key, None, None, "minio");

    let region = aws_sdk_s3::config::Region::new("us-east-1"); // Minio default region

    let s3_config = aws_sdk_s3::config::Builder::new()
        .region(region)
        .endpoint_url(endpoint_uri)
        .credentials_provider(credentials)
        .force_path_style(true) // Necessary for Minio
        .behavior_version_latest()
        .build();

    S3Client::from_conf(s3_config)
}
