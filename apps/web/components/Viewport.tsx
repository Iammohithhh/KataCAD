"use client";

// The Three.js viewport — a canvas with plain functional lighting and orbit
// controls. It renders whatever children it is given (a Phase 1 bracket, a
// Phase 2+ hero scene). Cinematic lighting and bloom arrive in Phase 9.
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { ReactNode } from "react";

export interface ViewportProps {
  children: ReactNode;
  /** Initial camera position. Hero scenes reframe the camera themselves. */
  cameraPosition?: [number, number, number];
  /**
   * Use an orthographic camera — parts at any depth render the same size, the
   * correct projection for a CAD tool. Hero scenes set this; the framing is
   * then handled by their CameraRig.
   */
  orthographic?: boolean;
}

export function Viewport({
  children,
  cameraPosition = [160, 130, 160],
  orthographic = false,
}: ViewportProps) {
  return (
    <Canvas
      orthographic={orthographic}
      camera={{ position: cameraPosition, fov: 45, near: 1, far: 20000 }}
    >
      <hemisphereLight intensity={0.6} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[300, 400, 300]} intensity={1.2} />
      <directionalLight position={[-300, -120, -200]} intensity={0.4} />
      {children}
      <OrbitControls makeDefault />
    </Canvas>
  );
}
