// Hero — quadcopter frame.
//
// A central hull with a canopy, four booms in an X layout each ending in a
// motor, and a two-blade propeller on each motor. The propellers spin.
import { drawRoundedRectangle, makeBaseBox, makeCylinder, type Shape3D } from "replicad";

import { animateQuadcopter, QUADCOPTER_NODES } from "@/lib/animations/quadcopter";

import { node, type HeroDefinition, type HeroModel, type HeroNode, type Vec3 } from "./types";
import { extrudeOn, param } from "./util";

const HULL_HEIGHT = 22;
const BOOM_Z = HULL_HEIGHT / 2;
const BOOM_RADIUS = 5;
const MOTOR_RADIUS = 9;
const MOTOR_HEIGHT = 14;

/** A boom running out along +X, with a motor barrel at its tip. */
function makeArm(armLength: number): Shape3D {
  const boom = makeCylinder(BOOM_RADIUS, armLength, [0, 0, BOOM_Z], [1, 0, 0]);
  const motor = makeCylinder(MOTOR_RADIUS, MOTOR_HEIGHT, [armLength, 0, BOOM_Z - 2], [0, 0, 1]);
  return boom.fuse(motor);
}

/** A two-blade propeller, hub centered on the origin, spinning about Z. */
function makePropeller(bladeLength: number): Shape3D {
  let prop: Shape3D = makeCylinder(8, 9, [0, 0, 0], [0, 0, 1]);
  const blade = makeBaseBox(bladeLength, 11, 3).translateZ(4.5);
  prop = prop.fuse(blade.clone().translateX(bladeLength / 2));
  prop = prop.fuse(blade.clone().translateX(-bladeLength / 2));
  return prop;
}

function buildQuadcopter(params: Record<string, number>): HeroModel {
  const hullSize = param(params, "hullSize", 72);
  const armLength = param(params, "armLength", 96);
  const bladeLength = param(params, "bladeLength", 56);

  // Hull: a rounded slab with a smaller canopy fused on top.
  let hull = extrudeOn(drawRoundedRectangle(hullSize, hullSize, 10), "XY", HULL_HEIGHT);
  const canopy = extrudeOn(
    drawRoundedRectangle(hullSize * 0.55, hullSize * 0.55, 8),
    "XY",
    14,
  ).translateZ(HULL_HEIGHT);
  hull = hull.fuse(canopy);

  const arm = makeArm(armLength);
  const propeller = makePropeller(bladeLength);
  const propZ = BOOM_Z + MOTOR_HEIGHT;

  const armNodes: HeroNode[] = [];
  for (let i = 0; i < 4; i += 1) {
    const heading = Math.PI / 4 + (i * Math.PI) / 2;
    armNodes.push(
      node({
        name: QUADCOPTER_NODES.arm(i),
        shape: arm,
        rotation: [0, 0, heading],
        children: [
          node({
            name: QUADCOPTER_NODES.propeller(i),
            shape: propeller,
            position: [armLength, 0, propZ] as Vec3,
          }),
        ],
      }),
    );
  }

  const root = node({
    name: "quadcopter",
    children: [node({ name: QUADCOPTER_NODES.hull, shape: hull }), ...armNodes],
  });

  return {
    root,
    sliders: [
      { key: "hullSize", label: "Hull size (mm)", min: 55, max: 95, step: 1 },
      { key: "armLength", label: "Arm length (mm)", min: 75, max: 130, step: 1 },
      { key: "bladeLength", label: "Propeller length (mm)", min: 40, max: 80, step: 1 },
    ],
  };
}

export const quadcopterDefinition: HeroDefinition = {
  id: "quadcopter",
  label: "Quadcopter Frame",
  defaultParams: { hullSize: 72, armLength: 96, bladeLength: 56 },
  build: buildQuadcopter,
  animate: animateQuadcopter,
};
