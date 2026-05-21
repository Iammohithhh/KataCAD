# KatACAD

Parametric CAD from natural language. This repo contains the **exhibition demo** of the KatACAD product.

For full project context, read `CLAUDE.md` at the repo root.

## Quickstart

Prerequisites: Node 20, pnpm 9, Python 3.11, Docker, Git.

```bash
git clone <repo-url> katacad
cd katacad
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
make setup
make dev
```

Open `http://localhost:3000`. The "Ping API" button proves the round trip works.

## Workspace layout

- `apps/web` — Next.js 14 frontend
- `apps/api` — FastAPI backend with CadQuery
- `packages/shared` — Shared TypeScript types
- `docs/` — Phase instructions and reference documents

## Common commands

```bash
make setup    # install all dependencies
make dev      # run web + api locally
make lint     # lint both apps
make clean    # remove all build artifacts and venvs
```
