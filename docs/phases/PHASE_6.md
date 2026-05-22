# PHASE 6 — Layer 3 Retrieval (GenCAD-Code)

> **Read `CLAUDE.md` at the repo root before reading this file.** Then read `docs/phases/PHASE_5.md` (the CadQuery pipeline this builds on). This document is the Phase 6 build brief.

---

## Phase goal

Cover the exotic long tail. When a prompt matches neither a hero (Layer 1) nor an archetype (Layer 2), retrieve the closest part from a curated corpus drawn from the **GenCAD-Code** dataset, re-execute its CadQuery, and serve it through the same pipeline as Layer 2 — so the visitor cannot tell the layers apart.

This is **retrieval, not generation**: the corpus CadQuery is executed verbatim (only uniformly scaled). It is the retrieval half of a RAG pattern — embeddings + a vector index + nearest-neighbour search — with no LLM generating the output.

---

## Architecture decisions (resolved against the real dataset)

1. **The dataset has no captions.** `CADCODER/GenCAD-Code` columns are `image`, `deepcad_id`, `cadquery`, `token_count`, `prompt` (a single constant code-gen instruction), `hundred_subset`. The Phase 6 spec and CLAUDE.md assumed per-part captions to embed — there are none.
2. **Retrieval uses CLIP, not caption embeddings.** `sentence-transformers/clip-ViT-B-32` maps text and images into one shared space. Build time: embed each curated part's **image**. Query time: embed the user's prompt with CLIP's **text** encoder, search the image index. No captioning step.
3. **The result shape is always the variable `solid`.** Every dataset CadQuery script ends assigning the final shape to `solid`. The re-executor `exec`s the code and reads `solid`.
4. **Parts are sub-millimetre.** DeepCAD coordinates are normalised (~0–1). The re-executor scales each part so its largest dimension hits a target size; a `scale` slider adjusts that.
5. **Retrieved parts are not parametric.** Dataset CadQuery is a flat script — no named parameters. The only slider is uniform `scale`.
6. **The runtime index is tiny.** ~500 CadQuery scripts (text) + a FAISS index of 500×512 floats (~1 MB). It is committed to the repo — no Railway volume needed (the spec's 921 MB concern only applied to caption-based indexing).
7. **Layer 3 reuses the Layer 2 web path.** The endpoint returns the same `{step_b64, metadata}` shape, so the studio renders it with the existing `importSTEP` flow.

---

## Deliverables

- `apps/api/pyproject.toml` — add `faiss-cpu`, `sentence-transformers` (runtime); `datasets` (build-only extra).
- `apps/api/scripts/build_index.py` — one-time: stream GenCAD-Code, curate ~500 parts (filter on code length, execution success, bounding-box sanity), CLIP-embed images, write `index/gencad.faiss` + `index/parts.jsonl`.
- `apps/api/app/lib/retrieval/` — the CLIP query embedder, FAISS index loader, the CadQuery re-executor, and the semantic-naming heuristic.
- `apps/api/app/routes/generate.py` — extended with `POST /api/generate/layer3`.
- `apps/api/app/schemas/generate.py` — `Layer3Request`.
- `apps/api/index/` — the committed curated index.
- `packages/shared/src/api.ts` — `Layer3Request`.
- `apps/web/lib/api/generate.ts` — `generateLayer3`.
- `apps/web/app/studio/StudioClient.tsx` — Layer 3 prompts retrieve and render a part.

---

## Hard rules for this phase

1. **No beautification.** Tailwind defaults, functional lighting.
2. **Real geometry only** — the retrieved CadQuery produces real B-Rep; STEP exports are real.
3. **The endpoint never crashes the request** — retrieval failure or an un-executable part returns a clear error; the web falls back.
4. **Re-executed code is the curated corpus only** — never arbitrary user input.
5. **The router already classifies Layer 3** (Phase 3) — Phase 6 only adds the web/endpoint handling.

---

## Verification checklist

- `build_index.py` produces `index/gencad.faiss` and `index/parts.jsonl` with ~500 parts.
- `ruff check .` and `pytest -q` pass in `apps/api`.
- `POST /api/generate/layer3` with an exotic prompt returns a valid STEP within ~4 s.
- `pnpm --filter web lint`, `tsc --noEmit`, `next build` pass.
- An exotic prompt in the studio retrieves and renders a part with the same lighting/export as Layers 1–2; the feature tree shows parsed names; the scale slider works.
- Heroes and Layer 2 archetypes still work.

---

*Phase 6 instruction file version 1.0. Written against the real GenCAD-Code dataset and the repository as Phase 5 left it.*
