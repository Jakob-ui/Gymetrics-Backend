# Gymetrics Backend

Minimales NestJS-Backend für Gymetrics (Benutzer-, Auth-, Trainings- und Template-APIs).

## Schnellstart

Voraussetzungen:
- Node.js (>= 20), npm
- Docker & Docker Compose

Installieren:
```sh
npm install
```

Lokal starten (Entwicklung):
```sh
npm run start:dev
```

Oder einfach mit Docker:
```sh
docker-compose up -d --build
```
Konfiguration über [.env](.env). Wichtige Variablen: `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH`, `ROOT_USERNAME`, `ROOT_PASSWORD`.

Swagger (API-Dokumentation) verfügbar unter `/api` (siehe [`src/main.ts`](src/main.ts)).