// Looping grasp animation for the five-finger gripper hero.
//
// Every finger has two phalanges (proximal + distal). A single eased cycle
// drives both joints: 0 (open) -> 1 (closed) -> 0. Each phalanx curls about
// its local X axis; the distal joint leads the proximal slightly for a
// natural roll-up.
import type { AnimationFrame } from "@/lib/replicad/heroes/types";

/** Canonical node names — shared with the gripper geometry module. */
export const GRIPPER_NODES = {
  palm: "palm",
  proximal: (index: number): string => `finger_${index + 1}_proximal`,
  distal: (index: number): string => `finger_${index + 1}_distal`,
};

const GRIP_PERIOD = 3.4; // seconds for one open-close-open cycle
const PROXIMAL_CURL = -0.95; // radians at full grip
const DISTAL_CURL = -1.15;

export function animateGripper(
  elapsedSeconds: number,
  params: Record<string, number>,
): AnimationFrame {
  const fingerCount = Math.max(1, Math.round(params.fingerCount ?? 5));

  // Eased 0 -> 1 -> 0 grip phase.
  const phase = (1 - Math.cos((elapsedSeconds * 2 * Math.PI) / GRIP_PERIOD)) / 2;

  const frame: AnimationFrame = {};
  for (let i = 0; i < fingerCount; i += 1) {
    frame[GRIPPER_NODES.proximal(i)] = { rotation: [PROXIMAL_CURL * phase, 0, 0] };
    frame[GRIPPER_NODES.distal(i)] = { rotation: [DISTAL_CURL * phase, 0, 0] };
  }
  return frame;
}
