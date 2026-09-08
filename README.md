# Mood-to-Menu

An AI-powered culinary companion that turns mood, cravings, and personal taste
preferences into personalized meal ideas — mood in, a real recipe out, with reasoning,
ingredients, and cooking instructions.

## Features

- **Vibe Check** — pick a mood, add free text, or use quick prompts to describe how
  you're feeling
- **Dynamic mood-based interface** — the app's colors, ambient background, and chef
  reactions shift with the selected mood
- **Gemini-powered recipe generation** — a personalized, cookable recipe with reasoning
  tied to your mood and request
- **Today's Menu** — the full recipe reveal: ingredients, instructions, prep time, and a
  chef's tip
- **Nutritional Facts** — an AI-estimated, per-serving nutrition breakdown
- **Grocery List** — add ingredients straight from a recipe, check them off, and clear
  completed/all items
- **Grocery List meal filtering & search** — filter the list down to one recipe's
  ingredients via a searchable picker
- **Taste Memory** — save comfort foods, liked/disliked ingredients, and dietary
  preferences that influence future recipes
- **Favorites** — save recipes to revisit later, with search and mood filtering
- **Recipe History** — a chronological record of every recipe you've generated
- **Chef personality & delight** — a sidebar chef mascot with contextual messages,
  loading-state personality, and subtle success/favorite feedback
- **Persistent local storage** — Favorites, Recipe History, Grocery List, and Taste
  Memory all persist across sessions in the browser
- **Responsive & accessible** — works down to mobile widths, with keyboard-navigable
  custom dropdowns, visible focus states, and full `prefers-reduced-motion` support
- **Docker support** — run the whole app with one command via Docker Compose

## Tech Stack

**Frontend**

- React
- TypeScript
- Vite
- Tailwind CSS
- Motion (Framer Motion)
- Zod (runtime validation)

**Backend**

- Node.js
- Express
- TypeScript
- Zod (runtime validation)
- Google Gemini via `@google/genai`

**Infrastructure**

- Docker
- Docker Compose
- Nginx

**Testing & Tooling**

- Vitest
- React Testing Library
- ESLint + Prettier
- npm workspaces + `concurrently`

## Architecture

```
Browser → React frontend → /api/* → Express backend → Gemini API
```

- The browser only ever talks to one origin, via same-origin `/api/*` requests — it
  never calls Gemini directly and never sees the API key.
- **Local development:** Vite's dev server proxies `/api/*` to the Express backend.
- **Docker/production:** Nginx serves the built frontend and proxies `/api/*` to the
  Express container over Docker's internal network (see [Docker](#docker) below).

## Project Structure

```
mood-to-menu/
├── client/
│   └── src/
│       ├── components/   # Shared UI primitives (Button, Card, icons, ...)
│       ├── features/     # Screens and feature-specific components, by domain
│       ├── hooks/        # Shared state hooks (useFavorites, useGroceryList, ...)
│       ├── lib/          # Storage, search/filter, and other pure utilities
│       ├── schemas/      # Client-side Zod validation
│       ├── services/     # Backend API client
│       └── types/        # Shared domain types
│
├── server/
│   └── src/
│       ├── config/       # Environment variable loading/validation
│       ├── middleware/   # Express error/404 handling
│       ├── routes/       # /api/health, /api/recipes/generate
│       ├── schemas/      # Request/response Zod validation
│       ├── services/     # Gemini prompt, client, and recipe generation
│       └── types/        # Shared domain types
│
├── docker-compose.yml
├── client/Dockerfile
├── server/Dockerfile
└── package.json          # npm workspaces root — dev/build/lint/typecheck scripts
```

## Local Development

**Prerequisites**

- Node.js 20+ (developed against Node 22)
- npm 10+

**Install** (from the repository root — npm workspaces cover both `client` and `server`
with one install):

```bash
npm install
```

**Environment**

```bash
cp server/.env.example server/.env
```

Then fill in `server/.env`:

```env
PORT=3001
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=
```

- `GEMINI_API_KEY` is required — the server fails fast at startup without it.
- `GEMINI_MODEL` is optional; it overrides the default Gemini model.
- The client has no environment variables of its own — it talks to the backend through
  the relative `/api` path.

**Run**

```bash
npm run dev
```

- Frontend (Vite): http://localhost:5173
- Backend (Express): http://localhost:3001
- The frontend's `/api/*` requests are proxied to the backend automatically.

Or run them individually:

```bash
npm run dev:client
npm run dev:server
```

## Docker

The app can also be run as two containers — an Nginx-served frontend and an Express
backend — via Docker Compose. This is a deployment/setup convenience; it does not
replace local development (`npm run dev` above still works exactly as before).

**Prerequisites**

- Docker Desktop (Docker Engine + Compose v2 — the `docker compose` subcommand)

**Environment**

Docker reads the same `server/.env` file local development uses — create it first if
you haven't (see [Local Development](#local-development) above).

**Run**

```bash
docker compose up --build -d
```

Then open:

```
http://localhost:8080
```

Health check (through Nginx to Express):

```
http://localhost:8080/api/health
```

**Logs**

```bash
docker compose logs -f
```

**Stop**

```bash
docker compose down
```

**Notes**

- The frontend is served entirely by Nginx (static files) — the Vite dev server never
  runs in the Docker image.
- `/api/*` is proxied by Nginx to the Express container; the backend container does not
  publish a port to the host.
- The Gemini API key is supplied at container runtime only, via `server/.env` — it is
  never present in a Dockerfile, `docker-compose.yml`, or a built image layer.

## Testing & Quality Checks

```bash
npm run test         # runs server and client test suites (Vitest + React Testing Library)
npm run typecheck    # runs the TypeScript compiler (no emit) for both workspaces
npm run lint         # runs ESLint for both workspaces
npm run build        # type-checks and builds both client and server for production
```

To run a single workspace, add `--workspace=client` or `--workspace=server` to any of
the above.

## Environment & Security

- The Gemini API key lives server-side only — the frontend never receives it and never
  calls Gemini directly.
- All Gemini requests go through the Express backend, which validates every request and
  response with Zod before it reaches the client.
- `server/.env` is git-ignored and is never baked into a Docker image.

## Data Storage

Favorites, Recipe History, Grocery List, and Taste Memory are all stored locally in the
browser via versioned `localStorage` keys — there is no backend database or user
account system. Clearing browser storage clears this data.

## AI-Generated Content

Recipes, reasoning, and nutritional information are generated by an AI model and are
estimates, not verified facts. Nutritional values are approximate. Always use your own
judgment for dietary restrictions, allergies, or medical needs.
