# Build stage
FROM rust:latest AS builder

WORKDIR /workspace

# Install protobuf compiler
RUN apt-get update && apt-get install -y protobuf-compiler

# Copy proto files (needed for build.rs)
COPY proto ./proto

# Create a new empty shell project for caching dependencies
WORKDIR /workspace/service
RUN cargo init

# Copy manifests
COPY service/Cargo.toml service/Cargo.lock ./

# Build only the dependencies to cache them
RUN cargo build --release
# Remove the dummy src
RUN rm src/*.rs

# Copy actual source code
COPY service/src ./src
COPY service/build.rs ./

# Touch the main file to force a rebuild
# RUN touch src/main.rs

# Build the actual application
RUN cargo build --release

# Production stage
FROM debian:bookworm-slim AS production

# Install OpenSSL and CA certificates
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the binary
COPY --from=builder /workspace/service/target/release/service ./service

# Expose the gRPC port (default 50051)
EXPOSE 50051

CMD ["./service"]
