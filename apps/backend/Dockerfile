FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory to root to mimic monorepo structure for proto access
WORKDIR /workspace

# Copy proto files to the location expected by the code (../../../../proto)
# The code is in /workspace/apps/backend/src/thumbnail/thumbnail.module.ts
# So relative to that, ../../../../proto is /workspace/proto
COPY proto ./proto

# Set working directory for backend
WORKDIR /workspace/apps/backend

# Copy package files
COPY apps/backend/package.json apps/backend/pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/backend .

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

WORKDIR /workspace

# Copy proto files again for runtime access
COPY --from=builder /workspace/proto ./proto

WORKDIR /workspace/apps/backend

# Copy built assets and dependencies
COPY --from=builder /workspace/apps/backend/dist ./dist
COPY --from=builder /workspace/apps/backend/node_modules ./node_modules
COPY --from=builder /workspace/apps/backend/package.json ./

EXPOSE 3000

CMD ["node", "dist/main"]
