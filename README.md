# Gymetrics Backend

Self-hosted fitness Tracker + AI assistant.

## Quickstart

Requirements:
- Docker & Docker Compose

System Architecture
![Picture of System Architecture](./ressources/architecture_gymetrics.png)

## Docker Compose example Configuration

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0.40
    container_name: gymetrics-mongo
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${DATABASE_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${DATABASE_ROOT_PASSWORD}
      - APP_USERNAME=${APP_USERNAME}
      - APP_PASSWORD=${APP_PASSWORD}
      - APP_DATABASE=${APP_DATABASE}
    volumes:
      - ${DATA_PATH}:/data/db
      - ./backend/mongo-init.sh:/docker-entrypoint-initdb.d/mongo-init.sh:ro
    restart: always
    networks:
      - mongodb_network

  backend:
    build: 
      context: ./backend
    container_name: gymetrics-backend
    environment:
      - MONGODB_URI=mongodb://${APP_USERNAME}:${APP_PASSWORD}@mongodb:27017/${APP_DATABASE}?authSource=${APP_DATABASE}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH=${JWT_REFRESH}
      - LOG_LEVEL=error
    ports:
      - 3000:3000
    expose:
      - 3000
    depends_on:
      - mongodb
    networks:
      - mongodb_network
    restart: always

  python-scraper:
    build: 
      context: ./scrapeService
    container_name: gymetrics-scraper
    environment:
      - SCRAPER_API_KEY=${SCRAPER_API_KEY}
    expose:
      - 5000
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

APP_USERNAME=gymetrics_user
APP_PASSWORD=change-this-secure-password

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