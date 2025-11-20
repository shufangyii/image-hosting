fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::configure()
        .compile(&["../proto/thumbnail_service.proto"], &["../proto"])?;
    Ok(())
}
