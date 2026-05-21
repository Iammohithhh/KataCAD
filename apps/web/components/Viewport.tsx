"use client";

// The Three.js viewport. Phase 1 uses plain functional lighting only — enough
// to read the geometry. Cinematic three-point lighting and bloom arrive in
// Phase 9; do not add them here.
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { ReplicadShape } from "@/components/ReplicadShape";
import type { TessellatedShape } from "@/lib/replicad";

export interface ViewportProps {
  mesh: TessellatedShape | null;
}

export function Viewport({ mesh }: ViewportProps) {
  return (
    <Canvas camera={{ position: [130, 100, 130], fov: 45, near: 1, far: 8000 }}>
      <hemisphereLight intensity={0.6} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[120, 160, 130]} intensity={1.2} />
      <directionalLight position={[-130, -50, -90]} intensity={0.4} />
      {mesh ? <ReplicadShape mesh={mesh} /> : null}
      <OrbitControls />
    </Canvas>
  );
}
