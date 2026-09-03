# Gymetrics Backend

Self-hosted fitness Tracker + AI assistant.

## Quickstart

Requirements:
- Docker & Docker Compose

System Architecture
![Picture of System Architecture](./ressources/architecture_gymetrics.png)

## Docker Compose example Configuration

```yaml
services:
  mongodb:
    image: mongo:7.0.40
    container_name: gymetrics-mongo
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${DATABASE_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${DATABASE_ROOT_PASSWORD}
    volumes:
      - ${DATA_PATH}:/data/db
    restart: unless-stopped
    networks:
      - mongodb_network

  backend:
    image: jakobl2/gymetrics:latest
    container_name: gymetrics-backend
    environment:
      - MONGODB_URI=mongodb://${DATABASE_ROOT_USERNAME}:${DATABASE_ROOT_PASSWORD}@mongodb:27017/${APP_DATABASE}?authSource=admin
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH=${JWT_REFRESH}
      - SCRAPER_API_KEY=${SCRAPER_API_KEY}
    ports:
      - 3245:3000
    depends_on:
      - mongodb
    networks:
      - mongodb_network
    restart: unless-stopped

  python-scraper:
    image: jakobl2/gymetrics-scraper:latest
    container_name: gymetrics-scraper
    environment:
      - SCRAPER_API_KEY=${SCRAPER_API_KEY}
    networks:
      - mongodb_network
    restart: always

networks:
  mongodb_network:
    driver: bridge
```

## Environment Configuration

Create `.env` from this template:

```bash
# DATA STORAGE PATH
DATA_PATH=/opt/gymetrics/data

# DATABASE CONFIGURATION
DATABASE_ROOT_USERNAME=admin
DATABASE_ROOT_PASSWORD=change-this-secure-password

APP_DATABASE=gymetrics

# AUTHENTICATION
JWT_SECRET=your-random-jwt-secret-key
JWT_REFRESH=your-random-refresh-token-key

# SCRAPER
SCRAPER_API_KEY=your-random-scraper-key
```

## API Documentation

Interactive API docs available at:
- **Swagger UI:** `http://localhost:3000/api`
- **Backend API:** `http://localhost:3000`