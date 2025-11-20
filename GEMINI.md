# Project Overview: Image Hosting Application

This directory serves as the root for an image hosting application, structured as a monorepo. The project utilizes a modern stack with a clear separation of concerns for its frontend, backend, and gRPC services.

## Project Structure

The project follows a monorepo structure with the following key directories:

*   **`apps/frontend`**: Contains the frontend application developed with Vite and Vue3.
*   **`apps/backend`**: Houses the backend application built with NestJS.
*   **`proto`**: Stores all `.proto` files for defining gRPC services and messages.
*   **`service`**: Contains the Rust-based gRPC service implementation.

## Key Technologies

*   **Frontend**: Vite + Vue3
*   **Backend**: NestJS
*   **Services**: Rust gRPC
*   **Authentication**: Clerk
*   **Database**: Supabase
*   **Object Storage**: Minio
*   **Asynchronous Processing**: Upstash (for thumbnail generation)
*   **Email Notifications**: Resend

## Core Features

*   User registration and login
*   Image upload and thumbnail generation
*   Image listing, preview, download, and deletion

## Usage

This monorepo is designed to streamline the development of the image hosting application. Each sub-project (`frontend`, `backend`, `service`) is independently manageable while benefiting from shared configurations and tools within the monorepo. The `proto` directory centralizes gRPC service definitions for consistent communication between services.