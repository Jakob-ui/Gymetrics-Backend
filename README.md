# Gymetrics Backend

Minimal NestJS backend for Gymetrics (user, auth, training, and template APIs).

## Quickstart

Requirements:
- Node.js (>= 20), npm
- Docker & Docker Compose

Install:
```sh
npm install
```

Run locally (development):
```sh
npm run start:dev
```

Or with Docker:
```sh
docker-compose up -d --build
```

Configuration via [.env](.env). Key variables: `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH`, `ROOT_USERNAME`, `ROOT_PASSWORD`.

Swagger (API docs) available at `/api` (see [src/main.ts](src/main.ts)).