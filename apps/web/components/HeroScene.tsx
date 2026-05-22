"use client";

// Renders a hero scene graph and animates it.
//
// Each HeroNode becomes a nested <group>; nesting composes the assembly's
// transforms. Geometry is tessellated once when the hero loads. A single
// useFrame evaluates the hero's animation and writes each node's transform.
import { ContactShadows } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import { BufferGeometry, Group, OrthographicCamera, Plane, Vector3 } from "three";

import { NO_SECTION, type SectionState } from "@/components/SectionControl";
import { tessellate } from "@/lib/replicad";
import type { AnimationFrame, HeroBounds, HeroModel, HeroNode, Vec3 } from "@/lib/replicad/heroes";
import { VIEWPORT } from "@/lib/theme";

/** Build the world-space clipping planes for the active section, if any. */
function sectionPlanes(section: SectionState, radius: number): Plane[] {
  if (!section.axis) return [];
  const normal =
    section.axis === "x"
      ? new Vector3(-1, 0, 0)
      : section.axis === "y"
        ? new Vector3(0, -1, 0)
        : new Vector3(0, 0, -1);
  return [new Plane(normal, section.offset * radius)];
}

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

interface NodeViewProps {
  node: RenderNode;
  groups: GroupMap;
  selectedNode: string | null;
  clippingPlanes: Plane[];
}

function NodeView({ node, groups, selectedNode, clippingPlanes }: NodeViewProps) {
  const attach = (group: Group | null): void => {
    if (group) groups.current.set(node.name, group);
    else groups.current.delete(node.name);
  };

  // The selected feature-tree node is rendered in the azure accent.
  const selected = node.name === selectedNode;

  return (
    <group ref={attach} position={node.position} rotation={node.rotation}>
      {node.faces ? (
        <mesh geometry={node.faces} castShadow>
          <meshStandardMaterial
            color={selected ? VIEWPORT.selectedColor : VIEWPORT.partColor}
            metalness={selected ? VIEWPORT.selectedMetalness : VIEWPORT.partMetalness}
            roughness={selected ? VIEWPORT.selectedRoughness : VIEWPORT.partRoughness}
            clippingPlanes={clippingPlanes}
            clipShadows
          />
        </mesh>
      ) : null}
      {node.edges ? (
        <lineSegments geometry={node.edges}>
          <lineBasicMaterial
            color={VIEWPORT.edgeColor}
            transparent
            opacity={0.55}
            clippingPlanes={clippingPlanes}
          />
        </lineSegments>
      ) : null}
      {node.children.map((child) => (
        <NodeView
          key={child.name}
          node={child}
          groups={groups}
          selectedNode={selectedNode}
          clippingPlanes={clippingPlanes}
        />
      ))}
    </group>
  );
}

/**
 * Frames the orthographic camera to fit a hero of the given bounding radius.
 * Orthographic projection keeps parts the same size at any depth — the
 * correct, distortion-free view for a CAD model.
 */
function CameraRig({ radius }: { radius: number }) {
  const camera = useThree((state) => state.camera) as OrthographicCamera;
  const size = useThree((state) => state.size);
  const controls = useThree((state) => state.controls) as unknown as
    | { target: { set: (x: number, y: number, z: number) => void }; update: () => void }
    | null;
  const applied = useRef<string>("");

  useFrame(() => {
    // Re-fit when the hero (radius) or the canvas size changes.
    const key = `${radius}:${size.width}x${size.height}`;
    if (applied.current === key) return;
    applied.current = key;

    const safeRadius = Math.max(radius, 1);
    const viewportMin = Math.max(Math.min(size.width, size.height), 1);
    // Ortho zoom sets apparent size: fit the model diameter with a margin.
    camera.zoom = viewportMin / (safeRadius * 2.5);

    const distance = safeRadius * 4;
    camera.position.set(distance, distance * 0.6, distance);
    camera.near = 1;
    camera.far = distance * 8;
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
  /** Name of the feature-tree node to highlight, if any. */
  selectedNode: string | null;
  /** Active section-view clipping state. */
  section?: SectionState;
}

export function HeroScene({
  model,
  bounds,
  animate,
  selectedNode,
  section = NO_SECTION,
}: HeroSceneProps) {
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
  // The model is centred at the origin, so its base sits half a height down.
  const groundY = -bounds.size[1] / 2 - radius * 0.04;
  const clippingPlanes = useMemo(
    () => sectionPlanes(section, radius),
    [section, radius],
  );

  return (
    <>
      <CameraRig radius={radius} />
      {/* Soft cinematic ground shadow, on the screen-horizontal plane. */}
      <ContactShadows
        position={[0, groundY, 0]}
        scale={radius * 3.4}
        far={radius * 2.8}
        blur={2.8}
        opacity={0.42}
        resolution={512}
        color={VIEWPORT.shadowColor}
      />
      <group position={[-bounds.center[0], -bounds.center[1], -bounds.center[2]]}>
        <NodeView
          node={tree}
          groups={groups}
          selectedNode={selectedNode}
          clippingPlanes={clippingPlanes}
        />
      </group>
    </>
  );
}
