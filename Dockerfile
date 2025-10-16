# Use Node.js LTS version
FROM node:22-slim

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y python3 make g++ curl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Configure npm and install dependencies with retries
RUN npm config set fetch-timeout 600000 && \
    npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retries 5 && \
    npm install --no-audit --no-fund || npm install --no-audit --no-fund

# Copy application files
COPY . .

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 9000

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
