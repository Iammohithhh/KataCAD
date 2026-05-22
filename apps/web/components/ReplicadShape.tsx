"use client";

// Renders a tessellated Replicad shape: a shaded solid mesh plus its B-Rep
// edges drawn on top. The shape is built in the +X/+Y/+Z octant, so the
// group is offset to bring its bounding-box center to the world origin.
import { useMemo } from "react";
import { Vector3 } from "three";

import type { TessellatedShape } from "@/lib/replicad";
import { VIEWPORT } from "@/lib/theme";

export interface ReplicadShapeProps {
  mesh: TessellatedShape;
}

export function ReplicadShape({ mesh }: ReplicadShapeProps) {
  const center = useMemo(() => {
    mesh.faces.computeBoundingBox();
    const c = new Vector3();
    mesh.faces.boundingBox?.getCenter(c);
    return c;
  }, [mesh]);

  return (
    <group position={[-center.x, -center.y, -center.z]}>
      <mesh geometry={mesh.faces} castShadow>
        <meshStandardMaterial
          color={VIEWPORT.partColor}
          metalness={VIEWPORT.partMetalness}
          roughness={VIEWPORT.partRoughness}
        />
      </mesh>
      <lineSegments geometry={mesh.edges}>
        <lineBasicMaterial color={VIEWPORT.edgeColor} transparent opacity={0.55} />
      </lineSegments>
    </group>
  );
}
