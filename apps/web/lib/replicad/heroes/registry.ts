// Hero registry — maps hero ids to their definitions and drives the gallery.
import type { HeroId } from "@katacad/shared";

import { gearboxDefinition } from "./gearbox";
import { gripperDefinition } from "./gripper";
import { robotArmDefinition } from "./robot-arm";
import type { HeroDefinition } from "./types";

/** Definitions for the heroes implemented so far (Phase 2: the first three). */
const HERO_DEFINITIONS: Partial<Record<HeroId, HeroDefinition>> = {
  gearbox: gearboxDefinition,
  gripper: gripperDefinition,
  "robot-arm": robotArmDefinition,
};

export interface HeroGalleryEntry {
  id: HeroId;
  label: string;
  /** False for heroes not yet built — shown as disabled placeholders. */
  available: boolean;
}

/** Gallery display order. The last five are placeholders until later phases. */
export const HERO_GALLERY: readonly HeroGalleryEntry[] = [
  { id: "gearbox", label: "Planetary Gearbox", available: true },
  { id: "gripper", label: "Five-Finger Gripper", available: true },
  { id: "robot-arm", label: "Six-Axis Robot Arm", available: true },
  { id: "quadcopter", label: "Quadcopter", available: false },
  { id: "v-twin", label: "V-Twin Engine", available: false },
  { id: "differential", label: "Differential", available: false },
  { id: "bicycle", label: "Bicycle", available: false },
  { id: "nema-mount", label: "NEMA Mount", available: false },
];

/** Look up a hero definition by id. */
export function getHero(id: HeroId): HeroDefinition | undefined {
  return HERO_DEFINITIONS[id];
}
