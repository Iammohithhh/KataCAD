// Geometric measurements for the dossier dimension table.
import { measureShapeSurfaceProperties, measureVolume, type AnyShape, type Shape3D } from "replicad";

import type { HeroBounds } from "@/lib/replicad/heroes";

export interface PartMeasurements {
  /** Bounding-box extents [x, y, z] in mm. */
  dimensions: [number, number, number];
  /** Volume in mm^3. */
  volume: number;
  /** Surface area in mm^2. */
  surfaceArea: number;
  faces: number;
  edges: number;
}

/** Measure a part's geometry for the dossier. Robust to measurement failures. */
export function measurePart(shape: AnyShape, bounds: HeroBounds): PartMeasurements {
  let volume = 0;
  try {
    volume = measureVolume(shape as Shape3D);
  } catch {
    volume = 0;
  }

  let surfaceArea = 0;
  try {
    surfaceArea = measureShapeSurfaceProperties(shape as Shape3D).area;
  } catch {
    surfaceArea = 0;
  }

  return {
    dimensions: bounds.size,
    volume,
    surfaceArea,
    faces: shape.faces.length,
    edges: shape.edges.length,
  };
}

/** Mass in grams, given a volume (mm^3) and a density (g/cm^3). */
export function massGrams(volumeMm3: number, densityGCm3: number): number {
  return (volumeMm3 / 1000) * densityGCm3;
}
