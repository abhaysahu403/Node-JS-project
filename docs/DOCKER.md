# Cloud Nexus HR Platform - Docker Setup Guide

## 🐳 Docker Overview

Docker enables consistent application deployment across different environments by containerizing applications and their dependencies.

## Docker Architecture

```
┌─────────────────────────────────────────────┐
│         Host Machine (Your Computer)        │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │    Docker Engine / Daemon           │   │
│  │                                     │   │
│  │ ┌──────────┐ ┌──────────┐ ┌───────┐│   │
│  │ │ Frontend │ │ Backend  │ │ MySQL ││   │
│  │ │Container │ │Container │ │       ││   │
│  │ └──────────┘ └──────────┘ └───────┘│   │
│  │      (Connected via Docker Network)│   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Installation

### Docker Desktop Installation

#### Windows
1. Download [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
2. Run installer and follow instructions
3. Enable WSL 2 if prompted
4. Restart computer
5. Verify: `docker --version`

#### macOS
1. Download [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
2. Install as you would any other macOS app
3. Open Docker and go through setup
4. Verify: `docker --version`

#### Linux (Ubuntu)
```bash
# Update system
sudo apt-get update

# Install Docker
sudo apt-get install docker.io

# Start Docker service
sudo systemctl start docker

# Add user to docker group (optional)
sudo usermod -aG docker $USER

# Verify
docker --version
```

### Docker Compose Installation

Usually comes with Docker Desktop. Verify:
```bash
docker-compose --version
```

If not installed on Linux:
```bash
sudo apt-get install docker-compose
```

## Project Dockerfiles

### Frontend Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/build ./build
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1
CMD ["serve", "-s", "build", "-l", "3000"]
```

**Key Points:**
- Multi-stage build (reduces final image size)
- Alpine Linux (lightweight)
- Serve for production
- Health checks enabled

### Backend Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
CMD ["node", "server.js"]
```

**Key Points:**
- Production npm install (no dev dependencies)
- Custom health check endpoint
- Proper error handling

## Docker Compose Configuration

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0-alpine
    container_name: cloud-nexus-mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    ports:
      - "${DB_PORT}:3306"
    volumes:
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
      - mysql_data:/var/lib/mysql
    networks:
      - cloud_nexus_network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: cloud-nexus-backend
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
    ports:
      - "${BACKEND_PORT}:5000"
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - cloud_nexus_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: cloud-nexus-frontend
    environment:
      REACT_APP_API_URL: ${REACT_APP_API_URL}
    ports:
      - "${FRONTEND_PORT}:3000"
    depends_on:
      - backend
    networks:
      - cloud_nexus_network

networks:
  cloud_nexus_network:
    driver: bridge

volumes:
  mysql_data:
    driver: local
```

## Docker Compose Commands

### Startup & Shutdown

```bash
# Build and start all services
docker-compose up --build

# Start services in background
docker-compose up -d --build

# Start without rebuilding
docker-compose up

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop and remove all data
docker-compose down -v --remove-orphans
```

### Service Management

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs frontend

# Follow logs (live)
docker-compose logs -f backend

# View logs with timestamps
docker-compose logs --timestamps

# Restart service
docker-compose restart backend

# Stop specific service
docker-compose stop mysql

# Start stopped service
docker-compose start mysql
```

### Debugging & Inspection

```bash
# Execute command in running container
docker-compose exec backend npm list

# Open shell in container
docker-compose exec backend sh

# MySQL CLI in container
docker-compose exec mysql mysql -u root -p cloud_nexus_hr

# View container details
docker-compose inspect frontend

# View resource usage
docker stats
```

## Image Management

```bash
# List local images
docker images

# Remove image
docker rmi image-name

# Remove unused images
docker image prune

# Remove dangling images
docker image prune -a

# Tag image
docker tag old-name new-name:version

# Push image to registry
docker push registry/image-name:tag
```

### Building Images Manually

```bash
# Build backend image
cd backend
docker build -t cloud-nexus-backend:latest .

# Build frontend image
cd frontend
docker build -t cloud-nexus-frontend:latest .

# Build with specific tag
docker build -t cloud-nexus-backend:v1.0.0 .

# View build history
docker history cloud-nexus-backend
```

## Container Management

```bash
# List all containers
docker ps -a

# Stop container
docker stop container-id

# Start container
docker start container-id

# Remove container
docker rm container-id

# View container logs
docker logs container-id

# View container details
docker inspect container-id

# Copy files from container
docker cp container-id:/path/to/file ./local/path

# Copy files to container
docker cp ./local/file container-id:/path/to/
```

## Networking

### Docker Network Types

1. **Bridge** (default)
   - Containers communicate via IP addresses
   - Used by docker-compose
   - Requires port mapping for external access

2. **Host**
   - Container uses host network
   - Good for performance
   - Port conflicts possible

3. **Overlay**
   - For Docker Swarm
   - Multi-host networking

### Networking Commands

```bash
# List networks
docker network ls

# Create network
docker network create my-network

# Connect container to network
docker network connect network-name container-id

# Inspect network
docker network inspect cloud_nexus_network

# Remove network
docker network rm network-name

# Test connectivity between containers
docker exec container-id ping other-container-name
```

## Volume Management

### Types of Volumes

1. **Named Volumes** (Recommended)
   ```yaml
   volumes:
     mysql_data:
       driver: local
   ```

2. **Bind Mounts**
   ```yaml
   volumes:
     - ./database:/data
   ```

3. **Anonymous Volumes**
   ```yaml
   volumes:
     - /app/node_modules
   ```

### Volume Commands

```bash
# List volumes
docker volume ls

# Create volume
docker volume create my-volume

# Inspect volume
docker volume inspect mysql_data

# Remove volume
docker volume rm my-volume

# Remove unused volumes
docker volume prune

# Backup volume
docker run --rm -v mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data

# Restore volume
docker run --rm -v mysql_data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /
```

## Best Practices

### Security
1. Use specific image tags (not `latest`)
2. Use minimal base images (Alpine Linux)
3. Don't run containers as root
4. Use secrets for sensitive data
5. Scan images for vulnerabilities

### Performance
1. Multi-stage builds to reduce size
2. Use `.dockerignore` to exclude files
3. Cache layers efficiently
4. Minimize layer count
5. Clean up unused images/volumes

### Maintenance
1. Use docker-compose for multi-container
2. Use meaningful container names
3. Document all environment variables
4. Use health checks
5. Monitor resource usage

### .dockerignore

```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
.DS_Store
dist/
build/
```

## Troubleshooting

### Common Issues

**Issue: Container exits immediately**
```bash
# Check logs
docker logs container-id

# Check container health
docker ps -a

# Inspect container
docker inspect container-id
```

**Issue: Port already in use**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port in docker-compose
ports:
  - "3001:3000"
```

**Issue: Out of disk space**
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Clean up everything
docker system prune -a
```

**Issue: Network connectivity**
```bash
# Check network
docker network ls

# Inspect network
docker network inspect cloud_nexus_network

# Verify DNS resolution
docker exec container-id nslookup service-name
```

## Docker Hub & Registries

### Login to Docker Hub
```bash
docker login
# Enter username and password
```

### Push Image to Docker Hub
```bash
# Tag image
docker tag local-image:tag username/repository:tag

# Push image
docker push username/repository:tag
```

### Pull Image from Registry
```bash
docker pull registry-url/image-name:tag
```

## Monitoring & Logging

### View Resource Usage
```bash
# Real-time statistics
docker stats

# Container process stats
docker top container-id

# Inspect resource limits
docker inspect container-id | grep -A 10 "HostConfig"
```

### Logging Options
```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Advanced Topics

### Docker Compose Overrides
```bash
# Use override file for development
docker-compose -f docker-compose.yml -f docker-compose.override.yml up
```

### Environment Variable Files
```bash
# Use env file
docker-compose --env-file .env.production up
```

### Build Arguments
```bash
# Pass build args
docker-compose build --build-arg BUILD_ENV=production
```

---

For more information, visit [Docker Official Documentation](https://docs.docker.com/)
