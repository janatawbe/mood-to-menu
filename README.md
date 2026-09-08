# Mood-to-Menu

Mood-to-Menu is an AI culinary companion. Once complete, it will let a user describe how
they're feeling, analyze that mood with the Gemini API, and recommend meals that match the
vibe — along with ingredients, reasoning, and cooking instructions.

**This repository is currently at Milestone 0: Project Foundation & Architecture.** No mood
analysis, AI integration, or recipe features exist yet — see [Milestone 0 Status](#milestone-0-status)
below for exactly what's implemented.

## Architecture

```
React Frontend  →  /api/*  →  Express Backend  →  Gemini API (future milestone)
```

- The browser only ever talks to the Express backend, via same-origin `/api/*` requests.
- In development, Vite proxies `/api/*` to the Express server so the frontend never
  hardcodes a backend URL.
- The Gemini API key will live server-side only when it's introduced in a later milestone —
  the browser will never call Gemini directly.

## Technology Stack

**Frontend**

- React + Vite + TypeScript
- Tailwind CSS
- Motion (Framer Motion)
- Zod (runtime validation)

**Backend**

- Node.js + Express + TypeScript
- Zod (runtime validation)

**Tooling**

- ESLint + Prettier
- npm workspaces + `concurrently` for a single-command dev environment

## Project Structure

```
mood-to-menu/
├── client/                  # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/      # (empty for now — reusable UI components)
│   │   ├── features/        # (empty for now — feature-scoped modules)
│   │   ├── hooks/           # (empty for now — custom React hooks)
│   │   ├── lib/             # (empty for now — general utilities)
│   │   ├── services/        # api.ts — typed fetch wrapper for the backend
│   │   ├── types/           # domain.ts — Mood, Ingredient, Recipe, TastePreferences
│   │   ├── App.tsx          # temporary API health-check verification screen
│   │   └── main.tsx
│   └── .env.example
│
├── server/                  # Express + TypeScript backend
│   ├── src/
│   │   ├── config/          # env.ts — environment variable loading
│   │   ├── middleware/      # notFound.ts, errorHandler.ts
│   │   ├── routes/          # health.ts — GET /api/health
│   │   ├── services/        # (empty for now — e.g. future Gemini service)
│   │   ├── types/           # domain.ts — Mood, Ingredient, Recipe, TastePreferences
│   │   └── index.ts         # Express app entry point
│   └── .env.example
│
├── package.json             # npm workspaces root — dev/build/lint/typecheck scripts
└── README.md
```

**Note on shared types:** `client/src/types/domain.ts` and `server/src/types/domain.ts`
currently hold identical domain types (`Mood`, `Ingredient`, `Recipe`, `TastePreferences`).
They're intentionally duplicated rather than pulled from a shared package — a shared
workspace package would need its own build/type-emit step for `tsc` to consume from the
server, which is more tooling than four small interfaces justify at this stage. If the type
surface grows in a later milestone, this is the natural point to introduce a `shared/`
workspace package.

## Prerequisites

- Node.js 20+ (developed against Node 22)
- npm 10+

## Installation

From the repository root (this project uses npm workspaces, so one install covers both
`client` and `server`):

```bash
npm install
```

## Environment Variables

Copy the example env file and fill in values as needed:

```bash
cp server/.env.example server/.env
```

`server/.env`:

```env
PORT=3001
GEMINI_API_KEY=
```

- `PORT` — port the Express server listens on (defaults to `3001` if unset).
- `GEMINI_API_KEY` — reserved for a later milestone. Leave empty for now; do not commit a
  real key. It is only ever read on the server.

The client has no environment variables of its own yet (see `client/.env.example`) — it
talks to the backend through the relative `/api` path.

## Development

Run both the frontend and backend together:

```bash
npm run dev
```

- Frontend (Vite): http://localhost:5173
- Backend (Express): http://localhost:3001
- The frontend's `/api/*` requests are proxied to the backend automatically.

Run them individually if needed:

```bash
npm run dev:client
npm run dev:server
```

## Other Commands

```bash
npm run build       # type-checks and builds both client and server for production
npm run typecheck   # runs the TypeScript compiler (no emit) for both workspaces
npm run lint         # runs ESLint for both workspaces
npm run format       # formats the repo with Prettier
npm run format:check # checks formatting without writing changes
```

## Docker

The app can also be run as two containers — an Nginx-served frontend and an Express
backend — via Docker Compose. This is purely a deployment/setup convenience; it does not
replace normal local development (`npm run dev` above still works exactly as before).

```
Browser → http://localhost:8080 → Nginx (client container) → /api/* → server:3001 (backend container) → Gemini API
```

Nginx serves the built React app and proxies any `/api/*` request to the backend
container over Docker's internal network — the browser only ever talks to one origin
(`localhost:8080`), the same relative-`/api`-path pattern the app already uses in dev.

**Prerequisites**

- Docker Desktop (Docker Engine + Compose v2 — the `docker compose` subcommand, not the
  legacy standalone `docker-compose`)

**Environment**

Docker reads the same `server/.env` file normal local development uses — create it if you
haven't already:

```bash
cp server/.env.example server/.env
```

Fill in `GEMINI_API_KEY` (and `GEMINI_MODEL` if you want to override the default model).
This file is never copied into an image — Compose loads it into the `server` container's
environment at startup only, so the key never gets baked into a build.

**Run**

```bash
docker compose up --build
```

Then open:

```
http://localhost:8080
```

**Stop**

```bash
docker compose down
```

**Rebuild** (after dependency or code changes)

```bash
docker compose up --build
```

**Logs**

```bash
docker compose logs -f
```

**Notes**

- The frontend is served entirely by Nginx (static files) — the Vite dev server never
  runs in the Docker image.
- `/api/*` is proxied by Nginx to the Express container; the backend container does not
  publish a port to the host, since nothing outside the Nginx container needs to reach it
  directly.
- The Gemini API key is supplied at container runtime only, via `server/.env` — it is
  never present in a Dockerfile, `docker-compose.yml`, or a built image layer.
- `GET /api/health` (already used by the app) doubles as the backend's Docker
  healthcheck; the client container waits for it to report healthy before starting.

## Milestone 0 Status

Implemented:

- React + Vite + TypeScript frontend scaffold, with unused Vite demo content removed.
- Express + TypeScript backend scaffold with a clean structure for future config,
  middleware, routes, and services.
- Tailwind CSS configured and working.
- Motion and Zod installed and ready for later milestones (not yet used for animations or
  schema validation beyond a minimal health-check response).
- `GET /api/health` implemented on the backend, returning `{ "status": "ok" }`.
- Vite dev proxy forwards `/api/*` to the Express backend — no hardcoded backend URL in the
  frontend.
- A temporary, minimally styled screen that calls `/api/health` on load and displays
  "API Status: Connected" or "Disconnected" — this verifies the frontend and backend can
  communicate. It is not the real Mood-to-Menu interface.
- Initial domain types for `Mood`, `Ingredient`, `Recipe`, and `TastePreferences`.
- `.env.example` files for both client and server; real `.env` files and other secrets are
  git-ignored. No Gemini API key exists anywhere in this repository.
- ESLint + Prettier configured for both workspaces.
- Root-level `npm run dev` / `build` / `lint` / `typecheck` scripts.

Not implemented (intentionally out of scope for Milestone 0):

- Gemini API integration, mood analysis, or AI prompts.
- Recipe generation, recipe cards, or recipe images.
- The real Mood Entrance / Vibe Check UI, mood cards, dynamic mood colors, or chef mascot.
- Grocery list, favorites, recipe history, or taste memory.
- `localStorage` persistence.
- Polished animations or final responsive design.

These belong to later milestones.
