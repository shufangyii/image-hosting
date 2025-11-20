# Image Hosting Application

A modern, full-stack image hosting application built with a monorepo structure.

## 🚀 Tech Stack

-   **Frontend**: Vue 3 + Vite (TypeScript)
-   **Backend**: NestJS (TypeScript)
-   **Service**: Rust (gRPC)
-   **Database**: Supabase (PostgreSQL)
-   **Storage**: Minio (S3-compatible)
-   **Queue**: Upstash Redis
-   **Auth**: Clerk
-   **Email**: Resend

## ✨ Features

-   **User Authentication**: Secure sign-up and login via Clerk.
-   **Image Upload**: Upload images to Minio storage with metadata in Supabase.
-   **Thumbnail Generation**: Asynchronous thumbnail generation using a high-performance Rust gRPC service.
-   **Email Notifications**: Welcome emails sent to new users via Resend (triggered by Clerk webhooks).
-   **Image Management**: List, preview, and delete images.

## 📂 Project Structure

-   `apps/frontend`: Vue 3 application.
-   `apps/backend`: NestJS API gateway and worker.
-   `service`: Rust gRPC service for image processing.
-   `proto`: Shared gRPC protocol definitions.

## 🛠️ Setup & Installation

### Prerequisites

-   Node.js (v18+) & pnpm
-   Rust (latest stable)
-   Docker (for Minio, if running locally)
-   Supabase account
-   Clerk account
-   Upstash account
-   Resend account

### Environment Variables

Create `.env` files in `apps/backend` and `service` based on the examples.

**Backend (`apps/backend/.env.development`):**
```env
# Clerk
CLERK_SECRET_KEY=...
CLERK_JWT_VERIFICATION_KEY=...
CLERK_WEBHOOK_SECRET=...

# Supabase
SUPABASE_URL=...
SUPABASE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Minio
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
MINIO_BUCKET_NAME=...

# Upstash Redis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Resend
RESEND_API_KEY=...

# gRPC
THUMBNAIL_GRPC_URL=localhost:50051
```

**Service (`service/.env`):**
```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
MINIO_BUCKET_NAME=...
```

### Running the Project

1.  **Start Minio (if local):**
    ```bash
    docker run -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ":9001"
    ```

2.  **Start Rust Service:**
    ```bash
    cd service
    cargo run
    ```

3.  **Start Backend:**
    ```bash
    cd apps/backend
    pnpm start:dev
    ```

4.  **Start Frontend:**
    ```bash
    cd apps/frontend
    pnpm dev
    ```

## 🧪 Verification Scripts

### Simulate Clerk Webhook (Email Notification)
To verify the email notification flow without a real Clerk event:
```bash
cd apps/backend
export CLERK_WEBHOOK_SECRET=your_secret_here
npx ts-node scripts/simulate-webhook.ts
```
