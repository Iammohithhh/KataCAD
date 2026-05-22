// Hero — NEMA stepper-motor mount bracket.
//
// An L-bracket: a base plate that bolts to a surface, a vertical face plate
// carrying the motor bore and its four-bolt pattern, and two gusset ribs
// bracing the corner. Static — a bracket has no moving parts.
import { draw, makeBox, makeCylinder, type Shape3D } from "replicad";

import { node, type HeroDefinition, type HeroModel } from "./types";
import { extrudeOn, param } from "./util";

const BASE_DEPTH = 46;
const MOUNT_HOLE_RADIUS = 3.2;
const BOLT_HOLE_RADIUS = 1.7;
// NEMA 17 bolt pattern: 31 mm square -> 15.5 mm from the bore center.
const BOLT_OFFSET = 15.5;

/** A right-triangle gusset, extruded thin along X, sitting in the corner. */
function makeRib(thickness: number, depth: number, height: number): Shape3D {
  const profile = draw([thickness, thickness])
    .lineTo([thickness + depth, thickness])
    .lineTo([thickness, thickness + height])
    .close();
  return extrudeOn(profile, "YZ", thickness);
}

function buildNemaMount(params: Record<string, number>): HeroModel {
  const thickness = param(params, "plateThickness", 6);
  const faceSize = param(params, "faceSize", 60);
  const boreRadius = param(params, "boreRadius", 13);
  const half = faceSize / 2;

  // Base plate — flat on the ground, two mounting holes near the front.
  let basePlate: Shape3D = makeBox([-half, 0, 0], [half, BASE_DEPTH, thickness]);
  for (const x of [-half + 12, half - 12]) {
    basePlate = basePlate.cut(
      makeCylinder(MOUNT_HOLE_RADIUS, thickness * 3, [x, BASE_DEPTH - 12, -thickness], [0, 0, 1]),
    );
  }

  // Face plate — stands vertically, carries the motor bore + bolt pattern.
  let facePlate: Shape3D = makeBox([-half, 0, 0], [half, thickness, faceSize]);
  const boreZ = faceSize / 2;
  facePlate = facePlate.cut(
    makeCylinder(boreRadius, thickness * 3, [0, -thickness, boreZ], [0, 1, 0]),
  );
  for (const dx of [-BOLT_OFFSET, BOLT_OFFSET]) {
    for (const dz of [-BOLT_OFFSET, BOLT_OFFSET]) {
      facePlate = facePlate.cut(
        makeCylinder(BOLT_HOLE_RADIUS, thickness * 3, [dx, -thickness, boreZ + dz], [0, 1, 0]),
      );
    }
  }

  // Two triangular gusset ribs bracing the base-to-face corner.
  const ribDepth = BASE_DEPTH * 0.55;
  const ribHeight = faceSize * 0.55;
  const ribLeft = makeRib(thickness, ribDepth, ribHeight).translateX(-half + 2);
  const ribRight = makeRib(thickness, ribDepth, ribHeight).translateX(half - 2 - thickness);

  const root = node({
    name: "nema-mount",
    children: [
      node({ name: "base_plate", shape: basePlate }),
      node({ name: "face_plate", shape: facePlate }),
      node({ name: "rib_left", shape: ribLeft }),
      node({ name: "rib_right", shape: ribRight }),
    ],
  });

  return {
    root,
    sliders: [
      { key: "plateThickness", label: "Plate thickness (mm)", min: 4, max: 12, step: 0.5 },
      { key: "faceSize", label: "Face plate size (mm)", min: 45, max: 80, step: 1 },
      { key: "boreRadius", label: "Motor bore radius (mm)", min: 8, max: 20, step: 0.5 },
    ],
  };
}

export const nemaMountDefinition: HeroDefinition = {
  id: "nema-mount",
  label: "NEMA Motor Mount",
  defaultParams: { plateThickness: 6, faceSize: 60, boreRadius: 13 },
  build: buildNemaMount,
  animate: () => ({}),
};
