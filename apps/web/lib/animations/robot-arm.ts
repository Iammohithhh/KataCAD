// Looping pick-and-place animation for the six-axis robot arm hero.
//
// Each joint is driven by an offset sinusoid. Together they produce a smooth,
// continuous reach-lift-swing-place cycle — choreographed motion, not a
// physics simulation (see the Phase 2 brief).
import type { AnimationFrame } from "@/lib/replicad/heroes/types";

/** Canonical node names — shared with the robot-arm geometry module. */
export const ARM_NODES = {
  base: "base",
  waist: "waist_joint",
  shoulder: "shoulder_joint",
  elbow: "elbow_joint",
  wristRoll: "wrist_roll_joint",
  wristPitch: "wrist_pitch_joint",
  tool: "tool_flange",
};

const CYCLE = 0.62; // base angular frequency (rad/s) of the motion loop

export function animateRobotArm(elapsedSeconds: number): AnimationFrame {
  const t = elapsedSeconds * CYCLE;

  // Waist sweeps the arm between a "pick" side and a "place" side.
  const waist = 0.9 * Math.sin(t);
  // Shoulder and elbow dip together to reach down, then lift.
  const shoulder = 0.35 + 0.45 * Math.sin(t * 2 + 0.4);
  const elbow = -0.7 + 0.55 * Math.sin(t * 2 + 1.1);
  // Wrist keeps the tool roughly level as the arm moves, plus a slow roll.
  const wristPitch = 0.3 * Math.sin(t * 2 + 1.7);
  const wristRoll = 0.8 * t;
  const toolRoll = -1.4 * t;

  return {
    [ARM_NODES.waist]: { rotation: [0, 0, waist] },
    [ARM_NODES.shoulder]: { rotation: [shoulder, 0, 0] },
    [ARM_NODES.elbow]: { rotation: [elbow, 0, 0] },
    [ARM_NODES.wristRoll]: { rotation: [0, 0, wristRoll] },
    [ARM_NODES.wristPitch]: { rotation: [wristPitch, 0, 0] },
    [ARM_NODES.tool]: { rotation: [0, 0, toolRoll] },
  };
}
