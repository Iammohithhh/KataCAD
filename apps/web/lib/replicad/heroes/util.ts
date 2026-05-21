// Small geometry helpers shared by the hero modules.
import type { Shape3D } from "replicad";

// `Drawing.sketchOnPlane` is typed as a union; for the closed profiles the
// heroes build it is always an extrudable sketch. These structural types let
// us extrude without depending on Replicad's exact (and broad) sketch types.
type Sketchable = { sketchOnPlane(plane: string, origin?: number): unknown };
type Extrudable = { extrude(distance: number): Shape3D };

/** Extrude a closed 2D drawing on the given plane into a solid. */
export function extrudeOn(
  drawing: unknown,
  plane: "XY" | "XZ" | "YZ",
  distance: number,
): Shape3D {
  const sketch = (drawing as Sketchable).sketchOnPlane(plane);
  return (sketch as Extrudable).extrude(distance);
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
