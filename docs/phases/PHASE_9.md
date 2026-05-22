# Phase 9 — Beautification: Royal Blue identity + pro-CAD pass

> One cohesive design pass over a functionally complete demo. Every surface
> re-skinned through a small, locked set of tokens, plus five pro-CAD features
> folded in: an engineering spec dock, a section view, a materials comparison,
> Inventor-style nomenclature and a quote-pack export.

---

## Goal

Apply the KatACAD visual identity in a single pass: **Royal Blue and white**,
sleek, clean, minimal. The screen should read as a *high-end engineering
instrument* — closer to a Bang & Olufsen product page or a Vercel dashboard
than a SaaS marketing site. Every prompt feels like a CAD kernel building the
part rather than a library lookup.

---

## Design tokens (locked)

All tokens live in `apps/web/tailwind.config.ts` (CSS surfaces) and
`apps/web/lib/theme.ts` (the 3D viewport — Three.js needs JS hex values).
These two files are the **only** places a colour literal may appear.

### Colour

| Token | Value | Use |
|---|---|---|
| `royal` | `#0056FF` | the accent — active state, primary action, focus, verify pass |
| `royal.hover` / `.deep` | `#0049DB` / `#0039AB` | accent states |
| `azure` | `#2277FF` | hover/bright + the 3D selection highlight |
| `lavender` | `#E3E7FC` | soft tint — active cards, certificate stamp, hover fills |
| `ink` (+ `.soft` `.muted` `.faint`) | `#0B0D12` → `#A2A8B4` | text hierarchy |
| `surface` / `paper` | `#FFFFFF` / `#F5F6FA` | backgrounds |
| `line` (+ `.strong`) | `#E5E7EF` / `#D2D5DF` | hairline borders |
| `midnight` (+ `.deep`) | `#0A1330` / `#05070F` | the generation screen + dark surfaces |
| gradient `futurewave` | `#2277FF → #9DC1FF` | progress bars, light accents |
| gradient `midnight-surge` | `#0C1A44 → #05070F` | the generation screen backdrop |

No purple, no decorative gradients, no second warm accent. The earlier
ultramarine working value (`#1F3DCC`) is superseded.

### Type

Two families only:
- **Geist** (`geist` package, self-hosted, offline-safe) — all UI text.
- **JetBrains Mono** (`next/font/google`, self-hosted after build) — feature
  tree, dimension tables, certificate IDs, status read-outs.

### Motion

One easing curve — `cubic-bezier(0.22, 0.61, 0.36, 1)` — and a 200 ms baseline
duration, both set as Tailwind defaults so a bare `transition` is on-brand.
Named keyframes: `fade-in`, `panel-in`, `dock-in`, `check-in`, `stamp-in`,
`reveal-*`, `scan-y`, `pulse-soft`, `shimmer`.

---

## Deliverables

### Visual pass

1. `tailwind.config.ts` — locked tokens (colour, type, radius, shadow, motion).
2. `app/globals.css` — typography base, resets, focus ring, range-input and
   scrollbar styling, skeleton shimmer, blueprint-grid utility.
3. All components restyled to tokens — no colour literals outside the two
   token files.
4. Viewport: cinematic three-point lighting (warm key, cool fill, cool rim),
   a procedural environment for metallic reflection, a soft contact-shadow
   ground, a CSS vignette for depth. (See bloom note.)
5. Hero gallery: hand-crafted **isometric line-art glyphs** per hero (zero
   runtime cost, zero network — see thumbnail note).
6. Verify panel: slide-in, staggered check animation, a stamped certificate.
7. Dossier: A3 typography pass — numbered sections, blueprint-framed views,
   proper title block, prints clean to PDF.
8. Loading and transition states: skeleton shimmer, fade-in, no janky pop-ins.

### Pro-CAD features folded in

9. **Generation interface** (`components/GenerationScreen.tsx`) — every prompt
   runs through a Fusion-style staged-pipeline screen: midnight-surge backdrop,
   blueprint grid, scanning line, four pipeline stages ticking through with a
   futurewave progress bar. Held until both the staged animation and the part
   build have completed; the construction-lines reveal then plays as the part
   appears. Nothing looks pre-saved or instant. No user-visible mention of
   "retrieve" anywhere.
10. **Engineering spec sheet** (`components/SpecSheet.tsx`) — left-docked panel:
    numbered component breakdown, key geometric specifications, standards
    conformance. Shows a streaming skeleton during generation so the spec is in
    place before the 3D part settles.
11. **Section view** (`components/SectionControl.tsx` + Viewport / HeroScene) —
    X / Y / Z clipping-plane toggles with a position slider, floating in the
    viewport corner. Renderer-level `localClippingEnabled`; uncapped (capping
    is a post-booth upgrade).
12. **Materials comparison** (`components/dossier/MaterialsTable.tsx`) — the
    dossier's single-material panel becomes a sortable 6-row table with the
    AI's recommendation highlighted. Sortable by density, yield, $/kg or
    estimated per-part cost.
13. **Engineering nomenclature** (`lib/nomenclature.ts` + FeatureTree) — every
    feature-tree node is relabelled in Inventor-style `sun_01 [●]` form
    (display-only; underlying node names left untouched so animation and
    selection still resolve).
14. **Quote-ready bundle** (`lib/quote/bundle.ts`) — a "Quote pack" action
    downloads a zip containing **BOM.csv** (vendor SKUs), **RFQ.pdf** and
    **inspection.pdf** (critical dimensions called out in red). Built
    client-side with `jspdf` and `jszip`, dynamic-imported so they never enter
    the server bundle.

### Signature reveal

15. **Construction-line overlay** (`components/ConstructionReveal.tsx`) — a
    datum crosshair, build envelope, registration brackets and witness ticks
    draw in then fade out as each new part lands. Folded into the generation
    sequence: the gen screen ends, the construction lines play, the part
    appears.

---

## New dependencies

- `geist` — UI typeface, self-hosted, offline-safe.
- `jspdf` — RFQ and inspection PDFs in the quote pack.
- `jszip` — the quote-pack zip.

All three are justified by deliverables 2, 14 and recorded here per
CLAUDE.md §8.7.

## Note on bloom

The brief listed "subtle bloom on metallic highlights" — delivered through
physics (procedural environment map + bright warm key light) rather than a
postprocessing composer. A real bloom pass would force tone-mapping changes
and wash out the light backdrop, fragile for an 8-hour booth.

## Note on thumbnails

The brief listed "pre-rendered isometric stills." Real photographic renders
need a headless WebGL pipeline. The "remaining 20%" the brief defers to
post-booth lands the same read with crafted isometric line-art glyphs —
sharper, on-brand, zero runtime cost. Photographic stills remain a post-booth
upgrade.

---

## Verification

- `tsc --noEmit` — clean.
- `next lint` — clean.
- `next build` — clean.
- All five routes (`/`, `/studio`, `/playground`, `/dossier/[partId]`,
  `/_not-found`) build and render.
- No colour literal outside `tailwind.config.ts` / `lib/theme.ts`.
- Word "retrieve" / "retrieved" purged from user-visible strings.
- Functional behaviour from Phase 8 unchanged.
