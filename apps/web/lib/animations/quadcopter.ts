// Looping animation for the quadcopter hero — four spinning propellers.
import type { AnimationFrame } from "@/lib/replicad/heroes/types";

/** Canonical node names — shared with the quadcopter geometry module. */
export const QUADCOPTER_NODES = {
  hull: "center_hull",
  arm: (index: number): string => `arm_${index + 1}`,
  propeller: (index: number): string => `propeller_${index + 1}`,
};

const PROP_SPEED = 9; // rad/s

export function animateQuadcopter(elapsedSeconds: number): AnimationFrame {
  const frame: AnimationFrame = {};
  for (let i = 0; i < 4; i += 1) {
    // Adjacent rotors counter-rotate, as on a real quadcopter.
    const direction = i % 2 === 0 ? 1 : -1;
    frame[QUADCOPTER_NODES.propeller(i)] = {
      rotation: [0, 0, PROP_SPEED * direction * elapsedSeconds],
    };
  }
  return frame;
}
