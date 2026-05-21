// Hero 3 — six-axis robot arm.
//
// A kinematic chain of seven nodes: a fixed base, then six articulated joints
// (waist, shoulder, elbow, wrist roll, wrist pitch, tool). Each link is built
// pointing +Z from its joint at the origin; the scene-graph nesting composes
// the chain, and the animation drives the joint angles through a loop.
import { drawRoundedRectangle, makeCylinder, type Shape3D } from "replicad";

import { animateRobotArm, ARM_NODES } from "@/lib/animations/robot-arm";

import { node, type HeroDefinition, type HeroModel } from "./types";
import { extrudeOn, param } from "./util";

const WAIST_HEIGHT = 70;
const WRIST_ROLL_LENGTH = 55;
const WRIST_PITCH_LENGTH = 50;

/** A rounded-box arm link pointing +Z from its joint at the origin. */
function makeLink(width: number, depth: number, length: number): Shape3D {
  return extrudeOn(drawRoundedRectangle(width, depth, 6), "XY", length);
}

/** A hinge nub: a cylinder lying along X, centered on the joint origin. */
function hingeNub(radius: number, width: number): Shape3D {
  return makeCylinder(radius, width, [-width / 2, 0, 0], [1, 0, 0]);
}

function buildRobotArm(params: Record<string, number>): HeroModel {
  const upperArm = param(params, "upperArm", 200);
  const forearm = param(params, "forearm", 170);

  // --- link geometry -----------------------------------------------------
  const base = makeCylinder(72, 44, [0, 0, 0], [0, 0, 1]).fuse(
    makeCylinder(46, 32, [0, 0, 44], [0, 0, 1]),
  );
  const baseHeight = 44 + 32;

  const waist = makeCylinder(44, WAIST_HEIGHT, [0, 0, 0], [0, 0, 1]);

  const shoulderLink = makeLink(56, 44, upperArm).fuse(hingeNub(30, 62));
  const elbowLink = makeLink(46, 38, forearm).fuse(hingeNub(26, 52));
  const wristRollLink = makeCylinder(30, WRIST_ROLL_LENGTH, [0, 0, 0], [0, 0, 1]);
  const wristPitchLink = makeLink(40, 34, WRIST_PITCH_LENGTH).fuse(hingeNub(22, 46));
  const toolFlange = makeCylinder(30, 24, [0, 0, 0], [0, 0, 1]).fuse(
    makeCylinder(14, 30, [0, 0, 24], [0, 0, 1]),
  );

  // --- kinematic chain (nested nodes) ------------------------------------
  const root = node({
    name: "robot-arm",
    children: [
      node({
        name: ARM_NODES.base,
        shape: base,
        children: [
          node({
            name: ARM_NODES.waist,
            shape: waist,
            position: [0, 0, baseHeight],
            children: [
              node({
                name: ARM_NODES.shoulder,
                shape: shoulderLink,
                position: [0, 0, WAIST_HEIGHT],
                children: [
                  node({
                    name: ARM_NODES.elbow,
                    shape: elbowLink,
                    position: [0, 0, upperArm],
                    children: [
                      node({
                        name: ARM_NODES.wristRoll,
                        shape: wristRollLink,
                        position: [0, 0, forearm],
                        children: [
                          node({
                            name: ARM_NODES.wristPitch,
                            shape: wristPitchLink,
                            position: [0, 0, WRIST_ROLL_LENGTH],
                            children: [
                              node({
                                name: ARM_NODES.tool,
                                shape: toolFlange,
                                position: [0, 0, WRIST_PITCH_LENGTH],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  return {
    root,
    sliders: [
      { key: "upperArm", label: "Upper arm length (mm)", min: 140, max: 260, step: 5 },
      { key: "forearm", label: "Forearm length (mm)", min: 110, max: 220, step: 5 },
    ],
  };
}

export const robotArmDefinition: HeroDefinition = {
  id: "robot-arm",
  label: "Six-Axis Robot Arm",
  defaultParams: { upperArm: 200, forearm: 170 },
  build: buildRobotArm,
  animate: animateRobotArm,
};
