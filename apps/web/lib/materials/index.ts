// Typed access to the material catalogue.
import catalogue from "./catalogue.json";

export interface Material {
  id: string;
  name: string;
  /** The governing material standard, e.g. "ASTM B221". */
  standard: string;
  category: string;
  /** Density in g/cm^3. */
  density: number;
  /** Yield strength in MPa. */
  yieldStrength: number;
  /** Ultimate tensile strength in MPa. */
  ultimateStrength: number;
  hardness: string;
  surfaceFinish: string;
  process: string;
  /** Indicative cost in USD per kilogram. */
  costPerKg: number;
}

export const MATERIALS: Material[] = catalogue;

const BY_ID = new Map(MATERIALS.map((material) => [material.id, material]));

/** Look up a material; falls back to the first catalogue entry if unknown. */
export function getMaterial(id: string): Material {
  return BY_ID.get(id) ?? MATERIALS[0];
}
