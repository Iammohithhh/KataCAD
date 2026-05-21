"use client";

// Renders a hero scene graph and animates it.
//
// Each HeroNode becomes a nested <group>; nesting composes the assembly's
// transforms. Geometry is tessellated once when the hero loads. A single
// useFrame evaluates the hero's animation and writes each node's transform.
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import { BufferGeometry, Group, PerspectiveCamera } from "three";

import { tessellate } from "@/lib/replicad";
import type { AnimationFrame, HeroBounds, HeroModel, HeroNode, Vec3 } from "@/lib/replicad/heroes";

interface RenderNode {
  name: string;
  faces: BufferGeometry | null;
  edges: BufferGeometry | null;
  position: Vec3;
  rotation: Vec3;
  children: RenderNode[];
}

type GroupMap = MutableRefObject<Map<string, Group>>;

/** Tessellate a hero node tree into renderable Three.js geometry. */
function buildRenderTree(source: HeroNode): RenderNode {
  let faces: BufferGeometry | null = null;
  let edges: BufferGeometry | null = null;
  if (source.shape) {
    const mesh = tessellate(source.shape);
    faces = mesh.faces;
    edges = mesh.edges;
  }
  return {
    name: source.name,
    faces,
    edges,
    position: source.position,
    rotation: source.rotation,
    children: source.children.map(buildRenderTree),
  };
}

function NodeView({ node, groups }: { node: RenderNode; groups: GroupMap }) {
  const attach = (group: Group | null): void => {
    if (group) groups.current.set(node.name, group);
    else groups.current.delete(node.name);
  };

  return (
    <group ref={attach} position={node.position} rotation={node.rotation}>
      {node.faces ? (
        <mesh geometry={node.faces}>
          <meshStandardMaterial color="#9aa0a6" metalness={0.15} roughness={0.55} />
        </mesh>
      ) : null}
      {node.edges ? (
        <lineSegments geometry={node.edges}>
          <lineBasicMaterial color="#1a1a1a" />
        </lineSegments>
      ) : null}
      {node.children.map((child) => (
        <NodeView key={child.name} node={child} groups={groups} />
      ))}
    </group>
  );
}

/** Reframes the camera to fit a hero of the given bounding radius. */
function CameraRig({ radius }: { radius: number }) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const controls = useThree((state) => state.controls) as unknown as
    | { target: { set: (x: number, y: number, z: number) => void }; update: () => void }
    | null;
  const last = useRef<number>(-1);

  useFrame(() => {
    if (last.current === radius) return;
    last.current = radius;
    const distance = Math.max(radius, 1) * 1.9;
    camera.position.set(distance, distance * 0.78, distance);
    camera.near = Math.max(0.5, radius / 80);
    camera.far = radius * 60;
    camera.updateProjectionMatrix();
    if (controls) {
      controls.target.set(0, 0, 0);
      controls.update();
    }
  });

  return null;
}

export interface HeroSceneProps {
  model: HeroModel;
  bounds: HeroBounds;
  animate: (elapsedSeconds: number) => AnimationFrame;
}

export function HeroScene({ model, bounds, animate }: HeroSceneProps) {
  const { tree, rest } = useMemo(() => {
    const built = buildRenderTree(model.root);
    const restMap = new Map<string, { position: Vec3; rotation: Vec3 }>();
    const walk = (node: RenderNode): void => {
      restMap.set(node.name, { position: node.position, rotation: node.rotation });
      node.children.forEach(walk);
    };
    walk(built);
    return { tree: built, rest: restMap };
  }, [model]);

  const groups = useRef<Map<string, Group>>(new Map());

  useFrame((state) => {
    const frame = animate(state.clock.getElapsedTime());
    for (const name of Object.keys(frame)) {
      const group = groups.current.get(name);
      const base = rest.get(name);
      if (!group || !base) continue;
      const { rotation: mr, position: mp } = frame[name];
      group.rotation.set(
        base.rotation[0] + (mr?.[0] ?? 0),
        base.rotation[1] + (mr?.[1] ?? 0),
        base.rotation[2] + (mr?.[2] ?? 0),
      );
      group.position.set(
        base.position[0] + (mp?.[0] ?? 0),
        base.position[1] + (mp?.[1] ?? 0),
        base.position[2] + (mp?.[2] ?? 0),
      );
    }
  });

  const radius = Math.max(bounds.size[0], bounds.size[1], bounds.size[2], 1) / 2;

  return (
    <>
      <CameraRig radius={radius} />
      <group position={[-bounds.center[0], -bounds.center[1], -bounds.center[2]]}>
        <NodeView node={tree} groups={groups} />
      </group>
    </>
  );
}
