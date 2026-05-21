// A parametric L-bracket built with real Replicad B-Rep geometry.
//
// This module imports only from `replicad`, so the exact same code builds
// geometry in the browser viewport and in the headless Node fixture script.
// It must never import React, Three.js, or anything browser-specific.
import { draw, makeCylinder, type Shape3D } from "replicad";

export interface BracketParams {
  /** Length of each leg, measured from the outer corner (mm). */
  legLength: number;
  /** Depth of the bracket along the extrusion axis (mm). */
  width: number;
  /** Material thickness of both legs (mm). */
  thickness: number;
  /** Diameter of the four mounting holes (mm). */
  holeDiameter: number;
  /** Fillet radius applied to the profile corners (mm). 0 disables it. */
  filletRadius: number;
}

export const DEFAULT_BRACKET_PARAMS: BracketParams = {
  legLength: 60,
  width: 40,
  thickness: 6,
  holeDiameter: 6.5,
  filletRadius: 3,
};

export interface BracketParamDef {
  key: keyof BracketParams;
  label: string;
  min: number;
  max: number;
  step: number;
}

/** Slider definitions for the playground UI. */
export const BRACKET_PARAM_DEFS: readonly BracketParamDef[] = [
  { key: "legLength", label: "Leg length (mm)", min: 30, max: 120, step: 1 },
  { key: "width", label: "Width (mm)", min: 20, max: 80, step: 1 },
  { key: "thickness", label: "Thickness (mm)", min: 3, max: 12, step: 0.5 },
  { key: "holeDiameter", label: "Hole diameter (mm)", min: 3, max: 12, step: 0.5 },
  { key: "filletRadius", label: "Fillet radius (mm)", min: 0, max: 8, step: 0.5 },
];

// `Drawing.sketchOnPlane` is typed as a union; for a single closed profile it
// is always an extrudable sketch. This is the one operation we rely on.
interface Extrudable {
  extrude(distance: number): Shape3D;
}

/**
 * Build the L-bracket as a single B-Rep solid: an L-shaped profile extruded
 * to `width`, with two mounting holes drilled through each leg.
 */
export function buildBracket(params: BracketParams): Shape3D {
  const { legLength, width, thickness, holeDiameter, filletRadius } = params;
  const holeRadius = holeDiameter / 2;

  // L-shaped profile in the XZ plane: foot runs along +X, upright along +Z.
  let profile = draw([0, 0])
    .lineTo([legLength, 0])
    .lineTo([legLength, thickness])
    .lineTo([thickness, thickness])
    .lineTo([thickness, legLength])
    .lineTo([0, legLength])
    .close();

  if (filletRadius > 0) {
    profile = profile.fillet(filletRadius);
  }

  const sketch = profile.sketchOnPlane("XZ") as unknown as Extrudable;
  let bracket = sketch.extrude(width);

  // Four mounting holes — two through each leg. `inset` keeps each hole clear
  // of the corner and the free end so the surrounding wall stays solid.
  const inset = Math.max(holeDiameter, thickness);
  const yMid = width / 2;
  const drillDepth = thickness + 2;
  const nearPos = thickness + inset;
  const farPos = legLength - inset;

  for (const x of [nearPos, farPos]) {
    // Holes through the foot, drilled along Z.
    bracket = bracket.cut(makeCylinder(holeRadius, drillDepth, [x, yMid, -1], [0, 0, 1]));
  }
  for (const z of [nearPos, farPos]) {
    // Holes through the upright, drilled along X.
    bracket = bracket.cut(makeCylinder(holeRadius, drillDepth, [-1, yMid, z], [1, 0, 0]));
  }

  return bracket;
}
