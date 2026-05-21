// Hero 2 — five-finger robotic gripper.
//
// A cylindrical palm with N fingers spaced evenly around its rim. Each finger
// has two phalanges; both curl about their local X axis (tangent to the palm)
// so the grasp animation closes every finger toward the central axis.
import { drawRoundedRectangle, makeCylinder, type Shape3D } from "replicad";

import { animateGripper, GRIPPER_NODES } from "@/lib/animations/gripper";

import { node, type HeroDefinition, type HeroModel, type HeroNode, type Vec3 } from "./types";
import { extrudeOn, param } from "./util";

const PALM_HEIGHT = 34;
const REST_SPLAY = 0.14; // radians — fingers sit slightly open at rest

/** Build one phalanx: a rounded bar pointing +Z with its joint at the origin. */
function makePhalanx(width: number, depth: number, length: number): Shape3D {
  return extrudeOn(drawRoundedRectangle(width, depth, 4), "XY", length);
}

function buildGripper(params: Record<string, number>): HeroModel {
  const fingerCount = Math.max(1, Math.round(param(params, "fingerCount", 5)));
  const palmRadius = param(params, "palmRadius", 46);
  const proximalLength = param(params, "proximalLength", 46);
  const distalLength = proximalLength * 0.8;

  const palm = makeCylinder(palmRadius, PALM_HEIGHT, [0, 0, 0], [0, 0, 1]);
  const proximal = makePhalanx(22, 17, proximalLength);
  const distal = makePhalanx(18, 14, distalLength);

  const rimRadius = palmRadius - 7;

  const fingerNodes: HeroNode[] = [];
  for (let i = 0; i < fingerCount; i += 1) {
    const angle = (2 * Math.PI * i) / fingerCount;
    const position: Vec3 = [
      rimRadius * Math.cos(angle),
      rimRadius * Math.sin(angle),
      PALM_HEIGHT,
    ];
    // Rotate about Z so the finger's local X axis is tangent to the palm;
    // the curl animation then rotates each phalanx about that local X.
    const rotation: Vec3 = [REST_SPLAY, 0, angle + Math.PI / 2];

    fingerNodes.push(
      node({
        name: GRIPPER_NODES.proximal(i),
        shape: proximal,
        position,
        rotation,
        children: [
          node({
            name: GRIPPER_NODES.distal(i),
            shape: distal,
            position: [0, 0, proximalLength],
          }),
        ],
      }),
    );
  }

  const root = node({
    name: "gripper",
    children: [node({ name: GRIPPER_NODES.palm, shape: palm, children: fingerNodes })],
  });

  return {
    root,
    sliders: [
      { key: "fingerCount", label: "Finger count", min: 3, max: 5, step: 1 },
      { key: "palmRadius", label: "Palm radius (mm)", min: 35, max: 60, step: 1 },
      { key: "proximalLength", label: "Finger length (mm)", min: 32, max: 64, step: 1 },
    ],
  };
}

export const gripperDefinition: HeroDefinition = {
  id: "gripper",
  label: "Five-Finger Gripper",
  defaultParams: { fingerCount: 5, palmRadius: 46, proximalLength: 46 },
  build: buildGripper,
  animate: animateGripper,
};
