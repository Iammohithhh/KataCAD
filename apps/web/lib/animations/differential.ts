// Looping animation for the differential hero.
//
// The carrier (with the ring gear and side gears bolted to / riding in it)
// rotates as a unit; the spider gears additionally spin on their cross pin.
import type { AnimationFrame } from "@/lib/replicad/heroes/types";

/** Canonical node names — shared with the differential geometry module. */
export const DIFFERENTIAL_NODES = {
  carrier: "carrier",
  ring: "ring_gear",
  sideGear: (index: number): string => `side_gear_${index + 1}`,
  spiderGear: (index: number): string => `spider_gear_${index + 1}`,
};

const ASSEMBLY_SPEED = 0.8; // rad/s — the whole carrier
const SPIDER_SPEED = 1.5; // rad/s — spiders on their cross pin

export function animateDifferential(elapsedSeconds: number): AnimationFrame {
  return {
    [DIFFERENTIAL_NODES.carrier]: { rotation: [0, 0, ASSEMBLY_SPEED * elapsedSeconds] },
    [DIFFERENTIAL_NODES.spiderGear(0)]: { rotation: [0, 0, SPIDER_SPEED * elapsedSeconds] },
    [DIFFERENTIAL_NODES.spiderGear(1)]: { rotation: [0, 0, -SPIDER_SPEED * elapsedSeconds] },
  };
}
