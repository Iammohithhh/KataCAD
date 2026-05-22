"use client";

// The Three.js viewport — Phase 9 cinematic pass.
//
// A warm key / cool fill / cool rim three-point rig, a procedural environment
// map for metallic reflections, and a flat soft backdrop with a CSS vignette
// for cinematic depth. It renders whatever children it is given (a hero scene,
// the playground bracket); contact shadows live with the hero scene, which
// knows the model's bounds.
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { ReactNode } from "react";

import { LIGHTING, VIEWPORT } from "@/lib/theme";

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
    <div className="relative h-full w-full">
      <Canvas
        orthographic={orthographic}
        camera={{ position: cameraPosition, fov: 45, near: 1, far: 20000 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          // Required for per-material clipping (the section view).
          gl.localClippingEnabled = true;
        }}
      >
        {/* Flat soft backdrop — the CSS vignette below adds the depth. */}
        <color attach="background" args={[VIEWPORT.backdropTop]} />

        {/* Three-point rig: warm key, cool fill, cool rim. */}
        <ambientLight intensity={LIGHTING.ambient} />
        <hemisphereLight
          args={[
            LIGHTING.hemisphereSky,
            LIGHTING.hemisphereGround,
            LIGHTING.hemisphereIntensity,
          ]}
        />
        <directionalLight
          position={[260, 320, 220]}
          intensity={LIGHTING.keyIntensity}
          color={LIGHTING.keyColor}
        />
        <directionalLight
          position={[-280, 80, -160]}
          intensity={LIGHTING.fillIntensity}
          color={LIGHTING.fillColor}
        />
        <directionalLight
          position={[-60, 220, -320]}
          intensity={LIGHTING.rimIntensity}
          color={LIGHTING.rimColor}
        />

        {/* Procedural environment — gives the metal its specular life without a
            network HDR fetch. Rendered once. */}
        <Environment resolution={256} frames={1}>
          <Lightformer
            form="rect"
            intensity={2.6}
            color={LIGHTING.envBright}
            scale={[14, 14, 1]}
            position={[0, 9, 5]}
            rotation={[Math.PI / 2, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={1.1}
            color={LIGHTING.fillColor}
            scale={[9, 4, 1]}
            position={[-8, 3, -7]}
          />
          <Lightformer
            form="rect"
            intensity={0.9}
            color={LIGHTING.keyColor}
            scale={[9, 4, 1]}
            position={[8, 2, 7]}
          />
        </Environment>

        {children}
        <OrbitControls makeDefault />
      </Canvas>

      {/* Cinematic vignette — a DOM overlay, never touches the WebGL frame. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(120% 90% at 50% 38%, transparent 52%, ${VIEWPORT.backdropBottom} 100%)`,
        }}
      />
    </div>
  );
}
