# PHASE 8 — Hardening, Fallback, and Dress Rehearsal

> **Read `CLAUDE.md` at the repo root before reading this file.** This document is the Phase 8 build brief.

---

## Phase goal

Make the demo robust enough to run for eight hours on a booth laptop without a developer babysitting it. This is failure-mode work, not feature work — every failure path degrades gracefully, and the visitor never sees an error.

---

## Architecture decisions

1. **Phase 8 is entirely client-side.** The fallbacks all live in `apps/web`; the API and shared types are untouched.
2. **The router gets a fallback ladder.** `routeWithFallback`: cached prompt → live API → keyword classifier → default hero. The cache is checked first (instant repeats and survives an API outage); the keyword classifier runs fully offline; the default hero is the last resort. It never throws.
3. **Heroes are preloaded.** All eight hero shapes are built and cached in the background once the kernel is ready, so a gallery click is instant. Heroes are local geometry — they never need the network.
4. **Layer 1 survives an API outage.** With the API down, a hero prompt is keyword-classified and rendered locally; the gallery always works. Layer 2/3 prompts fall back to the default hero.
5. **Booth mode hides the developer surface.** `NEXT_PUBLIC_BOOTH_MODE=true` hides the technical status line so only the visitor-facing UI shows. Run the dress rehearsal against the production build (`next build` + `next start`) — there is no React error overlay in production.

---

## Deliverables

- `apps/web/lib/config.ts` — the `BOOTH_MODE` flag.
- `apps/web/lib/cache/promptCache.ts` — the common-prompt route cache.
- `apps/web/lib/cache/heroCache.ts` — pre-warmed hero shapes.
- `apps/web/lib/router/keywords.ts` — the offline keyword classifier.
- `apps/web/lib/api/fallback.ts` — the `routeWithFallback` chain.
- `apps/web/app/studio/StudioClient.tsx` — wired to the fallback chain, the hero cache, and booth mode.
- `apps/web/.env.example` — documents `NEXT_PUBLIC_BOOTH_MODE`.
- `docs/REHEARSAL.md` — the dress-rehearsal checklist.

---

## Hard rules for this phase

1. **No new features** — this phase only hardens what exists.
2. **No beautification** — that is Phase 9.
3. **Every async path already has a timeout** (`AbortController`); Phase 8 adds the fallbacks behind them.
4. **No visible errors in booth mode** — failures resolve to a working part, silently.

---

## Verification checklist (the dress rehearsal — see `docs/REHEARSAL.md`)

- `pnpm --filter web lint`, `tsc --noEmit`, `next build` pass.
- Ten consecutive full runs (prompt → render → verify → dossier → export) complete under 60 s each on a throttled network.
- Killing the OpenAI key mid-run does not break the demo (keyword fallback).
- Killing the API mid-run still loads Layer 1 heroes (local geometry).
- No visible error toasts, console error spam, or React overlay in booth mode.

---

*Phase 8 instruction file version 1.0. Written against the repository as Phase 7 left it.*
