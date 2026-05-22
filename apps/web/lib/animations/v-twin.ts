// Looping animation for the V-twin engine hero.
//
// The crankshaft spins about Y; each piston reciprocates along its own
// (tilted) cylinder axis. The rear cylinder fires offset from the front,
// giving the characteristic V-twin cadence. Choreographed, not simulated.
import type { AnimationFrame } from "@/lib/replicad/heroes/types";

/** Canonical node names — shared with the V-twin geometry module. */
export const VTWIN_NODES = {
  crankcase: "crankcase",
  crankshaft: "crankshaft",
  cylinder: (index: number): string => (index === 0 ? "cylinder_front" : "cylinder_rear"),
  piston: (index: number): string => (index === 0 ? "piston_front" : "piston_rear"),
};

const CRANK_SPEED = 2.4; // rad/s
const STROKE = 26; // mm of piston travel
const REAR_OFFSET = 2.3; // rad — rear cylinder phase lag

export function animateVTwin(elapsedSeconds: number): AnimationFrame {
  const crank = CRANK_SPEED * elapsedSeconds;

  // Each piston rides a 0..1 sinusoid scaled to the stroke, along local Z.
  const front = ((1 - Math.cos(crank)) / 2) * STROKE;
  const rear = ((1 - Math.cos(crank + REAR_OFFSET)) / 2) * STROKE;

  return {
    [VTWIN_NODES.crankshaft]: { rotation: [0, crank, 0] },
    [VTWIN_NODES.piston(0)]: { position: [0, 0, front] },
    [VTWIN_NODES.piston(1)]: { position: [0, 0, rear] },
  };
}
