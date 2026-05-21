# Deployment & Docker — Deferred from Phase 0

Phase 0 builds the monorepo, the local developer loop, and the deployment
*configurations*. Two things could not be completed or verified in this
session and are deferred to the next one. Neither blocks Phase 1.

## 1. Docker container verification — deferred

Docker / Docker Compose is not installed on the build machine, so Step 8
(`docker compose up --build api`) and the Docker route of `make dev` could
not be exercised.

**What is in place:** `apps/api/Dockerfile`, `apps/api/.dockerignore`, and the
root `docker-compose.yml` are all written per the Phase 0 spec.

**What was done instead:** the backend was verified by running it directly
with `uvicorn` (the fast-iteration route the Phase 0 brief documents as the
alternative). Both endpoints returned the expected responses.

**Next session — to verify the container:**
1. Install Docker Desktop and confirm `docker compose version` prints `v2.*`.
2. From the repo root: `docker compose up --build api`.
3. In another terminal: `curl http://localhost:8000/health` — expect
   `{"status":"ok","service":"katacad-api","version":"0.1.0"}`.
4. Confirm the compose `healthcheck` reports the `api` service as healthy.
5. `docker compose down`.

## 2. Vercel + Railway deployment — deferred

No Vercel or Railway account access was available this session, so the apps
were not deployed. The Phase 0 brief marks the deployment step itself as
"optional but preferred", so this is an expected deferral.

**What is in place (configurations — required by Phase 0):**
- `apps/api/Dockerfile` + `apps/api/railway.json` — Railway builds the API
  from the Dockerfile and starts it with `uvicorn ... --port $PORT`, with a
  `/health` healthcheck.
- `apps/web/vercel.json` — declares the Next.js framework for the web app.

**Next session — to deploy:**
1. **Railway (backend):** create a project from the repo, set the service
   root directory to `apps/api`. Add an `OPENAI_API_KEY` env var (an empty
   value is acceptable in Phase 0). Deploy. Note the generated public URL.
2. **Vercel (frontend):** create a project from the repo, set the root
   directory to `apps/web`. Vercel detects the pnpm workspace automatically.
   Set `NEXT_PUBLIC_API_URL` to the Railway public URL from step 1. Deploy.
3. Open the Vercel production URL and confirm the "Ping API" button returns
   the JSON echo response from the Railway backend.
4. If the browser console shows a CORS error, add the Vercel production
   origin to the `allow_origins` list in `apps/api/app/main.py` and redeploy
   the backend. (Phase 0 hardcodes only the localhost origins.)
