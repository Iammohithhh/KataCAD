// Parametric gear geometry for the planetary gearbox hero.
//
// Teeth are deliberately simplified (trapezoidal, not involute) per the
// Phase 2 brief: they must read as a gear and animate smoothly, and a single
// extruded 2D outline is far faster to build than fusing teeth one by one.
import { draw, drawCircle, makeCylinder, type Shape3D } from "replicad";

import { extrudeOn } from "./util";

type Pt = [number, number];

// Angular stations within one tooth period, as (fraction of period, radius
// selector). The outline alternates between root radius (gaps) and tip radius
// (tooth crowns), giving a clean trapezoidal tooth.
const TOOTH_STATIONS: ReadonlyArray<[number, "root" | "tip"]> = [
  [0.0, "root"],
  [0.18, "root"],
  [0.34, "tip"],
  [0.66, "tip"],
  [0.82, "root"],
];

/** Generate the closed 2D outline of a toothed wheel as a ring of points. */
function toothedOutline(teeth: number, tipRadius: number, rootRadius: number): Pt[] {
  const period = (2 * Math.PI) / teeth;
  const points: Pt[] = [];
  for (let i = 0; i < teeth; i += 1) {
    for (const [fraction, which] of TOOTH_STATIONS) {
      const angle = (i + fraction) * period;
      const radius = which === "tip" ? tipRadius : rootRadius;
      points.push([radius * Math.cos(angle), radius * Math.sin(angle)]);
    }
  }
  return points;
}

/** Extrude a toothed outline (centered on Z) into a solid. */
function extrudeToothedWheel(points: Pt[], thickness: number): Shape3D {
  let pen = draw(points[0]);
  for (let i = 1; i < points.length; i += 1) {
    pen = pen.lineTo(points[i]);
  }
  return extrudeOn(pen.close(), "XY", thickness).translateZ(-thickness / 2);
}

export interface SpurGearSpec {
  teeth: number;
  /** Gear module — pitch diameter = module x teeth. */
  module: number;
  thickness: number;
  boreRadius: number;
}

/** The pitch radius of a gear with the given tooth count and module. */
export function pitchRadius(teeth: number, module: number): number {
  return (module * teeth) / 2;
}

/** Build an external spur gear, centered on the origin, axis along Z. */
export function makeSpurGear(spec: SpurGearSpec): Shape3D {
  const pitch = pitchRadius(spec.teeth, spec.module);
  const tipRadius = pitch + spec.module;
  const rootRadius = Math.max(
    pitch - 1.25 * spec.module,
    spec.boreRadius + spec.module * 0.8,
  );

  const wheel = extrudeToothedWheel(
    toothedOutline(spec.teeth, tipRadius, rootRadius),
    spec.thickness,
  );

  const bore = makeCylinder(
    spec.boreRadius,
    spec.thickness * 3,
    [0, 0, -spec.thickness * 1.5],
    [0, 0, 1],
  );
  return wheel.cut(bore);
}

export interface RingGearSpec {
  teeth: number;
  module: number;
  thickness: number;
  /** Outer radius of the ring body. */
  outerRadius: number;
}

/**
 * Build an internal ring gear: a disk with a gear-shaped bore cut out of it,
 * which leaves teeth pointing inward. Axis along Z, centered on the origin.
 */
export function makeRingGear(spec: RingGearSpec): Shape3D {
  const pitch = pitchRadius(spec.teeth, spec.module);
  const tipRadius = pitch + spec.module;
  const rootRadius = pitch - 1.25 * spec.module;

  const disk = extrudeOn(
    drawCircle(spec.outerRadius),
    "XY",
    spec.thickness,
  ).translateZ(-spec.thickness / 2);

  // A solid toothed wheel used as a cutting tool: removing it from the disk
  // leaves the ring's inward-pointing internal teeth.
  const cutter = extrudeToothedWheel(
    toothedOutline(spec.teeth, tipRadius, rootRadius),
    spec.thickness * 3,
  );

  return disk.cut(cutter);
}
