// Converts a Replicad B-Rep shape into Three.js geometry for the viewport.
//
// Replicad meshes the OpenCascade solid into triangles (faces) and polylines
// (edges); `replicad-threejs-helper` writes those buffers into Three.js
// BufferGeometry objects.
import { syncFaces, syncLines } from "replicad-threejs-helper";
import type { Shape3D } from "replicad";
import { BufferGeometry } from "three";

// Meshing tolerances. Smaller = finer mesh, slower. These values give a
// smooth bracket without a noticeable tessellation delay.
const MESH_TOLERANCE = 0.05;
const ANGULAR_TOLERANCE = 0.3;

export interface TessellatedShape {
  /** Triangulated faces — render as a solid mesh. */
  faces: BufferGeometry;
  /** B-Rep edges — render as line segments over the mesh. */
  edges: BufferGeometry;
}

/** Tessellate a shape into face and edge geometry for Three.js. */
export function tessellate(shape: Shape3D): TessellatedShape {
  const faces = new BufferGeometry();
  const edges = new BufferGeometry();

  syncFaces(
    faces,
    shape.mesh({ tolerance: MESH_TOLERANCE, angularTolerance: ANGULAR_TOLERANCE }),
  );
  syncLines(edges, shape.meshEdges());

  return { faces, edges };
}
