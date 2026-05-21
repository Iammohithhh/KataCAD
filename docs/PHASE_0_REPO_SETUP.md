# PHASE 0 — Project Skeleton and Infrastructure

> **Read `CLAUDE.md` at the repo root before reading this file.** That document is the project context. This document is the Phase 0 build brief.

---

## Phase goal

Stand up the monorepo, the deployment configurations, and the local developer loop so that every subsequent phase has a working "edit → run → see result" cycle. No product functionality is built in this phase. The phase is complete when a developer can clone the repo, run one command, and have a placeholder web app talking to a placeholder API in under five minutes.

**No CAD, no AI, no 3D viewport in this phase.** Those are Phase 1 and later. Anyone tempted to start on them here should re-read this paragraph.

---

## Prerequisites

The user should have the following installed locally. If any of these are missing, stop and ask before proceeding.

- Node.js 20.x LTS (`node --version` should print `v20.*`)
- pnpm 9.x (`pnpm --version` should print `9.*`)
- Python 3.11 (`python3.11 --version` should print `3.11.*`)
- Docker and Docker Compose (`docker compose version` should print `Docker Compose version v2.*`)
- Git 2.x with LFS support (`git lfs version`)
- A code editor (VS Code recommended for the integrated terminal)

The following accounts are needed for deployment (Phase 0 deployment steps are optional; if accounts are not available, document the deferral and continue):

- Vercel account (for frontend)
- Railway account (for backend)
- An OpenAI API key (not used in Phase 0; only documented in `.env.example`)

---

## Reading order

1. `CLAUDE.md` (project context)
2. This file (Phase 0 instructions)
3. Begin work

Do not read other phase files in this phase. They do not exist yet and they are not your concern.

---

## Deliverables

After Phase 0 is complete, the repository contains:

1. A monorepo skeleton managed by pnpm workspaces with two apps and one shared package.
2. A Next.js 14 frontend with one placeholder homepage that calls the backend and displays the response.
3. A FastAPI backend with two endpoints: `/health` and `/api/echo`.
4. A `docker-compose.yml` that brings up the backend on port 8000.
5. A `Makefile` with `make setup`, `make dev`, `make lint`, `make clean`.
6. `.env.example` files documenting all required environment variables.
7. `CLAUDE.md` at the repo root (copy of the project context document).
8. `README.md` with quickstart instructions.
9. Linting and formatting configured for both apps (ESLint+Prettier for web, Ruff+Black for api).
10. A `.github/workflows/ci.yml` that runs lint and typecheck on every push.
11. Vercel and Railway deployment configurations (deployment itself optional; configurations required).
12. An initial commit pushed to a fresh `main` branch.

---

## Step-by-step execution order

Execute these steps in order. Do not skip ahead. After each step, verify it succeeded before moving to the next.

### Step 1 — Repository initialization

```bash
mkdir katacad && cd katacad
git init
git lfs install
```

### Step 2 — Root configuration files

Create the root configuration files: `.gitignore`, `.gitattributes`, `.editorconfig`, `.nvmrc`, `.python-version`, `pnpm-workspace.yaml`, `package.json`, `tsconfig.base.json`, `Makefile`, `docker-compose.yml`, `LICENSE` (MIT), `README.md`, `CLAUDE.md`, and `AGENTS.md` (containing only `See CLAUDE.md`).

### Step 3 — Frontend scaffolding

Scaffold `apps/web` with `create-next-app` (TypeScript, Tailwind, ESLint, App Router, `@/*` import alias, pnpm). Replace `page.tsx`, `layout.tsx`, and `globals.css` with the placeholder versions, delete Next.js boilerplate (favicon, SVG logos, fonts), and add `.env.example`, `next.config.js`, and Prettier config.

### Step 4 — Backend scaffolding

Scaffold `apps/api` with a Python 3.11 venv and a FastAPI app exposing `/health` and `/api/echo`, plus `pyproject.toml`, `Dockerfile`, `.dockerignore`, `.env.example`, and tests.

### Step 5 — Shared package scaffolding

Create `packages/shared` with the shared TypeScript API and domain types.

### Step 6 — Wire the workspace

`pnpm install` from the root, then add `@katacad/shared` as a dependency of the web app and wire up `apps/web/lib/api/client.ts`.

### Step 7 — Linting and formatting setup

Install Prettier for web and Ruff + Black for api. Add the api `.pre-commit-config.yaml`. Verify all linters pass.

### Step 8 — Local development with Docker

Verify the backend runs both directly (`uvicorn`) and via `docker compose up --build api`.

### Step 9 — The Makefile loop

`make setup` installs everything; `make dev` brings up the api (Docker) and the web app (pnpm). Verify the placeholder homepage and the "Ping API" round trip.

### Step 10 — CI workflow

Create `.github/workflows/ci.yml` running lint and typecheck on every push and PR.

### Step 11 — Deployment configurations (optional but preferred)

Deploy the frontend to Vercel and the backend to Railway if accounts are available; otherwise document the deferral in `docs/DEPLOYMENT_DEFERRED.md`.

### Step 12 — Initial commit and push

Commit locally. Do **not** push without the user's explicit instruction.

---

## Verification checklist

- `pnpm install` from repo root completes without errors.
- `pip install -e ".[dev]"` in `apps/api` completes without errors.
- `make dev` brings up both apps with no errors.
- `curl http://localhost:8000/health` returns the health JSON.
- `curl -X POST http://localhost:8000/api/echo` echoes the message.
- `http://localhost:3000` shows the placeholder homepage; the "Ping API" button works.
- `pnpm --filter web lint`, `tsc --noEmit`, `ruff check .`, `black --check .`, and `pytest -q` all pass.
- `docker compose up --build api` builds and the healthcheck passes.
- `CLAUDE.md` and `README.md` are present and accurate.
- No file under `apps/web/app/` references any color, custom font, transition, or animation.

---

## Hard rules for this phase

1. No CAD code. 2. No AI code. 3. No 3D viewport. 4. No styling (Tailwind defaults only). 5. No additional dependencies beyond those listed. 6. No premature optimization. 7. No PostgreSQL. 8. No authentication. 9. No marketing copy on the placeholder homepage. 10. No deviations from this file without an explicit "yes" from the user.

---

*Phase 0 instruction file version 1.0. Owner: Dawar. Last updated alongside CLAUDE.md v1.0.*
*This is a condensed in-repo copy of the Phase 0 build brief; the authoritative full brief was provided to the build agent at phase start.*
