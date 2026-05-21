// Looping animation for the planetary gearbox hero.
//
// The sun gear spins fast, the planet carrier orbits slowly, and each planet
// counter-rotates on its own axis. Planets are children of the carrier in the
// scene graph, so they orbit with it and spin on top of that. Speeds are
// plausible rather than kinematically exact (see the Phase 2 brief).
import type { AnimationFrame } from "@/lib/replicad/heroes/types";

/** Canonical node names — shared with the gearbox geometry module. */
export const GEARBOX_NODES = {
  sun: "sun_gear",
  ring: "ring_gear",
  carrier: "planet_carrier",
  planet: (index: number): string => `planet_gear_${index + 1}`,
};

const SUN_SPEED = 1.2; // rad/s
const CARRIER_SPEED = SUN_SPEED / 5;
const PLANET_SPEED = -SUN_SPEED / 2; // relative to the carrier it rides on

export function animateGearbox(
  elapsedSeconds: number,
  params: Record<string, number>,
): AnimationFrame {
  const planetCount = Math.max(1, Math.round(params.planetCount ?? 3));

  const frame: AnimationFrame = {
    [GEARBOX_NODES.sun]: { rotation: [0, 0, SUN_SPEED * elapsedSeconds] },
    [GEARBOX_NODES.carrier]: { rotation: [0, 0, CARRIER_SPEED * elapsedSeconds] },
  };

  for (let i = 0; i < planetCount; i += 1) {
    frame[GEARBOX_NODES.planet(i)] = {
      rotation: [0, 0, PLANET_SPEED * elapsedSeconds],
    };
  }

  return frame;
}
