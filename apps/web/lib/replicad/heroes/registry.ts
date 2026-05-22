// Hero registry — maps hero ids to their definitions and drives the gallery.
import type { HeroId } from "@katacad/shared";

import { bicycleDefinition } from "./bicycle";
import { differentialDefinition } from "./differential";
import { gearboxDefinition } from "./gearbox";
import { gripperDefinition } from "./gripper";
import { nemaMountDefinition } from "./nema-mount";
import { quadcopterDefinition } from "./quadcopter";
import { robotArmDefinition } from "./robot-arm";
import type { HeroDefinition } from "./types";
import { vTwinDefinition } from "./v-twin";

/** Definitions for all eight Layer 1 heroes. */
const HERO_DEFINITIONS: Record<HeroId, HeroDefinition> = {
  gearbox: gearboxDefinition,
  gripper: gripperDefinition,
  "robot-arm": robotArmDefinition,
  quadcopter: quadcopterDefinition,
  "v-twin": vTwinDefinition,
  differential: differentialDefinition,
  bicycle: bicycleDefinition,
  "nema-mount": nemaMountDefinition,
};

export interface HeroGalleryEntry {
  id: HeroId;
  label: string;
  /** Kept for forward-compatibility; all eight heroes are now available. */
  available: boolean;
}

/** Gallery display order. */
export const HERO_GALLERY: readonly HeroGalleryEntry[] = [
  { id: "gearbox", label: "Planetary Gearbox", available: true },
  { id: "gripper", label: "Five-Finger Gripper", available: true },
  { id: "robot-arm", label: "Six-Axis Robot Arm", available: true },
  { id: "quadcopter", label: "Quadcopter", available: true },
  { id: "v-twin", label: "V-Twin Engine", available: true },
  { id: "differential", label: "Differential", available: true },
  { id: "bicycle", label: "Bicycle", available: true },
  { id: "nema-mount", label: "NEMA Mount", available: true },
];

/** Look up a hero definition by id. */
export function getHero(id: HeroId): HeroDefinition | undefined {
  return HERO_DEFINITIONS[id];
}
