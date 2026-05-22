# PHASE 7 — Verify Panel and Dossier

> **Read `CLAUDE.md` at the repo root before reading this file.** This document is the Phase 7 build brief.

---

## Phase goal

Build the two interactions that turn the demo from "parts generator" into "engineering assistant": the **verify panel** and the **technical dossier**. The dossier is the demo's strongest "industry-grade" signal — it must read like a real engineering release document, not a hobby printout.

---

## Architecture decisions (resolved against the real APIs)

1. **Projections are computed on dossier open.** Replicad's `drawProjection` is fast — the worst hero (gearbox) projects in ~730 ms. No precompute/caching dance is needed; the dossier shows a brief "generating views" state.
2. **The dossier is all-SVG.** Front / Top / Right via the named projection planes, plus an Isometric line view via a `ProjectionCamera` at `[1,1,1]`. An all-SVG dossier prints to PDF perfectly — no WebGL-canvas print risk.
3. **The part crosses to the dossier route via a Zustand store.** The "Dossier" button is a client-side navigation; the store (`lib/store/part.ts`) holds the live, already-built part — no rebuilding, no re-fetching.
4. **Real geometry, where it is real.** Face/edge counts (`shape.faces`/`shape.edges`), volume (`measureVolume`), surface area, bounding box, and the certificate hash are all derived from the actual geometry. Some verify-panel status wording is presentation-only — as the team reference allows.
5. **Phase 7 is structure + content, not beautification.** The dossier carries every industry-grade *element* — title block, first-angle projection symbol, general-tolerance block, standard material designations, cited references — but in plain Tailwind defaults. The blueprint visual pass is Phase 9. No slide/transition animations (the verify sequence is timed JS state, not CSS animation).

---

## Deliverables

- `apps/web/lib/verify/checks.ts` — the four checks (parser, constraint solver, geometric kernel, intent validator).
- `apps/web/lib/verify/certificate.ts` — feature-tree SHA-256 → `KTN-2026-MM-XXXX`.
- `apps/web/components/VerifyPanel.tsx` — the panel, the timed four-check sequence, the certificate.
- `apps/web/lib/dossier/projections.ts` — `drawProjection` wrapper (Front/Top/Right/Isometric).
- `apps/web/lib/dossier/measure.ts` — volume, surface area, mass, dimension rows.
- `apps/web/lib/materials/catalogue.json` — ~20 materials with engineering properties.
- `apps/web/lib/store/part.ts` — the Zustand store carrying the part to the dossier route.
- `apps/web/app/dossier/[partId]/page.tsx` + `DossierClient.tsx` — the A3 dossier.
- `apps/api/app/prompts/material.txt`, `manufacturing.txt` — the two dossier prompts.
- `apps/api/app/routes/dossier.py` + `app/lib/dossier.py` + `app/schemas/dossier.py` — `POST /api/dossier/analysis` (material pick + reasoning + manufacturing notes).
- An `[Export PDF]` button → `window.print()` against an A3 print stylesheet.

---

## Hard rules for this phase

1. **No beautification** — Tailwind defaults; the blueprint pass is Phase 9. Industry-grade *content* (title block, tolerance block, projection symbol, cited specs) is in scope; *styling* is not.
2. **Real geometry only** — counts, volume, the certificate hash are derived from the actual shape.
3. **OpenAI only at runtime**; no hardcoded model names; no secrets committed.
4. **The verify panel completes in under two seconds** and never blocks on a network call.
5. **The dossier must print cleanly to A3** — all-SVG views, a print stylesheet.

---

## Verification checklist

- `ruff` + `pytest` pass in `apps/api`; `pnpm --filter web lint`, `tsc --noEmit`, `next build` pass.
- The verify panel runs its four-check sequence in <2 s with real face/edge counts.
- The certificate ID is stable across reloads of the same part.
- The dossier renders the four views for all eight heroes and a sample of Layer 2/3 parts.
- Material reasoning is sensible for at least three test prompts.
- `[Export PDF]` produces a clean A3 file.
- Heroes, Layer 2, and Layer 3 still work.

---

*Phase 7 instruction file version 1.0. Written against the repository as Phase 6 left it.*
