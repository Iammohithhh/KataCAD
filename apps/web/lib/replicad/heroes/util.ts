// Small geometry helpers shared by the hero modules.
import { drawCircle, makeCylinder, type Shape3D } from "replicad";

import type { Vec3 } from "./types";

// `Drawing.sketchOnPlane` is typed as a union; for the closed profiles the
// heroes build it is always an extrudable/revolvable sketch. These structural
// types let us use it without depending on Replicad's exact (broad) types.
type Sketchable = { sketchOnPlane(plane: string, origin?: number): unknown };
type Extrudable = { extrude(distance: number): Shape3D };
type Revolvable = {
  revolve(axis?: Vec3, config?: { origin?: Vec3; angle?: number }): Shape3D;
};

/** Extrude a closed 2D drawing on the given plane into a solid. */
export function extrudeOn(
  drawing: unknown,
  plane: "XY" | "XZ" | "YZ",
  distance: number,
): Shape3D {
  const sketch = (drawing as Sketchable).sketchOnPlane(plane);
  return (sketch as Extrudable).extrude(distance);
}

/** Revolve a 2D drawing around an axis into a solid. */
export function revolveOn(
  drawing: unknown,
  plane: "XY" | "XZ" | "YZ",
  axis: Vec3,
): Shape3D {
  const sketch = (drawing as Sketchable).sketchOnPlane(plane);
  return (sketch as Revolvable).revolve(axis);
}

/** A cylindrical rod running between two 3D points (used for frame tubes). */
export function tubeBetween(a: Vec3, b: Vec3, radius: number): Shape3D {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  const length = Math.hypot(dx, dy, dz);
  if (length < 1e-6) {
    throw new Error("tubeBetween: start and end points coincide");
  }
  return makeCylinder(radius, length, a, [dx / length, dy / length, dz / length]);
}

/** A torus centered on the origin, axis along Z. */
export function makeTorus(majorRadius: number, minorRadius: number): Shape3D {
  // Offset a minor-radius circle to the major radius, then revolve about Z.
  return revolveOn(drawCircle(minorRadius).translate([majorRadius, 0]), "XZ", [0, 0, 1]);
}

/** Read a numeric parameter with a fallback when it is missing. */
export function param(
  params: Record<string, number>,
  key: string,
  fallback: number,
): number {
  const value = params[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
