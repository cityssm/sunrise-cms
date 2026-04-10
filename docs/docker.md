# Docker Support for Sunrise CMS

This directory contains Docker configuration files for running Sunrise CMS in a container.

## Files

- **Dockerfile**: Multi-stage Docker image definition for Sunrise CMS
- **docker-compose.yml**: Docker Compose configuration for easy local development
- **.dockerignore**: Files to exclude from the Docker build context

## Quick Start

### Using Docker Compose

1. Build and start the container:
   ```bash
   docker-compose up -d
   ```

2. Access the application at http://localhost:9000

3. Stop the container:
   ```bash
   docker-compose down
   ```

### Using Docker Directly

1. Build the image:
   ```bash
   docker build -t sunrise-cms:latest .
   ```

2. Run the container:
   ```bash
   docker run -d \
     --name sunrise-cms \
     -p 9000:9000 \
     -v $(pwd)/data:/app/data \
     -e NODE_ENV=development \
     -e DEBUG=sunrise:* \
     -e TEST_DATABASES=true \
     sunrise-cms:latest
   ```

3. Stop and remove the container:
   ```bash
   docker stop sunrise-cms
   docker rm sunrise-cms
   ```

## GitHub Actions Testing

The Docker container is automatically tested via GitHub Actions in the `docker-test.yml` workflow.

The test:
1. Builds the Docker image
2. Starts the container
3. Waits for the application to be ready
4. Runs a Cypress test against the containerized application
5. Shuts down the container

This ensures the Docker configuration stays functional with each change.

## Notes

- The application requires Node.js 22 or higher
- Native modules (like better-sqlite3) are compiled during the Docker build
- Build dependencies (python3, make, g++) are included for native module compilation
- The container uses the test database configuration when TEST_DATABASES=true
