# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and Prisma schema
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy Prisma schema and migrations
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client in production
RUN npx prisma generate

# Copy built application
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "dist/main"]
