// Looping animation for the bicycle hero — wheels and crankset turning.
import type { AnimationFrame } from "@/lib/replicad/heroes/types";

/** Canonical node names — shared with the bicycle geometry module. */
export const BICYCLE_NODES = {
  frame: "frame",
  fork: "fork",
  handlebar: "handlebar",
  seat: "seat",
  frontWheel: "front_wheel",
  rearWheel: "rear_wheel",
  crankset: "crankset",
};

const WHEEL_SPEED = 1.9; // rad/s

export function animateBicycle(elapsedSeconds: number): AnimationFrame {
  const spin = WHEEL_SPEED * elapsedSeconds;
  return {
    [BICYCLE_NODES.frontWheel]: { rotation: [0, 0, spin] },
    [BICYCLE_NODES.rearWheel]: { rotation: [0, 0, spin] },
    // The crank turns slower than the wheels, like a real drivetrain ratio.
    [BICYCLE_NODES.crankset]: { rotation: [0, 0, spin * 0.4] },
  };
}
