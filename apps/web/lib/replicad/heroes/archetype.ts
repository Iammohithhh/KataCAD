// Turns a Layer 2 archetype (a base64 STEP + metadata from the API) into a
// renderable model. The imported STEP becomes the geometry of a single-node
// hero model, so the existing viewport, feature tree and sliders all apply.
import { importSTEP, type Shape3D } from "replicad";

import type { ArchetypeFeatureNode, GenerateResponse } from "@katacad/shared";

import type { HeroBounds } from "./flatten";
import { node, type HeroModel, type HeroNode, type SliderDef, type Vec3 } from "./types";

export interface LoadedArchetype {
  model: HeroModel;
  bounds: HeroBounds;
  /** The imported B-Rep solid — used for STEP / STL export. */
  shape: Shape3D;
}

/** Decode a base64 STEP string into a Blob (browser-side). */
function base64ToBlob(b64: string): Blob {
  const binary = atob(b64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([buffer]);
}

/** Convert the API's feature tree into shapeless hero nodes (for display). */
function toFeatureNodes(features: ArchetypeFeatureNode[]): HeroNode[] {
  return features.map((feature) =>
    node({ name: feature.name, children: toFeatureNodes(feature.children) }),
  );
}

/** Import a generated archetype's STEP and wrap it as a renderable model. */
export async function loadArchetype(response: GenerateResponse): Promise<LoadedArchetype> {
  const blob = base64ToBlob(response.step_b64);
  const shape = (await importSTEP(blob)) as Shape3D;

  const tree = response.metadata.semantic_tree;
  const root = node({
    name: tree.name,
    shape,
    children: toFeatureNodes(tree.children),
  });

  const box = shape.boundingBox;
  const bounds: HeroBounds = {
    center: box.center as Vec3,
    size: [box.width, box.height, box.depth],
  };

  const sliders: SliderDef[] = response.metadata.sliders.map((s) => ({
    key: s.key,
    label: s.label,
    min: s.min,
    max: s.max,
    step: s.step,
  }));

  return { model: { root, sliders }, bounds, shape };
}
