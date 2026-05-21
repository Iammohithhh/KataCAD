// Flatten a hero scene graph into a single Replicad compound for export.
//
// Rendering animates nested Three.js groups, but a STEP/STL file needs one
// assembled solid. We walk the tree, compose each node's world transform with
// Three.js matrix math, bake that transform into a clone of the node's shape,
// and gather everything into a compound.
import { makeCompound, type Shape3D } from "replicad";
import { Euler, Matrix4, Quaternion, Vector3 } from "three";

import type { HeroModel, HeroNode, Vec3 } from "./types";

export interface HeroBounds {
  center: Vec3;
  size: Vec3;
}

export interface AssembledHero {
  /** Every node shape baked into world position — one Replicad compound. */
  compound: ReturnType<typeof makeCompound>;
  /** Axis-aligned bounds of the assembled hero at rest. */
  bounds: HeroBounds;
}

/** Apply a world transform (decomposed from a matrix) to a clone of a shape. */
function bakeTransform(shape: Shape3D, world: Matrix4): Shape3D {
  const position = new Vector3();
  const quaternion = new Quaternion();
  const scale = new Vector3();
  world.decompose(position, quaternion, scale);

  let result = shape.clone();

  // Quaternion -> axis-angle. Replicad's rotate takes degrees about an axis.
  const w = Math.min(1, Math.max(-1, quaternion.w));
  const angle = 2 * Math.acos(w);
  if (angle > 1e-6) {
    const sinHalf = Math.sqrt(Math.max(0, 1 - w * w));
    const axis: Vec3 =
      sinHalf < 1e-6
        ? [0, 0, 1]
        : [quaternion.x / sinHalf, quaternion.y / sinHalf, quaternion.z / sinHalf];
    result = result.rotate((angle * 180) / Math.PI, [0, 0, 0], axis);
  }

  return result.translate([position.x, position.y, position.z]);
}

/** Recursively collect every node's shape, transformed into world space. */
function collect(node: HeroNode, parentWorld: Matrix4, out: Shape3D[]): void {
  const local = new Matrix4().compose(
    new Vector3(node.position[0], node.position[1], node.position[2]),
    new Quaternion().setFromEuler(
      new Euler(node.rotation[0], node.rotation[1], node.rotation[2], "XYZ"),
    ),
    new Vector3(1, 1, 1),
  );
  const world = new Matrix4().multiplyMatrices(parentWorld, local);

  if (node.shape) {
    out.push(bakeTransform(node.shape, world));
  }
  for (const child of node.children) {
    collect(child, world, out);
  }
}

/** Assemble a hero into one compound plus its rest-pose bounding box. */
export function assembleHero(model: HeroModel): AssembledHero {
  const shapes: Shape3D[] = [];
  collect(model.root, new Matrix4(), shapes);

  const compound = makeCompound(shapes);
  const box = compound.boundingBox;

  return {
    compound,
    bounds: {
      center: box.center as Vec3,
      size: [box.width, box.height, box.depth],
    },
  };
}
