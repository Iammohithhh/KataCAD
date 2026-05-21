// Domain types shared across the KatACAD apps.

/** The three architecture layers a prompt can be routed to. */
export type Layer = 1 | 2 | 3;

/** The eight Layer 1 hero assemblies. Phase 2 implements the first three. */
export type HeroId =
  | "gearbox"
  | "gripper"
  | "robot-arm"
  | "quadcopter"
  | "v-twin"
  | "differential"
  | "bicycle"
  | "nema-mount";
