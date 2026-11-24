<p align="center">
  <img src="https://raw.githubusercontent.com/Jakob-ui/Gymetrics_App/main/shared/src/commonMain/composeResources/drawable/Gymetrics_Logo.png" width="96" alt="Gymetrics logo" />
</p>

<h1 align="center">Gymetrics Backend</h1>

<p align="center">
  The self-hosted server behind Gymetrics.<br/>
  REST API, database, gym scraper and a local AI agent, all started with one Docker Compose file.
</p>

<p align="center">
  <a href="https://github.com/Jakob-ui/Gymetrics_App">App repo</a> ·
  <a href="https://hub.docker.com/r/jakobl2/gymetrics">Docker Hub</a> ·
  <a href="https://gymetrics.at">gymetrics.at</a>
</p>

This repo is the backend. The mobile app (Kotlin Multiplatform, Android + iOS) lives in [Gymetrics_App](https://github.com/Jakob-ui/Gymetrics_App).


## Running it

You need Docker and Docker Compose. For the AI features you also need a running [Ollama](https://ollama.com) instance with a model that supports tool calling (see [Choosing a model](#choosing-a-model)). It doesn't have to be on the same machine.

The easiest way is the compose generator on [gymetrics.at](https://gymetrics.at), where you pick the services you want and get a ready `docker-compose.yml`. If you'd rather write it yourself:

1. Create a `.env` file and a `docker-compose.yml` (examples below).
2. Run `docker compose up -d`.
3. Open `http://<your-server>:3245/status`. If you see `"message": "Gymetrics backend here"`, it works.
4. Enter `http://<your-server>:3245` in the app and register.

The interactive API docs (Swagger) are at `http://<your-server>:3245/api`.

<details>
<summary><b>Example <code>.env</code></b></summary>

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
ENABLE_SCRAPER=true
SCRAPER_API_KEY=your-random-scraper-key

# AI / OLLAMA (set MODE=AI to enable AI templates in the app)
MODE=AI
OLLAMA_URL=http://your-ollama-host:11434
OLLAMA_MODEL=your-tool-capable-model
```

</details>

<details>
<summary><b>Example <code>docker-compose.yml</code></b></summary>

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
      - ENABLE_SCRAPER=${ENABLE_SCRAPER}
      - SCRAPER_API_KEY=${SCRAPER_API_KEY}
      - MODE=${MODE}
      - OLLAMA_URL=${OLLAMA_URL}
      - OLLAMA_MODEL=${OLLAMA_MODEL}
    ports:
      - 3245:3000
    depends_on:
      - mongodb
    networks:
      - mongodb_network
    restart: unless-stopped

  # keep this service name: the backend reaches the scraper at http://python-scraper:5000
  python-scraper:
    image: jakobl2/gymetrics-scraper:latest
    container_name: gymetrics-scraper
    environment:
      - SCRAPER_API_KEY=${SCRAPER_API_KEY}
    networks:
      - mongodb_network
    restart: always

  # optional
  mcp-server:
    image: jakobl2/TODO-mcp-image-name:latest  # TODO: put your Docker Hub image name here
    container_name: gymetrics-mcp
    environment:
      - BACKEND_URL=http://backend:3000
    ports:
      - 3001:3001
    depends_on:
      - backend
    networks:
      - mongodb_network
    restart: unless-stopped

networks:
  mongodb_network:
    driver: bridge
```

</details>


## What's in here

The backend is actually four services. Only the first two are required, the rest you can turn on if you want them.

| Service | Folder | Built with | What it does | Needed? |
|---|---|---|---|---|
| `backend` | [`backend/`](backend) | NestJS, TypeScript | REST API, auth, trainings, templates, AI agent | yes |
| `mongodb` | – | MongoDB 7 | stores everything | yes |
| `python-scraper` | [`scrapeService/`](scrapeService) | Python, Flask, BeautifulSoup | collects gyms and their equipment from the FitInn website | for gym selection and AI |
| `mcp-server` | [`mcpServer/`](mcpServer) | TypeScript, MCP SDK | lets MCP clients read your trainings and gym equipment | no |
| Ollama | not included | – | runs the language model | for AI templates |

## Why I built this

The backend is the older half of Gymetrics. I started it at the end of 2025 as a University project, months before the app. In my time building it I learned a lot: authentication with access and refresh tokens, a noSql database with mongoDB, validation, documentation and much more. Pretty quickly I also wanted it running on my own server and not just on my laptop, so Docker and a CI/CD pipeline came next.

After that, almost every bigger feature was an excuse to learn something new. My first addition was a scraper so the app knows which machines my gym actually has. Then I added a local LLM via Ollama and an MCP server, mostly because I wanted to understand how tool calling and the Model Context Protocol actually work.

## What it does

- **Accounts and auth.** Register, log in, refresh, validate. You get an access token (6 h) and a refresh token (31 days), signed with two different secrets.
- **Templates.** Create, edit and delete workout templates with exercises, sets, reps and weights. Search, sorting and pagination included.
- **AI templates.** Send your gym and an optional wish ("leg day, 45 minutes") and an LLM builds a template from your recent trainings and the equipment of your gym. Runs in the background, more on that [below](#the-ai-part).
- **Trainings.** Plan a training from a template on a specific day, log what you actually did, and get your next upcoming training or all trainings of a month. Every night at midnight a cron job marks trainings from past days as no longer active.
- **Gyms.** Countries, cities, gyms and the equipment of each gym, sorted by muscle group. The data comes from the scraper.
- **Server check.** `/status` returns a fixed message so the app can tell it's really talking to a Gymetrics backend (and not to anything that returns 200), plus whether AI mode is on, so the app knows whether to show the AI features.

<details>
<summary><b>All endpoints</b></summary>

Everything except `/`, `/status`, `/auth/register` and `/auth/login` needs an `Authorization: Bearer <token>` header (for `/auth/refresh` it's the refresh token). Request and response schemas are in Swagger under `/api`.

| Method | Route | What it does |
|---|---|---|
| GET | `/` and `/status` | health check, AI mode flag |
| POST | `/auth/register` | create an account |
| POST | `/auth/login` | get access + refresh token |
| POST | `/auth/refresh` | new tokens (send the refresh token) |
| GET | `/auth/validate` | is my access token still valid? |
| GET / PUT / DELETE | `/user` | your account |
| GET | `/user/profile` | profile data (height, weight, gym, ...) |
| GET / POST | `/templates` | list (search, sort, paging) / create |
| GET / PUT / DELETE | `/templates/:id` | one template |
| POST | `/templates/generate` | start AI generation |
| POST | `/training/create` | plan a training from a template |
| GET | `/training` | all trainings (filter by active, search, sort) |
| GET | `/training/nextTraining` | the next upcoming training |
| GET | `/training/monthlyTrainings` | trainings of a month (`year`, `month`) |
| GET / DELETE | `/training/:id` | one training |
| PUT | `/training/:id` | complete a training with the actual values |
| POST | `/training/:id` | update a single exercise |
| GET | `/studios` | countries |
| GET | `/studios/cities` | cities of a country |
| GET | `/studios/gyms` | gyms in a city |
| GET | `/studios/equipment` | equipment of a gym |

The MCP server listens on its own port (`3001`) at `POST /mcp` and has a `/health` route.

</details>

## Architecture

```mermaid
flowchart LR
    App["Gymetrics App"]
    Client["any MCP client"]

    subgraph Compose["docker compose"]
        API["backend<br/>NestJS · :3000"]
        DB[("mongodb")]
        Scraper["python-scraper<br/>Flask · :5000"]
        MCP["mcp-server<br/>:3001"]
    end

    Ollama["Ollama<br/>(own machine or container)"]
    FitInn["FitInn website"]

    App -- "REST + JWT" --> API
    API --> DB
    API -. "on start + 1st of every month" .-> Scraper
    Scraper -. "HTML" .-> FitInn
    API -. "chat + tool calls" .-> Ollama
    Client -. "MCP" .-> MCP
    MCP -. "REST, forwards your JWT" .-> API
```

The app only ever talks to the NestJS backend. In the example setup the scraper isn't exposed to the outside at all. It sits in the Docker network and only answers requests with the right API key. The MCP server doesn't have its own users: it simply forwards the token of whoever is calling it to the backend, so you only ever see your own data. (Yes, connecting your training data to an external AI client goes a bit against the whole self-hosted idea, but it was the best way to learn how MCP works.)

This is the diagram I drew while planning, with the data model:

![Gymetrics architecture and data model](./ressources/architecture_gymetrics.png)

### Project structure

Every NestJS module follows the same pattern: controller, service, Mongoose schema, and DTOs split into `Request`, `Response` and `Query` folders.

```
backend/src/
├── auth/                login, register, refresh, global guard, @Public() decorator
├── user/                account and profile data
├── trainingtemplates/   templates + AI generation
├── training/            planned and completed trainings, nightly cron job
├── studios/             read access to the scraped gym data
├── scraper/             calls the Python service, stores the result (monthly cron job)
├── agent-tools/         the tools the LLM is allowed to call
└── ollama/              small client for the Ollama chat API
scrapeService/           Python scraper for FitInn (Flask + Gunicorn)
mcpServer/               MCP server (Streamable HTTP)
ressources/              architecture diagram
```

## The AI part

```mermaid
sequenceDiagram
    participant App
    participant API as Backend
    participant DB as MongoDB
    participant LLM as Ollama

    App->>API: POST /templates/generate (gym, wish)
    API->>DB: save placeholder template (status: generating)
    API-->>App: placeholder
    Note over App: checks every 3 s until the status changes

    loop up to 5 rounds, until the model stops calling tools
        API->>LLM: chat (messages + tools)
        LLM-->>API: tool call
        API->>DB: getRecentTrainings / getEquipment
    end

    API->>LLM: final call with the template's JSON schema
    LLM-->>API: template as JSON
    API->>API: validate it like a normal template
    API->>DB: update (status: ready or failed)
```

Small local models are slow, especially on old hardware, and the app has a 10 second request timeout. So the backend doesn't make the app wait. It saves an empty template with the status `generating`, answers right away, and does the actual work in the background.

The model doesn't get your data up front. It gets two tools and decides itself when to use them: `getRecentTrainings` loads your trainings and `getEquipment` loads the machines of your gym. The system prompt tells it to only pick exercises your gym has the equipment for. After at most five rounds of tool calls, there's one last call where Ollama has to answer in the exact JSON schema of a template. The result then goes through the same validation as a template you create by hand. If the model returns something broken, the template is marked as `failed` instead of ending up half-filled in your list.

### Choosing a model

`OLLAMA_MODEL` **must** point to a model that supports **tool calling**, because the backend always sends a `tools` array. Not every Ollama model can do that. You can check a model's capabilities via:

```bash
curl http://<OLLAMA_URL>/api/tags
```

Look for `"tools"` in the `capabilities` array. Models without it (e.g. `gemma3`) fail immediately with a `400` on `/api/chat`:

```
{"error":"registry.ollama.ai/library/gemma3:latest does not support tools"}
```

These are the most popular models per category, kept to a size that's manageable for self-hosting (≤8B). Checked against the `tools` capability on [ollama.com/library](https://ollama.com/library) (as of 2026-09). This can change with model updates, so check `/api/tags` yourself if in doubt.

| tested | may work | definitely don't work |
|---|---|---|
| `llama3.1:8b` | `qwen2.5:0.5b` | `gemma3` |
| `ministral-3:3b` | `deepseek-r1:7b` | `phi4` |
| `qwen2.5:7b` | `granite3.1-dense:2b` | `llama2` |

On my own server I run `ministral-3:3b` in a separate Ollama container.
<!-- TODO: check if that's still true -->

## Decisions I made and why

<!-- TODO: The reasons for NestJS, MongoDB and Python are guesses. Replace them with your real ones. -->

I picked NestJS because it gives you a clear structure out of the box: modules, controllers, services and dependency injection. That made it easy to stay consistent, because every new feature looks like the one before.

For the database I went with MongoDB. A template or a training is basically one document with a list of exercises in it, so that felt natural at the start. In hindsight, comparing exercises across many trainings and building statistics would be easier with a relational database (see below).

The scraper is written in Python and runs as its own service, because Requests and BeautifulSoup make scraping much easier than doing it in Node. Every month the old gym data gets replaced completely with the new result. The data set is small, so that's simpler than working out what changed.

### Security

- **Protected by default.** The auth guard is registered globally, so every route needs a valid token. Routes that should be public have to be marked with `@Public()` explicitly. That way, forgetting something means a route is locked, not that it's open.
- **Refresh tokens are only stored as a hash.** If someone gets a copy of the database, they can't use the tokens in it. Since bcrypt only looks at the first 72 bytes and the beginning of a JWT is the same for every token of a user, the token is hashed with SHA-256 first. Otherwise bcrypt would see all refresh tokens of a user as the same one, and an old token would still work.
- **Strict validation.** Every request body and query parameter is validated with DTOs, and unknown fields are rejected, not just ignored. This came out of a code review where someone pointed out that my pagination parameters weren't checked at all.
- **The scraper is only reachable inside the Docker network** and only with the API key.

### Optional features

The scraper and AI are switched on with environment variables (`ENABLE_SCRAPER`, `MODE=AI`). Without them the backend runs as a normal workout tracker. The app reads the AI flag from `/status` and only shows the AI settings when it's on.

## Tech stack

#### Backend
* NestJS 11, TypeScript
* MongoDB 7 with Mongoose
* Passport + JWT, bcrypt
* class-validator, Swagger (OpenAPI)
* `@nestjs/schedule` for the cron jobs

#### Scraper
* Python 3.11, Flask, Gunicorn
* Requests, BeautifulSoup

#### AI
* Ollama (tool calling + structured output)
* MCP TypeScript SDK (Streamable HTTP)

#### Deployment and CI
* Docker and Docker Compose, images on Docker Hub
* GitHub Actions on every pull request into `main`: lint and build the NestJS app, compile check for the scraper, spell check for all Markdown files
* GitHub Actions on every push to `main`: build all three images and push them to Docker Hub

## What I'd do differently

<!-- TODO: These are things I noticed in the code. Keep the ones you agree with and say them your way. -->

If I would build this backend again I would do some things differently:
* `getRecentTrainings` only returns the trainings of the current month, so on the 1st the AI knows almost nothing about you. It should just take the last few completed trainings.
* The tool-calling loop exists twice (in `ollama.service.ts` and in `trainingtemplates.service.ts`). One version is enough.
* The nightly cron job loads every training of every user and saves them one by one. A single `updateMany` would do the same.
* The backend connects to MongoDB as the root user. A separate user that can only access the Gymetrics database would be cleaner.
* The CI lints and builds, but the spec files are still the generated stubs, so there are no real tests yet.
* The scraper depends on how the FitInn website looks. If they redesign it, it breaks.

## What's next/Features I want to add (let's see)

* Statistics across trainings
* An admin panel to manage the instance and its users
* Support for more gym chains
* Gym-specific hints for the AI (e.g. preferring the women's area at gyms that have one)
* Invalidating JWTs on logout (blacklist)
* Icons for templates
* An easier way to move a training to another day

## Branding

The Gymetrics name and logo are not covered by the software license and may not be used to promote derivative projects without permission.

## License

<!-- TODO: This repo doesn't have a LICENSE file yet. Add the same Apache 2.0 file as in the app repo
     (and change "license" in backend/package.json from "UNLICENSED" to "Apache-2.0"). -->
This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.