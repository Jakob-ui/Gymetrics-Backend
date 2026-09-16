# Gymetrics Backend

Self-hosted fitness Tracker + AI assistant. For the frontend Application go to: [Gymetrics_App](https://github.com/Jakob-ui/Gymetrics_App)

## Quickstart

Requirements:
- Docker & Docker Compose

System Architecture
![Picture of System Architecture](./ressources/architecture_gymetrics.png)

## Docker Compose example Configuration

**Tip:** Build your own docker-compose on [gymetrics.at](https://gymetrics.at)

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

# AI / OLLAMA
OLLAMA_URL=http://your-ollama-host:11434
OLLAMA_MODEL=your-tool-capable-model

```

## AI Template Generation (using Ollama)

`OLLAMA_MODEL` **MUST** point to a model that supports **tool/function calling**, since
the AI agent (`trainingtemplates.service.ts` → `generateWithAi`) always sends a
`tools` array (`getRecentTrainings`, `getEquipment`) so the model can fetch training
history and studio equipment itself before generating a plan.

Not every Ollama model supports this. Check a model's capabilities via:

```bash
curl http://<OLLAMA_URL>/api/tags
```

Look for `"tools"` in the `capabilities` array. Models without it (e.g. `gemma3`)
fail immediately with a `400` on `/api/chat`:

```
{"error":"registry.ollama.ai/library/gemma3:latest does not support tools"}
```

### Model compatibility

Most popular models per category, kept to a manageable size (≤8B) for self-hosting.
Checked against the `tools` capability on [ollama.com/library](https://ollama.com)
(as of 2026-09) — this can change with model updates, so check `/api/tags` yourself
if in doubt.

| tested | may work | definitely don't work |
|---|---|---|
| `llama3.1:8b` | `qwen2.5:0.5b` | `gemma3` |
| `ministral-3:3b` | `deepseek-r1:7b`  | `phi4` |
| `qwen2.5:7b` | `granite3.1-dense:2b` | `llama2` |

## API Documentation

Interactive API docs available at:
- **Swagger UI:** `http://localhost:3000/api`
- **Backend API:** `http://localhost:3000`