# PHASE 3 — OpenAI Router and Layer 1 Wiring

> **Read `CLAUDE.md` at the repo root before reading this file.** Then read `docs/phases/PHASE_2.md` for what Phase 2 produced. This document is the Phase 3 build brief.

---

## Phase goal

Let a visitor type a plain-English prompt and have the right Layer 1 hero load automatically. This is the first phase where a network round trip sits on the critical path, so latency and failure handling matter.

The OpenAI API classifies the prompt into a layer (1/2/3) and — for Layer 1 — a hero plus extracted numeric parameters. The web app loads that hero. Any failure (no key, API error, timeout) silently falls back to a default hero.

---

## Prerequisites

- Phase 2 is complete: `/studio` loads heroes from the gallery.
- Python 3.11+ for `apps/api`. An `OPENAI_API_KEY` is needed to exercise the live path; without one the router still works via its fallback.

---

## Architecture decisions (resolved against Phase 2)

1. **Paths follow the repo, not the plan's shorthand.** Router code lives under `apps/api/app/` — `app/lib/openai_client.py`, `app/prompts/router.txt`, `app/routes/route.py`, `app/schemas/route.py`.
2. **The fallback is a default hero, not the bracket.** `/studio` is hero-only in Phase 3, so an unclassifiable prompt loads the default hero (`gearbox`) — per CLAUDE.md's wording ("route to a default hero"). The bracket stays the Phase 1 `/playground` sandbox.
3. **`classify_prompt` never raises.** Missing key, API error, bad JSON — all return a `fallback` classification. The route endpoint always answers 200 with a valid body.
4. **Two layers of fallback.** The server falls back on its own failures; the web falls back on network failure or a >3.5 s timeout (`AbortController`). Either way the visitor sees a hero, never an error.
5. **The OpenAI model is an env var** (`OPENAI_MODEL`, default `gpt-4o-mini`) — never hardcoded in logic.
6. **Layers 2 and 3** are classified by the router but not yet rendered (Phases 5/6). In Phase 3 a non-Layer-1 result loads the fallback hero.
7. **In-memory prompt cache** keyed by the normalized prompt — repeated prompts skip the API call (burst-traffic mitigation).

---

## Deliverables

- `apps/api/pyproject.toml` — add `openai`; widen `requires-python` to `>=3.11`.
- `apps/api/app/prompts/router.txt` — the version-controlled system prompt.
- `apps/api/app/lib/openai_client.py` — `classify_prompt(prompt)`; cache; fallback.
- `apps/api/app/schemas/route.py` — `RouteRequest`, `RouteResponse`.
- `apps/api/app/routes/route.py` — `POST /api/route`; registered in `main.py`.
- `apps/api/tests/test_route.py` — fallback-path tests.
- `packages/shared/src/api.ts` — `RouteRequest`, `RouteResponse`.
- `apps/web/lib/api/route.ts` — `routePrompt(prompt)` with a timeout.
- `apps/web/components/PromptInput.tsx` — text box, Enter handler, loading state.
- `apps/web/app/studio/StudioClient.tsx` — prompt wired to hero loading.

---

## Hard rules for this phase

1. **No beautification.** Tailwind defaults, plain controls.
2. **OpenAI only at runtime** — never the Anthropic API.
3. **No hardcoded model names** in logic — read `OPENAI_MODEL`.
4. **No secrets committed.** `OPENAI_API_KEY` lives in `.env` (gitignored); `.env.example` documents it empty.
5. **The router must never crash the request** — every failure path returns a valid fallback.
6. **Do not build Layer 2 or Layer 3 rendering** — that is Phases 5 and 6.

---

## Verification checklist

- `ruff check .` and `pytest -q` pass in `apps/api`.
- `pnpm --filter web lint`, `tsc --noEmit`, and `next build` pass.
- With a valid key: "planetary gearbox with three planets" loads the gearbox; "six-axis arm" loads the robot arm; "robotic gripper for a 50 mm cylinder" loads the gripper.
- "asdfgh" silently loads the fallback hero within ~4 s, no visible error.
- With the API stopped, a prompt still loads the fallback hero (web-side fallback).
- `/playground` and the hero gallery still work.

---

*Phase 3 instruction file version 1.0. Written against the repository as Phase 2 left it.*
