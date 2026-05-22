// Pre-warmed hero shapes.
//
// All eight heroes are built once, in the background, after the CAD kernel is
// ready — so a gallery click is instant. Heroes are local geometry; this
// cache makes them fast and keeps them fully network-independent.
import type { HeroId } from "@katacad/shared";

import { assembleHero, getHero, type HeroBounds, type HeroModel } from "@/lib/replicad/heroes";
import type { AssembledHero } from "@/lib/replicad/heroes";

export interface CachedHero {
  model: HeroModel;
  bounds: HeroBounds;
  compound: AssembledHero["compound"];
}

const CACHE = new Map<HeroId, CachedHero>();

const HERO_IDS: HeroId[] = [
  "gearbox",
  "gripper",
  "robot-arm",
  "quadcopter",
  "v-twin",
  "differential",
  "bicycle",
  "nema-mount",
];

/** Build and cache one hero (at its default parameters). */
function buildAndCache(id: HeroId): void {
  if (CACHE.has(id)) return;
  const definition = getHero(id);
  if (!definition) return;
  try {
    const model = definition.build(definition.defaultParams);
    const { compound, bounds } = assembleHero(model);
    CACHE.set(id, { model, bounds, compound });
  } catch (err) {
    console.error(`Hero preload failed for "${id}":`, err);
  }
}

/** A hero's pre-built shape, if it has been cached. */
export function getCachedHero(id: HeroId): CachedHero | undefined {
  return CACHE.get(id);
}

/**
 * Preload every hero in the background — one per tick so the main thread is
 * never blocked for long. Safe to call repeatedly; already-cached heroes are
 * skipped.
 */
export function preloadHeroes(): void {
  let index = 0;
  const step = (): void => {
    if (index >= HERO_IDS.length) return;
    buildAndCache(HERO_IDS[index]);
    index += 1;
    setTimeout(step, 60);
  };
  setTimeout(step, 250);
}
