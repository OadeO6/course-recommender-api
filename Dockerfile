# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with network retry
RUN npm config set registry https://registry.npmjs.org/ && \
    npm install --network-timeout=100000

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Run
FROM node:20-alpine
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache python3

# Copy package files and install production dependencies
COPY --from=builder /app/package*.json ./
RUN npm config set registry https://registry.npmjs.org/ && \
    npm install --only=production --network-timeout=100000

# Copy built application
COPY --from=builder /app/dist ./dist

EXPOSE 3000
ENV NODE_OPTIONS=--experimental-global-webcrypto

# Default command for production
CMD ["node", "dist/src/main.js"]
 