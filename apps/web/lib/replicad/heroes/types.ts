// Scene-graph model for Layer 1 heroes.
//
// A hero is a tree of HeroNodes. Each node carries optional geometry built in
// a canonical local frame (pivot at the origin) plus a rest transform that
// places it relative to its parent. Animation adds per-frame deltas on top of
// the rest transform; geometry is never rebuilt to animate.
import type { Shape3D } from "replicad";

export type Vec3 = [number, number, number];

/** Hero parameters are a flat bag of numbers (slider-friendly). */
export type HeroParams = Record<string, number>;

export interface HeroNode {
  /** Semantic name — unique within the hero, used for animation lookup. */
  name: string;
  /** Geometry at this node, in its local frame. Omitted for pure joint nodes. */
  shape?: Shape3D;
  /** Rest translation relative to the parent node. */
  position: Vec3;
  /** Rest rotation (euler XYZ, radians) relative to the parent node. */
  rotation: Vec3;
  /** Child nodes, transformed relative to this node. */
  children: HeroNode[];
}

/** A per-frame animation override for one node, added on top of its rest transform. */
export interface NodeMotion {
  /** Rotation delta (euler XYZ, radians). */
  rotation?: Vec3;
  /** Translation delta. */
  position?: Vec3;
}

/** Animation state for one frame: node name -> motion. Absent nodes stay at rest. */
export type AnimationFrame = Record<string, NodeMotion>;

/** A parameter-slider definition. The slider UI panel itself arrives in Phase 4. */
export interface SliderDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
}

export interface HeroModel {
  /** Root of the scene graph. */
  root: HeroNode;
  /** Slider definitions for this hero's parameters. */
  sliders: readonly SliderDef[];
}

/** A buildable, animatable Layer 1 hero. */
export interface HeroDefinition {
  id: string;
  label: string;
  defaultParams: HeroParams;
  /** Build the scene graph from parameters. */
  build(params: HeroParams): HeroModel;
  /** Evaluate the animation at `elapsedSeconds`; returns per-node motion. */
  animate(elapsedSeconds: number, params: HeroParams): AnimationFrame;
}

/** Create a HeroNode with sensible defaults for the optional transform fields. */
export function node(config: {
  name: string;
  shape?: Shape3D;
  position?: Vec3;
  rotation?: Vec3;
  children?: HeroNode[];
}): HeroNode {
  return {
    name: config.name,
    shape: config.shape,
    position: config.position ?? [0, 0, 0],
    rotation: config.rotation ?? [0, 0, 0],
    children: config.children ?? [],
  };
}
