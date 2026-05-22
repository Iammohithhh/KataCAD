# Dress Rehearsal Checklist

Run this on the **actual booth laptop** before the exhibition. The demo must
survive eight hours unattended — this rehearsal proves it.

---

## Setup

1. **Build for production** — the dev server shows a React error overlay; the
   booth must run the production build.
   ```
   # apps/web/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_BOOTH_MODE=true
   ```
   ```
   corepack pnpm --filter web build
   corepack pnpm --filter web start
   ```
2. **Start the API** with a valid `OPENAI_API_KEY`:
   ```
   cd apps\api
   .\.venv\Scripts\python.exe -m uvicorn app.main:app --port 8000
   ```
3. Open `http://localhost:3000/studio` in a desktop browser.

---

## A. Ten clean runs (throttled network)

Open Chrome DevTools → Network → throttling → **Fast 3G**.

Do **ten consecutive full runs**. Each run:
1. Type a prompt and press Enter.
2. The part renders.
3. Click **Verify** — the four checks complete.
4. Click **Dossier** — the A3 sheet renders; click **Export PDF**.
5. Return to the studio.

Vary the prompts across all three layers, e.g.:
`planetary gearbox` · `six-axis robot arm` · `v-twin engine` · `quadcopter` ·
`flange with ten holes` · `a stepped shaft` · `hydraulic manifold` ·
`a turbine blade` · `an impeller` · `a heat sink`

- [ ] Each run completes in **under 60 seconds**.
- [ ] No visible error toast, no console error spam, no React overlay.
- [ ] The gallery thumbnails load every hero instantly.

## B. OpenAI failure

With the demo running, remove `OPENAI_API_KEY` from the API environment and
restart the API (or block `api.openai.com` in DevTools).

- [ ] A hero prompt (`planetary gearbox`) still loads the right hero — the
      keyword classifier covers it.
- [ ] An archetype/exotic prompt degrades gracefully to a hero, no error shown.

## C. API outage

Stop the API process entirely (Ctrl+C).

- [ ] Gallery clicks still load every Layer 1 hero (local geometry).
- [ ] A hero prompt still works via the keyword classifier.
- [ ] A Layer 2/3 prompt falls back to the default hero — no error shown.
- [ ] The viewport, verify panel, and feature tree still work for heroes.

## D. Endurance

- [ ] Leave the demo idle for 30 minutes, then run three more cycles — still smooth.

---

## If anything fails

Reserve time after the rehearsal for fixes. **Do not start Phase 9
(beautification) until this rehearsal passes ten clean runs.**
