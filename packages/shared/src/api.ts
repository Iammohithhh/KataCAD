import type { Layer } from "./domain";

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

export interface EchoRequest {
  message: string;
}

export interface EchoResponse {
  received: string;
  service: string;
}

/** A prompt sent to the router for classification. */
export interface RouteRequest {
  prompt: string;
}

/** The router's classification of a prompt. */
export interface RouteResponse {
  layer: Layer;
  /** Hero id when `layer` is 1, otherwise null. */
  hero: string | null;
  /** Archetype name when `layer` is 2, otherwise null. */
  archetype: string | null;
  /** Numeric parameters extracted from the prompt. */
  params: Record<string, number>;
  /** Where the classification came from. */
  source: "openai" | "cache" | "fallback";
}

/** A request to generate a Layer 2 archetype. */
export interface GenerateRequest {
  archetype: string;
  params: Record<string, number>;
}

/** A node in an archetype's semantic feature tree. */
export interface ArchetypeFeatureNode {
  name: string;
  children: ArchetypeFeatureNode[];
}

/** A parameter-slider definition for an archetype. */
export interface ArchetypeSlider {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
}

/** Metadata describing a generated archetype. */
export interface ArchetypeMetadata {
  archetype: string;
  label: string;
  semantic_tree: ArchetypeFeatureNode;
  sliders: ArchetypeSlider[];
  bounding_box: [number, number, number];
}

/** A generated Layer 2 archetype: a base64 STEP file plus its metadata. */
export interface GenerateResponse {
  step_b64: string;
  metadata: ArchetypeMetadata;
}
